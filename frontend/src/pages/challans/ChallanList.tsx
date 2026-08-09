import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { challanApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { canCreateChallans } from '../../utils/permissions';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { Challan } from '../../types';

const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric'
});

export const ChallanList = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canCreate = canCreateChallans(user?.role);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const response = await challanApi.getAll({ page, limit: 10, search, status });
      setChallans(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      toast.error('Failed to fetch challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Sales Challans</h1>
        {canCreate && (
          <Link
            to="/challans/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all"
          >
            <Plus size={20} />
            <span>Create Challan</span>
          </Link>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar 
              value={search} 
              onChange={(val: string) => {
                setSearch(val);
                setPage(1);
              }} 
              placeholder="Search by challan number..." 
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="" className="bg-slate-900">All Statuses</option>
              <option value="DRAFT" className="bg-slate-900">Draft</option>
              <option value="CONFIRMED" className="bg-slate-900">Confirmed</option>
              <option value="CANCELLED" className="bg-slate-900">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : challans.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} className="text-slate-500" />}
            title="No challans found"
            description="No sales challans match your search criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-white/5">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400">
                    <th className="px-4 py-3 font-medium">Challan No.</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Total Qty</th>
                    <th className="px-4 py-3 font-medium">Created By</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {challans.map((challan) => (
                    <tr key={challan.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-white">{challan.challanNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{challan.customer?.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{formatDate(challan.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{challan.totalQuantity} items</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{challan.createdBy?.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge type="challan" status={challan.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/challans/${challan.id}`}
                          className="inline-flex p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChallanList;
