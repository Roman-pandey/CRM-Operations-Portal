'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { customerApi, productApi, challanApi } from '../../services/api';

export interface Customer {
  id: number;
  customerName: string;
  businessName?: string;
}

export interface Product {
  id: number;
  productName: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

const formatCurrency = (n: number | string) => `₹${Number(n).toLocaleString('en-IN')}`;

export const ChallanForm = () => {
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<Array<{ productId: number | null; quantity: number }>>([
    { productId: null, quantity: 1 }
  ]);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, productsRes] = await Promise.all([
          customerApi.getAll({ limit: 100 }),
          productApi.getAll({ limit: 100 })
        ]);
        setCustomers(customersRes?.data || []);
        setProducts(productsRes?.data || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: null, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      newItems[index].productId = value ? Number(value) : null;
    } else {
      newItems[index].quantity = Number(value);
    }
    setItems(newItems);
  };

  const validateForm = () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return false;
    }
    if (items.length === 0) {
      toast.error('Please add at least one product');
      return false;
    }
    for (const item of items) {
      if (!item.productId) {
        toast.error('Please select a product for all rows');
        return false;
      }
      if (item.quantity <= 0) {
        toast.error('Quantity must be greater than 0');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (confirm: boolean) => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        customerId: Number(selectedCustomerId),
        items: items.map(i => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity)
        }))
      };
      
      const newChallan = await challanApi.create(payload);
      
      if (confirm) {
        await challanApi.confirm(newChallan.id);
        toast.success('Challan created and confirmed successfully');
      } else {
        toast.success('Draft challan created successfully');
      }
      
      navigate(`/challans/${newChallan.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to save challan');
    } finally {
      setSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  let totalItems = items.length;
  let totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  let totalAmount = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + ((product?.unitPrice || 0) * (item.quantity || 0));
  }, 0);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/challans')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Create Sales Challan</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Customer Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Customer *</label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value) || null)}
              className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.customerName} {c.businessName ? `(${c.businessName})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Products</h2>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg px-4 py-2 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              return (
                <div key={index} className="flex gap-4 items-end bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Product</label>
                    <select
                      value={item.productId || ''}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.productName} (SKU: {p.sku}) - Stock: {p.currentStock}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {selectedProduct && (
                      <div className="text-xs text-slate-400 mt-1">Stock: {selectedProduct.currentStock}</div>
                    )}
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit Price</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedProduct ? formatCurrency(selectedProduct.unitPrice) : '-'}
                      className="w-full bg-white/5 border border-transparent text-slate-400 rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Line Total</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedProduct ? formatCurrency(selectedProduct.unitPrice * item.quantity) : '-'}
                      className="w-full bg-white/5 border border-transparent text-slate-400 rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors border border-red-500/20 mb-[1px]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-medium">Total Items:</span> {totalItems} &nbsp;|&nbsp; <span className="font-medium">Total Quantity:</span> {totalQuantity}
            </div>
            <div className="text-xl font-bold text-white">
              Total: {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg px-6 py-2.5 transition-all font-medium disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => {
              if (validateForm()) setConfirmDialogOpen(true);
            }}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-2.5 transition-all font-medium disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            Save & Confirm
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        title="Confirm Challan"
        message="This will deduct stock from inventory immediately. Are you sure you want to continue?"
        onConfirm={() => handleSubmit(true)}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </div>
  );
};

export default ChallanForm;
