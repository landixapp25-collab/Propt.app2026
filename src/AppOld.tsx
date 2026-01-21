import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddPropertyForm from './components/AddPropertyForm';
import AddTransactionModal from './components/AddTransactionModal';
import AnalyzeDeal from './components/AnalyzeDeal';
import AuthForm from './components/AuthForm';
import ProfileView from './components/ProfileView';
import SavedDeals from './components/SavedDeals';
import { Property, Transaction, SavedDeal } from './types';
import { supabase } from './lib/supabase';
import { propertyService, transactionService, savedDealService } from './lib/database';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    propertyId: string;
    propertyName: string;
  }>({
    isOpen: false,
    propertyId: '',
    propertyName: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
      const [propertiesData, transactionsData, savedDealsData] = await Promise.all([
        propertyService.getAll(),
        transactionService.getAll(),
        savedDealService.getAll(),
      ]);
      setProperties(propertiesData);
      setTransactions(transactionsData);
      setSavedDeals(savedDealsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddProperty = async (propertyData: {
    name: string;
    purchasePrice: number;
    purchaseDate: string;
    propertyType: 'House' | 'Flat' | 'Commercial';
    currentValue: number;
  }) => {
    try {
      const newProperty = await propertyService.create(propertyData);
      setProperties([newProperty, ...properties]);
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

  const handleMoveToPortfolio = async (
    deal: SavedDeal,
    data: {
      purchasePrice: number;
      purchaseDate: string;
      currentValue: number;
    }
  ) => {
    try {
      const newProperty = await propertyService.create({
        name: deal.address,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        propertyType: deal.propertyType,
        currentValue: data.currentValue,
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
          <Dashboard
            properties={properties}
            transactions={transactions}
            onAddTransaction={openTransactionModal}
            onDeleteProperty={handleDeleteProperty}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'add-property':
        return <AddPropertyForm onSubmit={handleAddProperty} />;
      case 'analyze-deal':
        return <AnalyzeDeal onSaveSuccess={() => {
          loadData();
          setCurrentView('saved-deals');
        }} />;
      case 'saved-deals':
        return (
          <SavedDeals
            savedDeals={savedDeals}
            onDeleteDeal={handleDeleteSavedDeal}
            onMoveToPortfolio={handleMoveToPortfolio}
          />
        );
      case 'profile':
        return <ProfileView />;
      default:
        return <Dashboard properties={properties} transactions={transactions} onAddTransaction={openTransactionModal} onDeleteProperty={handleDeleteProperty} onDeleteTransaction={handleDeleteTransaction} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {renderContent()}
          </div>
        </main>
      </div>

      <AddTransactionModal
        propertyId={transactionModal.propertyId}
        propertyName={transactionModal.propertyName}
        isOpen={transactionModal.isOpen}
        onClose={closeTransactionModal}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}

export default App;
