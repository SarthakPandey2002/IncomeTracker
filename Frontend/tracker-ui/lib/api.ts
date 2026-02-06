import { supabase } from './supabase';
import { ApiResponse, IncomeRecord, IncomeSource, IncomeSummary, CsvPreview, ColumnMapping, InsightsResponse, InsightsStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeader();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data as T;
}

// Income Records
export async function getIncomeRecords(params?: {
  start_date?: string;
  end_date?: string;
  source_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ records: IncomeRecord[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.source_id) searchParams.set('source_id', params.source_id);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchApi(`/income${query ? `?${query}` : ''}`);
}

export async function createIncomeRecord(record: {
  source_name: string;
  amount: number;
  currency?: string;
  transaction_date: string;
  description?: string;
  category?: string;
  customer_name?: string;
}): Promise<IncomeRecord> {
  return fetchApi('/income', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function deleteIncomeRecord(id: string): Promise<void> {
  return fetchApi(`/income/${id}`, { method: 'DELETE' });
}

// Income Sources
export async function getIncomeSources(): Promise<IncomeSource[]> {
  return fetchApi('/income/sources');
}

// Summary
export async function getIncomeSummary(startDate?: string, endDate?: string): Promise<IncomeSummary> {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const query = params.toString();
  return fetchApi(`/income/summary${query ? `?${query}` : ''}`);
}

// CSV
export async function previewCsv(file: File): Promise<{
  preview: CsvPreview;
  detectedPlatform: string | null;
  suggestedMapping: ColumnMapping | null;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/csv/preview`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to preview CSV');
  }
  return data.data;
}

export async function importCsv(file: File, sourceName: string, mapping: ColumnMapping): Promise<{
  source: string;
  imported: number;
  duplicatesSkipped: number;
  totalInFile: number;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('source_name', sourceName);
  formData.append('mapping', JSON.stringify(mapping));

  const response = await fetch(`${API_URL}/csv/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to import CSV');
  }
  return data.data;
}

// AI Insights
export async function getIncomeInsights(period: 'week' | 'month' | 'year' = 'month'): Promise<InsightsResponse> {
  return fetchApi(`/insights?period=${period}`);
}

export async function getInsightsStatus(): Promise<InsightsStatus> {
  return fetchApi('/insights/status');
}
