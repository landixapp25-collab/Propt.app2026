import { useState } from 'react';
import { Building, TrendingUp, TrendingDown, Home, Sparkles, ChevronRight, Bell, Plus, Loader2 } from 'lucide-react';
import { Property, Transaction } from '../types';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface DashboardProps {
  properties: Property[];
  transactions: Transaction[];
  onPropertyClick: (property: Property) => void;
  onViewInsights: () => void;
  onAddProperty: () => void;
  hasInsights: boolean;
}

interface PortfolioInsights {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  portfolioScore: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    actionable: boolean;
  }[];
  underperformingProperties: {
    propertyName: string;
    issue: string;
    suggestion: string;
  }[];
  opportunityScore: number;
  marketOutlook: string;
  nextSteps: string[];
}

export default function Dashboard({
  properties,
  transactions,
  onPropertyClick,
  onViewInsights,
  onAddProperty,
  hasInsights
}: DashboardProps) {
  const [insightsLoading, setInsightsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
  const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
  const totalEquity = totalValue - totalInvestment;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyIncome = transactions
    .filter(t => t.type === 'Income' && new Date(t.date) >= firstDayOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'Expense' && new Date(t.date) >= firstDayOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const cashFlow = monthlyIncome - monthlyExpenses;

  const generateInsights = async () => {
    setInsightsLoading(true);

    try {
      const portfolioSummary = {
        totalProperties: properties.length,
        totalValue: totalValue,
        totalInvestment: totalInvestment,
        currentMonthlyIncome: monthlyIncome,
        currentMonthlyExpenses: monthlyExpenses,
        properties: properties.map(p => {
          const propertyTransactions = transactions.filter(t => t.propertyId === p.id);
          const income = propertyTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
          const expenses = propertyTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

          return {
            name: p.name,
            type: p.propertyType,
            purchasePrice: p.purchasePrice,
            currentValue: p.currentValue,
            totalIncome: income,
            totalExpenses: expenses,
            transactionCount: propertyTransactions.length,
          };
        }),
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioSummary }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data: { insights: PortfolioInsights } = await response.json();
      onViewInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const getPropertyNetProfit = (property: Property) => {
    const propertyTransactions = transactions.filter(t => t.propertyId === property.id);
    const income = propertyTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = propertyTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expenses + (property.currentValue - property.purchasePrice);
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'House': 'bg-blue-100 text-blue-700',
      'Flat': 'bg-purple-100 text-purple-700',
      'Commercial': 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#F7F9FC' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Logo size={32} />
            <h1 className="text-xl font-bold text-gray-800">Propt</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={24} color="#EF4444" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Value */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <Building size={24} className="text-[#FF6B6B] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-400">Portfolio Value</p>
          </div>

          {/* Total Equity */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <TrendingUp size={24} className="text-[#4ECDC4] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">{formatCurrency(totalEquity)}</p>
            <p className="text-sm text-gray-400">Total Equity</p>
          </div>

          {/* Monthly Income */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <TrendingUp size={24} className="text-[#4ECDC4] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-gray-400">Monthly Income</p>
          </div>

          {/* Cash Flow */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <TrendingDown size={24} className={`mb-3 ${cashFlow >= 0 ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'}`} />
            <p className={`text-2xl font-bold mb-1 ${cashFlow >= 0 ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'}`}>
              {formatCurrency(Math.abs(cashFlow))}
            </p>
            <p className="text-sm text-gray-400">Cash Flow</p>
          </div>
        </div>

        {/* AI Insights Card */}
        {properties.length > 0 && (
          <div className="bg-gradient-to-br from-[#14233C] to-[#1e3a5f] rounded-xl p-6 shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                  <Sparkles size={24} className="text-[#F8F9FA]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F8F9FA]">Portfolio Insights</h2>
                  <p className="text-sm text-gray-400">AI-powered recommendations</p>
                </div>
              </div>
            </div>

            {hasInsights ? (
              <button
                onClick={onViewInsights}
                className="w-full py-3 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg font-semibold hover:bg-[#FF5252] transition-colors flex items-center justify-center gap-2"
              >
                View Insights
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={generateInsights}
                disabled={insightsLoading}
                className="w-full py-3 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg font-semibold hover:bg-[#FF5252] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {insightsLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Insights
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Properties Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#F8F9FA]">Your Properties</h2>
            <button
              onClick={onAddProperty}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg hover:bg-[#FF5252] transition-colors font-semibold text-sm"
            >
              <Plus size={18} />
              Add Property
            </button>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <Home size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-2">No Properties Yet</h3>
              <p className="text-gray-400 mb-6">Start building your portfolio by adding your first property</p>
              <button
                onClick={onAddProperty}
                className="px-6 py-3 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg hover:bg-[#FF5252] transition-colors font-semibold inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Property
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => {
                const netProfit = getPropertyNetProfit(property);
                const isProfit = netProfit >= 0;

                return (
                  <button
                    key={property.id}
                    onClick={() => onPropertyClick(property)}
                    className="w-full bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden"
                  >
                    {property.aiAnalysis && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB84D] p-2 rounded-full">
                          <Sparkles size={16} className="text-[#F8F9FA]" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-12">
                        <h3 className="text-lg font-bold text-[#F8F9FA] mb-2 group-hover:text-[#FF6B6B] transition-colors">
                          {property.name}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(property.propertyType)}`}>
                          {property.propertyType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Purchase</p>
                          <p className="font-semibold text-[#F8F9FA]">{formatCurrency(property.purchasePrice)}</p>
                        </div>
                        <div className="text-gray-300">|</div>
                        <div>
                          <p className="text-gray-400">Current</p>
                          <p className="font-semibold text-[#F8F9FA]">{formatCurrency(property.currentValue)}</p>
                        </div>
                      </div>

                      <ChevronRight size={20} className="text-gray-400 group-hover:text-[#FF6B6B] transition-colors" />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-400">Net Position</span>
                      <div className={`flex items-center gap-1 font-bold ${isProfit ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'}`}>
                        {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        <span>{formatCurrency(Math.abs(netProfit))}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
