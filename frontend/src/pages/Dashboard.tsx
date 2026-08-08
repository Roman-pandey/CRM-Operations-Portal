import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import {
  canAccessCustomers,
  canAccessProducts,
  canAccessChallans,
  canViewStockMovements
} from '../utils/permissions';
import { DashboardStats } from '../types';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
        console.error('Dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user.name}</h1>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-slate-400">Role:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {canAccessCustomers(user.role) && (
          <StatsCard
            icon={<Users className="h-6 w-6" />}
            label="Total Customers"
            value={stats.totalCustomers}
            color="indigo"
          />
        )}
        {canAccessProducts(user.role) && (
          <StatsCard
            icon={<Package className="h-6 w-6" />}
            label="Total Products"
            value={stats.totalProducts}
            color="violet"
          />
        )}
        {canAccessProducts(user.role) && (
          <StatsCard
            icon={<AlertTriangle className="h-6 w-6" />}
            label="Low Stock Alerts"
            value={stats.lowStockCount}
            color="orange"
          />
        )}
        {canAccessChallans(user.role) && (
          <StatsCard
            icon={<FileText className="h-6 w-6" />}
            label="Total Challans"
            value={stats.totalChallans}
            color="emerald"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canAccessChallans(user.role) && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Recent Challans</h2>
              <Link to="/challans" className="text-sm text-indigo-400 hover:text-indigo-300">
                View all
              </Link>
            </div>
            {stats.recentChallans && stats.recentChallans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left divide-y divide-white/5">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Challan #</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.recentChallans.map((challan: any) => (
                      <tr key={challan.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{challan.challanNumber}</td>
                        <td className="px-4 py-3 text-slate-300">{challan.customer?.customerName || '-'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={challan.status} type="challan" />
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(challan.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4 text-center">No recent challans found.</p>
            )}
          </div>
        )}

        {canAccessProducts(user.role) && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Low Stock Products</h2>
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div>
                      <p className="font-medium text-white">{product.productName}</p>
                      <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-400">
                        {product.currentStock} left
                      </p>
                      <p className="text-xs text-slate-500">
                        Min: {product.minimumStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4 text-center">No low stock items currently.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
