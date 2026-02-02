import { X, Lock, Zap } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
}

export default function SubscriptionLimitModal({
  isOpen,
  onClose,
  currentTier,
  onUpgrade,
}: SubscriptionLimitModalProps) {
  if (!isOpen) return null;

  const getMessage = () => {
    if (currentTier === 'free') {
      return {
        title: 'Free Plan Limit Reached',
        message: 'You have reached the limit of 1 property on the Free plan.',
        upgradeTo: 'Pro',
        benefit: 'Upgrade to Pro to add up to 6 properties and unlock more features.',
      };
    } else if (currentTier === 'pro') {
      return {
        title: 'Pro Plan Limit Reached',
        message: 'You have reached the limit of 6 properties on the Pro plan.',
        upgradeTo: 'Business',
        benefit: 'Upgrade to Business for unlimited properties and premium features.',
      };
    }
    return null;
  };

  const content = getMessage();
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#537d90] rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Lock size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-[#F8F9FA]">{content.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-[#F8F9FA] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            {content.message}
          </p>

          <div className="bg-[#365563] rounded-lg p-4 border-2 border-orange-500">
            <div className="flex items-start gap-3">
              <Zap size={20} className="text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#F8F9FA] mb-1">
                  Upgrade to {content.upgradeTo}
                </p>
                <p className="text-sm text-gray-300">
                  {content.benefit}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 px-4 py-3 bg-orange-600 text-[#F8F9FA] font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
