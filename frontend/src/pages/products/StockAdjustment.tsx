import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown, Package, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { canManageStock } from '../../utils/permissions';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { Product, StockMovement } from '../../types';

const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const StockAdjustment = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adjusting, setAdjusting] = useState(false);

  const [form, setForm] = useState<{
    movementType: 'IN' | 'OUT';
    quantity: number | string;
    reason: string;
  }>({
    movementType: 'IN',
    quantity: 1,
    reason: ''
  });

  const canManage = canManageStock(user?.role);

  const fetchProductAndMovements = async () => {
    if (!id) return;
    try {
      const [prodRes, moveRes] = await Promise.all([
        productApi.getById(Number(id)),
        productApi.getStockMovements(Number(id), { page, limit: 10 })
      ]);
      setProduct(prodRes);
      setMovements(moveRes.data);
      setTotalPages(moveRes.meta.totalPages);
    } catch (error) {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndMovements();
  }, [id, page]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const parsedQty = typeof form.quantity === 'number' ? form.quantity : parseInt(form.quantity as string, 10);
    if (!parsedQty || isNaN(parsedQty) || parsedQty <= 0) {
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }

    setAdjusting(true);
    try {
      await productApi.adjustStock(Number(id), {
        quantity: parsedQty,
        movementType: form.movementType,
        reason: form.reason
      });
      toast.success('Stock adjusted successfully');
      setForm({ movementType: 'IN', quantity: 1, reason: '' });
      fetchProductAndMovements();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setForm({ ...form, quantity: '' });
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setForm({ ...form, quantity: Math.max(1, num) });
      }
    }
  };

  const handleIncrement = () => {
    const current = typeof form.quantity === 'number' ? form.quantity : (parseInt(form.quantity as string, 10) || 0);
    setForm({ ...form, quantity: current + 1 });
  };

  const handleDecrement = () => {
    const current = typeof form.quantity === 'number' ? form.quantity : (parseInt(form.quantity as string, 10) || 1);
    setForm({ ...form, quantity: Math.max(1, current - 1) });
  };

  if (loading || !product) {
    return <LoadingSpinner />;
  }

  const stockStatus = product.currentStock > product.minimumStock ? 'bg-green-500' :
    (product.currentStock === product.minimumStock ? 'bg-orange-500' : 'bg-red-500');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/products"
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Stock Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Product Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="font-medium text-white text-lg">{product.productName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">SKU</p>
                <p className="font-medium text-white">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Stock Level</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">{product.currentStock}</span>
                  <span className="text-sm text-slate-400">/ min {product.minimumStock}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${stockStatus}`} style={{ width: `${Math.min(100, (product.currentStock / (product.minimumStock || 1)) * 50)}%` }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Location</p>
                <p className="font-medium text-white">{product.warehouseLocation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {canManage && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Adjust Stock</h2>
              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, movementType: 'IN' })}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-all ${
                      form.movementType === 'IN' 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <ArrowDown size={18} /> Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, movementType: 'OUT' })}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-all ${
                      form.movementType === 'OUT' 
                        ? 'bg-red-500/20 border-red-500 text-red-400' 
                        : 'border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <ArrowUp size={18} /> Stock Out
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity (Type manually or use buttons)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-colors shrink-0"
                      title="Decrease quantity"
                    >
                      <Minus size={18} />
                    </button>

                    <input
                      type="number"
                      min="1"
                      required
                      value={form.quantity}
                      onChange={handleQuantityChange}
                      placeholder="Enter quantity"
                      className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 text-center font-medium focus:border-indigo-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-colors shrink-0"
                      title="Increase quantity"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason</label>
                  <input
                    type="text"
                    required
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="e.g. Restock, Damage, Correction"
                    className="w-full bg-white/5 border border-white/10 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adjusting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all disabled:opacity-50 font-medium"
                >
                  {adjusting ? 'Adjusting...' : 'Submit Adjustment'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4">Movement History</h2>
          
          {movements.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<Package size={48} className="text-slate-500" />}
                title="No movements yet"
                description="Stock movements will appear here once adjusted."
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full divide-y divide-white/5">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-400">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                      <th className="px-4 py-3 font-medium">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-300">{formatDate(movement.createdAt)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            movement.movementType === 'IN' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {movement.movementType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white">{movement.quantity}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{movement.reason}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">{movement.createdBy.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
