import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '0',
    minimumStock: '0',
    warehouseLocation: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const product = await productApi.getById(Number(id));
          setFormData({
            productName: product.productName,
            sku: product.sku,
            category: product.category || '',
            unitPrice: product.unitPrice.toString(),
            currentStock: product.currentStock.toString(),
            minimumStock: product.minimumStock.toString(),
            warehouseLocation: product.warehouseLocation || ''
          });
        } catch (error) {
          toast.error('Failed to fetch product details');
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        productName: formData.productName,
        sku: formData.sku,
        category: formData.category || undefined,
        unitPrice: Number(formData.unitPrice),
        minimumStock: Number(formData.minimumStock),
        warehouseLocation: formData.warehouseLocation || undefined,
      };

      if (!isEdit) {
        payload.currentStock = Number(formData.currentStock);
      }

      if (isEdit && id) {
        await productApi.update(Number(id), payload);
        toast.success('Product updated successfully');
      } else {
        await productApi.create(payload);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Name *</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                placeholder="Unique SKU code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                placeholder="e.g. Electronics, Clothing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-500">₹</span>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg pl-8 pr-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Initial Stock *</label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Minimum Stock *</label>
              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Warehouse Location</label>
              <input
                type="text"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                placeholder="e.g. Aisle 4, Shelf B"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Link
              to="/products"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
