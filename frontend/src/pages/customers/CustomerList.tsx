'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { canModifyCustomers } from '../../utils/permissions';
import { SearchBar } from '../../components/SearchBar';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const CustomerList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canModify = canModifyCustomers(user?.role);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter,
        customerType: typeFilter,
      });
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter, typeFilter]);

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await customerApi.delete(customerToDelete);
      toast.success('Customer deleted successfully');
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const confirmDelete = (id: number) => {
    setCustomerToDelete(id);
    setDeleteModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Customers</h1>
        {canModify && (
          <button
            onClick={() => navigate('/customers/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar 
              value={search} 
              onChange={(val: string) => {
                setSearch(val);
                setPage(1);
              }} 
              placeholder="Search by customer name, business, mobile or email..." 
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="RETAIL">RETAIL</option>
              <option value="WHOLESALE">WHOLESALE</option>
              <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12 text-slate-500" />}
            title="No customers found"
            description="Adjust your filters or add a new customer."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse divide-y divide-white/5">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400">Customer Name</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400">Business Name</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400">Mobile</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400">Type</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400">Follow-up Date</th>
                    <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-100">{c.customerName}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{c.businessName || '-'}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{c.mobile}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700">
                          {c.customerType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        <StatusBadge status={c.status} type="customer" />
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">{formatDate(c.followUpDate)}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/customers/${c.id}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          {canModify && (
                            <>
                              <button
                                onClick={() => navigate(`/customers/${c.id}/edit`)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(c.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <Pagination 
                page={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={setPage} 
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        variant="danger"
      />
    </div>
  );
};

// Also export as default if needed
export default CustomerList;

// Stub for Users icon if not imported
import { Users } from 'lucide-react';
