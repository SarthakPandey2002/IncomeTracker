'use client';

import { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'pro' | 'business';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function WaitlistModal({ isOpen, onClose, plan }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    onClose();
  };

  const planDetails = {
    pro: { name: 'Pro', price: '$9/month', color: 'from-blue-600 to-purple-600' },
    business: { name: 'Business', price: '$29/month', color: 'from-purple-600 to-pink-600' },
  };

  const details = planDetails[plan];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
            <p className="text-gray-400 mb-6">
              We&apos;ll email you at <span className="text-white">{email}</span> when {details.name} launches.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 bg-gradient-to-br ${details.color} rounded-xl flex items-center justify-center`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Join {details.name} Waitlist</h3>
                <p className="text-gray-400 text-sm">{details.price} - Coming Soon</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Be the first to know when we launch {details.name}. Get early access and exclusive pricing.
            </p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r ${details.color} text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>

              <p className="text-gray-500 text-xs text-center mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
