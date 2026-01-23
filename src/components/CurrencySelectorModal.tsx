import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencyChange: (currency: string) => void;
}

const currencies = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export default function CurrencySelectorModal({ isOpen, onClose, onCurrencyChange }: CurrencySelectorModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  useEffect(() => {
    const saved = localStorage.getItem('preferred_currency');
    if (saved) {
      setSelectedCurrency(saved);
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    localStorage.setItem('preferred_currency', code);
    onCurrencyChange(code);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#537d90] px-6 py-4 flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#F8F9FA]">Select Currency</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-[#F8F9FA] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors mb-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currency.symbol}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{currency.name}</div>
                  <div className="text-sm text-gray-500">{currency.code}</div>
                </div>
              </div>
              {selectedCurrency === currency.code && (
                <Check size={24} className="text-[#4ECDC4]" />
              )}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Currency conversion coming soon. Currently affects display only.
          </p>
        </div>
      </div>
    </div>
  );
}
