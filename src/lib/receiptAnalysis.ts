import { ExpenseCategory, IncomeCategory } from '../types';

export interface ReceiptAnalysisResult {
  vendor?: string;
  amount?: number;
  date?: string;
  category?: ExpenseCategory | IncomeCategory;
  items?: string;
  success: boolean;
  error?: string;
}

export async function analyzeReceipt(
  imageBase64: string,
  imageType: string
): Promise<ReceiptAnalysisResult> {
  console.log('[Receipt Analysis] Starting analysis...');
  console.log('[Receipt Analysis] Image type:', imageType);

  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-receipt`;

    console.log('[Receipt Analysis] Sending request to edge function...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        imageType,
      }),
    });

    console.log('[Receipt Analysis] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Receipt Analysis] Error:', errorData);
      return {
        success: false,
        error: errorData.error || 'Failed to analyse receipt',
      };
    }

    const result = await response.json();
    console.log('[Receipt Analysis] Success!', result);

    if (result.date) {
      result.date = formatDate(result.date);
    }

    return result;
  } catch (error) {
    console.error('[Receipt Analysis] Exception caught:', error);
    console.error('[Receipt Analysis] Error details:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyse receipt',
    };
  }
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
