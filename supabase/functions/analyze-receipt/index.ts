import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const ANALYSIS_PROMPT = `Analyse this UK receipt and extract the following information in JSON format:
{
  "vendor": "Company or store name",
  "amount": "Total amount in GBP as number only (no pound symbol)",
  "date": "Date in DD/MM/YYYY format",
  "category": "Select ONE from this list: Materials, Labour, Professional Fees, Planning & Permits, Finance Costs, Utilities, Acquisition Costs, Marketing & Sales, Insurance, Other",
  "items": "Brief description of main items purchased"
}

Categorization rules:
- Screwfix, B&Q, Wickes, Toolstation, Travis Perkins, Jewson, Selco, Buildbase = Materials
- Individual tradespeople, contractors, day rates = Labour
- Architects, surveyors, engineers, solicitors = Professional Fees
- Council, planning department, building control = Planning & Permits
- Banks, lenders, mortgage companies = Finance Costs
- British Gas, EDF, E.ON, Scottish Power, Yorkshire Water, Thames Water, utility companies = Utilities
- Insurance companies (AXA, Aviva, Direct Line, etc) = Insurance
- Estate agents, photographers, home stagers = Marketing & Sales
- Solicitors at purchase time, stamp duty, conveyancing = Acquisition Costs
- If unclear = Other

Extract the TOTAL amount including VAT.
Return ONLY valid JSON with no other text.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageBase64, imageType } = await req.json();

    if (!imageBase64 || !imageType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing image data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!apiKey) {
      console.error('[Analyse Receipt] No API key found');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let mediaType: string;
    let contentType: 'image' | 'document';

    if (imageType === 'pdf') {
      mediaType = 'application/pdf';
      contentType = 'document';
    } else if (imageType === 'jpg' || imageType === 'jpeg') {
      mediaType = 'image/jpeg';
      contentType = 'image';
    } else if (imageType === 'png') {
      mediaType = 'image/png';
      contentType = 'image';
    } else if (imageType === 'gif') {
      mediaType = 'image/gif';
      contentType = 'image';
    } else if (imageType === 'webp') {
      mediaType = 'image/webp';
      contentType = 'image';
    } else {
      console.error('[Analyse Receipt] Unsupported file type:', imageType);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unsupported format: ${imageType}. Please use JPG, PNG, GIF, WebP, or PDF`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const base64Data = imageBase64.split(',')[1] || imageBase64;

    if (base64Data.includes('data:')) {
      console.error('[Analyse Receipt] Base64 data contains data URL prefix');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid image data format'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Analyse Receipt] Sending request to Claude API...');
    console.log('[Analyse Receipt] Media type:', mediaType);
    console.log('[Analyse Receipt] Base64 data length:', base64Data.length);

    const content = [
      {
        type: contentType,
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      },
      {
        type: 'text',
        text: ANALYSIS_PROMPT,
      },
    ];

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      }),
    });

    console.log('[Analyse Receipt] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Analyse Receipt] Claude API error:', errorData);

      let errorMessage = 'Failed to analyse receipt';
      if (response.status === 401) {
        errorMessage = 'API key is invalid';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }

      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    console.log('[Analyse Receipt] API response received');

    const textContent = data.content?.find((c: any) => c.type === 'text')?.text;

    if (!textContent) {
      console.error('[Analyse Receipt] No text content in response');
      return new Response(
        JSON.stringify({ success: false, error: 'No response from AI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Analyse Receipt] AI response text:', textContent);

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Analyse Receipt] Could not find JSON in response');
      return new Response(
        JSON.stringify({ success: false, error: 'Could not parse AI response' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('[Analyse Receipt] Parsed data:', parsed);

    const result = {
      vendor: parsed.vendor || undefined,
      amount: parsed.amount ? parseFloat(parsed.amount) : undefined,
      date: parsed.date || undefined,
      category: parsed.category || undefined,
      items: parsed.items || undefined,
      success: true,
    };

    console.log('[Analyse Receipt] Success!');
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Analyse Receipt] Exception:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyse receipt',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
