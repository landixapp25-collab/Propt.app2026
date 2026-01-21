import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { portfolioSummary } = await req.json();

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are a UK property portfolio advisor. Analyze this portfolio and provide actionable insights in JSON format ONLY. Do not include any markdown formatting or code blocks, just return the raw JSON object.

Portfolio Data:
${JSON.stringify(portfolioSummary, null, 2)}

Return ONLY this JSON structure with no additional text:
{
  "overallHealth": "excellent/good/fair/poor",
  "portfolioScore": number between 0-100,
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "keyWeaknesses": ["weakness 1", "weakness 2"],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "priority": "high/medium/low",
      "impact": "Potential impact description",
      "actionable": true or false
    }
  ],
  "underperformingProperties": [
    {
      "propertyName": "name",
      "issue": "what's wrong",
      "suggestion": "how to fix"
    }
  ],
  "opportunityScore": number between 0-100,
  "marketOutlook": "Brief outlook for UK property market",
  "nextSteps": ["step 1", "step 2", "step 3"]
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    let parsedInsights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedInsights = JSON.parse(jsonMatch[0]);
      } else {
        parsedInsights = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse insights:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ insights: parsedInsights }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate insights",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
