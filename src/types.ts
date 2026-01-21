export type PropertyType = 'House' | 'Flat' | 'Commercial';

export type PropertyStatus = 'Stabilized' | 'In Development' | 'Under Offer' | 'Planning';

export type InvestmentStrategy = 'flip' | 'btl' | 'brrr';

export type TransactionType = 'Income' | 'Expense';

export type IncomeCategory = 'Rental Income' | 'Sale Proceeds' | 'Refinance' | 'Grant/Funding' | 'Other';
export type ExpenseCategory = 'Materials' | 'Labour' | 'Professional Fees' | 'Planning & Permits' | 'Finance Costs' | 'Utilities' | 'Acquisition Costs' | 'Marketing & Sales' | 'Insurance' | 'Other';

export interface Receipt {
  filename: string;
  data: string;
  uploadDate: string;
  fileType: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  receipt?: Receipt;
}

export interface AIAnalysis {
  dealRating: 'excellent' | 'good' | 'fair' | 'poor';
  strategy: InvestmentStrategy;

  purchasePrice?: number;
  developmentBudget?: number;
  gdv?: number;
  projectTimeline?: number;
  holdingCosts?: number;
  saleCosts?: number;
  grossProfit?: number;
  profitMargin?: number;

  monthlyRent?: number;
  grossYield?: number;
  netYield?: number;
  monthlyCashFlow?: number;
  monthlyExpenses?: number;

  initialInvestment?: number;
  postRefurbValue?: number;
  capitalRecovered?: number;
  capitalLeftIn?: number;
  remainingEquity?: number;
  refurbBudget?: number;
  isInfiniteReturn?: boolean;

  totalInvestment: number;
  roi: number;
  reasoning: string;
  marketComparison: string;
  riskFactors: string[];
  dataSources?: string;
}

export interface Property {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
  propertyType: PropertyType;
  currentValue: number | null;
  status: PropertyStatus;
  aiAnalysis?: AIAnalysis;
}

export type DealStatus = 'reviewing' | 'offer-made' | 'due-diligence' | 'acquired' | 'rejected';

export interface SavedDeal {
  id: string;
  address: string;
  strategy: InvestmentStrategy;
  propertyType: PropertyType;

  askingPrice?: number;
  bedrooms?: number;
  renovationCosts?: number;
  developmentBudget?: number;
  gdv?: number;
  projectTimeline?: number;
  holdingCosts?: number;
  monthlyRent?: number;
  monthlyExpenses?: number;
  depositPercent?: number;
  mortgageRate?: number;
  postRefurbValue?: number;
  refinancePercent?: number;

  aiAnalysis: AIAnalysis;
  analyzedDate: string;
  status: DealStatus;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'reminder';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  propertyId?: string;
  createdAt: string;
}
