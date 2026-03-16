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

/**
 * Robust JSON repair function that handles common LLM output issues:
 * - Trailing commas before } or ]
 * - Control characters (newlines, tabs) inside string values
 * - Single quotes instead of double quotes
 * - Unescaped backslashes
 * - Comments (// and /* *​/)
 */
function repairJSON(input: string): string {
    let s = input;

    // Remove BOM if present
    s = s.replace(/^\uFEFF/, '');

    // Remove single-line comments (// ...) that are NOT inside strings
    // This is a heuristic approach — process line by line
    const lines = s.split('\n');
    const cleanedLines: string[] = [];
    for (const line of lines) {
        // Check if this line has a // outside of a string
        let inString = false;
        let escaped = false;
        let commentStart = -1;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }
            if (ch === '"') { inString = !inString; continue; }
            if (!inString && ch === '/' && i + 1 < line.length && line[i + 1] === '/') {
                commentStart = i;
                break;
            }
        }
        cleanedLines.push(commentStart >= 0 ? line.substring(0, commentStart) : line);
    }
    s = cleanedLines.join('\n');

    // Remove block comments /* ... */
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove trailing commas before } or ]
    s = s.replace(/,\s*([}\]])/g, '$1');

    // Fix control characters inside JSON strings (newlines, tabs, etc.)
    // Walk through the string character by character to find string boundaries
    let result = '';
    let inStr = false;
    let esc = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];

        if (esc) {
            result += ch;
            esc = false;
            continue;
        }

        if (ch === '\\') {
            esc = true;
            result += ch;
            continue;
        }

        if (ch === '"') {
            inStr = !inStr;
            result += ch;
            continue;
        }

        if (inStr) {
            // Replace actual control characters with their escaped versions
            if (ch === '\n') { result += '\\n'; continue; }
            if (ch === '\r') { result += '\\r'; continue; }
            if (ch === '\t') { result += '\\t'; continue; }
            // Replace other control chars
            const code = ch.charCodeAt(0);
            if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
                result += '\\u' + code.toString(16).padStart(4, '0');
                continue;
            }
        }

        result += ch;
    }
    s = result;

    // Another pass to remove trailing commas (in case control char removal exposed new ones)
    s = s.replace(/,\s*([}\]])/g, '$1');

    return s;
}

/**
 * Close truncated JSON by auto-closing all open brackets, braces, and strings.
 * This handles cases where the AI model hits its token limit mid-response.
 */
function closeTruncatedJSON(input: string): string {
    let s = input.trimEnd();

    // If it already ends with }, it might be complete
    if (s.endsWith('}')) return s;

    // Track what's open
    let inString = false;
    let escaped = false;
    const stack: string[] = []; // stack of open delimiters

    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }

        if (inString) {
            if (ch === '"') inString = false;
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }
        if (ch === '{') stack.push('}');
        if (ch === '[') stack.push(']');
        if (ch === '}' || ch === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === ch) {
                stack.pop();
            }
        }
    }

    // If we're still inside a string, close it
    if (inString) {
        s += '"';
    }

    // Remove any trailing comma or colon that would be invalid
    s = s.replace(/[,:"\s]+$/, (match) => {
        // Keep the closing quote if we just added it
        if (match === '"') return match;
        return '';
    });
    s = s.trimEnd();

    // If ends mid-value (after a colon), add a placeholder
    if (s.endsWith(':')) {
        s += '""';
    }
    if (s.endsWith(',')) {
        s = s.slice(0, -1);
    }

    // Close all open brackets/braces in reverse order
    while (stack.length > 0) {
        const closer = stack.pop()!;
        // Remove trailing comma before closing
        s = s.replace(/,\s*$/, '');
        s += closer;
    }

    return s;
}

/**
 * Extract a JSON object string from raw LLM output
 */
function extractJSON(raw: string): string {
    // 1. Try markdown code blocks first
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }

    // 2. Find balanced braces — start from the first { and find matching }
    const firstBrace = raw.indexOf('{');
    if (firstBrace === -1) throw new Error("No JSON object found in response");

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = firstBrace; i < raw.length; i++) {
        const ch = raw[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        if (ch === '}') {
            depth--;
            if (depth === 0) {
                return raw.substring(firstBrace, i + 1);
            }
        }
    }

    // If we couldn't find balanced braces, fall back to first { to last }
    const lastBrace = raw.lastIndexOf('}');
    if (lastBrace > firstBrace) {
        return raw.substring(firstBrace, lastBrace + 1);
    }

    throw new Error("No valid JSON object boundaries found");
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

You MUST return ONLY a valid JSON object. The JSON must:
- Use double quotes for ALL keys and string values
- NOT contain any trailing commas
- NOT contain any comments
- NOT contain literal newlines inside string values (use \\n instead)
- Have NO text before the opening { or after the closing }

Here is the EXACT structure:

{
  "competitor": "${url}",
  "niche": "<detected or provided niche>",
  "company_summary": "<2-3 sentence summary of what they do and who they serve>",
  "overall_score": <number 0-100>,
  "success_factors": [
    {"factor": "<what they do well>", "impact": "high|medium|low", "detail": "<why this matters and how it works>"}
  ],
  "top_keywords": [
    {"keyword": "<keyword>", "difficulty": "easy|medium|hard", "opportunity": true|false}
  ],
  "seo_strategy": "<detailed 3-4 sentence analysis of their SEO approach>",
  "seo_score": <number 0-100>,
  "top_content": [
    {"title": "<content title>", "url": "<url if found>", "description": "<why it performs well>", "type": "<blog|landing_page|tool|video|guide|case_study>"}
  ],
  "content_strategy": "<their overall content strategy in 2-3 sentences>",
  "market_size": "<estimated market size>",
  "market_trend": "growing|stable|declining",
  "competitor_weaknesses": [
    {"weakness": "<what they are bad at>", "how_to_exploit": "<specific action your client should take>"}
  ],
  "content_gaps": [
    {"gap": "<topic they do not cover>", "priority": "high|medium|low", "action": "<exactly what content to create>"}
  ],
  "opportunities": [
    {
      "opportunity": "<market opportunity>",
      "difficulty": "easy|medium|hard",
      "potential_impact": "high|medium|low",
      "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }
  ],
  "market_entry_plan": [
    {"step": "<step title>", "description": "<what to do>", "timeline": "<when>"}
  ],
  "unique_angles": ["<differentiation angle 1>", "<angle 2>"],
  "positioning_suggestion": "<a specific positioning statement>"
}

Provide at least 5 success_factors, 8 top_keywords, 5 top_content, 4 competitor_weaknesses, 5 content_gaps, 4 opportunities, 5 market_entry_plan steps, and 4 unique_angles.

CRITICAL RULES:
- Use REAL data from your web searches. Do NOT hallucinate.
- Be SPECIFIC and reference actual findings.
- Every recommendation must be ACTIONABLE.
- Return ONLY valid JSON. No markdown, no code blocks, no text before or after.
- Do NOT use apostrophes or single quotes inside string values. Use the word or rephrase instead.
- Keep each string value concise (1-3 sentences max per field). Avoid long paragraphs.`;
}

/**
 * Extract text content from a Puter AI response (handles all known formats)
 */
function extractTextFromResponse(response: unknown): string {
    if (typeof response === "string") return response;

    if (response && typeof response === "object") {
        const r = response as Record<string, unknown>;

        // Format: { message: { content: "..." } }
        if (r.message && typeof r.message === "object") {
            const msg = r.message as Record<string, unknown>;
            if (typeof msg.content === "string") return msg.content;
            if (Array.isArray(msg.content)) {
                return msg.content
                    .filter((c: unknown): c is { text: string } =>
                        typeof c === "object" && c !== null && "text" in c
                    )
                    .map((c) => c.text)
                    .join("");
            }
        }

        // Format: { text: "..." }
        if (typeof r.text === "string") return r.text;

        // Format: { content: "..." }
        if (typeof r.content === "string") return r.content;

        // Format: { choices: [{ message: { content: "..." } }] }
        if (Array.isArray(r.choices) && r.choices.length > 0) {
            const choice = r.choices[0] as Record<string, unknown>;
            if (choice.message && typeof choice.message === "object") {
                const msg = choice.message as Record<string, unknown>;
                if (typeof msg.content === "string") return msg.content;
            }
        }
    }

    return "";
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
        "gpt-5.4",
        "claude-opus-4-5",
        "gpt-4o",
    ];

    onThinking(createThinkingMessage("🚀 Initializing deep market analysis...", "info"));
    onThinking(createThinkingMessage(`🎯 Target competitor: ${url}`, "info"));

    let response: unknown;
    let usedModel = "";

    for (let i = 0; i < modelsToTry.length; i++) {
        const model = modelsToTry[i];
        try {
            onThinking(createThinkingMessage(`🔌 Connecting to ${model}...`, "info"));

            // Use NON-STREAMING mode to avoid chunk corruption issues
            response = await window.puter.ai.chat(prompt, {
                model,
                tools: [{ type: "web_search" }],
                tool_choice: "auto",
                stream: false,
            });
            usedModel = model;
            onThinking(createThinkingMessage(`✅ Connected to ${model}`, "info"));
            break;
        } catch (err) {
            const errMsg = getErrorMessage(err);
            if (i < modelsToTry.length - 1) {
                onThinking(createThinkingMessage(`⚠️ ${model} unavailable. Trying next...`, "info"));
            } else {
                onThinking(createThinkingMessage(`❌ All models failed. Last error: ${errMsg}`, "error"));
                throw new Error(`All AI models failed. Last error: ${errMsg}`);
            }
        }
    }

    if (!response) {
        throw new Error("No AI model responded");
    }

    // Show progress messages since we no longer have streaming
    const thinkingMessages = [
        "🔍 Scanning competitor website...",
        "📊 Analyzing market positioning...",
        "🔑 Extracting keyword strategy...",
        "📝 Reviewing top content...",
        "⚠️ Identifying competitor weaknesses...",
        "🕳️ Finding content gaps...",
        "🚀 Mapping market entry opportunities...",
        "📋 Building market entry plan...",
        "💡 Crafting differentiation strategy...",
        "📄 Compiling intelligence report...",
    ];
    const types: ThinkingMessage["type"][] = [
        "search", "analyze", "extract", "extract", "analyze",
        "extract", "analyze", "generate", "generate", "generate",
    ];
    for (let i = 0; i < thinkingMessages.length; i++) {
        onThinking(createThinkingMessage(thinkingMessages[i], types[i]));
    }

    // Extract text from the response
    const fullText = extractTextFromResponse(response);
    console.log("AI response length:", fullText.length);
    console.log("AI response preview:", fullText.substring(0, 200));

    if (!fullText || fullText.trim().length === 0) {
        onThinking(createThinkingMessage("❌ AI returned empty response", "error"));
        throw new Error("AI returned an empty response");
    }

    onThinking(createThinkingMessage(`🧠 AI used: ${usedModel}. Parsing results...`, "generate"));

    // Extract and parse JSON with robust error handling
    try {
        // Step 1: Extract the JSON substring
        let jsonStr = extractJSON(fullText);

        // Step 2: Repair common JSON issues
        jsonStr = repairJSON(jsonStr);

        // Step 3: Try parsing, if it fails try closing truncated JSON
        try {
            const report: CompetitorReport = JSON.parse(jsonStr);
            onThinking(createThinkingMessage("✅ Deep analysis complete! Report ready.", "complete"));
            return report;
        } catch {
            // JSON is likely truncated — try auto-closing
            console.warn("JSON parse failed, attempting to close truncated JSON...");
            jsonStr = closeTruncatedJSON(jsonStr);
            jsonStr = repairJSON(jsonStr); // clean up again after closing
            const report: CompetitorReport = JSON.parse(jsonStr);
            onThinking(createThinkingMessage("✅ Deep analysis complete! Report ready (partial data recovered).", "complete"));
            return report;
        }
    } catch (firstErr) {
        console.warn("First parse attempt failed:", firstErr);

        // Retry: grab all text from first { and try to close it
        try {
            const firstBrace = fullText.indexOf('{');
            if (firstBrace !== -1) {
                let jsonStr = fullText.substring(firstBrace);
                jsonStr = repairJSON(jsonStr);
                jsonStr = closeTruncatedJSON(jsonStr);
                jsonStr = repairJSON(jsonStr);

                const report: CompetitorReport = JSON.parse(jsonStr);
                onThinking(createThinkingMessage("✅ Deep analysis complete! Report ready (partial data recovered).", "complete"));
                return report;
            }
        } catch (secondErr) {
            console.error("Second parse attempt also failed:", secondErr);
        }

        // Log for debugging
        console.error("RAW AI OUTPUT (first 2000 chars):", fullText.substring(0, 2000));
        console.error("RAW AI OUTPUT (last 500 chars):", fullText.substring(fullText.length - 500));

        onThinking(
            createThinkingMessage(
                `Failed to parse report: ${firstErr instanceof Error ? firstErr.message : "Unknown"}`,
                "error"
            )
        );
        // Return a structured fallback report
        return {
            competitor: url,
            niche: niche || "Unknown",
            company_summary: "Analysis completed but results could not be fully parsed. Please try again.",
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
