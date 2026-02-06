'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { previewCsv, importCsv } from '@/lib/api';
import { CsvPreview, ColumnMapping } from '@/lib/types';
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  CloudUpload,
  Table2,
  Tag,
  Calendar,
  FileSpreadsheet,
  User,
  AlignLeft,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [mapping, setMapping] = useState<ColumnMapping>({
    amount: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const result = await previewCsv(selectedFile);
      setPreview(result.preview);
      setDetectedPlatform(result.detectedPlatform);

      if (result.suggestedMapping) {
        setMapping(result.suggestedMapping);
      }

      if (result.detectedPlatform) {
        setSourceName(result.detectedPlatform.charAt(0).toUpperCase() + result.detectedPlatform.slice(1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview file');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    const fileName = droppedFile?.name.toLowerCase() || '';
    if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
      handleFileSelect(droppedFile);
    } else {
      setError('Please upload a CSV or XLSX file');
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    if (!file || !sourceName || !mapping.amount || !mapping.date) {
      setError('Please fill in all required fields');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const result = await importCsv(file, sourceName, mapping);
      setSuccess(`Successfully imported ${result.imported} records. ${result.duplicatesSkipped} duplicates skipped.`);
      setFile(null);
      setPreview(null);
      setMapping({ amount: '', date: '' });
      setSourceName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setMapping({ amount: '', date: '' });
    setSourceName('');
    setError('');
    setSuccess(null);
    setDetectedPlatform(null);
  };

  const supportedPlatforms = ['Patreon', 'Gumroad', 'Stripe', 'PayPal', 'Custom'];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-white">Upload Data</h1>
          <p className="text-gray-400 mt-1">Import income data from CSV or Excel files</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl animate-fade-in-up">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {!preview ? (
          /* Upload Zone */
          <div className="space-y-6 animate-fade-in-up animation-delay-100">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                isDragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 hover:border-blue-500/50 bg-white/5 hover:bg-white/[0.07]'
              }`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isDragOver ? 'opacity-100' : ''}`} />

              <input
                type="file"
                accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer relative z-10">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-white font-medium">Processing file...</p>
                    <p className="text-sm text-gray-400 mt-1">Analyzing your CSV/Excel file</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                      isDragOver
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-110'
                        : 'bg-white/10 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600'
                    }`}>
                      <CloudUpload className={`w-8 h-8 transition-colors ${isDragOver ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    </div>
                    <p className="text-lg font-medium text-white mb-1">
                      {isDragOver ? 'Drop your file here' : 'Drop your CSV or Excel file here, or click to browse'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports CSV and XLSX from Patreon, Gumroad, Stripe, PayPal, or any custom format
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Supported Platforms */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-medium text-white">Supported Platforms</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {supportedPlatforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300"
                  >
                    {platform}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                We auto-detect popular platforms and suggest column mappings automatically
              </p>
            </div>
          </div>
        ) : (
          /* Column Mapping */
          <div className="space-y-6 animate-fade-in-up animation-delay-100">
            {/* File Info Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{file?.name}</p>
                    <p className="text-sm text-gray-400">{preview.totalRows} rows detected</p>
                  </div>
                </div>
                {detectedPlatform && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Detected: {detectedPlatform}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mapping Form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Table2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Column Mapping</h3>
              </div>
              <p className="text-sm text-gray-400 -mt-4">
                Map your CSV columns to the required fields
              </p>

              {/* Source Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4" />
                  Source Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., Patreon, Freelance, Consulting"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Column Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <span className="text-green-400">$</span>
                    Amount Column <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={mapping.amount}
                    onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="bg-gray-900">Select column</option>
                    {preview.headers.map((header) => (
                      <option key={header} value={header} className="bg-gray-900">{header}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date Column <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={mapping.date}
                    onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="bg-gray-900">Select column</option>
                    {preview.headers.map((header) => (
                      <option key={header} value={header} className="bg-gray-900">{header}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <AlignLeft className="w-4 h-4" />
                    Description Column
                  </label>
                  <select
                    value={mapping.description || ''}
                    onChange={(e) => setMapping({ ...mapping, description: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="bg-gray-900">None (Optional)</option>
                    {preview.headers.map((header) => (
                      <option key={header} value={header} className="bg-gray-900">{header}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    Customer/Client Column
                  </label>
                  <select
                    value={mapping.customer || ''}
                    onChange={(e) => setMapping({ ...mapping, customer: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="bg-gray-900">None (Optional)</option>
                    {preview.headers.map((header) => (
                      <option key={header} value={header} className="bg-gray-900">{header}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">Data Preview</h3>
                <span className="text-sm text-gray-400 ml-2">First {preview.rows.length} rows</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-white/5">
                      {preview.headers.map((header) => (
                        <th
                          key={header}
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            header === mapping.amount
                              ? 'text-green-400 bg-green-500/10'
                              : header === mapping.date
                                ? 'text-blue-400 bg-blue-500/10'
                                : header === mapping.description
                                  ? 'text-purple-400 bg-purple-500/10'
                                  : header === mapping.customer
                                    ? 'text-orange-400 bg-orange-500/10'
                                    : 'text-gray-400'
                          }`}
                        >
                          {header}
                          {header === mapping.amount && <span className="ml-1 normal-case">(Amount)</span>}
                          {header === mapping.date && <span className="ml-1 normal-case">(Date)</span>}
                          {header === mapping.description && <span className="ml-1 normal-case">(Desc)</span>}
                          {header === mapping.customer && <span className="ml-1 normal-case">(Customer)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        {preview.headers.map((header) => (
                          <td
                            key={header}
                            className={`px-4 py-3 text-sm whitespace-nowrap ${
                              header === mapping.amount
                                ? 'text-green-400 font-medium'
                                : header === mapping.date
                                  ? 'text-blue-400'
                                  : 'text-gray-300'
                            }`}
                          >
                            {row[header] || <span className="text-gray-600">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !sourceName || !mapping.amount || !mapping.date}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {preview.totalRows} Records
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
