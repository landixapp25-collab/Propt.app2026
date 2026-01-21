import { useState, FormEvent } from 'react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AuthFormProps {
  onAuth: () => void;
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        onAuth();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuth();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#365563' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-4">
            <Logo size={48} />
            <h1 className="text-4xl font-bold text-[#F8F9FA]">Propt</h1>
          </div>
          <p className="text-gray-300">UK Property Portfolio Management</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp
                ? 'Sign up to start managing your property portfolio'
                : 'Sign in to access your property portfolio'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B] outline-none transition-colors"
                  placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                  required
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B6B] text-[#F8F9FA] font-semibold rounded-lg hover:bg-[#FF5252] active:bg-[#E85555] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Loading...'
              ) : isSignUp ? (
                <>
                  <UserPlus size={20} />
                  Sign Up
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-300">
          <p>Start tracking your property investments today</p>
        </div>
      </div>
    </div>
  );
}
