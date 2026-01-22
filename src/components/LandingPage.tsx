import { ArrowRight, Camera, Calculator, Folder, Smartphone, TrendingUp, Users, FileText, Check, X } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onNavigateToSignup: () => void;
  onNavigateToLogin: () => void;
}

export default function LandingPage({ onNavigateToSignup, onNavigateToLogin }: LandingPageProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332]">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2332] bg-opacity-95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo size={32} />
              <span className="text-xl font-bold text-white">Propt</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={onNavigateToSignup}
                className="px-5 py-2 bg-[#FF6B6B] text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors"
              >
                Sign Up
              </button>
            </div>

            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={onNavigateToLogin}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Login
              </button>
              <button
                onClick={onNavigateToSignup}
                className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors text-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Property Finance for Independent Developers
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Stop using spreadsheets. Built for developers doing 1-10 deals a year without a finance team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onNavigateToSignup}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B6B] text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={onNavigateToSignup}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg font-semibold border-2 border-gray-600 hover:border-[#5a9aa8] transition-all"
                >
                  View Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#2a3f52] to-[#1a2332] rounded-2xl p-8 shadow-2xl border border-gray-700">
                <div className="bg-[#365563] rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#FF6B6B] rounded-full flex items-center justify-center">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">£847,500</div>
                      <div className="text-sm text-gray-300">Portfolio Value</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#537d90] rounded-lg p-3">
                      <div className="text-lg font-bold text-white">£45,230</div>
                      <div className="text-xs text-gray-300">Profit (YTD)</div>
                    </div>
                    <div className="bg-[#537d90] rounded-lg p-3">
                      <div className="text-lg font-bold text-white">5</div>
                      <div className="text-xs text-gray-300">Active Projects</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#365563] rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-2">Recent Transaction</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF6B6B] bg-opacity-20 rounded-full flex items-center justify-center">
                        <Camera size={18} className="text-[#FF6B6B]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Buildbase Materials</div>
                        <div className="text-xs text-gray-400">Construction Materials</div>
                      </div>
                    </div>
                    <div className="text-white font-bold">£3,245</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0f1419]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Built for Solo Developers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1a2332] rounded-xl p-8 border border-gray-800 hover:border-[#5a9aa8] transition-all">
              <div className="w-14 h-14 bg-[#FF6B6B] bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <TrendingUp size={28} className="text-[#FF6B6B]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1-10 Deals Per Year</h3>
              <p className="text-gray-400">
                Managing multiple projects without dedicated finance staff
              </p>
            </div>

            <div className="bg-[#1a2332] rounded-xl p-8 border border-gray-800 hover:border-[#5a9aa8] transition-all">
              <div className="w-14 h-14 bg-[#5a9aa8] bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <FileText size={28} className="text-[#5a9aa8]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Currently Using Spreadsheets</h3>
              <p className="text-gray-400">
                Tired of disorganized receipts and manual tracking
              </p>
            </div>

            <div className="bg-[#1a2332] rounded-xl p-8 border border-gray-800 hover:border-[#5a9aa8] transition-all">
              <div className="w-14 h-14 bg-[#4ECDC4] bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <Users size={28} className="text-[#4ECDC4]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DIY Finance</h3>
              <p className="text-gray-400">
                Want to stay on top of costs without hiring an accountant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-gradient-to-br from-[#2a3f52] to-[#1a2332] rounded-xl p-6 border border-gray-700 hover:border-[#FF6B6B] transition-all">
              <div className="w-12 h-12 bg-[#FF6B6B] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Camera size={24} className="text-[#FF6B6B]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Receipt Extraction</h3>
              <p className="text-gray-400 text-sm">
                Snap a photo, we extract vendor, amount, date automatically
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#2a3f52] to-[#1a2332] rounded-xl p-6 border border-gray-700 hover:border-[#5a9aa8] transition-all">
              <div className="w-12 h-12 bg-[#5a9aa8] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Calculator size={24} className="text-[#5a9aa8]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">BRRR Deal Analyzer</h3>
              <p className="text-gray-400 text-sm">
                Analyze deals with real market research before you buy
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#2a3f52] to-[#1a2332] rounded-xl p-6 border border-gray-700 hover:border-[#4ECDC4] transition-all">
              <div className="w-12 h-12 bg-[#4ECDC4] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Folder size={24} className="text-[#4ECDC4]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tax Pack Exports</h3>
              <p className="text-gray-400 text-sm">
                One-click export of all transactions and receipts for your accountant
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#2a3f52] to-[#1a2332] rounded-xl p-6 border border-gray-700 hover:border-[#FFB84D] transition-all">
              <div className="w-12 h-12 bg-[#FFB84D] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Smartphone size={24} className="text-[#FFB84D]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Mobile-First</h3>
              <p className="text-gray-400 text-sm">
                Track expenses on site, not back at the desk
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0f1419]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Why Propt vs Landlord Studio / Property Hawk?
          </h2>
          <div className="bg-[#1a2332] rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold">Competitors</th>
                    <th className="text-center py-4 px-6 text-[#FF6B6B] font-semibold">Propt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white">Built for landlords</td>
                    <td className="text-center py-4 px-6">
                      <Check size={24} className="text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <div className="text-gray-400 text-sm">Built for developers</div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white">AI receipt extraction</td>
                    <td className="text-center py-4 px-6 text-gray-400 text-sm">£10/mo extra</td>
                    <td className="text-center py-4 px-6">
                      <Check size={24} className="text-[#4ECDC4] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white">BRRR deal analysis</td>
                    <td className="text-center py-4 px-6">
                      <X size={24} className="text-gray-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check size={24} className="text-[#4ECDC4] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white">Mobile-first design</td>
                    <td className="text-center py-4 px-6 text-gray-400 text-sm">Desktop-focused</td>
                    <td className="text-center py-4 px-6">
                      <Check size={24} className="text-[#4ECDC4] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white">Developer categories</td>
                    <td className="text-center py-4 px-6">
                      <X size={24} className="text-gray-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <div className="text-[#4ECDC4] text-sm font-semibold">Materials/Labour/Professional</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#2a3f52] rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-white mb-6">£0<span className="text-base text-gray-300">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>1 property</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>10 transactions per month</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Manual receipt upload</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>BRRR calculator access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Basic dashboard</span>
                </li>
              </ul>
              <button
                onClick={onNavigateToSignup}
                className="w-full py-3 bg-transparent border-2 border-[#4ECDC4] text-[#4ECDC4] rounded-lg font-semibold hover:bg-[#4ECDC4] hover:text-white transition-colors"
              >
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FFB84D] rounded-xl p-8 relative overflow-hidden shadow-2xl transform scale-105">
              <div className="absolute top-4 right-4 bg-white text-[#FF6B6B] px-3 py-1 rounded-full text-xs font-bold">
                73 spots left
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">£12</span>
                <span className="text-xl text-white line-through opacity-60">£24</span>
                <span className="text-white">/month</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2 mb-6">
                <p className="text-white text-xs font-semibold">
                  Founder pricing - first 100 users, locked forever
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>Up to 15 properties</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>Unlimited transactions</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>100 AI receipt extractions/mo</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>Full tax pack exports</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>Date range filtering</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>BRRR deal analyzer</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>Financial summaries & reports</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check size={20} className="mt-0.5 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
              </ul>
              <button
                onClick={onNavigateToSignup}
                className="w-full py-3 bg-white text-[#FF6B6B] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Pro Trial
              </button>
              <p className="text-white text-xs text-center mt-3 opacity-80">14-day trial</p>
            </div>

            {/* Business Plan */}
            <div className="bg-[#2a3f52] rounded-xl p-8 border border-gray-700 relative">
              <div className="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Business</h3>
              <div className="text-4xl font-bold text-white mb-6">£49<span className="text-base text-gray-300">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Unlimited properties</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Unlimited transactions</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Unlimited AI receipt extraction</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Multi-user access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Accountant collaboration</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Custom export formats</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check size={20} className="text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                  <span>Priority phone support</span>
                </li>
              </ul>
              <button
                disabled
                className="w-full py-3 bg-gray-700 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0f1419]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to ditch the spreadsheets?
          </h2>
          <button
            onClick={onNavigateToSignup}
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#FF6B6B] text-white text-lg rounded-lg font-semibold hover:bg-[#FF5252] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Free Trial
            <ArrowRight size={24} />
          </button>
          <p className="text-gray-400 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size={28} />
              <span className="text-xl font-bold text-white">Propt</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Login
              </button>
              <a
                href="mailto:hello@propt.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>

            <div className="text-gray-400 text-sm">
              © 2026 Propt
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
