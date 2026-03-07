import { CompetitorReport, ThinkingMessage } from "./types";

function createThinkingMessage(
    text: string,
    type: ThinkingMessage["type"]
): ThinkingMessage {
    return {
        id: Math.random().toString(36).substring(2, 9),
        text,
        timestamp: Date.now(),
        type,
    };
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
        const str = JSON.stringify(err);
        return str === "{}" ? "Puter authentication required — please sign in" : str;
    } catch {
        return String(err);
    }
}

function buildPrompt(url: string, niche?: string): string {
    const nicheInstruction = niche
        ? `The competitor operates in the "${niche}" niche/industry.`
        : `The niche/industry is NOT provided. You MUST infer the competitor's business niche from the website and search results.`;

    return `You are an elite competitive intelligence analyst and market strategist working for a top-tier consulting firm. You provide Fortune 500-level competitor analysis.

Your client wants to ENTER or DOMINATE the same market as this competitor. Your job is to give them a battle plan.

═══════════════════════════════════
TARGET COMPETITOR: ${url}
${nicheInstruction}
═══════════════════════════════════

## YOUR MISSION

Conduct DEEP competitive intelligence research. This is not surface-level — dig into everything.

## REQUIRED RESEARCH (use web_search for each)

Perform these searches systematically:

1. Search: "${url}" — understand what the company does
2. Search: "${url} review" — find user opinions, complaints, praise
3. Search: "${url} pricing" — understand their pricing model
4. Search: "${url} vs competitors" — find competitive landscape
5. Search: "${url} SEO traffic keywords" — find their SEO strategy
6. Search: "${url} top blog posts content" — find their best content
7. Search: "${url} weaknesses complaints problems" — find their weak spots
8. Search: "market size ${niche || 'industry'} 2024 2025" — understand market opportunity
9. Search: "${url} alternative better than" — find what people wish was different
10. Search: "how to compete with ${url}" — find strategic angles

## ANALYSIS REQUIREMENTS

After researching, provide ACTIONABLE intelligence:

🎯 **Company Summary**: What do they do? Who are their customers? What's their value prop?

📊 **Overall Score (0-100)**: Rate their competitive strength

🏆 **Success Factors**: WHY are they winning? What specifically makes them successful? Rate each factor's impact (high/medium/low) and explain in detail.

🔑 **Keywords**: What keywords do they rank for? Which are easy opportunities your client could steal? Flag which ones are opportunities.

📝 **Top Content**: What content drives their traffic? What TYPE of content (blog, tool, course, video)?

🎯 **SEO Strategy**: Detailed breakdown of their SEO approach. Give an SEO score (0-100).

📈 **Market Analysis**: How big is this market? Is it growing, stable, or declining?

⚠️ **Competitor Weaknesses**: What are they BAD at? For each weakness, explain HOW your client can exploit it.

🕳️ **Content Gaps**: What topics are they NOT covering? Rate priority (high/medium/low) and give a specific action to fill each gap.

🚀 **Market Entry Opportunities**: For each opportunity, rate difficulty (easy/medium/hard) and potential impact (high/medium/low). Provide 2-3 specific action steps.

📋 **Market Entry Plan**: Give a step-by-step plan with timeline (Week 1-2, Month 1, Month 2-3, etc.)

💡 **Unique Angles**: How can your client DIFFERENTIATE? What unique positioning would work?

🎯 **Positioning Statement**: Suggest a specific positioning statement for your client.

## OUTPUT FORMAT

Return ONLY a JSON object with this EXACT structure. No markdown, no code blocks, just raw JSON:

{
  "competitor": "${url}",
  "niche": "<detected or provided niche>",
  "company_summary": "<2-3 sentence summary of what they do and who they serve>",
  "overall_score": <number 0-100>,
  "success_factors": [
    {"factor": "<what they do well>", "impact": "high|medium|low", "detail": "<why this matters and how it works>"},
    ...at least 5 factors
  ],
  "top_keywords": [
    {"keyword": "<keyword>", "difficulty": "easy|medium|hard", "opportunity": true|false},
    ...at least 8 keywords
  ],
  "seo_strategy": "<detailed 3-4 sentence analysis of their SEO approach>",
  "seo_score": <number 0-100>,
  "top_content": [
    {"title": "<content title>", "url": "<url if found>", "description": "<why it performs well>", "type": "<blog|landing_page|tool|video|guide|case_study>"},
    ...at least 5 pieces
  ],
  "content_strategy": "<their overall content strategy in 2-3 sentences>",
  "market_size": "<estimated market size, e.g. '$5.2B in 2024'>",
  "market_trend": "growing|stable|declining",
  "competitor_weaknesses": [
    {"weakness": "<what they're bad at>", "how_to_exploit": "<specific action your client should take>"},
    ...at least 4 weaknesses
  ],
  "content_gaps": [
    {"gap": "<topic they don't cover>", "priority": "high|medium|low", "action": "<exactly what content to create>"},
    ...at least 5 gaps
  ],
  "opportunities": [
    {
      "opportunity": "<market opportunity>",
      "difficulty": "easy|medium|hard",
      "potential_impact": "high|medium|low",
      "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
    },
    ...at least 4 opportunities
  ],
  "market_entry_plan": [
    {"step": "<step title>", "description": "<what to do>", "timeline": "<when, e.g. Week 1-2>"},
    ...at least 5 steps
  ],
  "unique_angles": ["<differentiation angle 1>", "<angle 2>", ...at least 4],
  "positioning_suggestion": "<a specific positioning statement like 'The [X] for [audience] who want [benefit] without [pain point]'>"
}

CRITICAL RULES:
- Use REAL data from your web searches. Do NOT hallucinate.
- Be SPECIFIC — no generic advice. Reference actual findings.
- Every recommendation must be ACTIONABLE.
- Return ONLY the JSON. No text before or after.`;
}

export async function runAgenticAnalysis(
    url: string,
    niche: string | undefined,
    onThinking: (message: ThinkingMessage) => void
): Promise<CompetitorReport | null> {
    if (typeof window === "undefined" || !window.puter) {
        throw new Error("Puter SDK not available. Please wait for it to load and try again.");
    }

    // Ensure user is authenticated with Puter
    if (!window.puter.auth.isSignedIn()) {
        throw new Error("UNAUTHORIZED");
    }

    const prompt = buildPrompt(url, niche);

    // Puter model names — try multiple models in order
    const modelsToTry = [
        "claude-opus-4-5",
        "gpt-5.4",
        "gpt-4o",
    ];

    onThinking(createThinkingMessage("🚀 Initializing deep market analysis...", "info"));
    onThinking(
        createThinkingMessage(
            `🎯 Target competitor: ${url}`,
            "info"
        )
    );

    let response: unknown;
    let usedModel = "";

    for (let i = 0; i < modelsToTry.length; i++) {
        const model = modelsToTry[i];
        try {
            onThinking(
                createThinkingMessage(
                    `🔌 Connecting to ${model}...`,
                    "info"
                )
            );
            response = await window.puter.ai.chat(prompt, {
                model,
                tools: [{ type: "web_search" }],
                tool_choice: "auto",
                stream: true,
            });
            usedModel = model;
            onThinking(
                createThinkingMessage(
                    `✅ Connected to ${model}`,
                    "info"
                )
            );
            break;
        } catch (err) {
            const errMsg = getErrorMessage(err);
            if (i < modelsToTry.length - 1) {
                onThinking(
                    createThinkingMessage(
                        `⚠️ ${model} unavailable. Trying next...`,
                        "info"
                    )
                );
            } else {
                onThinking(
                    createThinkingMessage(
                        `❌ All models failed. Last error: ${errMsg}`,
                        "error"
                    )
                );
                throw new Error(`All AI models failed. Last error: ${errMsg}`);
            }
        }
    }

    if (!response) {
        throw new Error("No AI model responded");
    }

    // Handle streaming response
    let fullText = "";
    const thinkingMessages = [
        { trigger: 0, text: "🔍 Scanning competitor website...", type: "search" as const },
        { trigger: 100, text: "📊 Analyzing market positioning...", type: "analyze" as const },
        { trigger: 300, text: "🔑 Extracting keyword strategy...", type: "extract" as const },
        { trigger: 500, text: "📝 Reviewing top content...", type: "extract" as const },
        { trigger: 800, text: "⚠️ Identifying competitor weaknesses...", type: "analyze" as const },
        { trigger: 1100, text: "🕳️ Finding content gaps...", type: "extract" as const },
        { trigger: 1400, text: "🚀 Mapping market entry opportunities...", type: "analyze" as const },
        { trigger: 1800, text: "📋 Building market entry plan...", type: "generate" as const },
        { trigger: 2200, text: "💡 Crafting differentiation strategy...", type: "generate" as const },
        { trigger: 2600, text: "📄 Compiling intelligence report...", type: "generate" as const },
    ];
    let nextMessageIndex = 0;

    try {
        if (response && typeof response === "object" && Symbol.asyncIterator in (response as object)) {
            for await (const chunk of response as AsyncIterable<{ text?: string }>) {
                if (chunk?.text) {
                    fullText += chunk.text;
                } else if (typeof chunk === "string") {
                    fullText += chunk;
                }

                while (
                    nextMessageIndex < thinkingMessages.length &&
                    fullText.length >= thinkingMessages[nextMessageIndex].trigger
                ) {
                    const msg = thinkingMessages[nextMessageIndex];
                    onThinking(createThinkingMessage(msg.text, msg.type));
                    nextMessageIndex++;
                }
            }
        } else if (response && typeof response === "object") {
            // Non-streaming response
            const res = response as { message?: { content?: string | { text?: string }[] } };
            if (res.message?.content) {
                if (typeof res.message.content === "string") {
                    fullText = res.message.content;
                } else if (Array.isArray(res.message.content)) {
                    fullText = res.message.content
                        .filter((c): c is { text: string } => "text" in c)
                        .map((c) => c.text)
                        .join("");
                }
            }
        }
    } catch (streamErr) {
        onThinking(
            createThinkingMessage(
                `Stream error: ${getErrorMessage(streamErr)}`,
                "error"
            )
        );
    }

    onThinking(createThinkingMessage(`🧠 AI used: ${usedModel}. Parsing results...`, "generate"));

    // Extract JSON from the response
    try {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const report: CompetitorReport = JSON.parse(jsonMatch[0]);
            onThinking(
                createThinkingMessage("✅ Deep analysis complete! Report ready.", "complete")
            );
            return report;
        }
        throw new Error("No JSON found in response");
    } catch (parseErr) {
        onThinking(
            createThinkingMessage(
                `Failed to parse report: ${parseErr instanceof Error ? parseErr.message : "Unknown"}`,
                "error"
            )
        );
        // Return a structured fallback report
        return {
            competitor: url,
            niche: niche || "Unknown",
            company_summary: "Analysis completed but results could not be fully parsed.",
            overall_score: 0,
            success_factors: [{ factor: "Analysis incomplete", impact: "low", detail: "Please try again for full results." }],
            top_keywords: [],
            seo_strategy: fullText.substring(0, 500) || "Could not extract SEO strategy.",
            seo_score: 0,
            top_content: [],
            content_strategy: "",
            market_size: "Unknown",
            market_trend: "stable",
            competitor_weaknesses: [],
            content_gaps: [],
            opportunities: [{ opportunity: "Try running analysis again", difficulty: "easy", potential_impact: "high", action_steps: ["Refresh and retry"] }],
            market_entry_plan: [],
            unique_angles: [],
            positioning_suggestion: "",
        };
    }
}
