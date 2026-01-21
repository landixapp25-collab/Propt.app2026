import { useState } from 'react';
import { Bookmark, GitCompare, X, Crown, TrendingUp, TrendingDown, AlertTriangle, Eye, Home, Check } from 'lucide-react';
import { SavedDeal, DealStatus } from '../types';
import SavedDealCard from './SavedDealCard';
import ViewAnalysisModal from './ViewAnalysisModal';
import MoveToPortfolioModal from './MoveToPortfolioModal';
import Logo from './Logo';

interface SavedDealsProps {
  savedDeals: SavedDeal[];
  onDeleteDeal: (dealId: string) => void;
  onMoveToPortfolio: (deal: SavedDeal, data: {
    purchasePrice: number;
    purchaseDate: string;
    currentValue: number;
  }) => void;
  onUpdateDeal: (dealId: string, updates: Partial<SavedDeal>) => void;
}

type PipelineFilter = 'all' | 'reviewing' | 'offer-made' | 'due-diligence' | 'acquired';

export default function SavedDeals({
  savedDeals,
  onDeleteDeal,
  onMoveToPortfolio,
  onUpdateDeal,
}: SavedDealsProps) {
  const [selectedDealForView, setSelectedDealForView] = useState<SavedDeal | null>(null);
  const [selectedDealForMove, setSelectedDealForMove] = useState<SavedDeal | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('all');

  const handleViewAnalysis = (deal: SavedDeal) => {
    setSelectedDealForView(deal);
  };

  const handleMoveToPortfolio = (deal: SavedDeal) => {
    setSelectedDealForMove(deal);
  };

  const handleConfirmMove = (data: {
    purchasePrice: number;
    purchaseDate: string;
    currentValue: number;
  }) => {
    if (selectedDealForMove) {
      onMoveToPortfolio(selectedDealForMove, data);
      setSelectedDealForMove(null);
    }
  };

  const handleStatusChange = (dealId: string, newStatus: DealStatus) => {
    onUpdateDeal(dealId, { status: newStatus });

    // Automatically change filter to match the new status
    if (newStatus === 'reviewing') {
      setPipelineFilter('reviewing');
    } else if (newStatus === 'offer-made') {
      setPipelineFilter('offer-made');
    } else if (newStatus === 'due-diligence') {
      setPipelineFilter('due-diligence');
    } else if (newStatus === 'acquired') {
      setPipelineFilter('acquired');
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedDeals([]);
  };

  const toggleDealSelection = (dealId: string) => {
    setSelectedDeals(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : prev.length < 4 ? [...prev, dealId] : prev
    );
  };

  const startComparison = () => {
    setShowComparison(true);
  };

  const closeComparison = () => {
    setShowComparison(false);
    setCompareMode(false);
    setSelectedDeals([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-[#DEF7EC] text-[#047857]';
      case 'good':
        return 'bg-[#DEF7EC] text-[#047857]';
      case 'fair':
        return 'bg-[#FEF3C7] text-[#B45309]';
      case 'poor':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good Deal';
      case 'fair':
        return 'Marginal';
      case 'poor':
        return 'Poor Deal';
      default:
        return 'N/A';
    }
  };

  const getComparisonDeals = () => {
    return savedDeals.filter(deal => selectedDeals.includes(deal.id));
  };

  const findBestInCategory = (deals: SavedDeal[], category: string, higherIsBetter: boolean = true) => {
    if (deals.length === 0) return null;

    let bestDeal = deals[0];
    let bestValue: number;

    switch (category) {
      case 'askingPrice':
        bestValue = bestDeal.askingPrice;
        break;
      case 'totalInvestment':
        bestValue = bestDeal.aiAnalysis.totalInvestment;
        break;
      case 'monthlyRent':
        bestValue = bestDeal.aiAnalysis.estimatedMonthlyRent;
        break;
      case 'rentalYield':
        bestValue = bestDeal.aiAnalysis.rentalYield;
        break;
      case 'roi':
        bestValue = bestDeal.aiAnalysis.roi;
        break;
      case 'annualProfit':
        bestValue = bestDeal.aiAnalysis.annualProfit;
        break;
      default:
        return null;
    }

    for (const deal of deals) {
      let currentValue: number;

      switch (category) {
        case 'askingPrice':
          currentValue = deal.askingPrice || 0;
          break;
        case 'totalInvestment':
          currentValue = deal.aiAnalysis.totalInvestment;
          break;
        case 'monthlyRent':
          currentValue = deal.aiAnalysis.estimatedMonthlyRent;
          break;
        case 'rentalYield':
          currentValue = deal.aiAnalysis.rentalYield;
          break;
        case 'roi':
          currentValue = deal.aiAnalysis.roi;
          break;
        case 'annualProfit':
          currentValue = deal.aiAnalysis.annualProfit;
          break;
        default:
          continue;
      }

      if (higherIsBetter ? currentValue > bestValue : currentValue < bestValue) {
        bestValue = currentValue;
        bestDeal = deal;
      }
    }

    return bestDeal.id;
  };

  const getRecommendation = () => {
    const deals = getComparisonDeals();
    const scores: Record<string, number> = {};

    deals.forEach(deal => {
      scores[deal.id] = 0;
    });

    const categories = [
      { key: 'askingPrice', higherIsBetter: false },
      { key: 'totalInvestment', higherIsBetter: false },
      { key: 'monthlyRent', higherIsBetter: true },
      { key: 'rentalYield', higherIsBetter: true },
      { key: 'roi', higherIsBetter: true },
      { key: 'annualProfit', higherIsBetter: true },
    ];

    categories.forEach(({ key, higherIsBetter }) => {
      const bestId = findBestInCategory(deals, key, higherIsBetter);
      if (bestId) {
        scores[bestId] = (scores[bestId] || 0) + 1;
      }
    });

    let bestDealId = deals[0]?.id;
    let maxScore = 0;

    Object.entries(scores).forEach(([dealId, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestDealId = dealId;
      }
    });

    const bestDeal = deals.find(d => d.id === bestDealId);
    return bestDeal;
  };

  const getFilteredDeals = () => {
    if (pipelineFilter === 'all') return savedDeals;
    return savedDeals.filter(deal => {
      if (pipelineFilter === 'reviewing') return deal.status === 'reviewing';
      if (pipelineFilter === 'offer-made') return deal.status === 'offer-made';
      if (pipelineFilter === 'due-diligence') return deal.status === 'due-diligence';
      if (pipelineFilter === 'acquired') return deal.status === 'acquired';
      return true;
    });
  };

  const getFilterCount = (filter: PipelineFilter) => {
    if (filter === 'all') return savedDeals.length;
    return savedDeals.filter(deal => {
      if (filter === 'reviewing') return deal.status === 'reviewing';
      if (filter === 'offer-made') return deal.status === 'offer-made';
      if (filter === 'due-diligence') return deal.status === 'due-diligence';
      if (filter === 'acquired') return deal.status === 'acquired';
      return false;
    }).length;
  };

  const comparisonDeals = getComparisonDeals();
  const recommendedDeal = showComparison ? getRecommendation() : null;
  const filteredDeals = getFilteredDeals();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#365563' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Logo size={48} />
              <div>
                <h1 className="text-3xl font-bold text-[#F8F9FA]">
                  {compareMode ? 'Select deals to compare (2-4 deals)' : 'Saved Deals'}
                </h1>
                {compareMode && (
                  <p className="text-sm text-gray-200 mt-1">
                    {selectedDeals.length} {selectedDeals.length === 1 ? 'deal' : 'deals'} selected
                  </p>
                )}
              </div>
            </div>
            {!compareMode && savedDeals.length >= 2 && (
              <button
                onClick={toggleCompareMode}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#FF5252] transition-colors shadow-md"
              >
                <GitCompare size={20} />
                Compare Deals
              </button>
            )}
          </div>
          {!compareMode && (
            <p className="text-gray-300">
              Properties you've analysed and are considering for your portfolio
            </p>
          )}
        </div>

        {/* Pipeline Filter Chips */}
        {!compareMode && savedDeals.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setPipelineFilter('all')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                pipelineFilter === 'all'
                  ? 'bg-[#FF6B6B] text-[#F8F9FA]'
                  : 'bg-[#537d90] text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Deals ({getFilterCount('all')})
            </button>
            <button
              onClick={() => setPipelineFilter('reviewing')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                pipelineFilter === 'reviewing'
                  ? 'bg-[#FF6B6B] text-[#F8F9FA]'
                  : 'bg-[#537d90] text-gray-300 hover:bg-gray-600'
              }`}
            >
              Reviewing ({getFilterCount('reviewing')})
            </button>
            <button
              onClick={() => setPipelineFilter('offer-made')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                pipelineFilter === 'offer-made'
                  ? 'bg-[#FF6B6B] text-[#F8F9FA]'
                  : 'bg-[#537d90] text-gray-300 hover:bg-gray-600'
              }`}
            >
              Offer Made ({getFilterCount('offer-made')})
            </button>
            <button
              onClick={() => setPipelineFilter('due-diligence')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                pipelineFilter === 'due-diligence'
                  ? 'bg-[#FF6B6B] text-[#F8F9FA]'
                  : 'bg-[#537d90] text-gray-300 hover:bg-gray-600'
              }`}
            >
              Due Diligence ({getFilterCount('due-diligence')})
            </button>
            <button
              onClick={() => setPipelineFilter('acquired')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                pipelineFilter === 'acquired'
                  ? 'bg-[#FF6B6B] text-[#F8F9FA]'
                  : 'bg-[#537d90] text-gray-300 hover:bg-gray-600'
              }`}
            >
              Acquired ({getFilterCount('acquired')})
            </button>
          </div>
        )}

        {compareMode && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={startComparison}
              disabled={selectedDeals.length < 2}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors shadow-md ${
                selectedDeals.length >= 2
                  ? 'bg-[#FF6B6B] text-[#F8F9FA] hover:bg-[#FF5252]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Compare Selected ({selectedDeals.length})
            </button>
            <button
              onClick={toggleCompareMode}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors shadow-md"
            >
              Cancel
            </button>
          </div>
        )}

        {savedDeals.length === 0 ? (
          <div className="bg-[#537d90] rounded-lg shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#F8F9FA] mb-2">No Saved Deals Yet</h3>
            <p className="text-gray-300 mb-4">
              Analyse potential deals and save them here for later review
            </p>
            <p className="text-sm text-gray-300">
              Use the "Analyse Deal" page to evaluate properties and save promising opportunities
            </p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-[#537d90] rounded-lg shadow-md p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#F8F9FA] mb-2">No Deals in This Stage</h3>
            <p className="text-gray-300">
              Try selecting a different pipeline stage
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="relative">
                {compareMode && (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => toggleDealSelection(deal.id)}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedDeals.includes(deal.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      {selectedDeals.includes(deal.id) && (
                        <Check size={20} className="text-[#F8F9FA]" />
                      )}
                    </button>
                  </div>
                )}
                <SavedDealCard
                  deal={deal}
                  onViewAnalysis={handleViewAnalysis}
                  onMoveToPortfolio={handleMoveToPortfolio}
                  onDelete={onDeleteDeal}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDealForView && (
        <ViewAnalysisModal
          deal={selectedDealForView}
          onClose={() => setSelectedDealForView(null)}
        />
      )}

      {selectedDealForMove && (
        <MoveToPortfolioModal
          deal={selectedDealForMove}
          onConfirm={handleConfirmMove}
          onClose={() => setSelectedDealForMove(null)}
        />
      )}

      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#537d90] rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-[#537d90] border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-[#F8F9FA]">Deal Comparison</h2>
              <button
                onClick={closeComparison}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left font-semibold text-gray-700 border border-gray-200">Category</th>
                      {comparisonDeals.map(deal => (
                        <th key={deal.id} className="p-4 text-center font-semibold text-gray-700 border border-gray-200 min-w-[200px]">
                          <div className="text-sm line-clamp-2">{deal.address}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Property Info Section */}
                    <tr className="bg-gray-50">
                      <td colSpan={comparisonDeals.length + 1} className="p-3 font-bold text-[#F8F9FA] border border-gray-200">
                        Property Information
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Property Type</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center border border-gray-200">
                          {deal.propertyType}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Bedrooms</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center border border-gray-200">
                          {deal.bedrooms || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Asking Price</td>
                      {comparisonDeals.map(deal => {
                        const isBest = findBestInCategory(comparisonDeals, 'askingPrice', false) === deal.id;
                        return (
                          <td key={deal.id} className={`p-4 text-center border border-gray-200 ${isBest ? 'bg-green-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              {isBest && <Crown size={18} className="text-green-600" />}
                              <span className="font-semibold">{formatCurrency(deal.askingPrice || 0)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Deal Rating Section */}
                    <tr className="bg-gray-50">
                      <td colSpan={comparisonDeals.length + 1} className="p-3 font-bold text-[#F8F9FA] border border-gray-200">
                        AI Assessment
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Deal Rating</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center border border-gray-200">
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getRatingColor(deal.aiAnalysis.dealRating)}`}>
                            {getRatingLabel(deal.aiAnalysis.dealRating)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Investment Metrics Section */}
                    <tr className="bg-gray-50">
                      <td colSpan={comparisonDeals.length + 1} className="p-3 font-bold text-[#F8F9FA] border border-gray-200">
                        Investment Required
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Total Investment</td>
                      {comparisonDeals.map(deal => {
                        const isBest = findBestInCategory(comparisonDeals, 'totalInvestment', false) === deal.id;
                        return (
                          <td key={deal.id} className={`p-4 text-center border border-gray-200 ${isBest ? 'bg-green-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              {isBest && <Crown size={18} className="text-green-600" />}
                              <span className="font-semibold">{formatCurrency(deal.aiAnalysis.totalInvestment)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Purchase Costs</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center border border-gray-200">
                          {formatCurrency(deal.aiAnalysis.purchaseCosts)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Renovation Costs</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center border border-gray-200">
                          {formatCurrency(deal.renovationCosts)}
                        </td>
                      ))}
                    </tr>

                    {/* Return Metrics Section */}
                    <tr className="bg-gray-50">
                      <td colSpan={comparisonDeals.length + 1} className="p-3 font-bold text-[#F8F9FA] border border-gray-200">
                        Return Metrics
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Monthly Rent</td>
                      {comparisonDeals.map(deal => {
                        const isBest = findBestInCategory(comparisonDeals, 'monthlyRent', true) === deal.id;
                        return (
                          <td key={deal.id} className={`p-4 text-center border border-gray-200 ${isBest ? 'bg-green-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              {isBest && <Crown size={18} className="text-green-600" />}
                              <span className="font-semibold">{formatCurrency(deal.aiAnalysis.estimatedMonthlyRent)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Rental Yield</td>
                      {comparisonDeals.map(deal => {
                        const isBest = findBestInCategory(comparisonDeals, 'rentalYield', true) === deal.id;
                        return (
                          <td key={deal.id} className={`p-4 text-center border border-gray-200 ${isBest ? 'bg-green-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              {isBest && <Crown size={18} className="text-green-600" />}
                              <span className="font-semibold">{deal.aiAnalysis.rentalYield.toFixed(2)}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Annual Profit</td>
                      {comparisonDeals.map(deal => {
                        const isBest = findBestInCategory(comparisonDeals, 'annualProfit', true) === deal.id;
                        return (
                          <td key={deal.id} className={`p-4 text-center border border-gray-200 ${isBest ? 'bg-green-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              {isBest && <Crown size={18} className="text-green-600" />}
                              <span className={`font-semibold flex items-center gap-1 ${deal.aiAnalysis.annualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {deal.aiAnalysis.annualProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {formatCurrency(Math.abs(deal.aiAnalysis.annualProfit))}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">ROI</td>
                      {comparisonDeals.map(deal => {
                        const isBest = findBestInCategory(comparisonDeals, 'roi', true) === deal.id;
                        return (
                          <td key={deal.id} className={`p-4 text-center border border-gray-200 ${isBest ? 'bg-green-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                              {isBest && <Crown size={18} className="text-green-600" />}
                              <span className="font-semibold">{deal.aiAnalysis.roi.toFixed(2)}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Market Intelligence Section */}
                    <tr className="bg-gray-50">
                      <td colSpan={comparisonDeals.length + 1} className="p-3 font-bold text-[#F8F9FA] border border-gray-200">
                        Market Intelligence
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Risk Factors</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center border border-gray-200">
                          <div className="flex items-center justify-center gap-2">
                            <AlertTriangle size={16} className="text-orange-500" />
                            <span>{deal.aiAnalysis.riskFactors.length}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-700 border border-gray-200">Date Analysed</td>
                      {comparisonDeals.map(deal => (
                        <td key={deal.id} className="p-4 text-center text-sm text-gray-300 border border-gray-200">
                          {formatDate(deal.analyzedDate)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked View */}
              <div className="lg:hidden space-y-6">
                {comparisonDeals.map((deal, index) => (
                  <div key={deal.id} className="bg-[#537d90] rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 p-4 border-b border-gray-200">
                      <h3 className="font-bold text-[#F8F9FA] mb-2">Deal {index + 1}</h3>
                      <p className="text-sm text-gray-700">{deal.address}</p>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Property Type</span>
                        <span className="font-semibold">{deal.propertyType}</span>
                      </div>
                      {deal.bedrooms && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Bedrooms</span>
                          <span className="font-semibold">{deal.bedrooms}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Asking Price</span>
                        <span className="font-semibold">{formatCurrency(deal.askingPrice || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Rating</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRatingColor(deal.aiAnalysis.dealRating)}`}>
                          {getRatingLabel(deal.aiAnalysis.dealRating)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Total Investment</span>
                        <span className="font-semibold">{formatCurrency(deal.aiAnalysis.totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Monthly Rent</span>
                        <span className="font-semibold">{formatCurrency(deal.aiAnalysis.estimatedMonthlyRent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Rental Yield</span>
                        <span className="font-semibold">{deal.aiAnalysis.rentalYield.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">ROI</span>
                        <span className="font-semibold">{deal.aiAnalysis.roi.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Annual Profit</span>
                        <span className={`font-semibold ${deal.aiAnalysis.annualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(deal.aiAnalysis.annualProfit))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Risk Factors</span>
                        <span className="font-semibold">{deal.aiAnalysis.riskFactors.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Recommendation */}
              {recommendedDeal && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 p-3 rounded-full">
                      <Crown size={24} className="text-[#F8F9FA]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#F8F9FA] mb-2">AI Recommendation</h3>
                      <p className="text-gray-700 mb-3">
                        Based on the comparison, <strong>{recommendedDeal.address}</strong> appears to be the best overall deal.
                        It has the strongest performance across multiple key metrics including rental yield, ROI, and overall investment returns.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(recommendedDeal.aiAnalysis.dealRating)}`}>
                          {getRatingLabel(recommendedDeal.aiAnalysis.dealRating)} Deal
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          {recommendedDeal.aiAnalysis.rentalYield.toFixed(2)}% Yield
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                          {recommendedDeal.aiAnalysis.roi.toFixed(2)}% ROI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisonDeals.map(deal => (
                  <div key={deal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-[#F8F9FA] mb-3 line-clamp-1">{deal.address}</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setShowComparison(false);
                          handleViewAnalysis(deal);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-[#F8F9FA] text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye size={16} />
                        View Analysis
                      </button>
                      <button
                        onClick={() => {
                          setShowComparison(false);
                          handleMoveToPortfolio(deal);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-[#F8F9FA] text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Home size={16} />
                        Move to Portfolio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
