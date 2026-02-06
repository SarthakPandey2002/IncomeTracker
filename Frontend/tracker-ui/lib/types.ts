export interface IncomeSource {
  id: string;
  user_id: string;
  source_name: string;
  source_type: 'platform' | 'custom';
  icon_url: string | null;
  created_at: string;
}

export interface IncomeRecord {
  id: string;
  user_id: string;
  source_id: string | null;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string | null;
  category: string | null;
  customer_name: string | null;
  external_transaction_id: string | null;
  created_at: string;
  income_sources?: {
    source_name: string;
  };
}

export interface ColumnMapping {
  amount: string;
  date: string;
  description?: string;
  category?: string;
  customer?: string;
  currency?: string;
  transaction_id?: string;
}

export interface CsvPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface IncomeSummary {
  totalAmount: number;
  recordCount: number;
  bySource: Record<string, number>;
  byMonth: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IncomeInsight {
  summary: string;
  highlights: string[];
  recommendations: string[];
  topSource: string | null;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface InsightsResponse {
  insights: IncomeInsight;
  data: {
    currentPeriod: {
      totalIncome: number;
      transactionCount: number;
      bySource: Record<string, number>;
    };
    previousPeriod: {
      totalIncome: number;
      transactionCount: number;
    };
  };
  aiEnabled: boolean;
}

export interface InsightsStatus {
  configured: boolean;
  features: {
    smartCategorization: boolean;
    incomeInsights: boolean;
  };
}
