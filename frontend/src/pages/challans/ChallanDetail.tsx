'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, AlertCircle, Printer } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
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
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  
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

  const invoiceNumber = challan?.challanNumber ? challan.challanNumber.replace('CH-', 'INV-') : `INV-${id}`;

  const handlePrint = () => {
    setInvoiceModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
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

  const subtotal = challan.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPriceSnapshot), 0) || 0;
  const gstRate = 0.18; // 18% GST
  const cgstAmount = Math.round((subtotal * (gstRate / 2)) * 100) / 100;
  const sgstAmount = Math.round((subtotal * (gstRate / 2)) * 100) / 100;
  const grandTotal = subtotal + cgstAmount + sgstAmount;
  
  const userCanConfirm = user?.role ? canConfirmChallans(user.role) : false;

  return (
    <div className="max-w-5xl mx-auto pb-12 print:p-0 print:m-0 print:max-w-none">
      {/* Strict Print CSS: Ensures ONLY the invoice is printed starting on Page 1 line 0 */}
      <style>{`
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide main app UI, navbars, sidebars */
          #root,
          header,
          nav,
          aside,
          .print\\:hidden {
            display: none !important;
          }

          /* Reset fixed modal overlay for print document */
          .fixed.inset-0 {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Render Tax Invoice template clearly */
          #printable-tax-invoice {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 print:hidden">
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
        
        {/* Buttons: Print Tax Invoice | Edit | Cancel | Confirm */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Print Tax Invoice */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg px-3.5 py-2 text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" /> Print Tax Invoice
          </button>

          {userCanConfirm && (
            <>
              {/* Edit (if DRAFT) */}
              {challan.status === 'DRAFT' && (
                <button
                  onClick={() => navigate(`/challans/new`)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-lg px-3.5 py-2 text-sm transition-all"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
              )}

              {/* Cancel (if DRAFT or CONFIRMED) */}
              {(challan.status === 'DRAFT' || challan.status === 'CONFIRMED') && (
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}
                  className="bg-red-600/90 hover:bg-red-600 text-white font-medium rounded-lg px-3.5 py-2 text-sm transition-all"
                >
                  Cancel
                </button>
              )}

              {/* Confirm (if DRAFT) */}
              {challan.status === 'DRAFT' && (
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'confirm' })}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg px-3.5 py-2 text-sm transition-all shadow-md shadow-violet-600/20"
                >
                  Confirm
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {challan.status === 'CANCELLED' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-400">This challan has been cancelled</h3>
            <p className="text-sm text-red-400/80 mt-1">No further actions can be taken. Stock has been returned to inventory if it was previously confirmed.</p>
          </div>
        </div>
      )}

      {/* Customer & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:hidden">
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
            {challan.customer?.gstNumber && (
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">GSTIN</div>
                <div className="text-slate-200 font-mono text-sm">{challan.customer.gstNumber}</div>
              </div>
            )}
            {challan.customer?.address && (
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Address</div>
                <div className="text-slate-300 text-sm">{challan.customer.address}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Challan / Invoice Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Invoice Number</div>
              <div className="text-indigo-400 font-medium">{invoiceNumber}</div>
            </div>
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

      {/* Items Summary Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6 print:hidden">
        <h2 className="text-lg font-semibold text-white mb-4">Items Summary</h2>
        
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
                <td colSpan={4} className="py-4 px-4 text-sm font-medium text-slate-300 text-right">Subtotal:</td>
                <td className="py-4 px-4 text-sm font-medium text-slate-200 text-right">{challan.totalQuantity}</td>
                <td className="py-4 px-4 text-lg font-bold text-white text-right">{formatCurrency(subtotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="Tax Invoice Preview" maxWidth="max-w-4xl">
        <div id="printable-tax-invoice" className="bg-white text-slate-900 p-8 rounded-xl font-sans max-h-[85vh] overflow-y-auto overflow-x-hidden print:max-h-none print:p-0 print:overflow-visible border border-slate-200">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-5 mb-6">
            <div className="pr-4">
              <h1 className="text-xl font-extrabold uppercase tracking-wide text-indigo-950">FundsRoom Wholesale & Distribution</h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">123 Logistics Park, Andheri East, Mumbai - 400069</p>
              <p className="text-xs text-slate-600">GSTIN: <span className="font-mono font-semibold text-slate-800">27AAAAA0000A1Z5</span> | Phone: +91 98765 43210</p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1.5 bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider rounded-md">TAX INVOICE</span>
              <p className="text-sm font-extrabold text-indigo-950 mt-2">{invoiceNumber}</p>
              <p className="text-xs text-slate-600 font-medium">Challan Ref: {challan.challanNumber}</p>
              <p className="text-xs text-slate-600">Date: {formatDate(challan.createdAt)}</p>
            </div>
          </div>

          {/* Billed To / Shipped To Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Billed To (Customer)</p>
              <p className="font-bold text-slate-900 text-sm">{challan.customer?.customerName}</p>
              {challan.customer?.businessName && <p className="text-slate-700 font-medium">{challan.customer.businessName}</p>}
              <p className="text-slate-600 mt-0.5">{challan.customer?.address || 'Mumbai, Maharashtra'}</p>
              {challan.customer?.gstNumber && <p className="text-slate-900 font-mono font-medium mt-1">GSTIN: {challan.customer.gstNumber}</p>}
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Billing Details</p>
              <p className="text-slate-700"><span className="text-slate-500 font-normal">Challan Status:</span> <strong className="uppercase text-indigo-950">{challan.status}</strong></p>
              <p className="text-slate-700"><span className="text-slate-500 font-normal">Sales Agent:</span> {challan.createdBy?.name || 'Sales Desk'}</p>
              <p className="text-slate-700"><span className="text-slate-500 font-normal">Payment Terms:</span> Net 30 Days</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="w-full overflow-x-hidden mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 rounded-tl-md">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right rounded-tr-md">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {challan.items?.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.productNameSnapshot}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{item.skuSnapshot}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(item.unitPriceSnapshot)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(item.quantity * item.unitPriceSnapshot)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Declaration */}
          <div className="flex justify-between items-start text-xs mb-8 gap-4">
            <div className="flex-1 text-slate-500 space-y-1 pr-4">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Declaration:</p>
              <p className="leading-relaxed">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
            </div>
            <div className="w-64 shrink-0 space-y-1.5 text-right font-medium bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span>{formatCurrency(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span>{formatCurrency(sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-indigo-950 border-t-2 border-slate-300 pt-2 mt-2">
                <span>Total Amount:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Signatory */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-6 text-xs text-slate-500">
            <div>
              <p className="italic text-slate-600">Thank you for your business!</p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b border-slate-400 mb-1 w-44"></div>
              <p className="font-bold text-slate-900">Authorized Signatory</p>
              <p className="text-[10px] text-slate-500">FundsRoom Distribution</p>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="mt-6 flex justify-end gap-3 print:hidden border-t border-slate-200 pt-4">
            <button
              onClick={() => setInvoiceModalOpen(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-medium rounded-lg text-xs transition-colors shadow"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog for Confirm/Cancel Challan */}
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
