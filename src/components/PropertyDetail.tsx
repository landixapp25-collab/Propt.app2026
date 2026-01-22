import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, TrendingUp, TrendingDown, Sparkles, Calendar, Home as HomeIcon, Paperclip, Download } from 'lucide-react';
import { Property, Transaction, PropertyStatus } from '../types';
import ReceiptViewer from './ReceiptViewer';
import { exportReceiptsToZip } from '../lib/exportReceipts';
import DateRangeFilterModal, { DateRangeOption } from './DateRangeFilterModal';

interface PropertyDetailProps {
  property: Property;
  transactions: Transaction[];
  onBack: () => void;
  onDelete: (propertyId: string) => void;
  onAddTransaction: (propertyId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onViewAnalysis: () => void;
}

export default function PropertyDetail({
  property,
  transactions,
  onBack,
  onDelete,
  onAddTransaction,
  onDeleteTransaction,
  onViewAnalysis,
}: PropertyDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const propertyTransactions = transactions.filter(t => t.propertyId === property.id);

  const totalIncome = propertyTransactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = propertyTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const valueChange = property.currentValue !== null ? (property.currentValue - property.purchasePrice) : 0;
  const netProfit = totalIncome - totalExpenses + valueChange;
  const isProfit = netProfit >= 0;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyCashFlow = propertyTransactions
    .filter(t => new Date(t.date) >= firstDayOfMonth)
    .reduce((sum, t) => (t.type === 'Income' ? sum + t.amount : sum - t.amount), 0);

  const sortedTransactions = [...propertyTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusBadgeColor = (status: PropertyStatus) => {
    const colors: Record<PropertyStatus, string> = {
      'Stabilized': 'bg-emerald-100 text-emerald-700',
      'In Development': 'bg-amber-100 text-amber-700',
      'Under Offer': 'bg-blue-100 text-blue-700',
      'Planning': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(property.id);
    setShowDeleteConfirm(false);
    onBack();
  };

  const handleDeleteTransactionClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteTransactionConfirm(true);
  };

  const handleConfirmDeleteTransaction = () => {
    console.log('Confirming delete transaction:', transactionToDelete);
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete.id);
      setShowDeleteTransactionConfirm(false);
      setTransactionToDelete(null);
    }
  };

  const handleExportClick = () => {
    setShowDateRangeModal(true);
  };

  const handleExportWithDateRange = async (dateRange: DateRangeOption | null) => {
    setShowDateRangeModal(false);
    setIsExporting(true);
    setExportMessage(null);

    const result = await exportReceiptsToZip(property, propertyTransactions, dateRange);

    setIsExporting(false);
    setExportMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    setTimeout(() => {
      setExportMessage(null);
    }, 5000);
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
            {property.name}
          </h1>
          <button
            onClick={handleDeleteClick}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} color="#E86C6C" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Property Info Card */}
        <div className="bg-[#537d90] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#F7F9FC] p-3 rounded-lg">
                <HomeIcon size={24} color="#14233C" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Asset Type</p>
                <p className="font-semibold text-[#F8F9FA]">{property.propertyType}</p>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(property.status)}`}>
              {property.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-300 mb-1">Acquisition Cost</p>
              <p className="text-lg font-bold text-[#F8F9FA]">{formatCurrency(property.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">Current Valuation</p>
              <p className="text-lg font-bold text-[#F8F9FA]">
                {property.currentValue !== null ? formatCurrency(property.currentValue) : 'TBD'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-300 mb-1">Purchase Date</p>
              <p className="text-base font-semibold text-[#F8F9FA]">{formatDate(property.purchaseDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">Equity %</p>
              <p className="text-base font-semibold text-[#F8F9FA]">
                {property.currentValue !== null
                  ? `${((property.currentValue - property.purchasePrice) / property.currentValue * 100).toFixed(1)}%`
                  : 'TBD'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Total Return</span>
              <div className={`flex items-center gap-1 ${isProfit ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'}`}>
                {isProfit ? <TrendingUp size={20} className="flex-shrink-0" /> : <TrendingDown size={20} className="flex-shrink-0" />}
                <span className="font-bold" style={{ fontSize: 'clamp(0.75rem, 3.5vw, 1.25rem)' }}>{formatCurrency(Math.abs(netProfit))}</span>
              </div>
            </div>
          </div>

          {property.aiAnalysis && (
            <button
              onClick={onViewAnalysis}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#14233C] to-[#1e3a5f] text-[#F8F9FA] rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles size={20} />
              View AI Analysis
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#537d90] rounded-xl p-4 shadow-sm text-center">
            <TrendingUp size={20} className="mx-auto mb-2 text-[#4ECDC4]" />
            <p className="font-bold text-[#F8F9FA] px-1" style={{ fontSize: 'clamp(0.65rem, 2.5vw, 1.25rem)', wordBreak: 'break-word' }}>{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-gray-300 mt-1">Total Returns</p>
          </div>
          <div className="bg-[#537d90] rounded-xl p-4 shadow-sm text-center">
            <TrendingDown size={20} className="mx-auto mb-2 text-[#E86C6C]" />
            <p className="font-bold text-[#F8F9FA] px-1" style={{ fontSize: 'clamp(0.65rem, 2.5vw, 1.25rem)', wordBreak: 'break-word' }}>{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-300 mt-1">Total Costs</p>
          </div>
          <div className="bg-[#537d90] rounded-xl p-4 shadow-sm text-center">
            <Calendar size={20} className="mx-auto mb-2 text-[#FF6B6B]" />
            <p className="font-bold text-[#F8F9FA] px-1" style={{ fontSize: 'clamp(0.65rem, 2.5vw, 1.25rem)', wordBreak: 'break-word' }}>{formatCurrency(monthlyCashFlow)}</p>
            <p className="text-xs text-gray-300 mt-1">Monthly Net</p>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-[#537d90] rounded-xl p-6 shadow-sm" data-tour="transactions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F8F9FA]">Recent Transactions</h2>
            <div className="flex items-center gap-2">
              {propertyTransactions.length > 0 && (
                <button
                  onClick={handleExportClick}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-3 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB8AF] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Download size={16} />
                  {isExporting ? 'Preparing...' : 'Tax Pack'}
                </button>
              )}
              <button
                onClick={() => onAddTransaction(property.id)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg hover:bg-[#FF5252] transition-colors font-semibold"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-300 mb-2">No transactions yet</p>
              <p className="text-sm text-gray-300">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'Income'
                          ? 'bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4]'
                          : 'bg-[#E86C6C] bg-opacity-10 text-[#E86C6C]'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className="text-sm font-semibold text-[#FF6B6B]">{transaction.category}</span>
                      {transaction.receipt && (
                        <button
                          onClick={() => setSelectedReceipt(transaction)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="View receipt"
                        >
                          <Paperclip size={14} className="text-[#FF6B6B]" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{formatDate(transaction.date)}</p>
                    {transaction.description && (
                      <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'Income' ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'
                    }`}>
                      {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <button
                      onClick={() => handleDeleteTransactionClick(transaction)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Property Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#537d90] rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-[#E86C6C]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8F9FA]">Delete Asset</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{property.name}</strong>? This will also delete all associated transactions. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-[#E86C6C] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#D75555] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {showDeleteTransactionConfirm && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#537d90] rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-[#E86C6C]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8F9FA]">Delete Transaction?</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm font-medium text-[#F8F9FA]">{formatDate(transactionToDelete.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium text-[#F8F9FA]">{transactionToDelete.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className={`text-sm font-bold ${
                  transactionToDelete.type === 'Income' ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'
                }`}>
                  {transactionToDelete.type === 'Income' ? '+' : '-'}{formatCurrency(transactionToDelete.amount)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteTransactionConfirm(false);
                  setTransactionToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTransaction}
                className="flex-1 px-4 py-3 bg-[#E86C6C] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#D75555] transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {selectedReceipt && selectedReceipt.receipt && (
        <ReceiptViewer
          receipt={selectedReceipt.receipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Date Range Filter Modal */}
      {showDateRangeModal && (
        <DateRangeFilterModal
          onClose={() => setShowDateRangeModal(false)}
          onExport={handleExportWithDateRange}
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
