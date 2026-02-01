import Groq from 'groq-sdk';
import { env } from '../config/env';

// Initialize Groq client
const groq = new Groq({
  apiKey: env.groqApiKey,
});

// Category options for transactions
const CATEGORIES = [
  'Subscription',
  'Freelance',
  'Consulting',
  'Product Sales',
  'Affiliate',
  'Sponsorship',
  'Donations',
  'Refund',
  'Other',
] as const;

export type TransactionCategory = (typeof CATEGORIES)[number];

interface TransactionForCategorization {
  description: string;
  amount: number;
  source?: string;
}

interface CategorizedTransaction {
  description: string;
  category: TransactionCategory;
  confidence: number;
}

interface IncomeInsight {
  summary: string;
  highlights: string[];
  recommendations: string[];
  topSource: string | null;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface IncomeDataForInsights {
  totalIncome: number;
  previousPeriodIncome: number;
  transactionCount: number;
  sourceBreakdown: { source: string; amount: number; count: number }[];
  recentTransactions: { description: string; amount: number; date: string; source: string }[];
  period: string;
}

class GroqService {
  private model = 'llama-3.1-8b-instant'; // Fast and capable model

  // Smart Categorization - Categorize multiple transactions at once
  async categorizeTransactions(
    transactions: TransactionForCategorization[]
  ): Promise<CategorizedTransaction[]> {
    if (!env.groqApiKey) {
      // Return default category if no API key
      return transactions.map((t) => ({
        description: t.description,
        category: 'Other' as TransactionCategory,
        confidence: 0,
      }));
    }

    try {
      const prompt = `You are a financial transaction categorizer. Categorize each transaction into exactly ONE of these categories:
${CATEGORIES.join(', ')}

Transactions to categorize:
${transactions.map((t, i) => `${i + 1}. "${t.description}" - $${t.amount}${t.source ? ` (from ${t.source})` : ''}`).join('\n')}

Respond ONLY with a JSON array in this exact format, no other text:
[{"index": 1, "category": "Category", "confidence": 0.95}, ...]

The confidence should be between 0 and 1.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.1, // Low temperature for consistent categorization
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '[]';

      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const results = JSON.parse(jsonMatch[0]) as { index: number; category: string; confidence: number }[];

      return transactions.map((t, i) => {
        const result = results.find((r) => r.index === i + 1);
        return {
          description: t.description,
          category: (CATEGORIES.includes(result?.category as TransactionCategory)
            ? result?.category
            : 'Other') as TransactionCategory,
          confidence: result?.confidence || 0,
        };
      });
    } catch (error) {
      console.error('Groq categorization error:', error);
      // Fallback to 'Other' category on error
      return transactions.map((t) => ({
        description: t.description,
        category: 'Other' as TransactionCategory,
        confidence: 0,
      }));
    }
  }

  // Generate Income Insights
  async generateInsights(data: IncomeDataForInsights): Promise<IncomeInsight> {
    if (!env.groqApiKey) {
      return this.getDefaultInsights(data);
    }

    try {
      const prompt = `You are a financial analyst providing insights for a freelancer/creator's income tracker.

Income Data for ${data.period}:
- Total Income: $${data.totalIncome.toFixed(2)}
- Previous Period Income: $${data.previousPeriodIncome.toFixed(2)}
- Number of Transactions: ${data.transactionCount}

Income by Source:
${data.sourceBreakdown.map((s) => `- ${s.source}: $${s.amount.toFixed(2)} (${s.count} transactions)`).join('\n')}

Recent Transactions:
${data.recentTransactions.slice(0, 5).map((t) => `- ${t.date}: $${t.amount} from ${t.source} - "${t.description}"`).join('\n')}

Provide insights in this exact JSON format, no other text:
{
  "summary": "A 2-3 sentence summary of the income situation",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "topSource": "name of top income source or null",
  "trend": "up" or "down" or "stable",
  "trendPercentage": number (percentage change from previous period)
}

Be encouraging but realistic. Focus on actionable insights.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '{}';

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const insights = JSON.parse(jsonMatch[0]) as IncomeInsight;

      // Validate and sanitize response
      return {
        summary: insights.summary || 'Unable to generate summary',
        highlights: Array.isArray(insights.highlights) ? insights.highlights.slice(0, 3) : [],
        recommendations: Array.isArray(insights.recommendations) ? insights.recommendations.slice(0, 2) : [],
        topSource: insights.topSource || null,
        trend: ['up', 'down', 'stable'].includes(insights.trend) ? insights.trend : 'stable',
        trendPercentage: typeof insights.trendPercentage === 'number' ? insights.trendPercentage : 0,
      };
    } catch (error) {
      console.error('Groq insights error:', error);
      return this.getDefaultInsights(data);
    }
  }

  // Fallback insights when AI is unavailable
  private getDefaultInsights(data: IncomeDataForInsights): IncomeInsight {
    const change = data.previousPeriodIncome > 0
      ? ((data.totalIncome - data.previousPeriodIncome) / data.previousPeriodIncome) * 100
      : 0;

    const trend: 'up' | 'down' | 'stable' = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
    const topSource = data.sourceBreakdown.length > 0
      ? data.sourceBreakdown.reduce((a, b) => (a.amount > b.amount ? a : b)).source
      : null;

    return {
      summary: `You earned $${data.totalIncome.toFixed(2)} from ${data.transactionCount} transactions this period.`,
      highlights: [
        `Total income: $${data.totalIncome.toFixed(2)}`,
        topSource ? `Top source: ${topSource}` : 'Start tracking income sources',
        `${data.transactionCount} transactions recorded`,
      ],
      recommendations: [
        'Keep tracking all income sources for better insights',
        'AI-powered insights available when API key is configured',
      ],
      topSource,
      trend,
      trendPercentage: Math.round(change),
    };
  }

  // Check if Groq is configured
  isConfigured(): boolean {
    return !!env.groqApiKey;
  }
}

export const groqService = new GroqService();
