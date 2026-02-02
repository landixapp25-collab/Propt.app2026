import { useState, FormEvent, useEffect, useRef } from 'react';
import { X, Save, Camera, Trash2, Upload, Check, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { TransactionType, IncomeCategory, ExpenseCategory, Receipt } from '../types';
import { compressImage, formatFileSize } from '../lib/imageCompression';
import { analyzeReceipt, ReceiptAnalysisResult } from '../lib/receiptAnalysis';
import { detectImageFormat } from '../lib/imageFormat';
import { canUseAIReceipt, incrementAIReceiptUsage, getUserProfile, SubscriptionTier } from '../lib/subscription';

interface AddTransactionModalProps {
  propertyId: string;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: {
    propertyId: string;
    type: TransactionType;
    category: IncomeCategory | ExpenseCategory;
    amount: number;
    date: string;
    description?: string;
    receipt?: Receipt;
  }) => void;
  onShowUpgrade: (title: string, message: string, tier: 'pro' | 'business') => void;
}

export default function AddTransactionModal({
  propertyId,
  propertyName,
  isOpen,
  onClose,
  onSubmit,
  onShowUpgrade,
}: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    type: 'Income' as TransactionType,
    category: 'Rental Income' as IncomeCategory | ExpenseCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState<string>('');
  const [aiExtracted, setAiExtracted] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const incomeCategories: IncomeCategory[] = [
    'Rental Income',
    'Sale Proceeds',
    'Refinance',
    'Grant/Funding',
    'Other',
  ];
  const expenseCategories: ExpenseCategory[] = [
    'Materials',
    'Labour',
    'Professional Fees',
    'Planning & Permits',
    'Finance Costs',
    'Utilities',
    'Acquisition Costs',
    'Marketing & Sales',
    'Insurance',
    'Other',
  ];

  useEffect(() => {
    if (formData.type === 'Income') {
      setFormData((prev) => ({ ...prev, category: 'Rental Income' }));
    } else {
      setFormData((prev) => ({ ...prev, category: 'Materials' }));
    }
  }, [formData.type]);

  useEffect(() => {
    if (!isOpen) {
      setIsAnalyzing(false);
      setAnalysisMessage('');
      setUploadError('');
    }
  }, [isOpen]);

  const performAIAnalysis = async (receiptData: Receipt) => {
    setIsAnalyzing(true);
    setAnalysisMessage('Checking subscription...');
    setUploadError('');

    try {
      const profile = await getUserProfile();
      if (!profile) {
        setUploadError('Please sign in to use AI receipt extraction');
        setIsAnalyzing(false);
        return;
      }

      const check = await canUseAIReceipt(profile.id, profile.subscription_tier as SubscriptionTier);
      if (!check.allowed) {
        setIsAnalyzing(false);
        setAnalysisMessage('');
        setUploadError('');
        setReceipt(null);
        onShowUpgrade(
          profile.subscription_tier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Business',
          check.reason || '',
          profile.subscription_tier === 'free' ? 'pro' : 'business'
        );
        return;
      }

      setAnalysisMessage('Analysing receipt...');
      const result = await analyzeReceipt(receiptData.data, receiptData.fileType);

      if (result.success) {
        if (result.amount) {
          setFormData((prev) => ({
            ...prev,
            amount: result.amount!.toString(),
          }));
        }

        if (result.date) {
          setFormData((prev) => ({
            ...prev,
            date: result.date!,
          }));
        }

        if (result.category) {
          setFormData((prev) => ({
            ...prev,
            category: result.category!,
          }));
        }

        if (result.vendor || result.items) {
          const description = result.vendor && result.items
            ? `${result.vendor} - ${result.items}`
            : result.vendor || result.items || '';
          setFormData((prev) => ({
            ...prev,
            description,
          }));
        }

        setAiExtracted(true);
        setAnalysisMessage('Receipt analysed successfully');

        await incrementAIReceiptUsage(profile.id);

        setTimeout(() => {
          setAnalysisMessage('');
        }, 3000);
      } else {
        setUploadError(
          result.error || 'Could not read receipt clearly. Please enter details manually.'
        );
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      setUploadError(`Error: ${errorMessage}. Please enter details manually.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    try {
      detectImageFormat(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setCapturedFile(file);
      };

      reader.onerror = () => {
        setUploadError('Failed to load image');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Invalid image format');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File must be under 10MB');
      return;
    }

    try {
      const format = detectImageFormat(file);

      if (format.mediaType === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const receiptData = {
            filename: file.name,
            data: base64,
            uploadDate: new Date().toISOString(),
            fileType: 'pdf',
          };
          setReceipt(receiptData);
          await performAIAnalysis(receiptData);
        };
        reader.onerror = () => {
          setUploadError('Upload failed, please try again');
        };
        reader.readAsDataURL(file);
      } else {
        setIsCompressing(true);
        try {
          const compressed = await compressImage(file, 2, 0.85);
          const receiptData = {
            filename: file.name,
            data: compressed.data,
            uploadDate: new Date().toISOString(),
            fileType: format.fileType,
          };
          setReceipt(receiptData);
          await performAIAnalysis(receiptData);
        } catch (error) {
          setUploadError('Failed to process image');
        } finally {
          setIsCompressing(false);
        }
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Invalid file format');
    }
  };

  const handleConfirmPhoto = async () => {
    if (!capturedFile) return;

    setIsCompressing(true);
    setUploadError('');

    try {
      const compressed = await compressImage(capturedFile, 2, 0.85);
      const receiptData = {
        filename: capturedFile.name || `receipt_${Date.now()}.jpg`,
        data: compressed.data,
        uploadDate: new Date().toISOString(),
        fileType: 'jpeg',
      };
      setReceipt(receiptData);
      setPreviewImage(null);
      setCapturedFile(null);
      await performAIAnalysis(receiptData);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process image. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRetakePhoto = () => {
    setPreviewImage(null);
    setCapturedFile(null);
    setUploadError('');
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    setPreviewImage(null);
    setCapturedFile(null);
    setUploadError('');
    setAnalysisMessage('');
    setAiExtracted(false);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        propertyId,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description || undefined,
        receipt: receipt || undefined,
      });

      setFormData({
        type: 'Income',
        category: 'Rental Income',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setErrors({});
      setReceipt(null);
      setPreviewImage(null);
      setCapturedFile(null);
      setUploadError('');
      setAnalysisMessage('');
      setAiExtracted(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#537d90] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-[#F8F9FA]">Add Transaction</h3>
            <p className="text-sm text-gray-300 mt-1">{propertyName}</p>
          </div>
          <button
            onClick={() => {
              setIsAnalyzing(false);
              setAnalysisMessage('');
              setUploadError('');
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Income' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.type === 'Income'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Expense' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.type === 'Expense'
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                Category *
              </label>
              {aiExtracted && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <Sparkles size={14} />
                  AI extracted
                </span>
              )}
            </div>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value as IncomeCategory | ExpenseCategory });
                setAiExtracted(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              {formData.type === 'Income'
                ? incomeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                : expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (£) *
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1250"
              min="0"
              step="0.01"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Receipt (Optional)
            </label>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              aria-label="Capture photo with camera"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload file from device"
            />

            {previewImage ? (
              <div className="space-y-3">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Receipt preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Preview
                  </div>
                </div>
                <p className="text-xs text-gray-300 text-center">
                  Ensure entire receipt is visible and text is clear
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    disabled={isCompressing}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw size={18} />
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPhoto}
                    disabled={isCompressing}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompressing ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Use This Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : !receipt ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#FF5252] transition-colors min-h-[44px]"
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isCompressing}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={20} />
                    {isCompressing ? 'Processing...' : 'Upload File'}
                  </button>
                </div>
                <p className="text-xs text-gray-300 text-center">
                  JPG, PNG, GIF, WebP, or PDF • Max 10MB
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  {receipt.fileType === 'pdf' ? (
                    <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={receipt.data}
                      alt="Receipt preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{receipt.filename}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {receipt.fileType.toUpperCase()} • {new Date(receipt.uploadDate).toLocaleDateString()}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="flex items-center gap-1 mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-red-600" role="alert">{uploadError}</p>
            )}

            {isAnalyzing && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-400">
                <Loader2 size={16} className="animate-spin" />
                <span>{analysisMessage}</span>
              </div>
            )}

            {!isAnalyzing && analysisMessage && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                <Check size={16} />
                <span>{analysisMessage}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-[#F8F9FA] font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
