import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login({ email, password });
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAndSubmitDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setIsSubmitting(true);
      await login({ email: demoEmail, password: demoPass });
      toast.success(`Logged in as ${demoEmail}`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Gradients & Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <img 
            src="/logo.jpg" 
            alt="FundsRoom Logo" 
            className="w-12 h-12 rounded-2xl object-cover border border-indigo-500/30 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform" 
          />
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              FundsRoom
            </span>
            <span className="block text-[11px] uppercase tracking-widest text-indigo-400 font-semibold -mt-1">
              ERP + CRM OPERATIONS
            </span>
          </div>
        </Link>
      </div>

      {/* Main Glass Login Card (Matching Screenshot) */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
          
          {/* Card Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-indigo-400" /> Sign In To Portal
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter credentials or choose a quick demo account below.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-700/80 rounded-xl leading-5 bg-slate-800/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs transition-colors"
                  placeholder="admin@fundsroom.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-700/80 rounded-xl leading-5 bg-slate-800/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-indigo-400/30 rounded-xl shadow-lg shadow-indigo-600/30 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In To Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Quick One-Click Demo Login Grid */}
          <div className="border-t border-slate-800/80 pt-5">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-semibold text-slate-300">Quick One-Click Demo Login</span>
              <span className="text-indigo-400 font-mono text-[11px] font-medium">Role@123</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillAndSubmitDemo('admin@fundsroom.com', 'Admin@123')}
                className="bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 p-2.5 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-xs text-indigo-400 group-hover:text-indigo-300">👑 Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@fundsroom.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillAndSubmitDemo('sales@fundsroom.com', 'Sales@123')}
                className="bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 p-2.5 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-xs text-emerald-400 group-hover:text-emerald-300">💼 Sales</div>
                <div className="text-[10px] text-slate-400 truncate">sales@fundsroom.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillAndSubmitDemo('warehouse@fundsroom.com', 'Warehouse@123')}
                className="bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 p-2.5 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-xs text-amber-400 group-hover:text-amber-300">📦 Warehouse</div>
                <div className="text-[10px] text-slate-400 truncate">warehouse@fundsroom.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillAndSubmitDemo('accounts@fundsroom.com', 'Accounts@123')}
                className="bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 p-2.5 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-xs text-violet-400 group-hover:text-violet-300">📑 Accounts</div>
                <div className="text-[10px] text-slate-400 truncate">accounts@fundsroom.com</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-1 border-t border-slate-800/60">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Return to Main Landing Page
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
