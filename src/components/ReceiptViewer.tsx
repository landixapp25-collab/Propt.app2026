import { X, Download } from 'lucide-react';
import { Receipt } from '../types';

interface ReceiptViewerProps {
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptViewer({ receipt, onClose }: ReceiptViewerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receipt.data;
    link.download = receipt.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-[#537d90] rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#537d90]">
          <div>
            <h3 className="text-lg font-bold text-[#F8F9FA]">Receipt</h3>
            <p className="text-sm text-gray-300 mt-1">{receipt.filename}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-[#FF6B6B] text-[#F8F9FA] rounded-lg hover:bg-[#FF5252] transition-colors"
              title="Download receipt"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(90vh-80px)] bg-gray-900 flex items-center justify-center">
          {receipt.fileType === 'pdf' ? (
            <div className="w-full h-full min-h-[600px]">
              <iframe
                src={receipt.data}
                className="w-full h-full min-h-[600px]"
                title="Receipt PDF"
              />
            </div>
          ) : (
            <img
              src={receipt.data}
              alt="Receipt"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
