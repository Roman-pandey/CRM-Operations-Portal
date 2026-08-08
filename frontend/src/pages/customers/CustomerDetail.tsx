'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Calendar, Clock, MapPin, Briefcase, Phone, Mail, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { canModifyCustomers } from '../../utils/permissions';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canModify = canModifyCustomers(user?.role);

  const [customer, setCustomer] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Follow-up modal state
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [newFollowupData, setNewFollowupData] = useState({
    followUpDate: '',
    notes: ''
  });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [customerData, followupsData] = await Promise.all([
        customerApi.getById(parseInt(id)),
        customerApi.getFollowups(parseInt(id))
      ]);
      setCustomer(customerData);
      setFollowups(followupsData);
    } catch (error) {
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    if (!newFollowupData.notes.trim()) {
      toast.error('Notes are required');
      return;
    }

    try {
      setSavingFollowup(true);
      await customerApi.createFollowup(parseInt(id), {
        ...newFollowupData,
        followUpDate: newFollowupData.followUpDate ? new Date(newFollowupData.followUpDate).toISOString() : null,
      });
      toast.success('Follow-up added successfully');
      setFollowupModalOpen(false);
      setNewFollowupData({ followUpDate: '', notes: '' });
      // Refresh follow-ups and customer (as followUpDate on customer might be updated)
      fetchData();
    } catch (error) {
      toast.error('Failed to add follow-up');
    } finally {
      setSavingFollowup(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="py-12"><LoadingSpinner /></div>;
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/customers" className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">{customer.customerName}</h1>
        </div>
        {canModify && (
          <button
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg px-4 py-2 transition-all border border-white/10"
          >
            <Edit size={18} />
            <span>Edit Customer</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Customer Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Status</p>
                <StatusBadge status={customer.status} type="customer" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Customer Type</p>
                <span className="bg-slate-800 text-slate-300 text-sm px-2.5 py-1 rounded-md border border-slate-700">
                  {customer.customerType}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> Mobile
                </p>
                <p className="text-slate-100">{customer.mobile}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Email
                </p>
                <p className="text-slate-100">{customer.email || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Business Name</p>
                <p className="text-slate-100">{customer.businessName || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">GST Number</p>
                <p className="text-slate-100 font-mono text-sm">{customer.gstNumber || 'N/A'}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Address
                </p>
                <p className="text-slate-100">{customer.address || 'N/A'}</p>
              </div>
              
              <div className="sm:col-span-2 pt-4 border-t border-white/5">
                <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Notes
                </p>
                <p className="text-slate-100 whitespace-pre-wrap">{customer.notes || 'No notes provided.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Follow-up Schedule
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Next Follow-up Date</p>
              <p className="text-lg font-medium text-slate-100">
                {formatDate(customer.followUpDate)}
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                History
              </h2>
              {canModify && (
                <button
                  onClick={() => setFollowupModalOpen(true)}
                  className="p-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-md transition-colors"
                  title="Add Follow-up"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {followups.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No follow-up history.</p>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-2 space-y-6">
                  {followups.map((f, idx) => (
                    <div key={f.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 bg-slate-900 border-2 border-indigo-500 rounded-full"></div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-indigo-400">
                          {formatDateTime(f.createdAt)}
                        </span>
                        <span className="text-xs text-slate-500">
                          by {f.createdBy?.name || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{f.notes}</p>
                      {f.followUpDate && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Calendar size={12} /> Scheduled for {formatDate(f.followUpDate)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={followupModalOpen}
        onClose={() => setFollowupModalOpen(false)}
        title="Add Follow-up"
      >
        <form onSubmit={handleAddFollowup} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes *</label>
            <textarea
              value={newFollowupData.notes}
              onChange={(e) => setNewFollowupData({ ...newFollowupData, notes: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              placeholder="Enter follow-up details..."
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Next Follow-up Date (Optional)</label>
            <input
              type="date"
              value={newFollowupData.followUpDate}
              onChange={(e) => setNewFollowupData({ ...newFollowupData, followUpDate: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none [color-scheme:dark]"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={() => setFollowupModalOpen(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingFollowup}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors min-w-[100px]"
            >
              {savingFollowup ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
