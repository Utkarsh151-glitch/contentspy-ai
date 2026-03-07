export interface CompetitorReport {
    competitor: string;
    niche: string;
    // Overview
    company_summary: string;
    overall_score: number; // 0-100
    // Success Analysis
    success_factors: {
        factor: string;
        impact: "high" | "medium" | "low";
        detail: string;
    }[];
    // Keywords & SEO
    top_keywords: {
        keyword: string;
        difficulty: "easy" | "medium" | "hard";
        opportunity: boolean;
    }[];
    seo_strategy: string;
    seo_score: number; // 0-100
    // Content
    top_content: {
        title: string;
        url?: string;
        description: string;
        type: string; // blog, landing page, tool, etc.
    }[];
    content_strategy: string;
    // Market Analysis
    market_size: string;
    market_trend: "growing" | "stable" | "declining";
    competitor_weaknesses: {
        weakness: string;
        how_to_exploit: string;
    }[];
    content_gaps: {
        gap: string;
        priority: "high" | "medium" | "low";
        action: string;
    }[];
    // Market Entry Strategy
    opportunities: {
        opportunity: string;
        difficulty: "easy" | "medium" | "hard";
        potential_impact: "high" | "medium" | "low";
        action_steps: string[];
    }[];
    market_entry_plan: {
        step: string;
        description: string;
        timeline: string;
    }[];
    // Differentiation
    unique_angles: string[];
    positioning_suggestion: string;
}

export interface ThinkingMessage {
    id: string;
    text: string;
    timestamp: number;
    type: "search" | "analyze" | "extract" | "generate" | "info" | "complete" | "error";
}

export type AnalysisStatus = "idle" | "running" | "complete" | "error";
