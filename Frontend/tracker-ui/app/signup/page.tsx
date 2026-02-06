'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, User, CheckCircle2, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Too short', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Weak', color: 'bg-orange-500' };
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    }
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { strength: 4, label: 'Strong', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Weak', color: 'bg-orange-500' };
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Background gradient effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center animate-fade-in-up">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-gray-400 mb-6">
                We&apos;ve sent a confirmation link to <span className="text-white font-medium">{email}</span>. Please check your email to verify your account.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back to home */}
      <div className="relative z-10 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in-up">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold">IncomeTracker</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-gray-400">Start tracking your income in minutes</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-fade-in-up animation-delay-100">
            {/* Benefits badge */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 justify-center">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Free forever • No credit card required</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                  {error}
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.strength ? passwordStrength.color : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.strength >= 3 ? 'text-green-400' : passwordStrength.strength >= 2 ? 'text-orange-400' : 'text-red-400'}`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Sign in instead
            </Link>
          </div>

          {/* Footer text */}
          <p className="text-center text-gray-500 text-sm mt-6 animate-fade-in-up animation-delay-200">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
