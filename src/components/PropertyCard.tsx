import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Property, Transaction, PropertyStatus } from '../types';

interface PropertyCardProps {
  property: Property;
  transactions: Transaction[];
  onAddTransaction: (propertyId: string) => void;
  onDelete: (propertyId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onStatusChange: (propertyId: string, newStatus: PropertyStatus) => void;
}

export default function PropertyCard({ property, transactions, onAddTransaction, onDelete, onDeleteTransaction, onStatusChange }: PropertyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [showStatusSuccess, setShowStatusSuccess] = useState(false);

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

  const sortedTransactions = [...propertyTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(property.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleDeleteTransactionClick = (e: React.MouseEvent, transaction: Transaction) => {
    e.stopPropagation();
    setTransactionToDelete(transaction);
    setShowDeleteTransactionConfirm(true);
  };

  const handleConfirmDeleteTransaction = () => {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete.id);
      setShowDeleteTransactionConfirm(false);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDeleteTransaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteTransactionConfirm(false);
    setTransactionToDelete(null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as PropertyStatus;
    onStatusChange(property.id, newStatus);
    setShowStatusSuccess(true);
    setTimeout(() => setShowStatusSuccess(false), 2000);
  };

  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case 'Stabilized':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'In Development':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Under Offer':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Planning':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-[#537d90] rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
      {showStatusSuccess && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-fade-in">
          Status updated!
        </div>
      )}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-32 sm:pr-40">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#F8F9FA] mb-2">{property.name}</h3>
                <select
                  value={property.status}
                  onChange={handleStatusChange}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all ${getStatusColor(property.status)}`}
                >
                  <option value="Stabilized">Stabilized</option>
                  <option value="In Development">In Development</option>
                  <option value="Under Offer">Under Offer</option>
                  <option value="Planning">Planning</option>
                </select>
              </div>
              <button
                onClick={handleDeleteClick}
                className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete property"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-300">Purchase Price</p>
                <p className="font-semibold text-[#F8F9FA]">{formatCurrency(property.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-gray-300">Current Value</p>
                <p className="font-semibold text-[#F8F9FA]">
                  {property.currentValue !== null ? formatCurrency(property.currentValue) : 'TBD'}
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="font-bold">{formatCurrency(Math.abs(netProfit))}</span>
            </div>
            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
          {/* Transactions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-[#F8F9FA]">Recent Transactions</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTransaction(property.id);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-[#F8F9FA] rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Transaction
            </button>
            </div>

            {sortedTransactions.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No transactions yet. Add one to get started!</p>
            ) : (
              <div className="space-y-3">
                {sortedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-[#537d90] rounded-lg shadow-sm group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          transaction.type === 'Income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type}
                        </span>
                        <span className="text-sm font-medium text-[#FF6B6B]">{transaction.category}</span>
                      </div>
                      <p className="text-xs text-gray-300">{formatDate(transaction.date)}</p>
                      {transaction.description && (
                        <p className="text-xs text-gray-300 mt-1">{transaction.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <button
                        onClick={(e) => handleDeleteTransactionClick(e, transaction)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete transaction"
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
      )}

      {/* Delete Property Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#537d90] rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#F8F9FA]">Delete Property</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{property.name}</strong>? This will also delete all associated transactions. This action cannot be undone.
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
                className="flex-1 px-4 py-3 bg-red-600 text-[#F8F9FA] font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {showDeleteTransactionConfirm && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#537d90] rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#F8F9FA]">Delete Transaction?</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Date:</span>
                <span className="text-sm font-medium text-[#F8F9FA]">{formatDate(transactionToDelete.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Category:</span>
                <span className="text-sm font-medium text-[#F8F9FA]">{transactionToDelete.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Amount:</span>
                <span className={`text-sm font-bold ${
                  transactionToDelete.type === 'Income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transactionToDelete.type === 'Income' ? '+' : '-'}{formatCurrency(transactionToDelete.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Type:</span>
                <span className={`text-sm font-medium ${
                  transactionToDelete.type === 'Income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transactionToDelete.type}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDeleteTransaction}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTransaction}
                className="flex-1 px-4 py-3 bg-red-600 text-[#F8F9FA] font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
