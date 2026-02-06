'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getIncomeSummary, getIncomeInsights } from '@/lib/api';
import { IncomeSummary, InsightsResponse } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  FileText,
  PieChart,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Target,
  Lightbulb,
  Brain,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  Sector,
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

// Custom Tooltip for Area Chart
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-gray-400 text-sm font-medium">{label}</span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-500 mt-1">Monthly Income</div>
      </div>
    );
  }
  return null;
};

// Active shape for Pie Chart (expands on hover)
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.3}
      />
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize={18} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#9CA3AF" fontSize={12}>
        {payload.name}
      </text>
    </g>
  );
};

// Custom Tooltip for Pie Chart - needs sourceData for total calculation
const CustomPieTooltip = ({ active, payload, sourceData }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = sourceData?.reduce((sum: number, item: any) => sum + item.value, 0) || data.value;
    const percentageValue = (data.value / total) * 100;
    const percentageDisplay = Math.round(percentageValue); // Round to match center display

    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl min-w-[180px]">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          ></div>
          <span className="text-white font-semibold">{data.name}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Amount</span>
            <span className="text-white font-bold">
              ${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Share</span>
            <span className="text-blue-400 font-medium">{percentageDisplay}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentageValue}%`,
              backgroundColor: data.payload.fill
            }}
          ></div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [insightsPeriod, setInsightsPeriod] = useState<'week' | 'month' | 'year'>('month');

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    loadSummary();
    loadInsights();
  }, []);

  useEffect(() => {
    loadInsights();
  }, [insightsPeriod]);

  const loadSummary = async () => {
    try {
      const data = await getIncomeSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await getIncomeInsights(insightsPeriod);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Get current month key - try multiple formats to match backend data
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Try different date formats that might be in the data
  const possibleCurrentKeys = [
    `${currentYear}-${String(currentMonth).padStart(2, '0')}`, // 2026-01
    `${currentYear}-${currentMonth}`, // 2026-1
    `${currentYear}/${String(currentMonth).padStart(2, '0')}`, // 2026/01
    `${currentYear}/${currentMonth}`, // 2026/1
  ];

  const previousMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const prevYear = previousMonthDate.getFullYear();
  const prevMonth = previousMonthDate.getMonth() + 1;

  const possiblePreviousKeys = [
    `${prevYear}-${String(prevMonth).padStart(2, '0')}`,
    `${prevYear}-${prevMonth}`,
    `${prevYear}/${String(prevMonth).padStart(2, '0')}`,
    `${prevYear}/${prevMonth}`,
  ];

  // Find matching key from byMonth data
  const findMonthAmount = (keys: string[], byMonth: Record<string, number> | undefined) => {
    if (!byMonth) return 0;
    for (const key of keys) {
      if (byMonth[key] !== undefined) return byMonth[key];
    }
    return 0;
  };

  const monthlyData = summary
    ? Object.entries(summary.byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, amount]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          fullMonth: month,
          amount,
        }))
    : [];

  const sourceData = summary
    ? Object.entries(summary.bySource).map(([name, value]) => ({ name, value }))
    : [];

  // Get actual current month and previous month amounts
  const currentMonthAmount = findMonthAmount(possibleCurrentKeys, summary?.byMonth);
  const previousMonthAmount = findMonthAmount(possiblePreviousKeys, summary?.byMonth);

  // Get the latest month with data (for display if current month is empty)
  const sortedMonths = Object.entries(summary?.byMonth || {})
    .sort(([a], [b]) => b.localeCompare(a)); // Sort descending
  const latestMonthKey = sortedMonths[0]?.[0];
  const latestMonthAmount = sortedMonths[0]?.[1] || 0;
  const secondLatestMonthAmount = sortedMonths[1]?.[1] || 0;

  // Format the latest month for display
  const formatMonthKey = (key: string) => {
    if (!key) return '';
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Decide what to show in the "This Month" card
  const showCurrentMonth = currentMonthAmount > 0;
  const displayMonthTitle = showCurrentMonth
    ? now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : latestMonthKey
      ? `${formatMonthKey(latestMonthKey)} (Latest)`
      : 'This Month';
  const displayMonthAmount = showCurrentMonth ? currentMonthAmount : latestMonthAmount;

  // Calculate month-over-month change (compare latest two months if current month is empty)
  const compareAmount1 = showCurrentMonth ? currentMonthAmount : latestMonthAmount;
  const compareAmount2 = showCurrentMonth ? previousMonthAmount : secondLatestMonthAmount;
  const monthlyChange = compareAmount2 > 0
    ? ((compareAmount1 - compareAmount2) / compareAmount2 * 100).toFixed(1)
    : compareAmount1 > 0 ? '100' : '0';
  const isPositiveChange = Number(monthlyChange) >= 0;

  // Get date range for display
  const getDateRangeText = () => {
    if (monthlyData.length === 0) return 'No data yet';
    if (monthlyData.length === 1) return monthlyData[0].month;
    return `${monthlyData[0].month} - ${monthlyData[monthlyData.length - 1].month}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-white">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-gray-400 mt-1">
              Here&apos;s an overview of your income
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Income"
                value={`$${(summary?.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                trend={isPositiveChange ? 'up' : 'down'}
                trendValue={`${isPositiveChange ? '+' : ''}${monthlyChange}%`}
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard
                title={displayMonthTitle}
                value={`$${displayMonthAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={Calendar}
                gradient="from-purple-500 to-pink-500"
              />
              <StatCard
                title="Total Records"
                value={summary?.recordCount?.toString() || '0'}
                icon={FileText}
                gradient="from-orange-500 to-red-500"
              />
              <StatCard
                title="Income Sources"
                value={Object.keys(summary?.bySource || {}).length.toString()}
                icon={PieChart}
                gradient="from-green-500 to-emerald-500"
              />
            </div>

            {/* Charts */}
            {monthlyData.length > 0 || sourceData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Income Chart */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Monthly Income</h3>
                      <p className="text-sm text-gray-400">{getDateRangeText()}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {isPositiveChange ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className={isPositiveChange ? 'text-green-400' : 'text-red-400'}>
                        {isPositiveChange ? '+' : ''}{monthlyChange}%
                      </span>
                    </div>
                  </div>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                        />
                        <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </div>

                {/* Income by Source Chart */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Income by Source</h3>
                      <p className="text-sm text-gray-400">Distribution breakdown</p>
                    </div>
                  </div>
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsPie>
                        <Pie
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                        >
                          {sourceData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip sourceData={sourceData} />} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                  {/* Legend */}
                  {sourceData.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                      {sourceData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-400">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyDashboard />
            )}

            {/* AI Insights Card */}
            {(summary?.recordCount || 0) > 0 && (
              <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                      <p className="text-sm text-gray-400">
                        {insights?.aiEnabled ? 'Powered by Groq AI' : 'Basic insights'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setInsightsPeriod(period)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                          insightsPeriod === period
                            ? 'bg-white/20 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {insightsLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-16 bg-white/10 rounded-xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-white/10 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ) : insights ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-300 leading-relaxed">{insights.insights.summary}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {insights.insights.trend === 'up' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                            +{insights.insights.trendPercentage}%
                          </span>
                        )}
                        {insights.insights.trend === 'down' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg">
                            <ArrowDownRight className="w-4 h-4" />
                            {insights.insights.trendPercentage}%
                          </span>
                        )}
                        {insights.insights.trend === 'stable' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg">
                            Stable
                          </span>
                        )}
                        {insights.insights.topSource && (
                          <span className="text-sm text-gray-400">
                            Top source: <span className="text-white">{insights.insights.topSource}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Highlights & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Highlights */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Highlights
                        </h4>
                        <div className="space-y-2">
                          {insights.insights.highlights.map((highlight, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {insights.insights.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Unable to load insights</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {(summary?.recordCount || 0) === 0 && (
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Welcome to IncomeTracker!
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Upload your first CSV file to start tracking your income from any platform.
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Upload className="w-5 h-5" />
                  Upload Your First CSV
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  gradient,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  gradient: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl animate-pulse">
            <div className="w-12 h-12 bg-white/10 rounded-xl mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-20 mb-2"></div>
            <div className="h-8 bg-white/10 rounded w-32"></div>
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl animate-pulse">
            <div className="h-6 bg-white/10 rounded w-32 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-24 mb-6"></div>
            <div className="h-64 bg-white/10 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
      <Target className="w-12 h-12 mb-4 opacity-50" />
      <p>No data yet</p>
      <p className="text-sm">Upload a CSV to get started</p>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <TrendingUp className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No income data yet</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Upload your CSV files from Patreon, Gumroad, Stripe, or any other platform to see your income analytics.
      </p>
      <Link
        href="/upload"
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
      >
        <Upload className="w-5 h-5" />
        Upload CSV
      </Link>
    </div>
  );
}
