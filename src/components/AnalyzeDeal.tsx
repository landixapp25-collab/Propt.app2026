import { useState, FormEvent } from 'react';
import { Sparkles, MapPin, PoundSterling, Home, Bed, Wrench, Brain, CheckCircle, AlertCircle, XCircle, Lightbulb, BarChart, AlertTriangle, Bookmark, RefreshCw, Loader, Percent, TrendingUp, Building, Target, Wallet, Lock, Infinity, TrendingDown, Clock } from 'lucide-react';
import { PropertyType, AIAnalysis, InvestmentStrategy } from '../types';
import { savedDealService } from '../lib/database';
import Logo from './Logo';

interface AnalysisResult extends AIAnalysis {}

interface AnalyzeDealProps {
  onSaveSuccess?: () => void;
}

export default function AnalyzeDeal({ onSaveSuccess }: AnalyzeDealProps) {
  const [strategy, setStrategy] = useState<InvestmentStrategy>('flip');
  const [formData, setFormData] = useState({
    address: '',
    propertyType: 'House' as PropertyType,

    purchasePrice: '',
    developmentBudget: '',
    gdv: '',
    projectTimeline: '',
    holdingCosts: '',

    monthlyRent: '',
    monthlyExpenses: '',
    depositPercent: '25',
    mortgageRate: '',
    refurbBudget: '',

    postRefurbValue: '',
    refinancePercent: '75',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Property address is required';
    }

    if (strategy === 'flip') {
      if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
        newErrors.purchasePrice = 'Purchase price must be greater than 0';
      }
      if (!formData.developmentBudget || parseFloat(formData.developmentBudget) < 0) {
        newErrors.developmentBudget = 'Development budget is required';
      }
      if (!formData.gdv || parseFloat(formData.gdv) <= 0) {
        newErrors.gdv = 'Estimated GDV is required';
      }
      if (!formData.projectTimeline || parseInt(formData.projectTimeline) <= 0) {
        newErrors.projectTimeline = 'Project timeline is required';
      }
    } else if (strategy === 'btl') {
      if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
        newErrors.purchasePrice = 'Purchase price must be greater than 0';
      }
      if (!formData.monthlyRent || parseFloat(formData.monthlyRent) <= 0) {
        newErrors.monthlyRent = 'Monthly rent is required';
      }
    } else if (strategy === 'brrr') {
      if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
        newErrors.purchasePrice = 'Purchase price must be greater than 0';
      }
      if (!formData.refurbBudget || parseFloat(formData.refurbBudget) <= 0) {
        newErrors.refurbBudget = 'Refurb budget is required';
      }
      if (!formData.postRefurbValue || parseFloat(formData.postRefurbValue) <= 0) {
        newErrors.postRefurbValue = 'Post-refurb valuation is required';
      }
      if (!formData.monthlyRent || parseFloat(formData.monthlyRent) <= 0) {
        newErrors.monthlyRent = 'Monthly rent is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsAnalyzing(true);
      setApiError(null);

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase configuration not found');
        }

        const requestBody: any = {
          strategy,
          address: formData.address,
          propertyType: formData.propertyType,
        };

        if (strategy === 'flip') {
          requestBody.purchasePrice = parseFloat(formData.purchasePrice);
          requestBody.developmentBudget = parseFloat(formData.developmentBudget);
          requestBody.gdv = parseFloat(formData.gdv);
          requestBody.projectTimeline = parseInt(formData.projectTimeline);
          requestBody.holdingCosts = formData.holdingCosts ? parseFloat(formData.holdingCosts) : 0;
        } else if (strategy === 'btl') {
          requestBody.purchasePrice = parseFloat(formData.purchasePrice);
          requestBody.monthlyRent = parseFloat(formData.monthlyRent);
          requestBody.refurbBudget = formData.refurbBudget ? parseFloat(formData.refurbBudget) : 0;
          requestBody.monthlyExpenses = formData.monthlyExpenses ? parseFloat(formData.monthlyExpenses) : 0;
          requestBody.depositPercent = parseFloat(formData.depositPercent);
          requestBody.mortgageRate = formData.mortgageRate ? parseFloat(formData.mortgageRate) : 0;
        } else if (strategy === 'brrr') {
          requestBody.purchasePrice = parseFloat(formData.purchasePrice);
          requestBody.refurbBudget = parseFloat(formData.refurbBudget);
          requestBody.postRefurbValue = parseFloat(formData.postRefurbValue);
          requestBody.monthlyRent = parseFloat(formData.monthlyRent);
          requestBody.refinancePercent = parseFloat(formData.refinancePercent);

          console.log('🔍 USER TYPED VALUES (RAW STRINGS):', {
            purchasePrice: formData.purchasePrice,
            refurbBudget: formData.refurbBudget,
            postRefurbValue: formData.postRefurbValue,
            monthlyRent: formData.monthlyRent,
            refinancePercent: formData.refinancePercent
          });

          console.log('📤 SENDING TO API (PARSED NUMBERS):', {
            purchasePrice: requestBody.purchasePrice,
            refurbBudget: requestBody.refurbBudget,
            postRefurbValue: requestBody.postRefurbValue,
            monthlyRent: requestBody.monthlyRent,
            refinancePercent: requestBody.refinancePercent
          });
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/analyze-deal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `API request failed with status ${response.status}`;
          throw new Error(errorMessage);
        }

        const analysisResult = await response.json();

        console.log('📥 RECEIVED FROM API:', analysisResult);

        if (strategy === 'brrr') {
          console.log('🔍 CHECKING BRRR VALUES:', {
            monthlyRent_received: analysisResult.monthlyRent,
            monthlyRent_userTyped: formData.monthlyRent,
            valuesMatch: analysisResult.monthlyRent === parseFloat(formData.monthlyRent)
          });
        }

        if (analysisResult.error) {
          throw new Error(analysisResult.error);
        }

        setAnalysis(analysisResult);
      } catch (error: any) {
        console.error('Error analyzing deal:', error);

        let errorMessage = 'Unable to analyse deal. Please try again.';

        if (error.message?.includes('API key')) {
          errorMessage = 'Invalid API key. Please check your Anthropic API key in the .env file.';
        } else if (error.message?.includes('401')) {
          errorMessage = 'Authentication failed. Please verify your Anthropic API key.';
        } else if (error.message?.includes('403')) {
          errorMessage = 'Access denied. Your API key may not have the correct permissions.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }

        setApiError(errorMessage);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSaveDeal = async () => {
    if (!analysis) return;

    setIsSaving(true);
    try {
      const dealData: any = {
        address: formData.address,
        strategy,
        propertyType: formData.propertyType,
        aiAnalysis: analysis,
        analyzedDate: new Date().toISOString(),
        status: 'reviewing',
      };

      if (strategy === 'flip') {
        dealData.askingPrice = parseFloat(formData.purchasePrice);
        dealData.developmentBudget = parseFloat(formData.developmentBudget);
        dealData.gdv = parseFloat(formData.gdv);
        dealData.projectTimeline = parseInt(formData.projectTimeline);
        dealData.holdingCosts = formData.holdingCosts ? parseFloat(formData.holdingCosts) : 0;
      } else if (strategy === 'btl') {
        dealData.askingPrice = parseFloat(formData.purchasePrice);
        dealData.monthlyRent = parseFloat(formData.monthlyRent);
        dealData.renovationCosts = formData.refurbBudget ? parseFloat(formData.refurbBudget) : 0;
        dealData.monthlyExpenses = formData.monthlyExpenses ? parseFloat(formData.monthlyExpenses) : 0;
        dealData.depositPercent = parseFloat(formData.depositPercent);
        dealData.mortgageRate = formData.mortgageRate ? parseFloat(formData.mortgageRate) : 0;
      } else if (strategy === 'brrr') {
        dealData.askingPrice = parseFloat(formData.purchasePrice);
        dealData.renovationCosts = parseFloat(formData.refurbBudget);
        dealData.postRefurbValue = parseFloat(formData.postRefurbValue);
        dealData.monthlyRent = parseFloat(formData.monthlyRent);
        dealData.refinancePercent = parseFloat(formData.refinancePercent);
        dealData.monthlyExpenses = formData.monthlyExpenses ? parseFloat(formData.monthlyExpenses) : 0;
      }

      await savedDealService.create(dealData);

      setIsSaving(false);
      setSaveSuccess(true);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        handleReset();
        setSaveSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving deal:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to save deal: ${errorMessage}`);
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      address: '',
      propertyType: 'House',
      purchasePrice: '',
      developmentBudget: '',
      gdv: '',
      projectTimeline: '',
      holdingCosts: '',
      monthlyRent: '',
      monthlyExpenses: '',
      depositPercent: '25',
      mortgageRate: '',
      refurbBudget: '',
      postRefurbValue: '',
      refinancePercent: '75',
    });
    setAnalysis(null);
    setApiError(null);
    setErrors({});
  };

  const isFormValid = () => {
    if (!formData.address.trim()) return false;

    if (strategy === 'flip') {
      return formData.purchasePrice !== '' && parseFloat(formData.purchasePrice) > 0 &&
             formData.developmentBudget !== '' && parseFloat(formData.developmentBudget) >= 0 &&
             formData.gdv !== '' && parseFloat(formData.gdv) > 0 &&
             formData.projectTimeline !== '' && parseInt(formData.projectTimeline) > 0;
    } else if (strategy === 'btl') {
      return formData.purchasePrice !== '' && parseFloat(formData.purchasePrice) > 0 &&
             formData.monthlyRent !== '' && parseFloat(formData.monthlyRent) > 0;
    } else if (strategy === 'brrr') {
      return formData.purchasePrice !== '' && parseFloat(formData.purchasePrice) > 0 &&
             formData.refurbBudget !== '' && parseFloat(formData.refurbBudget) > 0 &&
             formData.postRefurbValue !== '' && parseFloat(formData.postRefurbValue) > 0 &&
             formData.monthlyRent !== '' && parseFloat(formData.monthlyRent) > 0;
    }
    return false;
  };

  const renderMetrics = () => {
    if (!analysis) return null;

    if (strategy === 'flip') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Building size={20} className="text-[#10B981]" />
              <p className="text-sm text-gray-300">Purchase Price</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.purchasePrice?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={20} className="text-[#F59E0B]" />
              <p className="text-sm text-gray-300">Development Costs</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.developmentBudget?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-[#3B82F6]" />
              <p className="text-sm text-gray-300">Total Project Cost</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.totalInvestment?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-[#8B5CF6]" />
              <p className="text-sm text-gray-300">Estimated GDV</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.gdv?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className={analysis.grossProfit && analysis.grossProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} />
              <p className="text-sm text-gray-300">Projected Profit</p>
            </div>
            <p
              className={`text-2xl font-bold ${
                analysis.grossProfit && analysis.grossProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              £{analysis.grossProfit?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Percent size={20} className={
                analysis.profitMargin && analysis.profitMargin >= 20 ? 'text-[#10B981]' :
                analysis.profitMargin && analysis.profitMargin >= 15 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
              } />
              <p className="text-sm text-gray-300">Profit Margin</p>
            </div>
            <p className={`text-2xl font-bold ${
              analysis.profitMargin && analysis.profitMargin >= 20 ? 'text-[#10B981]' :
              analysis.profitMargin && analysis.profitMargin >= 15 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
            }`}>
              {analysis.profitMargin?.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    } else if (strategy === 'btl') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Building size={20} className="text-[#10B981]" />
              <p className="text-sm text-gray-300">Purchase Price</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.purchasePrice?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling size={20} className="text-[#8B5CF6]" />
              <p className="text-sm text-gray-300">Monthly Income</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.monthlyRent?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Percent size={20} className="text-[#3B82F6]" />
              <p className="text-sm text-gray-300">Gross Yield</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">{analysis.grossYield?.toFixed(2)}%</p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <BarChart size={20} className="text-[#6366F1]" />
              <p className="text-sm text-gray-300">Net Yield</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">{analysis.netYield?.toFixed(2)}%</p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling size={20} className={analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} />
              <p className="text-sm text-gray-300">Monthly Cash Flow</p>
            </div>
            <p
              className={`text-2xl font-bold ${
                analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? '+' : ''}£{Math.abs(analysis.monthlyCashFlow || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-[#10B981]" />
              <p className="text-sm text-gray-300">Cash on Cash ROI</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">{analysis.roi?.toFixed(2)}%</p>
          </div>
        </div>
      );
    } else if (strategy === 'brrr') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-[#3B82F6]" />
              <p className="text-sm text-gray-300">Initial Capital</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.initialInvestment?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={20} className="text-[#10B981]" />
              <p className="text-sm text-gray-300">Capital Returned</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.capitalRecovered?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-[#F59E0B]" />
              <p className="text-sm text-gray-300">Capital Left in Deal</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.capitalLeftIn?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={20} className="text-[#8B5CF6]" />
              <p className="text-sm text-gray-300">Remaining Equity</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              £{analysis.remainingEquity?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling size={20} className="text-[#10B981]" />
              <p className="text-sm text-gray-300">Monthly Cash Flow</p>
              <p className="text-xs text-gray-400">(gross rent, before costs)</p>
            </div>
            <p className="text-2xl font-bold text-[#10B981]">
              £{analysis.monthlyRent?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#537d90] rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              {analysis.isInfiniteReturn ? (
                <Infinity size={20} className="text-[#10B981]" />
              ) : (
                <TrendingUp size={20} className="text-[#10B981]" />
              )}
              <p className="text-sm text-gray-300">Annualized ROI</p>
            </div>
            <p className="text-2xl font-bold text-[#F8F9FA]">
              {analysis.isInfiniteReturn ? '∞' : `${analysis.roi?.toFixed(1)}%`}
            </p>
            {analysis.isInfiniteReturn && (
              <p className="text-xs text-[#10B981] mt-1">Infinite Return!</p>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="max-w-7xl mx-auto relative py-8">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-[#F8F9FA] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle size={24} />
            <span className="font-semibold">Deal saved! View in Saved Deals.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-1 mb-2">
              <Logo size={40} />
              <h2 className="text-3xl font-bold text-[#F8F9FA]">AI Deal Analyser</h2>
            </div>
            <p className="text-gray-200">Get instant insights on any property investment</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#537d90] rounded-lg shadow-lg p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Investment Strategy *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStrategy('flip');
                    setAnalysis(null);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all leading-tight ${
                    strategy === 'flip'
                      ? 'bg-[#FF6B6B] text-[#F8F9FA] shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Development/<br/>Flip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStrategy('btl');
                    setAnalysis(null);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                    strategy === 'btl'
                      ? 'bg-[#FF6B6B] text-[#F8F9FA] shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Buy-to-Let
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStrategy('brrr');
                    setAnalysis(null);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                    strategy === 'brrr'
                      ? 'bg-[#FF6B6B] text-[#F8F9FA] shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  BRRR
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Property Address / Postcode *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address or postcode"
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-300 mb-2">
                Property Type *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home size={18} className="text-gray-400" />
                </div>
                <select
                  id="propertyType"
                  value={formData.propertyType}
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value as PropertyType }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors appearance-none bg-white"
                >
                  <option value="House">House</option>
                  <option value="Flat">Flat</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            {strategy === 'flip' && (
              <>
                <div>
                  <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Price (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PoundSterling size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="189000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
                </div>

                <div>
                  <label htmlFor="developmentBudget" className="block text-sm font-medium text-gray-300 mb-2">
                    Development Budget (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wrench size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="developmentBudget"
                      value={formData.developmentBudget}
                      onChange={(e) => setFormData(prev => ({ ...prev, developmentBudget: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.developmentBudget ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="45000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.developmentBudget && <p className="mt-1 text-sm text-red-600">{errors.developmentBudget}</p>}
                </div>

                <div>
                  <label htmlFor="gdv" className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated GDV (Gross Development Value) (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Target size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="gdv"
                      value={formData.gdv}
                      onChange={(e) => setFormData(prev => ({ ...prev, gdv: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.gdv ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="320000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.gdv && <p className="mt-1 text-sm text-red-600">{errors.gdv}</p>}
                </div>

                <div>
                  <label htmlFor="projectTimeline" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Timeline (months) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="projectTimeline"
                      value={formData.projectTimeline}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectTimeline: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.projectTimeline ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="8"
                      min="1"
                      step="1"
                    />
                  </div>
                  {errors.projectTimeline && <p className="mt-1 text-sm text-red-600">{errors.projectTimeline}</p>}
                </div>

                <div>
                  <label htmlFor="holdingCosts" className="block text-sm font-medium text-gray-300 mb-2">
                    Holding Costs (£) <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="holdingCosts"
                      value={formData.holdingCosts}
                      onChange={(e) => setFormData(prev => ({ ...prev, holdingCosts: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                      placeholder="e.g., 5000"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              </>
            )}

            {strategy === 'btl' && (
              <>
                <div>
                  <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Price (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PoundSterling size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="189000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
                </div>

                <div>
                  <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Rent (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PoundSterling size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="monthlyRent-btl"
                      value={formData.monthlyRent}
                      onChange={(e) => {
                        console.log('⌨️ BTL Monthly Rent onChange:', {
                          newValue: e.target.value,
                          oldValue: formData.monthlyRent
                        });
                        setFormData(prev => ({ ...prev, monthlyRent: e.target.value }));
                        console.log('✅ State updated to:', e.target.value);
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1000"
                      min="0"
                      step="50"
                    />
                  </div>
                  {errors.monthlyRent && <p className="mt-1 text-sm text-red-600">{errors.monthlyRent}</p>}
                </div>

                <div>
                  <label htmlFor="refurbBudget" className="block text-sm font-medium text-gray-300 mb-2">
                    Refurb Budget (£) <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wrench size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="refurbBudget"
                      value={formData.refurbBudget}
                      onChange={(e) => setFormData(prev => ({ ...prev, refurbBudget: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                      placeholder="e.g., 15000"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Expenses (£) <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PoundSterling size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="monthlyExpenses"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                      placeholder="e.g., 150"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="depositPercent" className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit %
                    </label>
                    <input
                      type="number"
                      id="depositPercent"
                      value={formData.depositPercent}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositPercent: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                      placeholder="25"
                      min="0"
                      max="100"
                      step="5"
                    />
                  </div>

                  <div>
                    <label htmlFor="mortgageRate" className="block text-sm font-medium text-gray-300 mb-2">
                      Mortgage Rate %
                    </label>
                    <input
                      type="number"
                      id="mortgageRate"
                      value={formData.mortgageRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, mortgageRate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                      placeholder="5.5"
                      min="0"
                      max="20"
                      step="0.1"
                    />
                  </div>
                </div>
              </>
            )}

            {strategy === 'brrr' && (
              <>
                <div>
                  <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Price (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PoundSterling size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="150000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
                </div>

                <div>
                  <label htmlFor="refurbBudget" className="block text-sm font-medium text-gray-300 mb-2">
                    Refurb Budget (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wrench size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="refurbBudget"
                      value={formData.refurbBudget}
                      onChange={(e) => setFormData(prev => ({ ...prev, refurbBudget: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.refurbBudget ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="30000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.refurbBudget && <p className="mt-1 text-sm text-red-600">{errors.refurbBudget}</p>}
                </div>

                <div>
                  <label htmlFor="postRefurbValue" className="block text-sm font-medium text-gray-300 mb-2">
                    Post-Refurb Valuation (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Target size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="postRefurbValue"
                      value={formData.postRefurbValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, postRefurbValue: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.postRefurbValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="280000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {errors.postRefurbValue && <p className="mt-1 text-sm text-red-600">{errors.postRefurbValue}</p>}
                </div>

                <div>
                  <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Rent (£) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PoundSterling size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="monthlyRent-brrr"
                      value={formData.monthlyRent}
                      onChange={(e) => {
                        console.log('⌨️ BRRR Monthly Rent onChange:', {
                          newValue: e.target.value,
                          oldValue: formData.monthlyRent,
                          targetValue: e.target.value
                        });
                        setFormData(prev => ({ ...prev, monthlyRent: e.target.value }));
                        console.log('✅ State updated to:', e.target.value);
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors ${
                        errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1200"
                      min="0"
                      step="50"
                    />
                  </div>
                  {errors.monthlyRent && <p className="mt-1 text-sm text-red-600">{errors.monthlyRent}</p>}
                </div>

                <div>
                  <label htmlFor="refinancePercent" className="block text-sm font-medium text-gray-300 mb-2">
                    Refinance % (LTV)
                  </label>
                  <input
                    type="number"
                    id="refinancePercent"
                    value={formData.refinancePercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, refinancePercent: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                    placeholder="75"
                    min="0"
                    max="100"
                    step="5"
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid() || isAnalyzing}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition-all shadow-md ${
                  isFormValid() && !isAnalyzing
                    ? 'bg-[#FF6B6B] text-[#F8F9FA] hover:bg-[#FF5252] hover:shadow-lg active:bg-[#E85A5A]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles size={20} />
                {isAnalyzing ? 'Analysing...' : 'Analyse Deal'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-[#537d90] rounded-lg shadow-lg overflow-hidden h-full min-h-[600px] relative">
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&h=600&fit=crop)',
              }}
            />
            <div className="absolute inset-0 bg-[#537d90] opacity-90" />

            {isAnalyzing && (
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3B82F6] mb-6"></div>
                <h3 className="text-2xl font-bold text-[#F8F9FA] mb-3">
                  AI analysing property...
                </h3>
                <p className="text-gray-300 max-w-md">
                  Running investment calculations and market analysis
                </p>
              </div>
            )}

            {apiError && !isAnalyzing && !analysis && (
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <XCircle size={48} className="text-[#EF4444]" />
                </div>
                <h3 className="text-2xl font-bold text-[#F8F9FA] mb-3">Analysis Failed</h3>
                <p className="text-[#EF4444] mb-6">{apiError}</p>
                <button
                  onClick={() => setApiError(null)}
                  className="px-6 py-3 bg-[#3B82F6] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#2563EB] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="relative z-10 h-full overflow-y-auto p-8">
                <div className="mb-8 flex justify-center">
                  <div
                    className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl shadow-lg ${
                      analysis.dealRating === 'excellent' || analysis.dealRating === 'good'
                        ? 'bg-[#DEF7EC] text-[#047857]'
                        : analysis.dealRating === 'fair'
                        ? 'bg-[#FEF3C7] text-[#B45309]'
                        : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}
                  >
                    {(analysis.dealRating === 'excellent' || analysis.dealRating === 'good') && <CheckCircle size={28} />}
                    {analysis.dealRating === 'fair' && <AlertCircle size={28} />}
                    {analysis.dealRating === 'poor' && <XCircle size={28} />}
                    <span>
                      {analysis.dealRating === 'excellent' && 'Excellent Deal'}
                      {analysis.dealRating === 'good' && 'Good Deal'}
                      {analysis.dealRating === 'fair' && 'Marginal'}
                      {analysis.dealRating === 'poor' && 'Poor Deal'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#537d90] rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-bold text-[#F8F9FA] mb-4">Key Metrics</h3>
                  {renderMetrics()}
                </div>

                <div className="bg-[#537d90] rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={24} className="text-[#F59E0B]" />
                    <h3 className="text-xl font-bold text-[#F8F9FA]">Why This Rating?</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{analysis.reasoning}</p>
                </div>

                <div className="bg-[#537d90] rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart size={24} className="text-[#3B82F6]" />
                    <h3 className="text-xl font-bold text-[#F8F9FA]">Market Comparison</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{analysis.marketComparison}</p>
                </div>

                <div className="bg-[#537d90] rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={24} className="text-[#F59E0B]" />
                    <h3 className="text-xl font-bold text-[#F8F9FA]">Risk Factors</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <AlertTriangle size={18} className="text-[#F59E0B] mt-1 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSaveDeal}
                    disabled={isSaving || saveSuccess}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-lg transition-all shadow-md ${
                      saveSuccess
                        ? 'bg-[#10B981] text-[#F8F9FA]'
                        : isSaving
                        ? 'bg-[#10B981] text-[#F8F9FA] cursor-wait opacity-80'
                        : 'bg-[#10B981] text-[#F8F9FA] hover:bg-[#059669] active:bg-[#047857]'
                    } disabled:cursor-not-allowed`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle size={20} />
                        Saved!
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Bookmark size={20} />
                        Save Deal
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#6B7280] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#4B5563] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                  >
                    <RefreshCw size={20} />
                    Analyse Another Deal
                  </button>
                </div>
              </div>
            )}

            {!isAnalyzing && !analysis && !apiError && (
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="bg-gradient-to-br from-[#DBEAFE] to-[#E0F2FE] w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Brain size={48} className="text-[#3B82F6]" />
                </div>
                <h3 className="text-2xl font-bold text-[#F8F9FA] mb-3">
                  Ready to analyse your next deal
                </h3>
                <p className="text-gray-300 max-w-md leading-relaxed">
                  Choose your investment strategy and enter property details. Our AI will provide instant insights,
                  calculations, and market analysis to help you make informed decisions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
