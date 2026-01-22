export interface TourStep {
  id: string;
  title: string;
  message: string;
  targetSelector?: string;
  action?: 'highlight' | 'open-modal';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    message: 'Your dashboard shows portfolio value, equity, and capital deployed at a glance',
    targetSelector: '[data-tour="metrics"]',
    position: 'bottom',
  },
  {
    id: 'add-property',
    title: 'Add Your First Property',
    message: 'Start by adding your first property. Click here to begin tracking income and expenses',
    targetSelector: '[data-tour="add-property"]',
    position: 'bottom',
  },
  {
    id: 'transactions',
    title: 'Track Transactions',
    message: 'Add income (rent) and expenses (materials, labour, etc.) to track your cashflow',
    targetSelector: '[data-tour="transactions"]',
    position: 'top',
  },
  {
    id: 'receipt-upload',
    title: 'Smart Receipt Upload',
    message: 'Snap a photo of any receipt - our AI automatically extracts vendor, amount, and date',
    targetSelector: '[data-tour="receipt-upload"]',
    position: 'top',
  },
  {
    id: 'analyze-deal',
    title: 'BRRR Calculator',
    message: 'Run deal analysis on potential properties using our BRRR calculator',
    targetSelector: '[data-tour="analyze-deal"]',
    position: 'top',
  },
  {
    id: 'export',
    title: 'Export Tax Pack',
    message: 'When tax time comes, export everything in one click - all transactions, receipts, and summaries organized for your accountant',
    targetSelector: '[data-tour="export"]',
    position: 'top',
  },
  {
    id: 'add-to-home',
    title: 'Add to Home Screen',
    message: 'For the best experience, add Propt to your home screen',
    action: 'open-modal',
  },
];

export const ONBOARDING_STORAGE_KEY = 'propt_onboarding_completed';

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function markOnboardingCompleted(): void {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function detectDevice(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }

  if (/android/.test(userAgent)) {
    return 'android';
  }

  return 'desktop';
}

export function getElementPosition(selector: string): { top: number; left: number; width: number; height: number } | null {
  const element = document.querySelector(selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}
