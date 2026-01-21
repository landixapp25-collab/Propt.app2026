import { useState } from 'react';
import { Plus, Home, TrendingUp, TrendingDown, ChevronRight, Sparkles } from 'lucide-react';
import { Property, Transaction, PropertyStatus } from '../types';
import FilterChips from './FilterChips';
import Logo from './Logo';

interface PropertiesPageProps {
  properties: Property[];
  transactions: Transaction[];
  onPropertyClick: (property: Property) => void;
  onAddProperty: () => void;
  onUpdateProperty: (propertyId: string, updates: Partial<Property>) => void;
}

export default function PropertiesPage({
  properties,
  transactions,
  onPropertyClick,
  onAddProperty,
  onUpdateProperty,
}: PropertiesPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<PropertyStatus | 'All'>('All');

  const handleStatusChange = (propertyId: string, newStatus: PropertyStatus) => {
    onUpdateProperty(propertyId, { status: newStatus });

    // Automatically change filter to match the new status
    setSelectedFilter(newStatus);
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

  const getPropertyNetProfit = (property: Property) => {
    const propertyTransactions = transactions.filter(t => t.propertyId === property.id);
    const income = propertyTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = propertyTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const valueChange = property.currentValue !== null ? (property.currentValue - property.purchasePrice) : 0;
    return income - expenses + valueChange;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'House': 'bg-blue-100 text-blue-700',
      'Flat': 'bg-purple-100 text-purple-700',
      'Commercial': 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadgeColor = (status: PropertyStatus) => {
    const colors: Record<PropertyStatus, string> = {
      'Stabilized': 'bg-emerald-100 text-emerald-700',
      'In Development': 'bg-amber-100 text-amber-700',
      'Under Offer': 'bg-blue-100 text-blue-700',
      'Planning': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusCounts = () => {
    const counts: Record<PropertyStatus | 'All', number> = {
      'All': properties.length,
      'Stabilized': 0,
      'In Development': 0,
      'Under Offer': 0,
      'Planning': 0,
    };

    properties.forEach(property => {
      counts[property.status] = (counts[property.status] || 0) + 1;
    });

    return counts;
  };

  const counts = getStatusCounts();

  const filterChips = [
    { label: 'All', value: 'All' as const, count: counts['All'] },
    { label: 'Stabilized', value: 'Stabilized' as PropertyStatus, count: counts['Stabilized'] },
    { label: 'In Development', value: 'In Development' as PropertyStatus, count: counts['In Development'] },
    { label: 'Under Offer', value: 'Under Offer' as PropertyStatus, count: counts['Under Offer'] },
    { label: 'Planning', value: 'Planning' as PropertyStatus, count: counts['Planning'] },
  ];

  const filteredProperties = selectedFilter === 'All'
    ? properties
    : properties.filter(property => property.status === selectedFilter);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Logo size={28} />
            <h1 className="text-xl font-bold text-[#F8F9FA]">Acquired Assets</h1>
          </div>
          <button
            onClick={onAddProperty}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg hover:bg-[#FF5252] transition-colors font-semibold"
          >
            <Plus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {properties.length === 0 ? (
          <div className="bg-[#537d90] rounded-xl p-12 shadow-sm text-center animate-fade-in">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F9FA] mb-3">No Assets Acquired Yet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Start building your portfolio by adding your first acquired asset. Track valuations, equity, and returns all in one place.
            </p>
            <button
              onClick={onAddProperty}
              className="px-8 py-4 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg hover:bg-[#FF5252] transition-colors font-semibold inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add Your First Asset
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Chips */}
            <FilterChips
              chips={filterChips}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />

            {/* Properties List */}
            {filteredProperties.length === 0 ? (
              <div className="bg-[#537d90] rounded-xl p-8 shadow-sm text-center">
                <p className="text-gray-300 text-lg">No {selectedFilter !== 'All' ? selectedFilter.toLowerCase() : ''} assets</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProperties.map((property) => {
                const netProfit = getPropertyNetProfit(property);
                const isProfit = netProfit >= 0;

                return (
                  <button
                    key={property.id}
                    onClick={() => onPropertyClick(property)}
                    className="w-full bg-[#537d90] rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden animate-fade-in"
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(property.propertyType)}`}>
                            {property.propertyType}
                          </span>
                          <select
                            value={property.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(property.id, e.target.value as PropertyStatus);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-2 cursor-pointer transition-all ${getStatusBadgeColor(property.status)}`}
                          >
                            <option value="Stabilized">Stabilized</option>
                            <option value="In Development">In Development</option>
                            <option value="Under Offer">Under Offer</option>
                            <option value="Planning">Planning</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-300">Acquired: {formatDate(property.purchaseDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-gray-300">Purchase</p>
                          <p className="font-semibold text-[#F8F9FA]">{formatCurrency(property.purchasePrice)}</p>
                        </div>
                        <div className="text-gray-300">|</div>
                        <div>
                          <p className="text-gray-300">Current</p>
                          <p className="font-semibold text-[#F8F9FA]">
                            {property.currentValue !== null ? formatCurrency(property.currentValue) : 'TBD'}
                          </p>
                        </div>
                      </div>

                      <ChevronRight size={20} className="text-gray-400 group-hover:text-[#FF6B6B] transition-colors" />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-300">Net Position</span>
                      {property.currentValue !== null ? (
                        <div className={`flex items-center gap-1 font-bold ${isProfit ? 'text-[#4ECDC4]' : 'text-[#E86C6C]'}`}>
                          {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          <span>{formatCurrency(Math.abs(netProfit))}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Pending valuation</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
