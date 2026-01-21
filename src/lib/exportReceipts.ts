import JSZip from 'jszip';
import { Transaction, Property } from '../types';
import { DateRangeOption } from '../components/DateRangeFilterModal';

interface ExportResult {
  success: boolean;
  message: string;
  totalCount?: number;
  receiptCount?: number;
}

interface PropertySummary {
  property: string;
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  receiptCoverage: number;
  transactionCount: number;
  period: string;
}

export async function exportReceiptsToZip(
  property: Property,
  transactions: Transaction[],
  dateRange?: DateRangeOption | null
): Promise<ExportResult> {
  const filteredTransactions = dateRange
    ? filterTransactionsByDate(transactions, dateRange.startDate, dateRange.endDate)
    : transactions;

  if (filteredTransactions.length === 0) {
    return {
      success: false,
      message: dateRange
        ? 'No transactions found for selected period'
        : 'No transactions found for this property',
    };
  }

  try {
    const zip = new JSZip();
    const year = new Date().getFullYear();

    const transactionsWithReceipts = filteredTransactions.filter(t => t.receipt);

    let receiptsFolder: JSZip | null = null;
    if (transactionsWithReceipts.length > 0) {
      receiptsFolder = zip.folder('receipts');
      if (!receiptsFolder) {
        throw new Error('Failed to create receipts folder');
      }
    }

    const csvRows: string[] = [
      'Date,Type,Category,Vendor,Description,Amount,Receipt,Property'
    ];

    const monthFolders = new Map<string, JSZip>();
    let receiptCounter = 1;

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;

      if (a.type === 'Income' && b.type !== 'Income') return -1;
      if (a.type !== 'Income' && b.type === 'Income') return 1;
      return 0;
    });

    for (const transaction of sortedTransactions) {
      const date = new Date(transaction.date);
      const vendor = extractVendorFromDescription(transaction.description || 'Unknown');
      const sanitizedVendor = sanitizeFilename(vendor);

      let receiptValue = 'N/A';
      let receiptFilename = '';

      if (transaction.receipt && receiptsFolder) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.toLocaleString('en-GB', { month: 'long' })}`;

        if (!monthFolders.has(monthKey)) {
          const monthFolder = receiptsFolder.folder(monthKey);
          if (monthFolder) {
            monthFolders.set(monthKey, monthFolder);
          }
        }

        const receiptNumber = String(receiptCounter).padStart(3, '0');
        const amountStr = Math.abs(transaction.amount).toFixed(0);
        const fileExtension = getFileExtension(transaction.receipt.fileType);
        receiptFilename = `receipt_${receiptNumber}_${sanitizedVendor}_${amountStr}.${fileExtension}`;

        const monthFolder = monthFolders.get(monthKey);
        if (monthFolder) {
          try {
            const base64Data = transaction.receipt.data.split(',')[1] || transaction.receipt.data;
            monthFolder.file(receiptFilename, base64Data, { base64: true });
            receiptValue = receiptFilename;
            receiptCounter++;
          } catch (error) {
            console.error('Error adding receipt file:', error);
            receiptValue = 'Receipt file missing';
          }
        }
      } else if (transaction.type === 'Income') {
        receiptValue = 'N/A';
      } else {
        receiptValue = 'No receipt';
      }

      const formattedDate = date.toLocaleDateString('en-GB');
      const formattedAmount = `£${Math.abs(transaction.amount).toFixed(2)}`;
      const csvType = escapeCSV(transaction.type);
      const csvCategory = escapeCSV(transaction.category);
      const csvVendor = escapeCSV(vendor);
      const csvDescription = escapeCSV(transaction.description || '');
      const csvProperty = escapeCSV(property.name);

      csvRows.push(
        `${formattedDate},${csvType},${csvCategory},${csvVendor},${csvDescription},${formattedAmount},${receiptValue},${csvProperty}`
      );
    }

    const csvContent = csvRows.join('\n');
    zip.file('transactions.csv', csvContent);

    const summary = generatePropertySummary(
      property.name,
      filteredTransactions,
      dateRange ? dateRange.label : 'All Time'
    );
    const summaryCsv = generateSummaryCsv([summary]);
    zip.file('summary.csv', summaryCsv);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const blobSize = blob.size / (1024 * 1024);
    if (blobSize > 50) {
      console.warn(`Large export size: ${blobSize.toFixed(2)}MB`);
    }

    const sanitizedPropertyName = sanitizeFilename(property.name);
    const dateLabel = dateRange ? `_${dateRange.filename}` : `_${year}`;
    const filename = `${sanitizedPropertyName}_TaxPack${dateLabel}.zip`;

    downloadBlob(blob, filename);

    return {
      success: true,
      message: `Exported ${filteredTransactions.length} transactions (${transactionsWithReceipts.length} with receipts) for ${property.name}`,
      totalCount: filteredTransactions.length,
      receiptCount: transactionsWithReceipts.length,
    };
  } catch (error) {
    console.error('Error creating tax pack:', error);
    return {
      success: false,
      message: 'Error creating tax pack. Please try again.',
    };
  }
}

export async function exportAllPropertiesToZip(
  properties: Property[],
  allTransactions: Transaction[],
  dateRange?: DateRangeOption | null
): Promise<ExportResult> {
  if (properties.length === 0) {
    return {
      success: false,
      message: 'No properties found',
    };
  }

  const propertiesWithTransactions = properties.filter(p => {
    const propertyTransactions = allTransactions.filter(t => t.propertyId === p.id);
    const filteredTransactions = dateRange
      ? filterTransactionsByDate(propertyTransactions, dateRange.startDate, dateRange.endDate)
      : propertyTransactions;
    return filteredTransactions.length > 0;
  });

  if (propertiesWithTransactions.length === 0) {
    return {
      success: false,
      message: dateRange
        ? 'No properties with transactions found for selected period'
        : 'No properties with transactions found',
    };
  }

  try {
    const zip = new JSZip();
    const summaries: PropertySummary[] = [];
    let totalTransactions = 0;
    let totalReceipts = 0;
    const failedProperties: string[] = [];

    for (const property of propertiesWithTransactions) {
      try {
        const propertyTransactions = allTransactions.filter(t => t.propertyId === property.id);
        const filteredTransactions = dateRange
          ? filterTransactionsByDate(propertyTransactions, dateRange.startDate, dateRange.endDate)
          : propertyTransactions;

        if (filteredTransactions.length === 0) continue;

        const sanitizedPropertyName = sanitizeFilename(property.name);
        const propertyFolder = zip.folder(`Property_${sanitizedPropertyName}`);
        if (!propertyFolder) {
          throw new Error(`Failed to create folder for ${property.name}`);
        }

        const transactionsWithReceipts = filteredTransactions.filter(t => t.receipt);
        totalTransactions += filteredTransactions.length;
        totalReceipts += transactionsWithReceipts.length;

        let receiptsFolder: JSZip | null = null;
        if (transactionsWithReceipts.length > 0) {
          receiptsFolder = propertyFolder.folder('receipts');
          if (!receiptsFolder) {
            throw new Error('Failed to create receipts folder');
          }
        }

        const csvRows: string[] = [
          'Date,Type,Category,Vendor,Description,Amount,Receipt,Property'
        ];

        const monthFolders = new Map<string, JSZip>();
        let receiptCounter = 1;

        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare !== 0) return dateCompare;

          if (a.type === 'Income' && b.type !== 'Income') return -1;
          if (a.type !== 'Income' && b.type === 'Income') return 1;
          return 0;
        });

        for (const transaction of sortedTransactions) {
          const date = new Date(transaction.date);
          const vendor = extractVendorFromDescription(transaction.description || 'Unknown');
          const sanitizedVendor = sanitizeFilename(vendor);

          let receiptValue = 'N/A';

          if (transaction.receipt && receiptsFolder) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.toLocaleString('en-GB', { month: 'long' })}`;

            if (!monthFolders.has(monthKey)) {
              const monthFolder = receiptsFolder.folder(monthKey);
              if (monthFolder) {
                monthFolders.set(monthKey, monthFolder);
              }
            }

            const receiptNumber = String(receiptCounter).padStart(3, '0');
            const amountStr = Math.abs(transaction.amount).toFixed(0);
            const fileExtension = getFileExtension(transaction.receipt.fileType);
            const receiptFilename = `receipt_${receiptNumber}_${sanitizedVendor}_${amountStr}.${fileExtension}`;

            const monthFolder = monthFolders.get(monthKey);
            if (monthFolder) {
              try {
                const base64Data = transaction.receipt.data.split(',')[1] || transaction.receipt.data;
                monthFolder.file(receiptFilename, base64Data, { base64: true });
                receiptValue = receiptFilename;
                receiptCounter++;
              } catch (error) {
                console.error('Error adding receipt file:', error);
                receiptValue = 'Receipt file missing';
              }
            }
          } else if (transaction.type === 'Income') {
            receiptValue = 'N/A';
          } else {
            receiptValue = 'No receipt';
          }

          const formattedDate = date.toLocaleDateString('en-GB');
          const formattedAmount = `£${Math.abs(transaction.amount).toFixed(2)}`;
          const csvType = escapeCSV(transaction.type);
          const csvCategory = escapeCSV(transaction.category);
          const csvVendor = escapeCSV(vendor);
          const csvDescription = escapeCSV(transaction.description || '');
          const csvProperty = escapeCSV(property.name);

          csvRows.push(
            `${formattedDate},${csvType},${csvCategory},${csvVendor},${csvDescription},${formattedAmount},${receiptValue},${csvProperty}`
          );
        }

        const csvContent = csvRows.join('\n');
        propertyFolder.file('transactions.csv', csvContent);

        const summary = generatePropertySummary(
          property.name,
          filteredTransactions,
          dateRange ? dateRange.label : 'All Time'
        );
        summaries.push(summary);
      } catch (error) {
        console.error(`Error processing property ${property.name}:`, error);
        failedProperties.push(property.name);
      }
    }

    const portfolioSummaryCsv = generateSummaryCsv(summaries);
    zip.file('portfolio_summary.csv', portfolioSummaryCsv);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const dateLabel = dateRange ? `_${dateRange.filename}` : `_${new Date().getFullYear()}`;
    const filename = `Multi-Property-TaxPack${dateLabel}.zip`;

    downloadBlob(blob, filename);

    const successCount = propertiesWithTransactions.length - failedProperties.length;
    let message = `Exported ${totalTransactions} transactions across ${successCount} ${successCount === 1 ? 'property' : 'properties'}`;

    if (failedProperties.length > 0) {
      message += ` (${failedProperties.length} ${failedProperties.length === 1 ? 'property' : 'properties'} had errors)`;
    }

    return {
      success: true,
      message,
      totalCount: totalTransactions,
      receiptCount: totalReceipts,
    };
  } catch (error) {
    console.error('Error creating multi-property tax pack:', error);
    return {
      success: false,
      message: 'Error creating tax pack. Please try again.',
    };
  }
}

function filterTransactionsByDate(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

function generatePropertySummary(
  propertyName: string,
  transactions: Transaction[],
  period: string
): PropertySummary {
  const income = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTransactions = transactions.filter(t => t.type === 'Expense');
  const expensesWithReceipts = expenseTransactions.filter(t => t.receipt).length;
  const receiptCoverage = expenseTransactions.length > 0
    ? (expensesWithReceipts / expenseTransactions.length) * 100
    : 0;

  return {
    property: propertyName,
    totalIncome: income,
    totalExpenses: expenses,
    netPosition: income - expenses,
    receiptCoverage: Math.round(receiptCoverage),
    transactionCount: transactions.length,
    period,
  };
}

function generateSummaryCsv(summaries: PropertySummary[]): string {
  const rows: string[] = [
    'Property,Total Income,Total Expenses,Net Position,Receipt Coverage,Transaction Count,Period'
  ];

  const sortedSummaries = [...summaries].sort((a, b) =>
    a.property.localeCompare(b.property)
  );

  for (const summary of sortedSummaries) {
    const income = `£${summary.totalIncome.toFixed(2)}`;
    const expenses = `£${summary.totalExpenses.toFixed(2)}`;
    const net = summary.netPosition >= 0
      ? `£${summary.netPosition.toFixed(2)}`
      : `-£${Math.abs(summary.netPosition).toFixed(2)}`;
    const coverage = `${summary.receiptCoverage}%`;

    rows.push(
      `${escapeCSV(summary.property)},${income},${expenses},${net},${coverage},${summary.transactionCount},${escapeCSV(summary.period)}`
    );
  }

  if (summaries.length > 1) {
    const totalIncome = summaries.reduce((sum, s) => sum + s.totalIncome, 0);
    const totalExpenses = summaries.reduce((sum, s) => sum + s.totalExpenses, 0);
    const totalNet = totalIncome - totalExpenses;
    const totalTransactions = summaries.reduce((sum, s) => sum + s.transactionCount, 0);

    const allExpenseTransactions = summaries.reduce((sum, s) => {
      return sum + (s.transactionCount - Math.round(s.transactionCount * (s.totalIncome / (s.totalIncome + s.totalExpenses))));
    }, 0);
    const allExpensesWithReceipts = summaries.reduce((sum, s) => {
      const expenseCount = s.transactionCount - Math.round(s.transactionCount * (s.totalIncome / (s.totalIncome + s.totalExpenses)));
      return sum + Math.round(expenseCount * (s.receiptCoverage / 100));
    }, 0);
    const avgCoverage = allExpenseTransactions > 0
      ? Math.round((allExpensesWithReceipts / allExpenseTransactions) * 100)
      : 0;

    const period = summaries[0]?.period || 'All Time';

    rows.push(
      `TOTAL,£${totalIncome.toFixed(2)},£${totalExpenses.toFixed(2)},${totalNet >= 0 ? '£' : '-£'}${Math.abs(totalNet).toFixed(2)},${avgCoverage}%,${totalTransactions},${escapeCSV(period)}`
    );
  }

  return rows.join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function extractVendorFromDescription(description: string): string {
  const parts = description.split('-');
  return parts[0].trim() || 'Unknown';
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

function getFileExtension(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('png')) return 'png';
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
  return 'jpg';
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
