import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Shield, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  canAccessCustomers, 
  canAccessProducts, 
  canViewStockMovements, 
  canAccessChallans, 
  canManageUsers 
} from '../utils/permissions';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', show: true },
    { to: '/customers', icon: <Users className="w-5 h-5" />, label: 'Customers', show: canAccessCustomers(user?.role) },
    { to: '/products', icon: <Package className="w-5 h-5" />, label: 'Products', show: canAccessProducts(user?.role) },
    { to: '/stock-movements', icon: <ArrowLeftRight className="w-5 h-5" />, label: 'Stock Movements', show: canViewStockMovements(user?.role) },
    { to: '/challans', icon: <FileText className="w-5 h-5" />, label: 'Challans', show: canAccessChallans(user?.role) },
    { to: '/users', icon: <Shield className="w-5 h-5" />, label: 'User Management', show: canManageUsers(user?.role) },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/logo.jpg" alt="FundsRoom Logo" className="w-7 h-7 rounded-lg object-cover border border-indigo-500/30 shadow-sm" />
              <span className="text-lg font-bold text-slate-100">FundsRoom ERP</span>
            </Link>
            <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  {user?.name.charAt(0)}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800">
          <button 
            className="text-slate-400 hover:text-slate-200"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="FundsRoom Logo" className="w-6 h-6 rounded-md object-cover border border-indigo-500/30" />
            <span className="text-lg font-bold text-slate-100">FundsRoom</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user?.name.charAt(0)}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
