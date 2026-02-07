import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ColumnMapping, CsvPreview, ParsedCsvRow, IncomeRecord } from '../types';
import { AppError } from '../middleware/error.middleware';

export class CsvService {
  // Parse file (CSV or XLSX) and return preview
  parsePreview(fileContent: string | Buffer, previewRows = 5, fileType: 'csv' | 'xlsx' = 'csv'): CsvPreview {
    if (fileType === 'xlsx') {
      return this.parseXlsxPreview(fileContent as Buffer, previewRows);
    }
    return this.parseCsvPreview(fileContent as string, previewRows);
  }

  // Parse CSV content and return preview
  private parseCsvPreview(csvContent: string, previewRows = 5): CsvPreview {
    const result = Papa.parse<ParsedCsvRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      throw new AppError(`CSV parsing error: ${result.errors[0]?.message}`);
    }

    const headers = result.meta.fields || [];
    const rows = result.data.slice(0, previewRows);
    const totalRows = result.data.length;

    return { headers, rows, totalRows };
  }

  // Parse XLSX content and return preview
  private parseXlsxPreview(fileBuffer: Buffer, previewRows = 5): CsvPreview {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new AppError('Excel file has no sheets');
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedCsvRow>(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        throw new AppError('Excel file is empty');
      }

      const headers = Object.keys(jsonData[0] || {});
      const rows = jsonData.slice(0, previewRows);
      const totalRows = jsonData.length;

      return { headers, rows, totalRows };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Excel parsing error: ${(error as Error).message}`);
    }
  }

  // Parse CSV to JSON array
  private parseCsvToJson(csvContent: string): ParsedCsvRow[] {
    const result = Papa.parse<ParsedCsvRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      throw new AppError(`CSV parsing error: ${result.errors[0]?.message}`);
    }

    return result.data;
  }

  // Parse XLSX to JSON array
  private parseXlsxToJson(fileBuffer: Buffer): ParsedCsvRow[] {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new AppError('Excel file has no sheets');
      }

      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json<ParsedCsvRow>(worksheet, { defval: '' });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Excel parsing error: ${(error as Error).message}`);
    }
  }

  // Parse file (CSV or XLSX) with column mapping
  parseWithMapping(
    fileContent: string | Buffer,
    mapping: ColumnMapping,
    sourceName: string,
    fileType: 'csv' | 'xlsx' = 'csv'
  ): Partial<IncomeRecord>[] {
    const data = fileType === 'xlsx'
      ? this.parseXlsxToJson(fileContent as Buffer)
      : this.parseCsvToJson(fileContent as string);

    const records: Partial<IncomeRecord>[] = [];

    for (const row of data) {
      // Extract amount (required)
      const amountStr = row[mapping.amount];
      if (!amountStr) continue;

      const amount = this.parseAmount(amountStr);
      if (isNaN(amount)) continue;

      // Extract date (required)
      const dateStr = row[mapping.date];
      if (!dateStr) continue;

      const transactionDate = this.parseDate(dateStr);
      if (!transactionDate) continue;

      // Build record
      const record: Partial<IncomeRecord> = {
        amount,
        transaction_date: transactionDate,
        raw_data: row as Record<string, unknown>,
      };

      // Optional fields
      if (mapping.description && row[mapping.description]) {
        record.description = row[mapping.description];
      }
      if (mapping.category && row[mapping.category]) {
        record.category = row[mapping.category];
      }
      if (mapping.customer && row[mapping.customer]) {
        record.customer_name = row[mapping.customer];
      }
      if (mapping.currency && row[mapping.currency]) {
        record.currency = row[mapping.currency];
      }
      if (mapping.transaction_id && row[mapping.transaction_id]) {
        record.external_transaction_id = row[mapping.transaction_id];
      }

      records.push(record);
    }

    return records;
  }

  // Parse amount string/number to number (handles $, commas, etc.)
  private parseAmount(amountValue: string | number): number {
    // If already a number (common with Excel files), return directly
    if (typeof amountValue === 'number') {
      return amountValue;
    }

    // Remove currency symbols, commas, and whitespace
    const cleaned = String(amountValue)
      .replace(/[$ ₹€£,]/g, '')
      .replace(/\s/g, '')
      .trim();

    return parseFloat(cleaned);
  }

  // Parse various date formats to YYYY-MM-DD
  private parseDate(dateValue: string | number | Date): string | null {
    // Handle Date objects (common with Excel files)
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString().split('T')[0] || null;
      }
      return null;
    }

    // Handle Excel serial date numbers
    if (typeof dateValue === 'number') {
      // Excel serial date: days since 1900-01-01 (with a bug for 1900 leap year)
      const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
      const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0] || null;
      }
      return null;
    }

    const cleaned = String(dateValue).trim();

    // Try common formats
    const formats = [
      // ISO format: 2024-01-15
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // US format: 01/15/2024 or 1/15/2024
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // European format: 15/01/2024
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // With time: 2024-01-15T00:00:00
      /^(\d{4})-(\d{2})-(\d{2})T/,
    ];

    // Try ISO first
    const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    // Try US format (MM/DD/YYYY)
    const usMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usMatch) {
      const month = usMatch[1]!.padStart(2, '0');
      const day = usMatch[2]!.padStart(2, '0');
      return `${usMatch[3]}-${month}-${day}`;
    }

    // Try to parse with Date object as fallback
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0] || null;
    }

    return null;
  }

  // Detect known platform formats
  detectPlatform(headers: string[]): string | null {
    const headerSet = new Set(headers.map((h) => h.toLowerCase()));

    // Patreon
    if (headerSet.has('patron') && headerSet.has('pledge')) {
      return 'patreon';
    }

    // Gumroad
    if (headerSet.has('product') && headerSet.has('price') && headerSet.has('email')) {
      return 'gumroad';
    }

    // Stripe
    if (headerSet.has('id') && headerSet.has('amount') && headerSet.has('status')) {
      return 'stripe';
    }

    // PayPal
    if (headerSet.has('transaction id') && headerSet.has('gross')) {
      return 'paypal';
    }

    return null;
  }

  // Get suggested column mapping for known platforms
  getSuggestedMapping(platform: string): ColumnMapping | null {
    const mappings: Record<string, ColumnMapping> = {
      patreon: {
        amount: 'Pledge',
        date: 'Created',
        customer: 'Patron',
        description: 'Tier',
      },
      gumroad: {
        amount: 'Price',
        date: 'Created At',
        customer: 'Email',
        description: 'Product',
        transaction_id: 'Order Number',
      },
      stripe: {
        amount: 'Amount',
        date: 'Created',
        description: 'Description',
        transaction_id: 'id',
        currency: 'Currency',
      },
      paypal: {
        amount: 'Gross',
        date: 'Date',
        customer: 'Name',
        transaction_id: 'Transaction ID',
        currency: 'Currency',
      },
    };

    return mappings[platform] || null;
  }
}

export const csvService = new CsvService();
