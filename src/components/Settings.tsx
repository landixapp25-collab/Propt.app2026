import { useState } from 'react';
import { User, Mail, LogOut, Bell, HelpCircle, CreditCard, Shield, ChevronRight, FileText, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

export default function Settings() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Logout error:', error);
        alert(`Failed to log out: ${error.message}`);
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error('Logout exception:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      {/* Header */}
      <div className="border-b border-gray-200" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-1">
          <Logo size={28} />
          <h1 className="text-xl font-bold text-[#F8F9FA]">Profile</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* User Profile Card */}
        <div className="bg-[#537d90] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B6B] to-[#FFB84D] rounded-full flex items-center justify-center">
              <User size={40} className="text-[#F8F9FA]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#F8F9FA] mb-1">Property Investor</h2>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Mail size={14} />
                investor@propt.com
              </p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">ACCOUNT SETTINGS</h3>
          </div>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600">
            <User size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Personal Information</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors">
            <Shield size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Privacy & Security</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Subscription */}
        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">SUBSCRIPTION</h3>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <CreditCard size={20} className="text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#F8F9FA] font-semibold">Free Plan</p>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      Current
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">Unlimited properties & AI insights</p>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FFB84D] text-[#F8F9FA] rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Crown size={20} />
              Upgrade to Pro
            </button>
            <p className="text-xs text-gray-300 text-center mt-3">
              Get advanced analytics, priority support, and more
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">PREFERENCES</h3>
          </div>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600">
            <Bell size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Notifications</span>
            <div className="bg-[#4ECDC4] w-12 h-6 rounded-full flex items-center px-1">
              <div className="bg-white w-5 h-5 rounded-full ml-auto"></div>
            </div>
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600">
            <span className="text-gray-600 font-medium">💷</span>
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Currency</span>
            <span className="text-gray-600 text-sm font-medium">GBP (£)</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors">
            <span className="text-gray-600 font-medium">🌓</span>
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Theme</span>
            <span className="text-gray-600 text-sm font-medium">Light</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Help & Support */}
        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">HELP & SUPPORT</h3>
          </div>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600">
            <HelpCircle size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Help Center</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600">
            <Mail size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Contact Support</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600">
            <FileText size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Privacy Policy</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors">
            <FileText size={20} className="text-gray-600" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Terms of Service</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border-2 border-red-100">
          <div className="px-4 py-3 bg-red-50">
            <h3 className="font-semibold text-[#E86C6C] text-sm">DANGER ZONE</h3>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-4 flex items-center justify-center gap-3 hover:bg-red-50 transition-colors border-b border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={20} className="text-[#E86C6C]" />
            <span className="font-semibold text-[#E86C6C]">
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </span>
          </button>
          <button className="w-full px-4 py-3 flex items-center justify-center hover:bg-red-50 transition-colors">
            <span className="text-sm text-[#E86C6C]">Delete Account</span>
          </button>
        </div>

        {/* Version Info */}
        <p className="text-center text-sm text-gray-300 py-4">Propt v1.0.0</p>
      </div>
    </div>
  );
}
