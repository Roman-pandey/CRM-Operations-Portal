import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { canModifyProducts } from '../../utils/permissions';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { SearchBar } from '../../components/SearchBar';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { Product } from '../../types';

const formatCurrency = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

export const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canModify = canModifyProducts(user?.role);

  // Fetch unique categories for dropdown options
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productApi.getAll({ limit: 100 });
        if (response.data) {
          const uniqueCats = Array.from(
            new Set(
              response.data
                .map((p: any) => p.category)
                .filter((c: any) => Boolean(c) && typeof c === 'string' && c.trim() !== '')
            )
          ) as string[];
          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error('Failed to load categories list', error);
      }
    };
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getAll({ page, limit: 10, search, category });
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, category]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productApi.delete(deleteId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product. It may have existing challans.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        {canModify && (
          <Link
            to="/products/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition-all"
          >
            <Plus size={20} />
            <span>Add Product</span>
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
              placeholder="Search by product name or SKU..." 
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-100">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={48} className="text-slate-500" />}
            title="No products found"
            description="No products match your current search or category filter."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-white/5">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Unit Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    {canModify && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">{product.productName}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">{product.sku}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {product.category ? (
                          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700">
                            {product.category}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{formatCurrency(product.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {product.currentStock} / {product.minimumStock}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          type="stock"
                          status={product.currentStock <= product.minimumStock ? 'LOW_STOCK' : 'IN_STOCK'}
                        />
                      </td>
                      {canModify && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            to={`/products/${product.id}/stock`}
                            className="inline-flex p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Adjust Stock"
                          >
                            <ArrowLeftRight size={18} />
                          </Link>
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="inline-flex p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="inline-flex p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
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

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ProductList;
