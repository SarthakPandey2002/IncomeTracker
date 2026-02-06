'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getIncomeRecords, deleteIncomeRecord, getIncomeSources } from '@/lib/api';
import { IncomeRecord, IncomeSource } from '@/lib/types';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Filter,
  FileText,
  User,
  AlertCircle,
  Loader2,
  Upload,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 20;

export default function IncomePage() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [page, selectedSource]);

  const loadSources = async () => {
    try {
      const data = await getIncomeSources();
      setSources(data);
    } catch (err) {
      console.error('Failed to load sources:', err);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getIncomeRecords({
        limit: ITEMS_PER_PAGE,
        offset: page * ITEMS_PER_PAGE,
        source_id: selectedSource || undefined,
      });
      setRecords(data.records);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    setDeleting(id);
    try {
      await deleteIncomeRecord(id);
      setRecords(records.filter((r) => r.id !== id));
      setTotal(total - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Generate source colors based on index
  const getSourceColor = (sourceName: string) => {
    const colors = [
      { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
      { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    ];
    const index = sourceName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white">Income Records</h1>
            <p className="text-gray-400 mt-1">
              {total} total record{total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer min-w-[160px]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="" className="bg-gray-900">All Sources</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id} className="bg-gray-900">
                  {source.source_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl animate-fade-in-up">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-fade-in-up animation-delay-100">
          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <p className="text-gray-400">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No records found</h3>
              <p className="text-gray-400 text-center mb-6 max-w-sm">
                {selectedSource
                  ? 'No records found for the selected source. Try selecting a different source.'
                  : 'Upload a CSV file to start tracking your income.'}
              </p>
              {!selectedSource && (
                <Link
                  href="/upload"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </Link>
              )}
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4" />
                        Amount
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((record) => {
                    const sourceColor = getSourceColor(record.income_sources?.source_name || 'Unknown');
                    return (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(record.transaction_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${sourceColor.bg} ${sourceColor.text} ${sourceColor.border}`}>
                            {record.income_sources?.source_name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                          {record.description || <span className="text-gray-600">-</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {record.customer_name || <span className="text-gray-600">-</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-400">
                          ${Number(record.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(record.id)}
                            disabled={deleting === record.id}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50 transition-all"
                            title="Delete record"
                          >
                            {deleting === record.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{page * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="text-white font-medium">{Math.min((page + 1) * ITEMS_PER_PAGE, total)}</span> of{' '}
                <span className="text-white font-medium">{total}</span> records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page indicators */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          pageNum === page
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
