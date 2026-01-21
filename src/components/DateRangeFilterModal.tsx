import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

export interface DateRangeOption {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  filename: string;
}

interface DateRangeFilterModalProps {
  onClose: () => void;
  onExport: (range: DateRangeOption | null) => void;
}

export default function DateRangeFilterModal({ onClose, onExport }: DateRangeFilterModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('all-time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const now = new Date();
  const currentYear = now.getFullYear();

  const getDateRangeOptions = (): DateRangeOption[] => {
    const options: DateRangeOption[] = [
      {
        id: 'all-time',
        label: 'All Time',
        startDate: new Date(2000, 0, 1),
        endDate: new Date(2099, 11, 31),
        filename: 'AllTime',
      },
    ];

    const taxYear2024Start = new Date(2024, 3, 6);
    const taxYear2024End = new Date(2025, 3, 5);
    const taxYear2025Start = new Date(2025, 3, 6);
    const taxYear2025End = new Date(2026, 3, 5);

    options.push(
      {
        id: 'tax-2024-25',
        label: 'Tax Year 2024/25 (6 Apr 2024 - 5 Apr 2025)',
        startDate: taxYear2024Start,
        endDate: taxYear2024End,
        filename: '2024-25',
      },
      {
        id: 'tax-2025-26',
        label: 'Tax Year 2025/26 (6 Apr 2025 - 5 Apr 2026)',
        startDate: taxYear2025Start,
        endDate: taxYear2025End,
        filename: '2025-26',
      }
    );

    for (let year = currentYear; year >= currentYear - 2; year--) {
      options.push({
        id: `year-${year}`,
        label: `Calendar Year ${year}`,
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
        filename: `${year}`,
      });
    }

    const quarters = [
      { id: 'q1', label: 'Q1 (Jan-Mar)', start: [0, 1], end: [2, 31] },
      { id: 'q2', label: 'Q2 (Apr-Jun)', start: [3, 1], end: [5, 30] },
      { id: 'q3', label: 'Q3 (Jul-Sep)', start: [6, 1], end: [8, 30] },
      { id: 'q4', label: 'Q4 (Oct-Dec)', start: [9, 1], end: [11, 31] },
    ];

    quarters.forEach((quarter) => {
      options.push({
        id: `${quarter.id}-${currentYear}`,
        label: `${quarter.label} ${currentYear}`,
        startDate: new Date(currentYear, quarter.start[0], quarter.start[1]),
        endDate: new Date(currentYear, quarter.end[0], quarter.end[1]),
        filename: `${quarter.id.toUpperCase()}-${currentYear}`,
      });
    });

    return options;
  };

  const dateRangeOptions = getDateRangeOptions();

  useEffect(() => {
    const savedFilter = localStorage.getItem('lastExportDateFilter');
    if (savedFilter) {
      setSelectedOption(savedFilter);
    }
  }, []);

  const handleExport = () => {
    let rangeToExport: DateRangeOption | null = null;

    if (selectedOption === 'custom') {
      if (!customStartDate || !customEndDate) {
        alert('Please select both start and end dates for custom range');
        return;
      }

      const start = new Date(customStartDate);
      const end = new Date(customEndDate);

      if (start > end) {
        alert('Start date must be before end date');
        return;
      }

      const formatCustomDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).replace(/ /g, '');
      };

      rangeToExport = {
        id: 'custom',
        label: 'Custom Range',
        startDate: start,
        endDate: end,
        filename: `${formatCustomDate(start)}-${formatCustomDate(end)}`,
      };
    } else {
      const option = dateRangeOptions.find(opt => opt.id === selectedOption);
      if (option) {
        rangeToExport = option;
      }
    }

    localStorage.setItem('lastExportDateFilter', selectedOption);
    onExport(rangeToExport);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <Calendar size={24} className="text-teal-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Select Date Range</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 mb-4">
            Choose which time period to include in your tax pack export
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dateRangeOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === option.id
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="dateRange"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-3 font-medium text-gray-900">{option.label}</span>
              </label>
            ))}

            <label
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedOption === 'custom'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="dateRange"
                value="custom"
                checked={selectedOption === 'custom'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-5 h-5 text-teal-600 focus:ring-teal-500 mt-1"
              />
              <div className="ml-3 flex-1">
                <span className="font-medium text-gray-900 block mb-3">Custom Range</span>
                {selectedOption === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#5a9aa8' }}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
