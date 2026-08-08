'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { challanApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { canConfirmChallans } from '../../utils/permissions';

const formatCurrency = (n: number | string) => `₹${Number(n).toLocaleString('en-IN')}`;
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const ChallanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challan, setChallan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: 'confirm' | 'cancel' | null }>({
    isOpen: false,
    type: null
  });

  const fetchChallan = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await challanApi.getById(Number(id));
      setChallan(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load challan details');
      toast.error('Failed to load challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchChallan();
  }, [id]);

  const handleAction = async () => {
    if (!confirmDialog.type) return;
    
    try {
      if (confirmDialog.type === 'confirm') {
        await challanApi.confirm(Number(id));
        toast.success('Challan confirmed successfully');
      } else if (confirmDialog.type === 'cancel') {
        await challanApi.cancel(Number(id));
        toast.success('Challan cancelled successfully');
      }
      fetchChallan();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || `Failed to ${confirmDialog.type} challan`);
    } finally {
      setConfirmDialog({ isOpen: false, type: null });
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !challan) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-12 h-12 text-slate-400" />}
        title="Challan Not Found"
        description={error || "The requested challan could not be found."}
        action={<button onClick={() => navigate('/challans')} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all mt-4">Back to Challans</button>}
      />
    );
  }

  const totalAmount = challan.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPriceSnapshot), 0) || 0;
  const userCanConfirm = user?.role ? canConfirmChallans(user.role) : false;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/challans')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {challan.challanNumber}
            <StatusBadge status={challan.status} type="challan" />
          </h1>
        </div>
        
        {userCanConfirm && (
          <div className="flex items-center gap-3">
            {challan.status === 'DRAFT' && (
              <>
                <button
                  onClick={() => navigate(`/challans/new`)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg px-4 py-2 transition-all"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}
                  className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'confirm' })}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Confirm
                </button>
              </>
            )}
            {challan.status === 'CONFIRMED' && (
              <button
                onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}
                className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 transition-all"
              >
                Cancel Challan
              </button>
            )}
          </div>
        )}
      </div>
      
      {challan.status === 'CANCELLED' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-400">This challan has been cancelled</h3>
            <p className="text-sm text-red-400/80 mt-1">No further actions can be taken. Stock has been returned to inventory if it was previously confirmed.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Customer</div>
              <div className="text-slate-200">
                {challan.customer?.customerName}
                {challan.customer?.businessName && <span className="text-slate-400 ml-2">({challan.customer.businessName})</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Challan Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Created By</div>
              <div className="text-slate-200">{challan.createdBy?.name || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Created At</div>
              <div className="text-slate-200">{formatDate(challan.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Last Updated</div>
              <div className="text-slate-200">{formatDate(challan.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-xs uppercase text-slate-400 font-medium">#</th>
                <th className="py-3 px-4 text-xs uppercase text-slate-400 font-medium">Product Name</th>
                <th className="py-3 px-4 text-xs uppercase text-slate-400 font-medium">SKU</th>
                <th className="py-3 px-4 text-xs uppercase text-slate-400 font-medium text-right">Unit Price</th>
                <th className="py-3 px-4 text-xs uppercase text-slate-400 font-medium text-right">Quantity</th>
                <th className="py-3 px-4 text-xs uppercase text-slate-400 font-medium text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {challan.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-300">{idx + 1}</td>
                  <td className="py-3 px-4 text-sm text-slate-200">{item.productNameSnapshot}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{item.skuSnapshot}</td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">{formatCurrency(item.unitPriceSnapshot)}</td>
                  <td className="py-3 px-4 text-sm text-slate-300 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-slate-200 text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPriceSnapshot)}
                  </td>
                </tr>
              ))}
              {(!challan.items || challan.items.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No items found</td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-white/10">
              <tr>
                <td colSpan={4} className="py-4 px-4 text-sm font-medium text-slate-300 text-right">Grand Total:</td>
                <td className="py-4 px-4 text-sm font-medium text-slate-200 text-right">{challan.totalQuantity}</td>
                <td className="py-4 px-4 text-lg font-bold text-white text-right">{formatCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        message={
          confirmDialog.type === 'confirm' 
            ? 'This will deduct stock from inventory. Are you sure?' 
            : challan.status === 'CONFIRMED' 
              ? 'This will restore stock to inventory. Are you sure you want to cancel this challan?'
              : 'Are you sure you want to cancel this draft challan?'
        }
        variant={confirmDialog.type === 'cancel' ? 'danger' : 'warning'}
        onConfirm={handleAction}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
      />
    </div>
  );
};

export default ChallanDetail;
