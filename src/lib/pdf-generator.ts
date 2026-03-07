import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CompetitorReport } from "./types";

// Brand colors
const BRAND = { r: 19, g: 127, b: 236 };
const DARK = { r: 15, g: 23, b: 42 };
const SLATE = { r: 100, g: 116, b: 139 };
const WHITE = { r: 255, g: 255, b: 255 };
const GREEN = { r: 34, g: 197, b: 94 };
const RED = { r: 239, g: 68, b: 68 };
const AMBER = { r: 245, g: 158, b: 11 };

function getScoreColor(score: number) {
    if (score >= 70) return GREEN;
    if (score >= 40) return AMBER;
    return RED;
}

function getImpactColor(level: string) {
    if (level === "high" || level === "hard") return RED;
    if (level === "medium") return AMBER;
    return GREEN;
}

/**
 * Sanitize text for jsPDF — the default Helvetica font only supports
 * WinAnsiEncoding (basic Latin-1 / ASCII). Any character outside that
 * range (emojis, smart quotes, em-dashes, fancy Unicode symbols, etc.)
 * will render as garbled nonsense. This function replaces known
 * offenders with their ASCII equivalents and strips the rest.
 */
function sanitize(text: string | undefined | null): string {
    if (!text) return "";
    return text
        // Smart quotes → straight quotes
        .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
        .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
        // Dashes
        .replace(/[\u2013\u2014\u2015]/g, "-")
        .replace(/\u2012/g, "-")
        // Ellipsis
        .replace(/\u2026/g, "...")
        // Bullets / dots
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-")
        // Spaces (non-breaking, thin, hair, etc.)
        .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
        // Arrows
        .replace(/[\u2190-\u21FF]/g, "->")
        // Trademark, copyright, registered
        .replace(/\u2122/g, "(TM)")
        .replace(/\u00A9/g, "(c)")
        .replace(/\u00AE/g, "(R)")
        // Multiplication / division
        .replace(/\u00D7/g, "x")
        .replace(/\u00F7/g, "/")
        // Strip ALL emojis (Emoji_Presentation + Emoji_Modifier + Supplementary planes)
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
        .replace(/[\u{2600}-\u{27BF}]/gu, "")
        .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
        .replace(/[\u{200D}]/gu, "")
        // Strip any remaining non-Latin1 characters (above U+00FF)
        .replace(/[^\x00-\xFF]/g, "")
        .trim();
}

export function generateReportPDF(report: CompetitorReport) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let y = 0;

    function checkPage(needed: number) {
        if (y + needed > 270) {
            doc.addPage();
            y = 20;
        }
    }

    function drawLine(yPos: number, color = SLATE) {
        doc.setDrawColor(color.r, color.g, color.b);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
    }

    // ═══════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════
    // Dark background
    doc.setFillColor(DARK.r, DARK.g, DARK.b);
    doc.rect(0, 0, pageWidth, 297, "F");

    // Brand accent bar
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.rect(0, 0, pageWidth, 4, "F");

    // Logo area
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.roundedRect(margin, 30, 12, 12, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.text("CS", margin + 6, 37.5, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.text("ContentSpy AI", margin + 16, 38);

    doc.setFontSize(8);
    doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
    doc.text("COMPETITIVE INTELLIGENCE REPORT", margin + 16, 44);

    // Main title
    doc.setFontSize(32);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.setFont("helvetica", "bold");
    doc.text("Competitor", margin, 80);
    doc.text("Intelligence", margin, 92);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text("Report", margin, 104);

    // Target info
    doc.setFontSize(11);
    doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
    doc.text("TARGET COMPETITOR", margin, 125);
    doc.setFontSize(16);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.text(sanitize(report.competitor), margin, 134);

    doc.setFontSize(11);
    doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
    doc.text("INDUSTRY / NICHE", margin, 148);
    doc.setFontSize(14);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text(sanitize(report.niche), margin, 157);

    // Scores
    const scoreColor = getScoreColor(report.overall_score || 0);
    const seoColor = getScoreColor(report.seo_score || 0);

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, 170, 75, 35, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
    doc.text("OVERALL SCORE", margin + 8, 180);
    doc.setFontSize(28);
    doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(`${report.overall_score || 0}/100`, margin + 8, 196);

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin + 80, 170, 75, 35, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
    doc.text("SEO SCORE", margin + 88, 180);
    doc.setFontSize(28);
    doc.setTextColor(seoColor.r, seoColor.g, seoColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(`${report.seo_score || 0}/100`, margin + 88, 196);

    // Market info
    if (report.market_size) {
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(margin, 212, contentWidth, 25, 3, 3, "F");
        doc.setFontSize(9);
        doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
        doc.text("MARKET SIZE", margin + 8, 222);
        doc.setFontSize(12);
        doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
        doc.text(sanitize(report.market_size), margin + 8, 231);
        doc.setFontSize(9);
        doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
        doc.text("MARKET TREND", margin + 100, 222);
        doc.setFontSize(12);
        const trendColor = report.market_trend === "growing" ? GREEN : report.market_trend === "declining" ? RED : BRAND;
        doc.setTextColor(trendColor.r, trendColor.g, trendColor.b);
        doc.text(sanitize((report.market_trend || "").toUpperCase()), margin + 100, 231);
    }

    // Summary
    if (report.company_summary) {
        doc.setFontSize(9);
        doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
        doc.text("COMPANY OVERVIEW", margin, 250);
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 220);
        const sumLines = doc.splitTextToSize(sanitize(report.company_summary), contentWidth);
        doc.text(sumLines, margin, 258);
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(50, 60, 80);
    doc.text(`Generated by ContentSpy AI - ${new Date().toLocaleDateString()}`, margin, 290);

    // ═══════════════════════════════════════
    // PAGE 2: SUCCESS FACTORS & WEAKNESSES
    // ═══════════════════════════════════════
    doc.addPage();
    doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
    doc.rect(0, 0, pageWidth, 297, "F");

    // Page header
    doc.setFillColor(DARK.r, DARK.g, DARK.b);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.rect(0, 18, pageWidth, 1, "F");
    doc.setFontSize(9);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.setFont("helvetica", "bold");
    doc.text("CONTENTSPY AI - INTELLIGENCE REPORT", margin, 12);
    doc.setFont("helvetica", "normal");
    doc.text(sanitize(report.competitor), pageWidth - margin, 12, { align: "right" });

    y = 28;

    // Section: Why They're Winning
    doc.setFontSize(16);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("Why They're Winning", margin, y);
    y += 8;

    if (report.success_factors?.length) {
        const sfData = report.success_factors.map((f) => {
            const factor = sanitize(typeof f === "string" ? f : f.factor);
            const impact = sanitize(typeof f === "string" ? "-" : f.impact?.toUpperCase());
            const detail = sanitize(typeof f === "string" ? "" : f.detail || "");
            return [factor, impact, detail];
        });

        autoTable(doc, {
            startY: y,
            head: [["Success Factor", "Impact", "Detail"]],
            body: sfData,
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b], fontSize: 8, font: "helvetica", fontStyle: "bold" },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 70], cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 45, fontStyle: "bold" },
                1: { cellWidth: 20, halign: "center" },
                2: { cellWidth: "auto" },
            },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            didParseCell: (data) => {
                if (data.column.index === 1 && data.section === "body") {
                    const val = String(data.cell.raw);
                    if (val === "HIGH") data.cell.styles.textColor = [RED.r, RED.g, RED.b];
                    else if (val === "MEDIUM") data.cell.styles.textColor = [AMBER.r, AMBER.g, AMBER.b];
                    else if (val === "LOW") data.cell.styles.textColor = [GREEN.r, GREEN.g, GREEN.b];
                }
            },
        });

        y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 30;
        y += 10;
    }

    // Weaknesses
    checkPage(40);
    doc.setFontSize(16);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("Competitor Weaknesses & How to Exploit", margin, y);
    y += 8;

    if (report.competitor_weaknesses?.length) {
        const wData = report.competitor_weaknesses.map((w) => [sanitize(w.weakness), sanitize(w.how_to_exploit)]);

        autoTable(doc, {
            startY: y,
            head: [["Weakness", "How to Exploit"]],
            body: wData,
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [RED.r, RED.g, RED.b], fontSize: 8, font: "helvetica", fontStyle: "bold" },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 70], cellPadding: 4 },
            columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
            alternateRowStyles: { fillColor: [255, 245, 245] },
        });

        y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 30;
        y += 10;
    }

    // ═══════════════════════════════════════
    // SEO & KEYWORDS
    // ═══════════════════════════════════════
    checkPage(50);
    if (y > 200) {
        doc.addPage();
        y = 28;
        // Repeat header
        doc.setFillColor(DARK.r, DARK.g, DARK.b);
        doc.rect(0, 0, pageWidth, 18, "F");
        doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
        doc.rect(0, 18, pageWidth, 1, "F");
        doc.setFontSize(9);
        doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
        doc.setFont("helvetica", "bold");
        doc.text("CONTENTSPY AI - INTELLIGENCE REPORT", margin, 12);
        doc.setFont("helvetica", "normal");
        doc.text(sanitize(report.competitor), pageWidth - margin, 12, { align: "right" });
    }

    doc.setFontSize(16);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("Keyword Strategy", margin, y);
    y += 8;

    if (report.top_keywords?.length) {
        const kwData = report.top_keywords.map((kw) => {
            const keyword = sanitize(typeof kw === "string" ? kw : kw.keyword);
            const difficulty = sanitize(typeof kw === "string" ? "-" : kw.difficulty?.toUpperCase());
            const opp = typeof kw === "string" ? "" : kw.opportunity ? "YES" : "-";
            return [keyword, difficulty, opp];
        });

        autoTable(doc, {
            startY: y,
            head: [["Keyword", "Difficulty", "Opportunity?"]],
            body: kwData,
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b], fontSize: 8, font: "helvetica", fontStyle: "bold" },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 70], cellPadding: 3 },
            columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "center", cellWidth: 25 }, 2: { halign: "center", cellWidth: 25 } },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            didParseCell: (data) => {
                if (data.column.index === 2 && data.section === "body") {
                    if (String(data.cell.raw).includes("YES")) data.cell.styles.textColor = [GREEN.r, GREEN.g, GREEN.b];
                }
                if (data.column.index === 1 && data.section === "body") {
                    const val = String(data.cell.raw);
                    if (val === "HARD") data.cell.styles.textColor = [RED.r, RED.g, RED.b];
                    else if (val === "MEDIUM") data.cell.styles.textColor = [AMBER.r, AMBER.g, AMBER.b];
                    else if (val === "EASY") data.cell.styles.textColor = [GREEN.r, GREEN.g, GREEN.b];
                }
            },
        });

        y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 30;
        y += 10;
    }

    // SEO Strategy text
    checkPage(30);
    doc.setFontSize(11);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("SEO Strategy Overview", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 90);
    const seoLines = doc.splitTextToSize(sanitize(report.seo_strategy), contentWidth);
    doc.text(seoLines, margin, y);
    y += seoLines.length * 4 + 10;

    // ═══════════════════════════════════════
    // CONTENT GAPS & OPPORTUNITIES
    // ═══════════════════════════════════════
    doc.addPage();
    y = 28;
    doc.setFillColor(DARK.r, DARK.g, DARK.b);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.rect(0, 18, pageWidth, 1, "F");
    doc.setFontSize(9);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.setFont("helvetica", "bold");
    doc.text("CONTENTSPY AI - INTELLIGENCE REPORT", margin, 12);
    doc.setFont("helvetica", "normal");
    doc.text(sanitize(report.competitor), pageWidth - margin, 12, { align: "right" });

    // Content Gaps
    doc.setFontSize(16);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("Content Gaps & Actions", margin, y);
    y += 8;

    if (report.content_gaps?.length) {
        const gapData = report.content_gaps.map((g) => {
            const gap = sanitize(typeof g === "string" ? g : g.gap);
            const priority = sanitize(typeof g === "string" ? "-" : g.priority?.toUpperCase());
            const action = sanitize(typeof g === "string" ? "" : g.action || "");
            return [gap, priority, action];
        });

        autoTable(doc, {
            startY: y,
            head: [["Content Gap", "Priority", "Action to Take"]],
            body: gapData,
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [245, 158, 11], fontSize: 8, font: "helvetica", fontStyle: "bold" },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 70], cellPadding: 4 },
            columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" }, 1: { cellWidth: 20, halign: "center" }, 2: { cellWidth: "auto" } },
            alternateRowStyles: { fillColor: [255, 252, 240] },
            didParseCell: (data) => {
                if (data.column.index === 1 && data.section === "body") {
                    const val = String(data.cell.raw);
                    if (val === "HIGH") data.cell.styles.textColor = [RED.r, RED.g, RED.b];
                    else if (val === "MEDIUM") data.cell.styles.textColor = [AMBER.r, AMBER.g, AMBER.b];
                    else if (val === "LOW") data.cell.styles.textColor = [GREEN.r, GREEN.g, GREEN.b];
                }
            },
        });
        y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 30;
        y += 10;
    }

    // Opportunities
    checkPage(50);
    doc.setFontSize(16);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("Growth Opportunities", margin, y);
    y += 8;

    if (report.opportunities?.length) {
        report.opportunities.forEach((opp, i) => {
            checkPage(35);
            const opportunity = sanitize(typeof opp === "string" ? opp : opp.opportunity);
            const difficulty = typeof opp !== "string" ? opp.difficulty : "";
            const impact = typeof opp !== "string" ? opp.potential_impact : "";
            const steps = typeof opp !== "string" ? opp.action_steps : [];

            // Opportunity card
            doc.setFillColor(245, 247, 250);
            doc.roundedRect(margin, y - 3, contentWidth, 8 + (steps?.length || 0) * 5 + 8, 2, 2, "F");
            const impColor = getImpactColor(impact);
            doc.setFillColor(impColor.r, impColor.g, impColor.b);
            doc.rect(margin, y - 3, 2, 8 + (steps?.length || 0) * 5 + 8, "F");

            doc.setFontSize(10);
            doc.setTextColor(DARK.r, DARK.g, DARK.b);
            doc.setFont("helvetica", "bold");
            doc.text(`${i + 1}. ${opportunity}`, margin + 6, y + 2);
            if (difficulty) {
                doc.setFontSize(7);
                doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
                doc.text(sanitize(`Difficulty: ${difficulty.toUpperCase()} | Impact: ${impact.toUpperCase()}`), margin + 6, y + 7);
            }
            y += 12;

            if (steps?.length) {
                steps.forEach((step, j) => {
                    doc.setFontSize(8);
                    doc.setTextColor(70, 70, 90);
                    doc.setFont("helvetica", "normal");
                    const stepLines = doc.splitTextToSize(sanitize(`${j + 1}. ${step}`), contentWidth - 15);
                    doc.text(stepLines, margin + 10, y);
                    y += stepLines.length * 4;
                });
            }
            y += 6;
        });
    }

    // ═══════════════════════════════════════
    // MARKET ENTRY PLAN
    // ═══════════════════════════════════════
    doc.addPage();
    y = 28;
    doc.setFillColor(DARK.r, DARK.g, DARK.b);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.rect(0, 18, pageWidth, 1, "F");
    doc.setFontSize(9);
    doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    doc.setFont("helvetica", "bold");
    doc.text("CONTENTSPY AI - INTELLIGENCE REPORT", margin, 12);
    doc.setFont("helvetica", "normal");
    doc.text(sanitize(report.competitor), pageWidth - margin, 12, { align: "right" });

    doc.setFontSize(16);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.setFont("helvetica", "bold");
    doc.text("Market Entry Roadmap", margin, y);
    y += 8;

    if (report.market_entry_plan?.length) {
        report.market_entry_plan.forEach((step, i) => {
            checkPage(25);
            // Timeline badge
            doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
            doc.roundedRect(margin, y - 2, 30, 7, 1, 1, "F");
            doc.setFontSize(7);
            doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
            doc.setFont("helvetica", "bold");
            doc.text(sanitize(step.timeline || `Step ${i + 1}`), margin + 15, y + 3, { align: "center" });

            doc.setFontSize(10);
            doc.setTextColor(DARK.r, DARK.g, DARK.b);
            doc.text(sanitize(step.step), margin + 34, y + 3);
            y += 9;

            doc.setFontSize(8);
            doc.setTextColor(70, 70, 90);
            doc.setFont("helvetica", "normal");
            const descLines = doc.splitTextToSize(sanitize(step.description), contentWidth - 34);
            doc.text(descLines, margin + 34, y);
            y += descLines.length * 4 + 6;

            if (i < report.market_entry_plan.length - 1) {
                drawLine(y - 3, { r: 230, g: 230, b: 230 });
            }
        });
    }

    // Positioning
    y += 8;
    checkPage(30);
    if (report.positioning_suggestion) {
        doc.setFillColor(240, 247, 255);
        doc.roundedRect(margin, y - 2, contentWidth, 25, 3, 3, "F");
        doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
        doc.rect(margin, y - 2, 3, 25, "F");
        doc.setFontSize(8);
        doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
        doc.setFont("helvetica", "bold");
        doc.text("RECOMMENDED POSITIONING", margin + 8, y + 4);
        doc.setFontSize(11);
        doc.setTextColor(DARK.r, DARK.g, DARK.b);
        doc.setFont("helvetica", "bolditalic");
        const posLines = doc.splitTextToSize(sanitize(`"${report.positioning_suggestion}"`), contentWidth - 15);
        doc.text(posLines, margin + 8, y + 11);
    }

    // Unique angles
    y += 35;
    checkPage(30);
    if (report.unique_angles?.length) {
        doc.setFontSize(12);
        doc.setTextColor(DARK.r, DARK.g, DARK.b);
        doc.setFont("helvetica", "bold");
        doc.text("Differentiation Angles", margin, y);
        y += 7;
        report.unique_angles.forEach((angle, i) => {
            checkPage(10);
            doc.setFontSize(9);
            doc.setTextColor(70, 70, 90);
            doc.setFont("helvetica", "normal");
            const angleLines = doc.splitTextToSize(sanitize(`${i + 1}. ${angle}`), contentWidth - 5);
            doc.text(angleLines, margin + 5, y);
            y += angleLines.length * 4 + 2;
        });
    }

    // Footer on last page
    doc.setFontSize(7);
    doc.setTextColor(170, 170, 190);
    doc.text(
        `ContentSpy AI - Competitive Intelligence Report | Generated ${new Date().toLocaleString()} | Confidential`,
        pageWidth / 2,
        290,
        { align: "center" }
    );

    // Save with explicit filename using Blob and Anchor (prevents UUID naming bug)
    const filename = `ContentSpy_Report_${report.competitor.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    try {
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;

        // Append to body, click, and clean up to ensure the 'download' attribute is respected
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 200);
    } catch (err) {
        console.error("Failed to generate PDF blob, falling back to basic save", err);
        doc.save(filename);
    }
}
