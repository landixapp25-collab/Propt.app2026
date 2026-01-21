import { useState } from 'react';
import {
  Building,
  TrendingUp,
  TrendingDown,
  Home,
  Sparkles,
  Brain,
  Loader2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Flame,
  Lightbulb,
  Info,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Folder,
  RefreshCw,
  Eye,
  Target,
  Download,
  Package
} from 'lucide-react';
import MetricCard from './MetricCard';
import PropertyCard from './PropertyCard';
import { Property, Transaction, PropertyStatus } from '../types';
import DateRangeFilterModal, { DateRangeOption } from './DateRangeFilterModal';
import { exportAllPropertiesToZip } from '../lib/exportReceipts';

interface DashboardProps {
  properties: Property[];
  transactions: Transaction[];
  onAddTransaction: (propertyId: string) => void;
  onDeleteProperty: (propertyId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onUpdateProperty: (propertyId: string, updates: Partial<Property>) => void;
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

export default function Dashboard({ properties, transactions, onAddTransaction, onDeleteProperty, onDeleteTransaction, onUpdateProperty }: DashboardProps) {
  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = properties.reduce((sum, p) => sum + (p.currentValue !== null ? p.currentValue : 0), 0);
  const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0);

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyIncome = transactions
    .filter(t => t.type === 'Income' && new Date(t.date) >= firstDayOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'Expense' && new Date(t.date) >= firstDayOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const generateInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);

    try {
      const portfolioSummary = {
        totalProperties: properties.length,
        totalValue: totalValue,
        totalInvestment: totalInvestment,
        currentMonthlyIncome: monthlyIncome,
        currentMonthlyExpenses: monthlyExpenses,
        properties: properties.map(p => {
          const propertyTransactions = transactions.filter(t => t.propertyId === p.id);
          const propertyIncome = propertyTransactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);
          const propertyExpenses = propertyTransactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

          const monthlyPropertyIncome = propertyTransactions
            .filter(t => t.type === 'Income' && new Date(t.date) >= firstDayOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);
          const monthlyPropertyExpenses = propertyTransactions
            .filter(t => t.type === 'Expense' && new Date(t.date) >= firstDayOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            name: p.name,
            type: p.type,
            bedrooms: p.bedrooms,
            purchasePrice: p.purchasePrice,
            purchaseDate: p.purchaseDate,
            currentValue: p.currentValue,
            totalIncome: propertyIncome,
            totalExpenses: propertyExpenses,
            monthlyIncome: monthlyPropertyIncome,
            monthlyExpenses: monthlyPropertyExpenses,
            netReturn: propertyIncome - propertyExpenses,
            appreciation: p.currentValue - p.purchasePrice,
          };
        })
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          portfolioSummary
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const parsedInsights = await response.json();
      setInsights(parsedInsights);
      setLastUpdated(new Date());
      setInsightsCollapsed(false);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsightsError('Unable to generate insights. Please try again.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const toggleRecommendation = (index: number) => {
    setExpandedRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleExportAllClick = () => {
    setShowDateRangeModal(true);
  };

  const handleExportAllWithDateRange = async (dateRange: DateRangeOption | null) => {
    setShowDateRangeModal(false);
    setIsExporting(true);
    setExportMessage(null);

    const result = await exportAllPropertiesToZip(properties, transactions, dateRange);

    setIsExporting(false);
    setExportMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    setTimeout(() => {
      setExportMessage(null);
    }, 5000);
  };

  const hasPropertiesWithTransactions = properties.some(p =>
    transactions.some(t => t.propertyId === p.id)
  );

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-emerald-600';
      case 'good':
        return 'text-green-600';
      case 'fair':
        return 'text-amber-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-green-600';
    if (score >= 60) return 'stroke-amber-600';
    return 'stroke-red-600';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flame size={18} className="text-red-600" />;
      case 'medium':
        return <Lightbulb size={18} className="text-amber-600" />;
      case 'low':
        return <Info size={18} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-amber-300 bg-amber-50';
      case 'low':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600 text-[#F8F9FA]';
      case 'medium':
        return 'bg-amber-500 text-[#F8F9FA]';
      case 'low':
        return 'bg-blue-600 text-[#F8F9FA]';
      default:
        return 'bg-gray-600 text-[#F8F9FA]';
    }
  };

  const sortedRecommendations = insights?.recommendations.slice().sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8F9FA] mb-2">Portfolio Overview</h2>
          <p className="text-gray-300">Monitor your property investments and performance</p>
        </div>
        {hasPropertiesWithTransactions && (
          <button
            onClick={handleExportAllClick}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#5a9aa8' }}
          >
            <Package size={20} />
            {isExporting ? 'Preparing...' : 'Export All Tax Packs'}
          </button>
        )}
      </div>

      {/* Portfolio Insights Section */}
      <div className="bg-[#537d90] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFE5E5] p-3 rounded-lg">
                <Sparkles size={28} className="text-[#FF6B6B]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#F8F9FA]">AI Portfolio Insights</h3>
                <p className="text-gray-300">Personalized recommendations based on your portfolio</p>
              </div>
            </div>
            {insights && (
              <button
                onClick={() => setInsightsCollapsed(!insightsCollapsed)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                {insightsCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
              </button>
            )}
          </div>

          {!insights && !insightsLoading && !insightsError && (
            <div className="text-center py-8">
              {properties.length === 0 ? (
                <div>
                  <div className="bg-white/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder size={40} className="text-gray-300" />
                  </div>
                  <p className="text-gray-300 mb-4">Add properties to your portfolio to get AI-powered insights</p>
                  <p className="text-sm text-gray-300">Click "Add Property" in the sidebar to get started</p>
                </div>
              ) : (
                <button
                  onClick={generateInsights}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#FF5252] transition-colors"
                >
                  <Brain size={20} />
                  Generate Insights
                </button>
              )}
            </div>
          )}

          {insightsLoading && (
            <div className="text-center py-12">
              <Loader2 size={48} className="text-[#FF6B6B] animate-spin mx-auto mb-4" />
              <p className="text-gray-300 font-medium">AI analyzing your portfolio...</p>
              <p className="text-sm text-gray-300 mt-2">This may take a few moments</p>
            </div>
          )}

          {insightsError && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
              <p className="text-red-700 font-medium mb-4">{insightsError}</p>
              <button
                onClick={generateInsights}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#FF5252] transition-colors"
              >
                <RefreshCw size={20} />
                Retry
              </button>
            </div>
          )}

          {insights && !insightsCollapsed && (
            <div className="space-y-6 mt-6">
              {/* Portfolio Health Score */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  Portfolio Health Score
                </h4>
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <svg className="transform -rotate-90" width="120" height="120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className={getScoreRingColor(insights.portfolioScore)}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${(insights.portfolioScore / 100) * 314} 314`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(insights.portfolioScore)}`}>
                          {insights.portfolioScore}
                        </div>
                        <div className="text-xs text-gray-300">/ 100</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold capitalize ${getHealthColor(insights.overallHealth)}`}>
                      {insights.overallHealth}
                    </div>
                    <p className="text-gray-300 mt-1">
                      Your portfolio is performing {insights.overallHealth === 'excellent' ? 'exceptionally well' :
                        insights.overallHealth === 'good' ? 'well' :
                        insights.overallHealth === 'fair' ? 'moderately' : 'below expectations'}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-300">Opportunity Score:</div>
                      <div className={`text-sm font-bold ${getScoreColor(insights.opportunityScore)}`}>
                        {insights.opportunityScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h4 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {insights.keyStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h4 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-3">
                    {insights.keyWeaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-blue-600" />
                  Personalized Recommendations
                </h4>
                <div className="space-y-3">
                  {sortedRecommendations?.map((rec, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg overflow-hidden transition-all ${getPriorityBorderColor(rec.priority)}`}
                    >
                      <button
                        onClick={() => toggleRecommendation(index)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(rec.priority)}
                          <div className="text-left">
                            <div className="font-bold text-[#F8F9FA]">{rec.title}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityBadgeColor(rec.priority)}`}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                        {expandedRecommendations.has(index) ?
                          <ChevronUp size={20} className="text-gray-300" /> :
                          <ChevronDown size={20} className="text-gray-300" />
                        }
                      </button>
                      {expandedRecommendations.has(index) && (
                        <div className="px-4 pb-4 bg-white">
                          <p className="text-gray-300 mb-3">{rec.description}</p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="font-semibold text-blue-900 text-sm mb-1">Potential Impact</div>
                            <p className="text-blue-800 text-sm">{rec.impact}</p>
                          </div>
                          {rec.actionable && (
                            <button className="px-4 py-2 bg-blue-600 text-[#F8F9FA] text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                              Take Action
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Underperforming Properties */}
              {insights.underperformingProperties.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    Properties Needing Attention
                  </h4>
                  <div className="space-y-4">
                    {insights.underperformingProperties.map((prop, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="font-bold text-[#F8F9FA] mb-2">{prop.propertyName}</div>
                        <div className="text-sm text-gray-300 mb-2">
                          <span className="font-semibold">Issue:</span> {prop.issue}
                        </div>
                        <div className="text-sm text-gray-300 mb-3">
                          <span className="font-semibold">Suggestion:</span> {prop.suggestion}
                        </div>
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-[#F8F9FA] text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                          <Eye size={14} />
                          View Property
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-[#F8F9FA] mb-4 flex items-center gap-2">
                  <CheckSquare size={20} className="text-blue-600" />
                  Next Steps
                </h4>
                <ol className="space-y-3">
                  {insights.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-300 flex-1">{step}</span>
                      <CheckSquare size={18} className="text-gray-300 mt-0.5 flex-shrink-0" />
                    </li>
                  ))}
                </ol>
              </div>

              {/* Market Outlook */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-[#F8F9FA] mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Market Outlook
                </h4>
                <p className="text-gray-300">{insights.marketOutlook}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <p className="text-sm text-gray-300">
                  Last updated: {lastUpdated?.toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
                <button
                  onClick={generateInsights}
                  disabled={insightsLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} />
                  Refresh Insights
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Original Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          icon={Building}
          colorClass="text-blue-600"
        />
        <MetricCard
          title="Number of Properties"
          value={properties.length.toString()}
          icon={Home}
          colorClass="text-purple-600"
        />
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={TrendingUp}
          colorClass="text-green-600"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          colorClass="text-red-600"
        />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#F8F9FA] mb-4">Your Properties</h3>
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
              alt="Modern house"
              className="w-64 h-48 object-cover rounded-lg mx-auto mb-6 opacity-80"
            />
            <h4 className="text-xl font-semibold text-[#F8F9FA] mb-2">No Properties Yet</h4>
            <p className="text-gray-300 mb-6">Start building your portfolio by adding your first property</p>
            <p className="text-sm text-gray-300">Click "Add Property" in the sidebar to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                transactions={transactions}
                onAddTransaction={onAddTransaction}
                onDelete={onDeleteProperty}
                onDeleteTransaction={onDeleteTransaction}
                onStatusChange={(propertyId, newStatus) => onUpdateProperty(propertyId, { status: newStatus })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Date Range Filter Modal */}
      {showDateRangeModal && (
        <DateRangeFilterModal
          onClose={() => setShowDateRangeModal(false)}
          onExport={handleExportAllWithDateRange}
        />
      )}

      {/* Export Toast Notification */}
      {exportMessage && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in">
          <div
            className={`max-w-md mx-auto p-4 rounded-lg shadow-lg ${
              exportMessage.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            <p className="font-semibold">{exportMessage.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
