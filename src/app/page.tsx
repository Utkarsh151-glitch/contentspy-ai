"use client";

import { useState, useCallback } from "react";
import { Sidebar, PageId } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ThinkingConsole } from "@/components/ThinkingConsole";
import { ReportView } from "@/components/ReportView";
import { RecentAnalyses } from "@/components/RecentAnalyses";
import { MarketDynamics } from "@/components/MarketDynamics";
import { ReportsPage } from "@/components/pages/ReportsPage";
import { BenchmarkingPage } from "@/components/pages/BenchmarkingPage";
import { InsightsPage } from "@/components/pages/InsightsPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { runAgenticAnalysis } from "@/lib/agent";
import { saveReport, SavedReport } from "@/lib/report-store";
import { CompetitorReport, ThinkingMessage, AnalysisStatus } from "@/lib/types";

import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/components/providers/AuthProvider";

const pageTitles: Record<PageId, string> = {
  dashboard: "Overview",
  reports: "Reports",
  benchmarking: "Benchmarking",
  insights: "Insights",
  settings: "Settings",
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [thinkingMessages, setThinkingMessages] = useState<ThinkingMessage[]>([]);
  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // to trigger child re-fetches
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleThinkingMessage = useCallback((message: ThinkingMessage) => {
    setThinkingMessages((prev) => [...prev, message]);
  }, []);

  const startAnalysis = useCallback(
    async (url: string, niche?: string) => {
      if (typeof window === "undefined") return;

      // Check Authentication first
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      setStatus("running");
      setThinkingMessages([]);
      setReport(null);

      try {
        const result = await runAgenticAnalysis(url, niche, handleThinkingMessage);
        if (result) {
          setReport(result);
          setStatus("complete");
          // Save to Puter KV
          try {
            await saveReport(result, url);
            setRefreshKey((k) => k + 1); // trigger child re-fetches
          } catch (saveErr) {
            console.warn("Failed to save report to Puter KV:", saveErr);
          }
        } else {
          setStatus("error");
        }
      } catch (err) {
        let errMsg = err instanceof Error ? err.message : (typeof err === "string" ? err : JSON.stringify(err));

        if (errMsg === "UNAUTHORIZED") {
          setShowAuthModal(true);
          setStatus("idle");
          return;
        }

        console.error("Analysis failed:", errMsg, err);
        setStatus("error");
        handleThinkingMessage({
          id: "error-final",
          text: `Analysis failed: ${errMsg}`,
          timestamp: Date.now(),
          type: "error",
        });
      }
    },
    [handleThinkingMessage, isAuthenticated]
  );

  const handleViewReport = useCallback((saved: SavedReport) => {
    setReport(saved.report);
    setStatus("complete");
    setActivePage("dashboard");
  }, []);

  const handleNavigate = useCallback((page: PageId) => {
    setActivePage(page);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f8] dark:bg-[#101922]">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          handleNavigate(page);
          setSidebarOpen(false); // Close sidebar on mobile when navigating
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        <Header
          title={pageTitles[activePage]}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Dashboard Page */}
        {activePage === "dashboard" && (
          <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
            <HeroSection
              onAnalyze={startAnalysis}
              isAnalyzing={status === "running"}
            />

            {(status === "running" || thinkingMessages.length > 0) && (
              <ThinkingConsole
                messages={thinkingMessages}
                isActive={status === "running"}
              />
            )}

            {report && status === "complete" && <ReportView report={report} />}

            {status === "idle" && <RecentAnalyses key={`recent-${refreshKey}`} onViewReport={handleViewReport} />}
            {status === "idle" && <MarketDynamics />}
          </div>
        )}

        {/* Reports Page */}
        {activePage === "reports" && <ReportsPage key={`reports-${refreshKey}`} onViewReport={handleViewReport} />}

        {/* Benchmarking Page */}
        {activePage === "benchmarking" && <BenchmarkingPage key={`bench-${refreshKey}`} />}

        {/* Insights Page */}
        {activePage === "insights" && <InsightsPage key={`insights-${refreshKey}`} />}

        {/* Settings Page */}
        {activePage === "settings" && <SettingsPage key={`settings-${refreshKey}`} onDataCleared={() => setRefreshKey((k) => k + 1)} />}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
