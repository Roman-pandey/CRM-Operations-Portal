import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { stockMovementApi } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';

export const StockMovements = () => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const data = await stockMovementApi.getAll({ page, limit: 15 });
        setMovements(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        toast.error('Failed to load stock movements');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, [page]);

  if (loading && movements.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Stock Movements</h1>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
        {movements.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left divide-y divide-white/5">
                <thead className="text-xs uppercase text-slate-400 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">SKU</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium">Reason</th>
                    <th className="px-6 py-4 font-medium">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {m.product?.productName || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {m.product?.sku || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {m.movementType === 'IN' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            OUT
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        <span className={m.movementType === 'IN' ? 'text-emerald-400' : 'text-red-400'}>
                          {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate" title={m.reason}>
                        {m.reason}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {m.createdBy?.name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12 text-slate-600" />}
            title="No Movements Found"
            description="There are no stock movements recorded yet."
          />
        )}
      </div>
    </div>
  );
};

export default StockMovements;
