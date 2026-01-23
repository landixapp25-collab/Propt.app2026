import { useState, useEffect } from 'react';
import { User, Mail, LogOut, Bell, HelpCircle, CreditCard, Shield, ChevronRight, FileText, Crown, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';
import PersonalInformationModal from './PersonalInformationModal';
import PrivacySecurityModal from './PrivacySecurityModal';
import SubscriptionPage from './SubscriptionPage';
import CurrencySelectorModal from './CurrencySelectorModal';
import ThemeSelectorModal from './ThemeSelectorModal';
import HelpCenterPage from './HelpCenterPage';
import ContactSupportModal from './ContactSupportModal';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsOfServicePage from './TermsOfServicePage';

type SettingsView = 'main' | 'subscription' | 'helpCenter' | 'privacyPolicy' | 'termsOfService';

export default function Settings() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Property Investor');

  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showPrivacySecurityModal, setShowPrivacySecurityModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState('GBP');
  const [theme, setTheme] = useState('Light');

  useEffect(() => {
    loadUserData();
    loadPreferences();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const loadPreferences = () => {
    const savedNotifications = localStorage.getItem('notifications_enabled');
    const savedCurrency = localStorage.getItem('preferred_currency');
    const savedTheme = localStorage.getItem('theme');

    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === 'true');
    }
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    if (savedTheme) {
      setTheme(savedTheme === 'light' ? 'Light' : savedTheme === 'dark' ? 'Dark' : 'System');
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Auth session missing')) {
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

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    const confirmDelete = window.confirm(
      'Are you ABSOLUTELY sure? This will permanently delete your account and all data. This action cannot be undone.'
    );

    if (!confirmDelete) {
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('transactions').delete().eq('user_id', user.id);
      await supabase.from('properties').delete().eq('user_id', user.id);
      await supabase.from('saved_deals').delete().eq('user_id', user.id);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      await supabase.auth.signOut();

      alert('Your account has been deleted successfully.');
    } catch (err: any) {
      console.error('Delete account error:', err);
      alert(`Failed to delete account: ${err.message}`);
      setShowDeleteConfirm(false);
    }
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notifications_enabled', String(newValue));

    const message = newValue ? 'Notifications enabled' : 'Notifications disabled';
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-[#4ECDC4] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€',
    };
    return symbols[code] || '£';
  };

  if (currentView === 'subscription') {
    return <SubscriptionPage onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'helpCenter') {
    return <HelpCenterPage onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'privacyPolicy') {
    return <PrivacyPolicyPage onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'termsOfService') {
    return <TermsOfServicePage onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#365563' }}>
      <div className="border-b border-gray-200" style={{ backgroundColor: '#365563' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-1">
          <Logo size={28} />
          <h1 className="text-xl font-bold text-[#F8F9FA]">Profile</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-[#537d90] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B6B] to-[#FFB84D] rounded-full flex items-center justify-center">
              <User size={40} className="text-[#F8F9FA]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#F8F9FA] mb-1">{userName}</h2>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Mail size={14} />
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">ACCOUNT SETTINGS</h3>
          </div>
          <button
            onClick={() => setShowPersonalInfoModal(true)}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600"
          >
            <User size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Personal Information</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowPrivacySecurityModal(true)}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors"
          >
            <Shield size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Privacy & Security</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

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
                  <p className="text-sm text-gray-300">1 property • 10 transactions/month</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('subscription')}
              className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FFB84D] text-[#F8F9FA] rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Crown size={20} />
              Upgrade to Pro
            </button>
            <p className="text-xs text-gray-300 text-center mt-3">
              Get up to 6 properties, unlimited transactions, AI features & more
            </p>
          </div>
        </div>

        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">PREFERENCES</h3>
          </div>
          <button
            onClick={toggleNotifications}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600"
          >
            <Bell size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Notifications</span>
            <div
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                notificationsEnabled ? 'bg-[#4ECDC4]' : 'bg-gray-400'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </div>
          </button>
          <button
            onClick={() => setShowCurrencyModal(true)}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600"
          >
            <span className="text-gray-300 font-medium text-xl">{getCurrencySymbol(currency)}</span>
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Currency</span>
            <span className="text-gray-300 text-sm font-medium">{currency} ({getCurrencySymbol(currency)})</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowThemeModal(true)}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors"
          >
            <span className="text-gray-300 font-medium text-xl">🌓</span>
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Theme</span>
            <span className="text-gray-300 text-sm font-medium">{theme}</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-[#537d90] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#537d90]">
            <h3 className="font-semibold text-[#F8F9FA] text-sm">HELP & SUPPORT</h3>
          </div>
          <button
            onClick={() => setCurrentView('helpCenter')}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600"
          >
            <HelpCircle size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Help Center</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600"
          >
            <Mail size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Contact Support</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentView('privacyPolicy')}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors border-b border-gray-600"
          >
            <FileText size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Privacy Policy</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentView('termsOfService')}
            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[#647d8f] transition-colors"
          >
            <FileText size={20} className="text-gray-300" />
            <span className="flex-1 text-left text-[#F8F9FA] font-medium">Terms of Service</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

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
          <button
            onClick={handleDeleteAccount}
            className={`w-full px-4 py-3 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors ${
              showDeleteConfirm ? 'bg-red-100' : ''
            }`}
          >
            <Trash2 size={18} className="text-[#E86C6C]" />
            <span className={`text-sm ${showDeleteConfirm ? 'font-bold' : ''} text-[#E86C6C]`}>
              {showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete Account'}
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-300 py-4">Propt v1.0.0</p>
      </div>

      <PersonalInformationModal
        isOpen={showPersonalInfoModal}
        onClose={() => {
          setShowPersonalInfoModal(false);
          loadUserData();
        }}
      />
      <PrivacySecurityModal
        isOpen={showPrivacySecurityModal}
        onClose={() => setShowPrivacySecurityModal(false)}
      />
      <CurrencySelectorModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onCurrencyChange={(newCurrency) => {
          setCurrency(newCurrency);
          const message = `Currency changed to ${newCurrency}`;
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-[#4ECDC4] text-white px-6 py-3 rounded-lg shadow-lg z-50';
          notification.textContent = message;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 2000);
        }}
      />
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onThemeChange={(newTheme) => {
          setTheme(newTheme === 'light' ? 'Light' : newTheme === 'dark' ? 'Dark' : 'System');
        }}
      />
      <ContactSupportModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
