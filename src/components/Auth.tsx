import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Landmark, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  type: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ type }) => {
  const { login, registerUser, setRoute, isLoading } = useApp();
  const [isLogin, setIsLogin] = useState(type === 'login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await registerUser(name, email, password);
    }
  };

  return (
    <div id="auth-panel" className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-academic-ivory px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        
        {/* Academic Card Header */}
        <div className="bg-academic-charcoal text-white text-center py-8 px-6 border-b-4 border-academic-gold relative">
          <div className="bg-academic-crimson text-white inline-flex p-3 rounded-lg shadow-inner mb-3 border border-academic-gold/50">
            <Landmark className="h-6 w-6 text-academic-gold" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white leading-tight">
            MERN UNIVERSITY
          </h2>
          <p className="text-xs text-academic-gold font-semibold uppercase tracking-widest mt-1">
            Online Admissions Portal
          </p>
        </div>

        {/* Card Body */}
        <div className="py-8 px-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              {isLogin ? 'Sign In to Your Account' : 'Register Applicant Account'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isLogin ? 'Access your application state or administrative dashboard' : 'Create an online applicant profile to register and apply'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (Signup only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Full Legal Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name exactly as on matric transcript"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-academic-crimson hover:bg-red-950 text-white font-semibold py-2 px-4 rounded-md text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md border border-academic-crimson hover:border-red-950 flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Processing...' : isLogin ? 'Authenticate credentials' : 'Register Applicant Profile'}</span>
                {!isLoading && <ArrowRight className="h-4 w-4 text-academic-gold" />}
              </button>
            </div>
          </form>

          {/* Verification Guard info for Registration */}
          {!isLogin && (
            <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-md flex items-start space-x-2.5 text-emerald-800 text-[11px] leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Security Guard:</strong> To maintain integrity, all online registrations default to <strong>Applicant</strong> role only. Academic staff accounts must be created and allocated strictly by the System Administrator.
              </span>
            </div>
          )}

          {/* Toggle panel view */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs">
            <span className="text-gray-500">
              {isLogin ? "Don't have an online admissions profile?" : 'Already registered your admissions profile?'}
            </span>{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                // Clear state
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-academic-crimson font-bold hover:underline ml-1 cursor-pointer"
            >
              {isLogin ? 'Create Profile' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
