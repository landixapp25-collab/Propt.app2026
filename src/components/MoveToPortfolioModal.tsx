import { useState } from 'react';
import { X, Home } from 'lucide-react';
import { SavedDeal, PropertyStatus } from '../types';

interface MoveToPortfolioModalProps {
  deal: SavedDeal;
  onConfirm: (data: {
    purchasePrice: number;
    purchaseDate: string;
    currentValue: number | null;
    status: PropertyStatus;
  }) => void;
  onClose: () => void;
}

export default function MoveToPortfolioModal({
  deal,
  onConfirm,
  onClose,
}: MoveToPortfolioModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    purchasePrice: deal.askingPrice || 0,
    purchaseDate: today,
    currentValue: deal.askingPrice || 0,
    status: 'Stabilized' as PropertyStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (formData.currentValue <= 0) {
      newErrors.currentValue = 'Current value must be greater than 0';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#537d90] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#537d90] border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Home size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F8F9FA]">Move to Portfolio</h2>
              <p className="text-sm text-gray-300">{deal.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Confirm the details below to add this property to your portfolio.
              The values are pre-filled based on the analysis, but you can adjust them as needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Purchase Price
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="250000"
                step="1000"
              />
              {errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>
              )}
              {deal.askingPrice && (
                <p className="mt-1 text-sm text-gray-300">
                  Default: {formatCurrency(deal.askingPrice)} (asking price)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.purchaseDate && (
                <p className="mt-1 text-sm text-red-600">{errors.purchaseDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Current Value
              </label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) =>
                  setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="250000"
                step="1000"
              />
              {errors.currentValue && (
                <p className="mt-1 text-sm text-red-600">{errors.currentValue}</p>
              )}
              {deal.askingPrice && (
                <p className="mt-1 text-sm text-gray-300">
                  Default: {formatCurrency(deal.askingPrice)} (asking price)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Asset Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as PropertyStatus })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Stabilized">Stabilized</option>
                <option value="In Development">In Development</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Planning">Planning</option>
              </select>
              <p className="mt-1 text-sm text-gray-300">
                Select the current status of this asset
              </p>
            </div>

            <div className="bg-[#365563] rounded-lg p-4 border border-gray-600">
              <h3 className="font-semibold text-[#F8F9FA] mb-3">Property Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300">Type</p>
                  <p className="font-semibold text-[#F8F9FA]">{deal.propertyType}</p>
                </div>
                {deal.bedrooms && (
                  <div>
                    <p className="text-gray-300">Bedrooms</p>
                    <p className="font-semibold text-[#F8F9FA]">{deal.bedrooms}</p>
                  </div>
                )}
                {deal.aiAnalysis.monthlyRent && (
                  <div>
                    <p className="text-gray-300">Est. Monthly Rent</p>
                    <p className="font-semibold text-[#F8F9FA]">
                      {formatCurrency(deal.aiAnalysis.monthlyRent)}
                    </p>
                  </div>
                )}
                {(deal.aiAnalysis.grossYield || deal.aiAnalysis.netYield) && (
                  <div>
                    <p className="text-gray-300">Rental Yield</p>
                    <p className="font-semibold text-[#F8F9FA]">
                      {(deal.aiAnalysis.grossYield || deal.aiAnalysis.netYield)?.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 text-[#F8F9FA] font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Add to Portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
