import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { LoginRequest, LoginResponse, ApiErrorResponse } from '../../types/auth';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestBody: LoginRequest = { email, password };
      
      const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store user session (in a real app, you'd use secure storage)
      localStorage.setItem('mockme_user', JSON.stringify(data.user));
      localStorage.setItem('mockme_token', data.tokens.accessToken);
      
      console.log('Login successful:', data);
      
      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 font-sans antialiased relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 transform transition-all duration-500 hover:scale-105">
        <Link href="/" legacyBehavior>
          <a className="flex items-center text-teal-400 hover:text-sky-400 transition-colors duration-200 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </a>
        </Link>
        
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400">
            Sign in to continue your interview preparation.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-800/70 backdrop-blur border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 rounded-xl shadow-2xl text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-teal-500/25 cursor-pointer text-center ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>
        
        <p className="text-sm text-center text-gray-400">Dont have an account?{' '}
          <Link href="/signup" legacyBehavior>
            <a className="text-teal-400 hover:underline hover:text-sky-400 transition-colors duration-200 font-semibold">
              Sign Up
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;