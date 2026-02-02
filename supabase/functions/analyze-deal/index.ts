const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FlipRequest {
  strategy: 'flip';
  address: string;
  propertyType: string;
  purchasePrice: number;
  developmentBudget: number;
  gdv: number;
  projectTimeline: number;
  holdingCosts?: number;
}

interface BTLRequest {
  strategy: 'btl';
  address: string;
  propertyType: string;
  purchasePrice: number;
  monthlyRent: number;
  refurbBudget?: number;
  monthlyExpenses?: number;
  depositPercent: number;
  mortgageRate?: number;
}

interface BRRRRequest {
  strategy: 'brrr';
  address: string;
  propertyType: string;
  purchasePrice: number;
  refurbBudget: number;
  postRefurbValue: number;
  monthlyRent: number;
  refinancePercent: number;
}

type AnalysisRequest = FlipRequest | BTLRequest | BRRRRequest;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData: AnalysisRequest = await req.json();

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    let prompt = '';
    let analysisResult: any = {};

    if (formData.strategy === 'flip') {
      const saleCosts = Math.round(formData.gdv * 0.02);
      const totalInvestment = formData.purchasePrice + formData.developmentBudget + (formData.holdingCosts || 0);
      const grossProfit = formData.gdv - totalInvestment - saleCosts;
      const profitMargin = (grossProfit / totalInvestment) * 100;

      analysisResult = {
        strategy: 'flip',
        purchasePrice: Number(formData.purchasePrice),
        developmentBudget: Number(formData.developmentBudget),
        gdv: Number(formData.gdv),
        projectTimeline: Number(formData.projectTimeline),
        holdingCosts: Number(formData.holdingCosts || 0),
        saleCosts: Number(saleCosts),
        grossProfit: Number(grossProfit),
        profitMargin: Number(profitMargin),
        totalInvestment: Number(totalInvestment),
        roi: Number(profitMargin),
      };

      let dealRating: string;
      if (profitMargin >= 25) {
        dealRating = 'good';
      } else if (profitMargin >= 15) {
        dealRating = 'fair';
      } else {
        dealRating = 'poor';
      }

      analysisResult.dealRating = dealRating;

      prompt = `Analyse this UK property flip/development as an expert. Be extremely concise.

Address: ${formData.address}
Purchase: £${formData.purchasePrice.toLocaleString()} | Dev Budget: £${formData.developmentBudget.toLocaleString()} | GDV: £${formData.gdv.toLocaleString()}
Projected Profit: £${grossProfit.toLocaleString()} (${profitMargin.toFixed(1)}% margin)
Rating: ${dealRating}

Write MAXIMUM 4 sentences (250 characters total) covering:
- Sentence 1: Overall verdict + primary reason
- Sentence 2-3: Key metric context (profit margin strength, GDV realism)
- Sentence 4: Strategic insight or main concern

Format as JSON (ONLY JSON):
{
  "reasoning": "Your 4-sentence analysis here",
  "marketComparison": "1-2 sentences on GDV vs local market in ${formData.address}",
  "riskFactors": ["risk 1", "risk 2", "risk 3"]
}`;

    } else if (formData.strategy === 'btl') {
      const annualRent = formData.monthlyRent * 12;
      const grossYield = (annualRent / formData.purchasePrice) * 100;

      const voidPeriod = annualRent * 0.08;
      const maintenance = annualRent * 0.10;
      const management = formData.monthlyExpenses || (formData.monthlyRent * 0.10);
      const insurance = 300;
      const totalAnnualExpenses = voidPeriod + maintenance + (management * 12) + insurance;

      const netAnnualIncome = annualRent - totalAnnualExpenses;
      const netYield = (netAnnualIncome / formData.purchasePrice) * 100;

      const deposit = formData.purchasePrice * (formData.depositPercent / 100);
      const loanAmount = formData.purchasePrice - deposit;
      const stampDuty = calculateStampDuty(formData.purchasePrice);
      const legalFees = 1500;
      const totalInvestment = deposit + stampDuty + legalFees + (formData.refurbBudget || 0);

      let monthlyMortgage = 0;
      if (formData.mortgageRate && formData.mortgageRate > 0) {
        const monthlyRate = (formData.mortgageRate / 100) / 12;
        const numPayments = 25 * 12;
        monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      }

      const monthlyCashFlow = formData.monthlyRent - (formData.monthlyExpenses || 0) - monthlyMortgage;
      const annualCashFlow = monthlyCashFlow * 12;
      const roi = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

      analysisResult = {
        strategy: 'btl',
        purchasePrice: Number(formData.purchasePrice),
        monthlyRent: Number(formData.monthlyRent),
        grossYield: Number(grossYield),
        netYield: Number(netYield),
        monthlyCashFlow: Number(monthlyCashFlow),
        monthlyExpenses: Number(formData.monthlyExpenses || 0),
        totalInvestment: Number(totalInvestment),
        roi: Number(roi),
      };

      let dealRating: string;
      if (grossYield >= 6 && monthlyCashFlow >= 0) {
        dealRating = 'good';
      } else if ((grossYield >= 4 && grossYield < 6) || monthlyCashFlow >= 0) {
        dealRating = 'fair';
      } else {
        dealRating = 'poor';
      }

      analysisResult.dealRating = dealRating;

      prompt = `Analyse this UK Buy-to-Let investment as an expert. Be extremely concise.

Address: ${formData.address}
Purchase: £${formData.purchasePrice.toLocaleString()} | Rent: £${formData.monthlyRent.toLocaleString()}/month
Gross Yield: ${grossYield.toFixed(1)}% | Cash Flow: ${monthlyCashFlow >= 0 ? '+' : ''}£${Math.round(monthlyCashFlow)}
Rating: ${dealRating}

Write MAXIMUM 4 sentences (250 characters total) covering:
- Sentence 1: Overall verdict + primary reason
- Sentence 2-3: Yield/cash flow context
- Sentence 4: Strategic insight or main concern

Format as JSON (ONLY JSON):
{
  "reasoning": "Your 4-sentence analysis here",
  "marketComparison": "1-2 sentences on rent vs local market in ${formData.address}",
  "riskFactors": ["risk 1", "risk 2", "risk 3"]
}`;

    } else if (formData.strategy === 'brrr') {
      // BRRR Calculations - Using cash purchase assumption for cleaner calculation
      // Initial Capital = Purchase Price + Refurb Budget (assuming cash purchase or bridging)
      const initialInvestment = formData.purchasePrice + formData.refurbBudget;

      // New Mortgage = Post-Refurb Value × Refinance LTV%
      const refinanceAmount = formData.postRefurbValue * (formData.refinancePercent / 100);

      // Capital Returned = Amount raised from refinance
      const capitalRecovered = Math.min(refinanceAmount, initialInvestment);

      // Capital Left in Deal = Initial Capital - Capital Returned
      let capitalLeftIn = Math.max(0, initialInvestment - capitalRecovered);

      // Remaining Equity = Post-Refurb Value - New Mortgage
      const remainingEquity = formData.postRefurbValue - refinanceAmount;

      // Annual Rental Income (gross, no expenses)
      const annualRentalIncome = formData.monthlyRent * 12;

      // ROI = ((Monthly Rent × 12) / Capital Left in Deal) × 100
      let roi = 0;
      let isInfiniteReturn = false;

      if (capitalRecovered >= initialInvestment) {
        // Infinite return scenario - all capital returned
        isInfiniteReturn = true;
        capitalLeftIn = 0;
        roi = Infinity;
      } else if (capitalLeftIn > 0) {
        roi = (annualRentalIncome / capitalLeftIn) * 100;
      }

      analysisResult = {
        strategy: 'brrr',
        purchasePrice: Number(formData.purchasePrice),
        refurbBudget: Number(formData.refurbBudget),
        initialInvestment: Number(initialInvestment),
        postRefurbValue: Number(formData.postRefurbValue),
        capitalRecovered: Number(capitalRecovered),
        capitalLeftIn: Number(capitalLeftIn),
        remainingEquity: Number(remainingEquity),
        monthlyRent: Number(formData.monthlyRent),
        refinancePercent: Number(formData.refinancePercent),
        totalInvestment: Number(initialInvestment),
        roi: Number(roi),
        isInfiniteReturn: isInfiniteReturn,
      };

      // Proper BRRR Rating Logic
      let dealRating: string;
      const recoveryRate = (capitalRecovered / initialInvestment) * 100;
      const roiValue = isInfiniteReturn ? Infinity : roi;
      const equityPercent = (remainingEquity / formData.postRefurbValue) * 100;

      // Excellent Deal: Capital recovery ≥80% OR (ROI ≥30% AND recovery ≥50%) OR Infinite return
      if (isInfiniteReturn || recoveryRate >= 80 || (roiValue >= 30 && recoveryRate >= 50)) {
        dealRating = 'excellent';
      }
      // Good Deal: (Recovery 50-79% AND ROI ≥20%) OR Recovery ≥80% OR ROI ≥25%
      else if ((recoveryRate >= 50 && recoveryRate < 80 && roiValue >= 20) || recoveryRate >= 80 || roiValue >= 25) {
        dealRating = 'good';
      }
      // Marginal Deal: (Recovery 30-49% AND ROI 15-24%) OR (Recovery ≥50% AND ROI 10-19%)
      else if ((recoveryRate >= 30 && recoveryRate < 50 && roiValue >= 15 && roiValue < 25) || (recoveryRate >= 50 && roiValue >= 10 && roiValue < 20)) {
        dealRating = 'fair';
      }
      // Poor Deal: Everything else including (Recovery <30% AND ROI <15%) OR ROI <10%
      else {
        dealRating = 'poor';
      }

      analysisResult.dealRating = dealRating;

      prompt = `Analyse this UK BRRR investment as an expert. Be extremely concise.

Address: ${formData.address}
Purchase: £${formData.purchasePrice.toLocaleString()} | Refurb: £${formData.refurbBudget.toLocaleString()} | Post-Refurb Value: £${formData.postRefurbValue.toLocaleString()}
Capital Recovered: £${capitalRecovered.toLocaleString()} (${recoveryRate.toFixed(1)}%) | Capital Left In: £${capitalLeftIn.toLocaleString()}
${isInfiniteReturn ? 'INFINITE RETURN - All capital returned!' : `ROI: ${roi.toFixed(1)}% on remaining capital`}
Monthly Rent: £${formData.monthlyRent.toLocaleString()}
Rating: ${dealRating}

Write EXACTLY 4 sentences (250 characters total):
- Sentence 1: Overall verdict + primary reason (ROI or capital recovery focus)
- Sentence 2: ${recoveryRate >= 70 ? 'Highlight strong capital recovery' : 'Note capital recovery limitation'}
- Sentence 3: ${isInfiniteReturn ? 'Emphasize infinite return' : roiValue >= 20 ? 'Highlight strong ROI compensating for capital requirements' : 'Note ROI context'}
- Sentence 4: Strategic fit - who this suits (long-term hold vs rapid recycling)

Format as JSON (ONLY JSON):
{
  "reasoning": "Your 4-sentence analysis here",
  "marketComparison": "1-2 sentences comparing valuation and rent to ${formData.address} market",
  "riskFactors": ["risk 1", "risk 2", "risk 3"]
}`;
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
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    let analysisText = "";
    for (const content of data.content) {
      if (content.type === "text") {
        analysisText += content.text;
      }
    }

    let aiResponse;
    try {
      const jsonMatch = analysisText.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Attempted to parse:", analysisText);
      throw new Error("Failed to parse AI response as JSON");
    }

    analysisResult.reasoning = aiResponse.reasoning;
    analysisResult.marketComparison = aiResponse.marketComparison;
    analysisResult.riskFactors = aiResponse.riskFactors || [];

    if (!analysisResult.dealRating) {
      throw new Error("Invalid analysis format received from AI");
    }

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error analyzing deal:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to analyse deal",
        details: error.toString()
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

function calculateStampDuty(price: number): number {
  if (price <= 250000) return 0;

  let duty = 0;
  if (price > 250000) {
    duty += Math.min(price - 250000, 675000 - 250000) * 0.05;
  }
  if (price > 925000) {
    duty += Math.min(price - 925000, 1500000 - 925000) * 0.10;
  }
  if (price > 1500000) {
    duty += (price - 1500000) * 0.12;
  }

  duty += price * 0.03;

  return Math.round(duty);
}
