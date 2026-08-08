import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  FileText, 
  ArrowRight, 
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans relative flex flex-col justify-between">
      
      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 left-1/3 w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[140px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Floating Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
        <nav className="max-w-7xl mx-auto rounded-full bg-slate-900/40 backdrop-blur-md border border-slate-800/40 py-3.5 px-6 flex items-center justify-between shadow-xl">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.jpg" 
              alt="FundsRoom Logo" 
              className="w-9 h-9 rounded-xl object-cover border border-indigo-500/30 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                FundsRoom
              </span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold -mt-1">
                ERP + CRM
              </span>
            </div>
          </Link>

          {/* Action CTA Buttons in Navbar */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard ({user?.role}) <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 border border-indigo-400/30 hover:scale-[1.02] cursor-pointer"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Hero Content Area */}
      <main className="relative pt-6 pb-16 px-4 sm:px-6 z-10 flex-1 space-y-14 max-w-7xl mx-auto w-full">
        
        {/* Hero Headline & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>MODERN ERP + CRM OPERATIONS WORKSPACE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Run Your Business Operations From{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent inline-block">
              One Powerful Workspace.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Manage customers, inventory, stock movements and sales challans through a centralized ERP & CRM platform built for modern operations teams.
          </p>

          <div className="flex justify-center pt-2">
            <button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="px-8 py-4 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-indigo-400/30 group cursor-pointer"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Micro Trust Stats */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center border-t border-slate-800/60">
            <div className="p-2">
              <div className="text-xl font-bold text-white">4 Roles</div>
              <div className="text-xs text-slate-400 font-medium">Granular RBAC Access</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-bold text-indigo-400">100% Atomic</div>
              <div className="text-xs text-slate-400 font-medium">Row-Locked Transactions</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-bold text-cyan-400">Real-Time</div>
              <div className="text-xs text-slate-400 font-medium">Stock Audit Movement</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-bold text-emerald-400">Tax Invoice</div>
              <div className="text-xs text-slate-400 font-medium">A4 Printable Generator</div>
            </div>
          </div>
        </div>

        {/* Enlarged High-Resolution Dashboard Preview Panel */}
        <div className="pt-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000" />
            
            <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-700/70 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6">
              
              {/* Simulated Browser Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline-block bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
                    https://fundsroom-portal.com/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Role: ADMIN
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                    R
                  </div>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Total Customers</p>
                    <p className="text-3xl font-extrabold text-white mt-1">128</p>
                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> +12% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Total Products</p>
                    <p className="text-3xl font-extrabold text-white mt-1">45</p>
                    <p className="text-xs text-slate-400 mt-1">42 Available In Stock</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-amber-500/40 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Low Stock Alerts</p>
                    <p className="text-3xl font-extrabold text-amber-400 mt-1">3 Items</p>
                    <p className="text-xs text-amber-400/90 mt-1 font-medium">Requires Restock</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Sales Challans</p>
                    <p className="text-3xl font-extrabold text-white mt-1">84</p>
                    <p className="text-xs text-emerald-400 mt-1 font-medium">62 Confirmed Orders</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Sales Challans Table (7 Columns) */}
                <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" /> Recent Sales Challans
                    </h3>
                    <span className="text-xs text-indigo-400 font-semibold cursor-pointer" onClick={() => navigate('/login')}>View All →</span>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Challan #</th>
                          <th className="py-2.5 px-3">Customer Name</th>
                          <th className="py-2.5 px-3">Qty</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        <tr>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-300">CH-2026-0084</td>
                          <td className="py-3 px-3 font-medium text-white">Sharma Wholesale Traders</td>
                          <td className="py-3 px-3 text-slate-300">12</td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              CONFIRMED
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400 hover:text-white cursor-pointer"><ArrowUpRight className="w-4 h-4 inline" /></span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-300">CH-2026-0085</td>
                          <td className="py-3 px-3 font-medium text-white">Apex Retail Enterprises</td>
                          <td className="py-3 px-3 text-slate-300">5</td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              DRAFT
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400 hover:text-white cursor-pointer"><ArrowUpRight className="w-4 h-4 inline" /></span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-300">CH-2026-0083</td>
                          <td className="py-3 px-3 font-medium text-white">Global Distribution Hub</td>
                          <td className="py-3 px-3 text-slate-300">24</td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              CONFIRMED
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-slate-400 hover:text-white cursor-pointer"><ArrowUpRight className="w-4 h-4 inline" /></span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Alert List (5 Columns) */}
                <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Restock Alerts
                    </h3>
                    <span className="text-xs text-amber-400 font-semibold">3 Items</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">APC Back-UPS 1100VA</span>
                        <span className="text-amber-400 font-mono font-bold">4 / 5 Min</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[80%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Logitech MX Master 3S</span>
                        <span className="text-amber-400 font-mono font-bold">2 / 10 Min</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[20%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Samsung 980 PRO 1TB NVMe</span>
                        <span className="text-amber-400 font-mono font-bold">3 / 8 Min</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[37.5%]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-slate-950 border-t border-slate-900/80 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="FundsRoom Logo" 
              className="w-7 h-7 rounded-lg object-cover border border-indigo-500/30 shadow-md" 
            />
            <div>
              <p className="font-bold text-white text-xs">FundsRoom ERP + CRM</p>
              <p className="text-slate-500 text-[10px]">Operations Workspace</p>
            </div>
          </div>

          <div className="text-center sm:text-right text-slate-500">
            <p>© 2026 FundsRoom. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
