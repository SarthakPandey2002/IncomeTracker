'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  TrendingUp,
  Upload,
  PieChart,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users,
  Briefcase,
  Palette,
  Code,
  DollarSign,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  Globe,
  Menu,
  X,
  Github,
  Twitter,
  Mail,
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float animation-delay-200" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-xl z-50 border-b border-white/10" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">IncomeTracker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                FAQ
              </button>
              <Link href="/login" className="text-gray-400 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-gray-300 hover:text-white font-medium py-2 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left text-gray-300 hover:text-white font-medium py-2 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left text-gray-300 hover:text-white font-medium py-2 transition-colors"
            >
              FAQ
            </button>
            <hr className="border-white/10" />
            <Link
              href="/login"
              className="block text-gray-300 hover:text-white font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full text-center bg-white text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            Track income from any source with CSV uploads
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up animation-delay-100">
            All Your Income
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              One Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            Upload CSVs from Patreon, Gumroad, Stripe, freelance invoices, or any source.
            Get beautiful charts, trends, and insights in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-12 border-t border-white/10">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Any CSV</div>
              <div className="text-gray-500 mt-1">Format Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Instant</div>
              <div className="text-gray-500 mt-1">Analytics</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">100%</div>
              <div className="text-gray-500 mt-1">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                track income
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple yet powerful tools to understand your earnings from every source
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Upload}
              title="Upload Any CSV"
              description="Drag & drop CSVs from any platform. Our smart parser auto-detects columns for Patreon, Gumroad, Stripe, and more."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={FileSpreadsheet}
              title="Custom Column Mapping"
              description="Got a custom CSV? No problem. Map your columns to our fields in seconds with our intuitive interface."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={PieChart}
              title="Visual Analytics"
              description="Beautiful charts showing income by source, monthly trends, and growth patterns at a glance."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Monthly Trends"
              description="Track how your income grows month over month. Spot patterns and plan for the future."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your financial data is encrypted and never shared. You own your data, always."
              gradient="from-indigo-500 to-blue-500"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Import"
              description="Import thousands of records in seconds. Duplicate detection ensures clean data every time."
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start tracking in{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Upload Your CSV"
              description="Export your earnings from any platform and upload the CSV file"
              gradient="from-blue-500 to-purple-500"
            />
            <StepCard
              number="2"
              title="Map Your Columns"
              description="Tell us which column is amount, date, and optionally description"
              gradient="from-purple-500 to-pink-500"
            />
            <StepCard
              number="3"
              title="See Your Dashboard"
              description="Instantly see beautiful charts and insights about your income"
              gradient="from-pink-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Supported Platforms Section */}
      <section className="relative py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Works with{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                any platform
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Export your earnings CSV from these platforms and import in seconds
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <PlatformCard name="Patreon" icon={Users} color="from-orange-500 to-red-500" />
            <PlatformCard name="Gumroad" icon={ShoppingBag} color="from-pink-500 to-rose-500" />
            <PlatformCard name="Stripe" icon={CreditCard} color="from-purple-500 to-indigo-500" />
            <PlatformCard name="PayPal" icon={DollarSign} color="from-blue-500 to-cyan-500" />
            <PlatformCard name="Shopify" icon={ShoppingBag} color="from-green-500 to-emerald-500" />
            <PlatformCard name="Custom CSV" icon={FileSpreadsheet} color="from-gray-500 to-gray-600" />
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Don&apos;t see your platform? No problem! Our smart mapper works with any CSV format.
          </p>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                modern earners
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Whether you have one income stream or twenty, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UseCaseCard
              icon={Palette}
              title="Content Creators"
              items={['YouTube AdSense', 'Patreon memberships', 'Sponsorship deals', 'Merch sales']}
              gradient="from-pink-500 to-rose-500"
            />
            <UseCaseCard
              icon={Code}
              title="Developers"
              items={['Freelance projects', 'SaaS revenue', 'Open source sponsors', 'Consulting fees']}
              gradient="from-blue-500 to-cyan-500"
            />
            <UseCaseCard
              icon={Briefcase}
              title="Freelancers"
              items={['Client invoices', 'Retainer payments', 'Project milestones', 'Hourly billing']}
              gradient="from-purple-500 to-indigo-500"
            />
            <UseCaseCard
              icon={Globe}
              title="Digital Nomads"
              items={['Multiple clients', 'Various currencies', 'Platform earnings', 'Passive income']}
              gradient="from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your finances,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                beautifully visualized
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get instant insights with interactive charts and detailed breakdowns
            </p>
          </div>

          {/* Mock Dashboard */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                  <div>
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-white/5 rounded-lg" />
                  <div className="h-8 w-8 bg-white/5 rounded-lg" />
                </div>
              </div>

              {/* Mock Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MockStatCard label="Total Revenue" value="$12,847" change="+12.5%" positive />
                <MockStatCard label="This Month" value="$3,241" change="+8.2%" positive />
                <MockStatCard label="Transactions" value="156" change="+23" positive />
                <MockStatCard label="Avg. per Sale" value="$82.35" change="-2.1%" positive={false} />
              </div>

              {/* Mock Charts Row */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Bar Chart */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white">Monthly Revenue</span>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">+18.2%</span>
                  </div>
                  <div className="flex items-end justify-between gap-1 h-28">
                    {[
                      { month: 'Jul', value: 40 },
                      { month: 'Aug', value: 65 },
                      { month: 'Sep', value: 45 },
                      { month: 'Oct', value: 80 },
                      { month: 'Nov', value: 55 },
                      { month: 'Dec', value: 95 },
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 mb-1">${item.value * 32}</span>
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t hover:from-blue-500 hover:to-purple-400 transition-colors cursor-pointer"
                            style={{ height: `${item.value}px` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white">Income by Source</span>
                    <span className="text-xs text-gray-400">This Year</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Donut Chart SVG */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="40 60" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-40" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-65" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-85" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">$12.8k</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-gray-400">Patreon</span>
                        <span className="text-white ml-auto">40%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-gray-400">Gumroad</span>
                        <span className="text-white ml-auto">25%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500" />
                        <span className="text-gray-400">Stripe</span>
                        <span className="text-white ml-auto">20%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-400">Other</span>
                        <span className="text-white ml-auto">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Table */}
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 border-b border-white/5 text-xs text-gray-400">
                  <div>Source</div>
                  <div>Date</div>
                  <div>Description</div>
                  <div className="text-right">Amount</div>
                </div>
                {[
                  { source: 'Patreon', date: 'Jan 15', desc: 'Monthly membership', amount: '$249.00' },
                  { source: 'Gumroad', date: 'Jan 14', desc: 'Course sale', amount: '$97.00' },
                  { source: 'Stripe', date: 'Jan 12', desc: 'Consulting fee', amount: '$500.00' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-3 border-b border-white/5 text-sm">
                    <div className="text-white">{row.source}</div>
                    <div className="text-gray-400">{row.date}</div>
                    <div className="text-gray-400">{row.desc}</div>
                    <div className="text-right text-green-400">{row.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently asked{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="What CSV formats do you support?"
              answer="We support any CSV file! Our smart parser auto-detects columns from popular platforms like Patreon, Gumroad, Stripe, and PayPal. For custom CSVs, simply map your columns to our fields - it takes seconds."
            />
            <FAQItem
              question="Is my financial data secure?"
              answer="Absolutely. We use industry-standard encryption for all data in transit and at rest. Your data is stored securely and is never shared with third parties. You own your data, always."
            />
            <FAQItem
              question="Can I track income in different currencies?"
              answer="Yes! You can import transactions in any currency. We store the original currency with each record so you always have accurate data."
            />
            <FAQItem
              question="How do you handle duplicate transactions?"
              answer="Our smart import system automatically detects duplicates based on date, amount, and description. You'll never accidentally import the same transaction twice."
            />
            <FAQItem
              question="Is IncomeTracker really free?"
              answer="Yes, IncomeTracker is completely free to use! We believe everyone should have access to great financial tracking tools. Premium features may be added in the future, but the core functionality will always be free."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to take control of your income?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join creators and freelancers who track their earnings with IncomeTracker
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-110 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5 text-white" />
      </button>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">IncomeTracker</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-sm">
                The simplest way to track all your income sources in one place. Upload CSVs, get insights, grow your earnings.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="mailto:hello@incometracker.com"
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Account</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-400 hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} IncomeTracker. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm">
              Made with <span className="text-red-500">♥</span> for creators & freelancers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all hover:border-white/20">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  gradient,
}: {
  number: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="text-center group">
      <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function PlatformCard({
  name,
  icon: Icon,
  color,
}: {
  name: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:border-white/20 cursor-default">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-300">{name}</span>
      </div>
    </div>
  );
}

function UseCaseCard({
  icon: Icon,
  title,
  items,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  gradient: string;
}) {
  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-white/20">
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MockStatCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className={`text-xs mt-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-48 pb-5' : 'max-h-0'
        }`}
      >
        <p className="px-5 text-gray-400">{answer}</p>
      </div>
    </div>
  );
}
