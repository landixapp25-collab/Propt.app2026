import { PropertyStatus } from '../types';

interface FilterChip {
  label: string;
  value: PropertyStatus | 'All';
  count: number;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedFilter: PropertyStatus | 'All';
  onFilterChange: (filter: PropertyStatus | 'All') => void;
}

export default function FilterChips({ chips, selectedFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="mb-4 -mx-4 px-4 overflow-x-auto">
      <div className="flex gap-3 min-w-max pb-1">
        {chips.map((chip) => {
          const isSelected = chip.value === selectedFilter;
          return (
            <button
              key={chip.value}
              onClick={() => onFilterChange(chip.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                border whitespace-nowrap
                ${
                  isSelected
                    ? 'bg-[#FF6B6B] text-white border-[#FF6B6B] shadow-md'
                    : 'bg-white bg-opacity-10 text-gray-200 border-[#537d90] hover:bg-opacity-20'
                }
              `}
            >
              {chip.label} ({chip.count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
