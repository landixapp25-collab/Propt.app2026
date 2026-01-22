import { useState } from 'react';
import { Building2, TrendingUp, TrendingDown, Bell, Plus, Search, Package } from 'lucide-react';
import { Property, Transaction } from '../types';
import Logo from './Logo';
import DateRangeFilterModal, { DateRangeOption } from './DateRangeFilterModal';
import { exportAllPropertiesToZip } from '../lib/exportReceipts';

interface DashboardOverviewProps {
  properties: Property[];
  transactions: Transaction[];
  onNavigateToProperties: () => void;
  onNavigateToAnalyze: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
}

export default function DashboardOverview({
  properties,
  transactions,
  onNavigateToProperties,
  onNavigateToAnalyze,
  onOpenNotifications,
  unreadNotificationCount,
}: DashboardOverviewProps) {
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

  const annualIncome = monthlyIncome * 12;
  const projectedAnnualYield = totalInvestment > 0 ? (annualIncome / totalInvestment) * 100 : 0;
  const capitalDeployed = totalInvestment;

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

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      {/* Header */}
      <div className="border-b border-gray-200" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Logo size={32} />
            <h1 className="text-xl font-bold text-[#F8F9FA]">Propt</h1>
          </div>
          <button
            onClick={onOpenNotifications}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell size={24} color="#1F2937" />
            {unreadNotificationCount > 0 && (
              <div className="absolute top-1 right-1 bg-[#EF4444] text-[#F8F9FA] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Export Button */}
        {hasPropertiesWithTransactions && (
          <div className="flex justify-end">
            <button
              data-tour="export"
              onClick={handleExportAllClick}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: '#5a9aa8' }}
            >
              <Package size={20} />
              {isExporting ? 'Preparing...' : 'Export All Tax Packs'}
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-tour="metrics">
          <div className="bg-[#537d90] rounded-xl p-5 shadow-md">
            <Building2 size={24} className="text-[#FF6B6B] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-300">Portfolio Value</p>
          </div>

          <div className="bg-[#537d90] rounded-xl p-5 shadow-md">
            <TrendingUp size={24} className="text-[#F59E0B] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">{formatCurrency(totalEquity)}</p>
            <p className="text-sm text-gray-300">Total Equity</p>
          </div>

          <div className="bg-[#537d90] rounded-xl p-5 shadow-md">
            <TrendingUp size={24} className="text-[#10B981] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">{projectedAnnualYield.toFixed(1)}%</p>
            <p className="text-sm text-gray-300">Projected Annual Yield</p>
          </div>

          <div className="bg-[#537d90] rounded-xl p-5 shadow-md">
            <TrendingUp size={24} className="text-[#3B82F6] mb-3" />
            <p className="text-2xl font-bold text-[#F8F9FA] mb-1">
              {formatCurrency(capitalDeployed)}
            </p>
            <p className="text-sm text-gray-300">Capital Deployed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            data-tour="add-property"
            onClick={onNavigateToProperties}
            className="bg-[#537d90] rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group border border-gray-100"
          >
            <div className="bg-[#FF6B6B] bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-20 transition-all">
              <Plus size={24} className="text-[#FF6B6B]" />
            </div>
            <p className="font-semibold text-[#F8F9FA] group-hover:text-[#FF6B6B] transition-colors">Add Asset</p>
            <p className="text-xs text-gray-300 mt-1">Expand your portfolio</p>
          </button>

          <button
            data-tour="analyze-deal"
            onClick={onNavigateToAnalyze}
            className="bg-[#537d90] rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center group border border-gray-100"
          >
            <div className="bg-[#3B82F6] bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-20 transition-all">
              <Search size={24} className="text-[#3B82F6]" />
            </div>
            <p className="font-semibold text-[#F8F9FA] group-hover:text-[#3B82F6] transition-colors">Analyse Deal</p>
            <p className="text-xs text-gray-300 mt-1">Evaluate opportunities</p>
          </button>
        </div>
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
