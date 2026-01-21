import { useState, FormEvent } from 'react';
import { Home, Check, ArrowLeft } from 'lucide-react';
import { PropertyType, PropertyStatus } from '../types';
import Logo from './Logo';

interface AddPropertyFormProps {
  onSubmit: (property: {
    name: string;
    purchasePrice: number;
    purchaseDate: string;
    propertyType: PropertyType;
    currentValue: number | null;
    status: PropertyStatus;
  }) => void;
  onBack: () => void;
}

export default function AddPropertyForm({ onSubmit, onBack }: AddPropertyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    purchaseDate: '',
    propertyType: 'House' as PropertyType,
    currentValue: '',
    status: 'Stabilized' as PropertyStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Asset address is required';
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Acquisition cost must be greater than 0';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Acquisition date is required';
    }

    if (formData.currentValue && parseFloat(formData.currentValue) < 0) {
      newErrors.currentValue = 'Current valuation cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        name: formData.name,
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        propertyType: formData.propertyType,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
        status: formData.status,
      });

      setFormData({
        name: '',
        purchasePrice: '',
        purchaseDate: '',
        propertyType: 'House',
        currentValue: '',
        status: 'Stabilized',
      });
      setErrors({});
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="border-b border-gray-200" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-[#F8F9FA]" />
            </button>
            <div className="flex items-center gap-1">
              <Logo size={28} />
              <h1 className="text-xl font-bold text-[#F8F9FA]">Add New Asset</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {submitted && (
          <div className="mb-6 p-4 bg-[#4ECDC4] bg-opacity-10 border border-[#4ECDC4] rounded-xl flex items-center gap-3 animate-fade-in">
            <Check size={20} className="text-[#4ECDC4]" />
            <p className="text-[#4ECDC4] font-semibold">Asset added successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#537d90] rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#F8F9FA] mb-2">
              Asset Address *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input-field w-full ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="e.g., 123 High Street, London"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-[#F8F9FA] mb-2">
                Acquisition Cost (£) *
              </label>
              <input
                type="number"
                id="purchasePrice"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className={`input-field w-full ${
                  errors.purchasePrice ? 'border-red-500' : ''
                }`}
                placeholder="250000"
                min="0"
                step="1000"
              />
              {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
            </div>

            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-[#F8F9FA] mb-2">
                Acquisition Date *
              </label>
              <input
                type="date"
                id="purchaseDate"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className={`input-field w-full ${
                  errors.purchaseDate ? 'border-red-500' : ''
                }`}
              />
              {errors.purchaseDate && <p className="mt-1 text-sm text-red-600">{errors.purchaseDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-[#F8F9FA] mb-2">
                Asset Type *
              </label>
              <select
                id="propertyType"
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                className="input-field w-full"
              >
                <option value="House">House</option>
                <option value="Flat">Flat</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-[#F8F9FA] mb-2">
                Asset Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                className="input-field w-full"
              >
                <option value="Stabilized">Stabilized</option>
                <option value="In Development">In Development</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Planning">Planning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currentValue" className="block text-sm font-medium text-[#F8F9FA] mb-2">
                Current Valuation (£) <span className="text-gray-300 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                id="currentValue"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className={`input-field w-full ${
                  errors.currentValue ? 'border-red-500' : ''
                }`}
                placeholder="Leave blank if in development"
                min="0"
                step="1000"
              />
              {errors.currentValue && <p className="mt-1 text-sm text-red-600">{errors.currentValue}</p>}
              <p className="mt-1 text-xs text-gray-300">You can add this later once work is complete</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn-primary w-full"
            >
              <Home size={20} />
              Add Asset
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
