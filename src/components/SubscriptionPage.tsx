import { ArrowLeft, Crown, Check, Mail } from 'lucide-react';

interface SubscriptionPageProps {
  onBack: () => void;
}

export default function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const handleContactSupport = () => {
    window.location.href = 'mailto:hello@propt.app?subject=Upgrade to Pro Plan - Founder Pricing&body=Hi! I would like to upgrade to the Pro plan with founder pricing (£12/month locked forever).%0D%0A%0D%0APlease let me know the next steps.%0D%0A%0D%0AThank you!';
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="border-b border-gray-700" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-[#F8F9FA] hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#F8F9FA]">Subscription</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#F8F9FA] mb-2">Choose Your Plan</h2>
          <p className="text-gray-300">Unlock powerful features to grow your property portfolio</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#537d90] rounded-2xl p-6 border-2 border-gray-600">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#F8F9FA] mb-2">Free Plan</h3>
              <div className="text-4xl font-bold text-[#F8F9FA] mb-1">£0</div>
              <p className="text-gray-300 text-sm">Forever free</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">1 property</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">10 transactions per month</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Basic analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Mobile app access</span>
              </div>
            </div>

            <button
              disabled
              className="w-full py-3 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FFB84D] rounded-2xl p-6 border-2 border-[#FFB84D] relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white text-[#FF6B6B] px-3 py-1 rounded-full text-xs font-bold">
              FOUNDER PRICING
            </div>

            <div className="text-center mb-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown size={28} className="text-white" />
                <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
              </div>
              <div className="text-4xl font-bold text-white mb-1">£12</div>
              <p className="text-white/90 text-sm">per month, locked forever</p>
              <p className="text-white/80 text-xs mt-1">(Regular price: £25/month)</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">Up to 6 properties</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">Unlimited transactions</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">100 AI receipt extractions/month</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">Full tax pack exports (CSV & PDF)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">BRRR deal analyzer</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">Advanced analytics & insights</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">Priority support</span>
              </div>
            </div>

            <button
              onClick={handleContactSupport}
              className="w-full py-3 bg-white text-[#FF6B6B] rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Contact Us to Upgrade
            </button>

            <p className="text-white/90 text-xs text-center mt-3">
              Email hello@propt.app to get started
            </p>
          </div>
        </div>

        <div className="mt-8 bg-[#537d90] rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-bold text-[#F8F9FA] mb-4">Why Upgrade to Pro?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-[#F8F9FA] mb-1">Advanced Analytics</h4>
              <p className="text-sm text-gray-300">Get deeper insights into your portfolio performance with advanced metrics and visualizations</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-semibold text-[#F8F9FA] mb-1">AI-Powered Features</h4>
              <p className="text-sm text-gray-300">Automatically extract receipt data, analyze deals, and get intelligent recommendations</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📄</div>
              <h4 className="font-semibold text-[#F8F9FA] mb-1">Tax Time Made Easy</h4>
              <p className="text-sm text-gray-300">Export complete tax packs with all your transactions organized and ready for your accountant</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-300 text-sm">
            Have questions? <button onClick={handleContactSupport} className="text-[#4ECDC4] hover:underline font-medium">Contact our team</button>
          </p>
        </div>
      </div>
    </div>
  );
}
