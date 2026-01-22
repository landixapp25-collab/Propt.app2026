import { useState, FormEvent, useMemo } from 'react';
import { Mail, Lock, LogIn, UserPlus, CheckCircle2, XCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AuthFormProps {
  onAuth: () => void;
  mode?: 'login' | 'signup';
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export default function AuthForm({ onAuth, mode = 'login' }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const passwordRequirements = useMemo((): PasswordRequirements => {
    return {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(req => req === true);
  }, [passwordRequirements]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
      });

      if (error) throw error;
      setResendMessage('Verification email sent! Check your inbox.');
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResendMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!isPasswordValid) {
          setError('Password must meet all requirements above');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        setSignupEmail(email);
        setShowSuccess(true);
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
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Password must contain:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {passwordRequirements.minLength ? (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordRequirements.hasUppercase ? (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                        One uppercase letter (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordRequirements.hasLowercase ? (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                        One lowercase letter (a-z)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordRequirements.hasNumber ? (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                        One number (0-9)
                      </span>
                    </div>
                  </div>
                </div>
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

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
            <button
              onClick={() => {
                setShowSuccess(false);
                setEmail('');
                setPassword('');
                setIsSignUp(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] rounded-full flex items-center justify-center mb-4">
                <Mail size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email!</h3>

              <p className="text-gray-600 mb-4">
                We've sent a verification link to
              </p>

              <p className="text-[#4ECDC4] font-semibold mb-4 break-all px-2">
                {signupEmail}
              </p>

              <p className="text-gray-600 mb-6">
                Click the link in the email to activate your account. Don't forget to check your spam folder!
              </p>

              {resendMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  resendMessage.includes('sent')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}

              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full px-4 py-2 border-2 border-[#4ECDC4] text-[#4ECDC4] font-semibold rounded-lg hover:bg-[#4ECDC4] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={() => {
                  setShowSuccess(false);
                  setEmail('');
                  setPassword('');
                  setIsSignUp(false);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
