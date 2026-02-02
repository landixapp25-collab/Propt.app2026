import { useState } from 'react';
import { Eye, Home, Trash2, TrendingUp, TrendingDown, PoundSterling, Percent, BarChart } from 'lucide-react';
import { SavedDeal, DealStatus } from '../types';

interface SavedDealCardProps {
  deal: SavedDeal;
  onViewAnalysis: (deal: SavedDeal) => void;
  onMoveToPortfolio: (deal: SavedDeal) => void;
  onDelete: (dealId: string) => void;
  onStatusChange: (dealId: string, newStatus: DealStatus) => void;
}

export default function SavedDealCard({
  deal,
  onViewAnalysis,
  onMoveToPortfolio,
  onDelete,
  onStatusChange,
}: SavedDealCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusSuccess, setShowStatusSuccess] = useState(false);
  const [showAcquiredConfirm, setShowAcquiredConfirm] = useState(false);

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
        return 'Excellent Deal';
      case 'good':
        return 'Good Deal';
      case 'fair':
        return 'Marginal';
      case 'poor':
        return 'Poor Deal';
      default:
        return 'Analysed';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(deal.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as DealStatus;

    if (newStatus === 'acquired') {
      setShowAcquiredConfirm(true);
    } else {
      onStatusChange(deal.id, newStatus);
      setShowStatusSuccess(true);
      setTimeout(() => setShowStatusSuccess(false), 2000);
    }
  };

  const handleConfirmAcquired = () => {
    onStatusChange(deal.id, 'acquired');
    setShowAcquiredConfirm(false);
    setShowStatusSuccess(true);
    setTimeout(() => {
      setShowStatusSuccess(false);
      onMoveToPortfolio(deal);
    }, 1500);
  };

  const handleCancelAcquired = () => {
    setShowAcquiredConfirm(false);
  };

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case 'reviewing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'offer-made':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'due-diligence':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'acquired':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: DealStatus) => {
    switch (status) {
      case 'reviewing':
        return 'Reviewing';
      case 'offer-made':
        return 'Offer Made';
      case 'due-diligence':
        return 'Due Diligence';
      case 'acquired':
        return 'Acquired';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="bg-[#537d90] rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100 relative">
        {showStatusSuccess && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-fade-in">
            Status updated!
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-3">{deal.address}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(deal.aiAnalysis.dealRating)}`}>
                  {getRatingLabel(deal.aiAnalysis.dealRating)}
                </span>
                <select
                  value={deal.status}
                  onChange={handleStatusChange}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all ${getStatusColor(deal.status)}`}
                >
                  <option value="reviewing">Reviewing</option>
                  <option value="offer-made">Offer Made</option>
                  <option value="due-diligence">Due Diligence</option>
                  <option value="acquired">Acquired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold text-[#F8F9FA]">{formatCurrency(deal.askingPrice || 0)}</p>
            <p className="text-sm text-gray-300">
              {deal.propertyType}
              {deal.bedrooms && ` • ${deal.bedrooms} bedrooms`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-200">
            {deal.aiAnalysis.monthlyRent && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <PoundSterling size={16} className="text-[#10B981]" />
                  <p className="text-sm text-gray-300">Monthly Rent</p>
                </div>
                <p className="text-lg font-semibold text-[#F8F9FA]">
                  {formatCurrency(deal.aiAnalysis.monthlyRent)}
                </p>
              </div>
            )}
            {(deal.aiAnalysis.grossYield || deal.aiAnalysis.netYield) && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Percent size={16} className="text-[#8B5CF6]" />
                  <p className="text-sm text-gray-300">{deal.aiAnalysis.netYield ? 'Net Yield' : 'Gross Yield'}</p>
                </div>
                <p className="text-lg font-semibold text-[#F8F9FA]">
                  {(deal.aiAnalysis.netYield || deal.aiAnalysis.grossYield || 0).toFixed(2)}%
                </p>
              </div>
            )}
            {deal.aiAnalysis.roi != null && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <BarChart size={16} className="text-[#3B82F6]" />
                  <p className="text-sm text-gray-300">ROI</p>
                </div>
                <p className="text-lg font-semibold text-[#F8F9FA]">
                  {deal.aiAnalysis.roi.toFixed(2)}%
                </p>
              </div>
            )}
            {deal.aiAnalysis.monthlyCashFlow && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={16} className={deal.aiAnalysis.monthlyCashFlow >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} />
                  <p className="text-sm text-gray-300">Annual Cash Flow</p>
                </div>
                <p className={`text-lg font-semibold flex items-center gap-1 ${
                  deal.aiAnalysis.monthlyCashFlow >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}>
                  {formatCurrency(Math.abs(deal.aiAnalysis.monthlyCashFlow * 12))}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-300">Analysed {formatDate(deal.analyzedDate)}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewAnalysis(deal)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3B82F6] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#2563EB] transition-colors shadow-sm"
            >
              <Eye size={18} />
              View Analysis
            </button>
            <button
              onClick={() => onMoveToPortfolio(deal)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10B981] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm"
            >
              <Home size={18} />
              Move to Portfolio
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2.5 bg-red-50 text-[#EF4444] font-semibold rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#537d90] rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-[#EF4444]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8F9FA]">Delete Saved Deal</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the saved analysis for <strong>{deal.address}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-[#EF4444] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAcquiredConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#537d90] rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Home size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#F8F9FA]">Mark as Acquired</h3>
            </div>
            <p className="text-gray-300 mb-6">
              This will mark <strong>{deal.address}</strong> as acquired and prompt you to add it to your portfolio. Do you want to continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelAcquired}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcquired}
                className="flex-1 px-4 py-3 bg-green-600 text-[#F8F9FA] font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
