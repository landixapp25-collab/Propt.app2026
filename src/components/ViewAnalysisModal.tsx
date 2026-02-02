import { X, Sparkles, TrendingUp, AlertTriangle, Building, Wrench, Target, Wallet, PoundSterling, Percent, BarChart, RefreshCw, Lock, Infinity } from 'lucide-react';
import { SavedDeal } from '../types';

interface ViewAnalysisModalProps {
  deal: SavedDeal;
  onClose: () => void;
}

export default function ViewAnalysisModal({ deal, onClose }: ViewAnalysisModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'fair':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'Excellent Deal';
      case 'good':
        return 'Good Deal';
      case 'fair':
        return 'Fair Deal';
      case 'poor':
        return 'Poor Deal';
      default:
        return 'Analysed';
    }
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'flip':
        return 'Development/Flip';
      case 'btl':
        return 'Buy-to-Let';
      case 'brrr':
        return 'BRRR';
      default:
        return strategy;
    }
  };

  const renderMetrics = () => {
    const analysis = deal.aiAnalysis;

    if (deal.strategy === 'flip') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Building size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Purchase Price</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.purchasePrice || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Development Costs</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.developmentBudget || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Total Project Cost</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.totalInvestment || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Target size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Estimated GDV</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.gdv || 0)}
            </p>
          </div>
          <div className={`rounded-lg p-4 border ${
            analysis.grossProfit && analysis.grossProfit >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className={analysis.grossProfit && analysis.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'} />
              <p className={`text-sm ${analysis.grossProfit && analysis.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Projected Profit
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              analysis.grossProfit && analysis.grossProfit >= 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {formatCurrency(analysis.grossProfit || 0)}
            </p>
          </div>
          <div className={`rounded-lg p-4 border ${
            analysis.profitMargin && analysis.profitMargin >= 20 ? 'bg-green-50 border-green-200' :
            analysis.profitMargin && analysis.profitMargin >= 15 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Percent size={18} className={
                analysis.profitMargin && analysis.profitMargin >= 20 ? 'text-green-700' :
                analysis.profitMargin && analysis.profitMargin >= 15 ? 'text-amber-700' : 'text-red-700'
              } />
              <p className={`text-sm ${
                analysis.profitMargin && analysis.profitMargin >= 20 ? 'text-green-700' :
                analysis.profitMargin && analysis.profitMargin >= 15 ? 'text-amber-700' : 'text-red-700'
              }`}>
                Profit Margin
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              analysis.profitMargin && analysis.profitMargin >= 20 ? 'text-green-900' :
              analysis.profitMargin && analysis.profitMargin >= 15 ? 'text-amber-900' : 'text-red-900'
            }`}>
              {analysis.profitMargin?.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    } else if (deal.strategy === 'btl') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Building size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Purchase Price</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.purchasePrice || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Monthly Income</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.monthlyRent || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Percent size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Gross Yield</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {analysis.grossYield?.toFixed(2)}%
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <BarChart size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Net Yield</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {analysis.netYield?.toFixed(2)}%
            </p>
          </div>
          <div className={`rounded-lg p-4 border ${
            analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling size={18} className={analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'} />
              <p className={`text-sm ${analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Monthly Cash Flow
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {analysis.monthlyCashFlow && analysis.monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(Math.abs(analysis.monthlyCashFlow || 0))}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-green-700" />
              <p className="text-sm text-green-700">Cash on Cash ROI</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {analysis.roi?.toFixed(2)}%
            </p>
          </div>
        </div>
      );
    } else if (deal.strategy === 'brrr') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Initial Capital</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.initialInvestment || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Target size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Refinanced Value</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.postRefurbValue || 0)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw size={18} className="text-green-700" />
              <p className="text-sm text-green-700">Capital Returned</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(analysis.capitalRecovered || 0)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} className="text-amber-700" />
              <p className="text-sm text-amber-700">Capital Left in Deal</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">
              {formatCurrency(analysis.capitalLeftIn || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Remaining Equity</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.remainingEquity || 0)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling size={18} className="text-blue-700" />
              <p className="text-sm text-blue-700">Monthly Cash Flow</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(analysis.monthlyRent || 0)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              (gross rent, before costs)
            </p>
          </div>
          <div className={`rounded-lg p-4 border ${
            analysis.isInfiniteReturn || (analysis.roi && analysis.roi > 100)
              ? 'bg-purple-50 border-purple-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {analysis.isInfiniteReturn || (analysis.roi && analysis.roi > 100) ? (
                <Infinity size={18} className="text-purple-700" />
              ) : (
                <TrendingUp size={18} className="text-green-700" />
              )}
              <p className={`text-sm ${
                analysis.isInfiniteReturn || (analysis.roi && analysis.roi > 100)
                  ? 'text-purple-700'
                  : 'text-green-700'
              }`}>
                Annualized ROI
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              analysis.isInfiniteReturn || (analysis.roi && analysis.roi > 100)
                ? 'text-purple-900'
                : 'text-green-900'
            }`}>
              {analysis.isInfiniteReturn || (analysis.roi && analysis.roi > 100) ? '∞' : `${analysis.roi?.toFixed(1)}%`}
            </p>
            {(analysis.isInfiniteReturn || (analysis.roi && analysis.roi > 100)) && (
              <p className="text-xs text-purple-600 mt-1 font-semibold">
                Infinite Return Achieved!
              </p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#537d90] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#537d90] border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Sparkles size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F8F9FA]">AI Deal Analysis</h2>
              <p className="text-sm text-gray-300">{deal.address} · {getStrategyLabel(deal.strategy)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#456871] rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`border rounded-lg p-6 ${getRatingColor(deal.aiAnalysis.dealRating)}`}>
            <h3 className="text-2xl font-bold mb-2">{getRatingLabel(deal.aiAnalysis.dealRating)}</h3>
            {deal.aiAnalysis.reasoning && (
              <p className="text-sm opacity-90">{deal.aiAnalysis.reasoning}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#F8F9FA] mb-4">Key Metrics</h3>
            {renderMetrics()}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#F8F9FA] mb-4">Market Comparison</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-line">{deal.aiAnalysis.marketComparison}</p>
            </div>
          </div>

          {deal.aiAnalysis.riskFactors && deal.aiAnalysis.riskFactors.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-600" />
                Risk Factors
              </h3>
              <div className="space-y-2">
                {deal.aiAnalysis.riskFactors.map((risk, index) => (
                  <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-900">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deal.aiAnalysis.dataSources && (
            <div>
              <h3 className="text-lg font-bold text-[#F8F9FA] mb-4">Data Sources</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700">{deal.aiAnalysis.dataSources}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
