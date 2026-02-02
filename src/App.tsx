import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Analytics } from '@vercel/analytics/react';
import DashboardOverview from './components/DashboardOverview';
import PropertiesPage from './components/PropertiesPage';
import PropertyDetail from './components/PropertyDetail';
import InsightsFull from './components/InsightsFull';
import AddPropertyForm from './components/AddPropertyForm';
import AddTransactionModal from './components/AddTransactionModal';
import AnalyzeDeal from './components/AnalyzeDeal';
import AuthForm from './components/AuthForm';
import SavedDeals from './components/SavedDeals';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import NotificationsModal from './components/NotificationsModal';
import LandingPage from './components/LandingPage';
import { Property, Transaction, SavedDeal, Notification, UserProfile, SubscriptionTier } from './types';
import { supabase } from './lib/supabase';
import { propertyService, transactionService, savedDealService, notificationService } from './lib/database';
import SubscriptionLimitModal from './components/SubscriptionLimitModal';
import { incrementTransactionUsage } from './lib/subscription';

type ViewType = 'landing' | 'login' | 'signup' | 'dashboard' | 'properties' | 'analyze-deal' | 'saved-deals' | 'profile' | 'property-detail' | 'add-property' | 'insights-full';
type AuthMode = 'login' | 'signup';

interface PortfolioInsights {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  portfolioScore: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    actionable: boolean;
  }[];
  underperformingProperties: {
    propertyName: string;
    issue: string;
    suggestion: string;
  }[];
  opportunityScore: number;
  marketOutlook: string;
  nextSteps: string[];
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    propertyId: string;
    propertyName: string;
  }>({
    isOpen: false,
    propertyId: '',
    propertyName: '',
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSubscriptionLimitModal, setShowSubscriptionLimitModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    tier: 'pro' | 'business';
  }>({
    isOpen: false,
    title: '',
    message: '',
    tier: 'pro',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentView('dashboard');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [propertiesData, transactionsData, savedDealsData, notificationsData, profileData] = await Promise.all([
        propertyService.getAll(),
        transactionService.getAll(),
        savedDealService.getAll(),
        notificationService.getAll(),
        supabase.from('profiles').select('*').single(),
      ]);
      setProperties(propertiesData);
      setTransactions(transactionsData);
      setSavedDeals(savedDealsData);
      setNotifications(notificationsData);
      if (profileData.data) {
        setUserProfile(profileData.data as UserProfile);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkSubscriptionLimit = (): boolean => {
    if (!userProfile) return true;

    const nonDemoProperties = properties.filter(p => !p.isDemo);
    const propertyCount = nonDemoProperties.length;
    const tier = userProfile.subscription_tier;

    if (tier === 'free' && propertyCount >= 1) {
      return false;
    }

    if (tier === 'pro' && propertyCount >= 6) {
      return false;
    }

    return true;
  };

  const handleAddPropertyClick = () => {
    if (!checkSubscriptionLimit()) {
      setShowSubscriptionLimitModal(true);
      return;
    }
    setCurrentView('add-property');
  };

  const handleUpgrade = () => {
    setShowSubscriptionLimitModal(false);
    setCurrentView('profile');
  };

  const handleAddProperty = async (propertyData: {
    name: string;
    purchasePrice: number;
    purchaseDate: string;
    propertyType: 'House' | 'Flat' | 'Commercial';
    currentValue: number;
    status: 'Stabilized' | 'In Development' | 'Under Offer' | 'Planning';
  }) => {
    try {
      const newProperty = await propertyService.create(propertyData);
      setProperties([newProperty, ...properties]);
      setCurrentView('properties');
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  const handleAddTransaction = async (transactionData: {
    propertyId: string;
    type: 'Income' | 'Expense';
    category: string;
    amount: number;
    date: string;
    description?: string;
  }) => {
    try {
      const newTransaction = await transactionService.create(transactionData);
      setTransactions([newTransaction, ...transactions]);

      if (user && userProfile?.subscription_tier === 'free') {
        await incrementTransactionUsage(user.id);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await propertyService.delete(propertyId);
      setProperties(properties.filter(p => p.id !== propertyId));
      setTransactions(transactions.filter(t => t.propertyId !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionService.delete(transactionId);
      setTransactions(transactions.filter(t => t.id !== transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(`Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateProperty = async (propertyId: string, updates: Partial<Property>) => {
    try {
      const updatedProperty = await propertyService.update(propertyId, updates);
      setProperties(properties.map(p => p.id === propertyId ? updatedProperty : p));
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleUpdateSavedDeal = async (dealId: string, updates: Partial<SavedDeal>) => {
    try {
      const updatedDeal = await savedDealService.update(dealId, updates);
      setSavedDeals(savedDeals.map(d => d.id === dealId ? updatedDeal : d));
    } catch (error) {
      console.error('Error updating saved deal:', error);
    }
  };

  const handleDeleteSavedDeal = async (dealId: string) => {
    try {
      await savedDealService.delete(dealId);
      setSavedDeals(savedDeals.filter(d => d.id !== dealId));
    } catch (error) {
      console.error('Error deleting saved deal:', error);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMoveToPortfolio = async (
    deal: SavedDeal,
    data: {
      purchasePrice: number;
      purchaseDate: string;
      currentValue: number | null;
      status: 'Stabilized' | 'In Development' | 'Under Offer' | 'Planning';
    }
  ) => {
    try {
      const newProperty = await propertyService.create({
        name: deal.address,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        propertyType: deal.propertyType,
        currentValue: data.currentValue,
        status: data.status,
      });

      await savedDealService.delete(deal.id);

      setProperties([newProperty, ...properties]);
      setSavedDeals(savedDeals.filter(d => d.id !== deal.id));

      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error moving deal to portfolio:', error);
      alert('Failed to move deal to portfolio');
    }
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('property-detail');
  };

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);

    try {
      const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
      const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlyIncome = transactions
        .filter(t => t.type === 'Income' && new Date(t.date) >= firstDayOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = transactions
        .filter(t => t.type === 'Expense' && new Date(t.date) >= firstDayOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      const portfolioSummary = {
        totalProperties: properties.length,
        totalValue: totalValue,
        totalInvestment: totalInvestment,
        currentMonthlyIncome: monthlyIncome,
        currentMonthlyExpenses: monthlyExpenses,
        properties: properties.map(p => {
          const propertyTransactions = transactions.filter(t => t.propertyId === p.id);
          const income = propertyTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
          const expenses = propertyTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

          return {
            name: p.name,
            type: p.propertyType,
            purchasePrice: p.purchasePrice,
            currentValue: p.currentValue,
            totalIncome: income,
            totalExpenses: expenses,
            transactionCount: propertyTransactions.length,
          };
        }),
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioSummary }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data: { insights: PortfolioInsights } = await response.json();
      setInsights(data.insights);
      setCurrentView('insights-full');
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const openTransactionModal = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      setTransactionModal({
        isOpen: true,
        propertyId,
        propertyName: property.name,
      });
    }
  };

  const closeTransactionModal = () => {
    setTransactionModal({
      isOpen: false,
      propertyId: '',
      propertyName: '',
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardOverview
            properties={properties}
            transactions={transactions}
            onNavigateToProperties={() => setCurrentView('properties')}
            onNavigateToAnalyze={() => setCurrentView('analyze-deal')}
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotificationCount={notifications.filter(n => !n.read).length}
            onShowUpgrade={(title, message, tier) => {
              setUpgradeModal({ isOpen: true, title, message, tier });
            }}
          />
        );

      case 'properties':
        return (
          <PropertiesPage
            properties={properties}
            transactions={transactions}
            onPropertyClick={handlePropertyClick}
            onAddProperty={handleAddPropertyClick}
            onUpdateProperty={handleUpdateProperty}
          />
        );

      case 'property-detail':
        return selectedProperty ? (
          <PropertyDetail
            property={selectedProperty}
            transactions={transactions}
            onBack={() => setCurrentView('properties')}
            onDelete={handleDeleteProperty}
            onAddTransaction={openTransactionModal}
            onDeleteTransaction={handleDeleteTransaction}
            onViewAnalysis={() => {}}
            onShowUpgrade={(title, message, tier) => {
              setUpgradeModal({ isOpen: true, title, message, tier });
            }}
          />
        ) : null;

      case 'insights-full':
        return insights ? (
          <InsightsFull
            insights={insights}
            onBack={() => setCurrentView('properties')}
            onRefresh={handleGenerateInsights}
            loading={insightsLoading}
          />
        ) : null;

      case 'add-property':
        return <AddPropertyForm onSubmit={handleAddProperty} onBack={() => setCurrentView('properties')} />;

      case 'analyze-deal':
        return (
          <AnalyzeDeal
            onSaveSuccess={async () => {
              await loadData();
              setCurrentView('saved-deals');
            }}
          />
        );

      case 'saved-deals':
        return (
          <SavedDeals
            savedDeals={savedDeals}
            onDeleteDeal={handleDeleteSavedDeal}
            onMoveToPortfolio={handleMoveToPortfolio}
            onUpdateDeal={handleUpdateSavedDeal}
          />
        );

      case 'profile':
        return <Settings />;

      default:
        return (
          <DashboardOverview
            properties={properties}
            transactions={transactions}
            onNavigateToProperties={() => setCurrentView('properties')}
            onNavigateToAnalyze={() => setCurrentView('analyze-deal')}
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotificationCount={notifications.filter(n => !n.read).length}
            onShowUpgrade={(title, message, tier) => {
              setUpgradeModal({ isOpen: true, title, message, tier });
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#FF6B6B' }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentView === 'landing') {
      return (
        <LandingPage
          onNavigateToSignup={() => {
            setAuthMode('signup');
            setCurrentView('signup');
          }}
          onNavigateToLogin={() => {
            setAuthMode('login');
            setCurrentView('login');
          }}
        />
      );
    }

    if (currentView === 'login' || currentView === 'signup') {
      return <AuthForm onAuth={() => {}} mode={authMode} />;
    }

    return (
      <LandingPage
        onNavigateToSignup={() => {
          setAuthMode('signup');
          setCurrentView('signup');
        }}
        onNavigateToLogin={() => {
          setAuthMode('login');
          setCurrentView('login');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Only show bottom nav on main views, not on detail pages */}
      {!['property-detail', 'insights-full', 'add-property'].includes(currentView) && (
        <BottomNav currentView={currentView} onViewChange={(view) => setCurrentView(view as ViewType)} />
      )}

      <AddTransactionModal
        propertyId={transactionModal.propertyId}
        propertyName={transactionModal.propertyName}
        isOpen={transactionModal.isOpen}
        onClose={closeTransactionModal}
        onSubmit={handleAddTransaction}
        onShowUpgrade={(title, message, tier) => {
          setUpgradeModal({ isOpen: true, title, message, tier });
        }}
      />

      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onDelete={handleDeleteNotification}
        />
      )}

      <SubscriptionLimitModal
        isOpen={showSubscriptionLimitModal}
        onClose={() => setShowSubscriptionLimitModal(false)}
        currentTier={userProfile?.subscription_tier || 'free'}
        onUpgrade={handleUpgrade}
      />

      <SubscriptionLimitModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
        currentTier={userProfile?.subscription_tier || 'free'}
        onUpgrade={() => {
          setUpgradeModal({ ...upgradeModal, isOpen: false });
          setCurrentView('profile');
        }}
        title={upgradeModal.title}
        message={upgradeModal.message}
      />

      <Analytics />
    </div>
  );
}

export default App;
