import { useState } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Target, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
  marketOutlook: string;
  nextSteps: string[];
}

interface InsightsFullProps {
  insights: PortfolioInsights;
  onBack: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function InsightsFull({ insights, onBack, onRefresh, loading }: InsightsFullProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'properties' | 'next-steps'>('overview');
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const getScoreColor = () => {
    if (insights.portfolioScore >= 80) return '#4ECDC4';
    if (insights.portfolioScore >= 60) return '#FFB84D';
    return '#E86C6C';
  };

  const getHealthBadge = () => {
    const colors = {
      excellent: 'bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4]',
      good: 'bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4]',
      fair: 'bg-[#FFB84D] bg-opacity-10 text-[#FFB84D]',
      poor: 'bg-[#E86C6C] bg-opacity-10 text-[#E86C6C]',
    };
    return colors[insights.overallHealth];
  };

  return (
    <div className="min-h-screen pb-20 animate-slide-in-right" style={{ backgroundColor: '#365563' }}>
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} color="white" />
          </button>
          <h1 className="text-lg font-semibold text-[#F8F9FA] flex-1 text-center pr-10">
            Portfolio Insights
          </h1>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} color="#14233C" className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Score Circle */}
        <div className="bg-[#537d90] rounded-xl p-8 shadow-sm mb-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={getScoreColor()}
                strokeWidth="8"
                strokeDasharray={`${(insights.portfolioScore / 100) * 351.86} 351.86`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#F8F9FA]">{insights.portfolioScore}</span>
              <span className="text-xs text-gray-300">Score</span>
            </div>
          </div>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getHealthBadge()}`}>
            {insights.overallHealth.charAt(0).toUpperCase() + insights.overallHealth.slice(1)} Health
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#537d90] rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'recommendations', label: 'Actions' },
              { id: 'properties', label: 'Properties' },
              { id: 'next-steps', label: 'Next Steps' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#FF6B6B] border-b-2 border-[#FF6B6B]'
                    : 'text-gray-300 hover:text-[#F8F9FA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {insights.keyStrengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={20} className="text-[#4ECDC4]" />
                      <h3 className="font-semibold text-[#F8F9FA]">Key Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {insights.keyStrengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-[#4ECDC4] mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.keyWeaknesses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={20} className="text-[#FFB84D]" />
                      <h3 className="font-semibold text-[#F8F9FA]">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-2">
                      {insights.keyWeaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-[#FFB84D] mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.marketOutlook && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={20} className="text-[#F8F9FA]" />
                      <h3 className="font-semibold text-[#F8F9FA]">Market Outlook</h3>
                    </div>
                    <p className="text-sm text-gray-300">{insights.marketOutlook}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-3 animate-fade-in">
                {insights.recommendations.map((rec, index) => {
                  const isExpanded = expandedRec === index;
                  const priorityColors = {
                    high: 'bg-[#E86C6C] bg-opacity-10 text-[#E86C6C]',
                    medium: 'bg-[#FFB84D] bg-opacity-10 text-[#FFB84D]',
                    low: 'bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4]',
                  };

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedRec(isExpanded ? null : index)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 text-left">
                          <Target size={20} className="text-[#FF6B6B] mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[#F8F9FA]">{rec.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[rec.priority]}`}>
                                {rec.priority}
                              </span>
                            </div>
                            {!isExpanded && (
                              <p className="text-sm text-gray-300 line-clamp-1">{rec.description}</p>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-4 animate-fade-in">
                          <p className="text-sm text-gray-300">{rec.description}</p>
                          <div className="bg-[#F7F9FC] p-3 rounded-lg">
                            <p className="text-xs text-gray-300 mb-1">Expected Impact</p>
                            <p className="text-sm font-medium text-[#F8F9FA]">{rec.impact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-3 animate-fade-in">
                {insights.underperformingProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto mb-4 text-[#4ECDC4]" />
                    <p className="text-gray-300">All properties are performing well!</p>
                  </div>
                ) : (
                  insights.underperformingProperties.map((prop, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-[#FFB84D] mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#F8F9FA] mb-1">{prop.propertyName}</h4>
                          <p className="text-sm text-gray-300 mb-2">{prop.issue}</p>
                          <div className="bg-[#F7F9FC] p-3 rounded-lg">
                            <p className="text-xs text-gray-300 mb-1">Suggestion</p>
                            <p className="text-sm font-medium text-[#F8F9FA]">{prop.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Next Steps Tab */}
            {activeTab === 'next-steps' && (
              <div className="space-y-3 animate-fade-in">
                {insights.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[#F7F9FC] rounded-lg">
                    <div className="bg-[#FF6B6B] text-[#F8F9FA] rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-300 flex-1">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
