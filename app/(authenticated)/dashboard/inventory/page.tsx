'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getAllProducts, createProduct, updateProduct } from '@/lib/services/inventoryService';

type Product = {
  id: number;
  refNumber: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', sku: '', price: '', quantity: '', category: 'Electronics',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const data = await getAllProducts();
      setProducts(data);
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // derive unique categories from API data
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchesSearch =
      (p.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.sku?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.refNumber?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' ? true : p.category === categoryFilter;
    const matchesStock = stockFilter === 'ALL' ? true : p.quantity < 10;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ name: '', sku: '', price: '', quantity: '', category: 'Electronics' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity),
      category: product.category,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price || !form.quantity) {
      setError('All fields are required');
      return;
    }
    try {
      setError('');
      setSubmitting(true);
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred while saving the product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          onClick={openAddModal}
          className="bg-blue-800 cursor-pointer hover:bg-blue-800/80 text-white gap-1 py-5 px-3 rounded-xl"
        >
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mt-6">
        <div className="flex items-center rounded-xl p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all
                ${categoryFilter === cat ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              {cat === 'ALL'
                ? `All (${products.length})`
                : `${cat} (${products.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStockFilter(prev => prev === 'ALL' ? 'LOW' : 'ALL')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all border
            ${stockFilter === 'LOW'
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'text-gray-400 border-white/10 hover:text-white'
            }`}
        >
          ⚠️ Low Stock ({products.filter(p => p.quantity < 10).length})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl mt-6 border border-white/10 overflow-hidden px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Ref No.</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">SKU</TableHead>
              <TableHead className="text-gray-400">Category</TableHead>
              <TableHead className="text-gray-400">Price (AED)</TableHead>
              <TableHead className="text-gray-400">Stock</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <p className="text-red-400">{fetchError}</p>
                  <button onClick={fetchProducts} className="text-blue-400 text-sm mt-2 hover:underline">
                    Try again
                  </button>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">{product.refNumber}</TableCell>
                  <TableCell className="text-white font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-300 font-mono">{product.sku}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 pl-6">{product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={product.quantity < 10
                      ? 'bg-red-500/20 text-red-400 border-0'
                      : 'bg-green-500/20 text-green-400 border-0'
                    }>
                      {product.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="ps-6">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                    >
                      <Pencil size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="space-y-2.5">
              <Label>Product Name <span className="text-red-600">*</span></Label>
              <Input
                disabled={submitting}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-black/20 py-5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label>SKU <span className="text-red-600">*</span></Label>
                <Input
                  disabled={submitting}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="ELEC-001"
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Category <span className="text-red-600">*</span></Label>
                <select
                  disabled={submitting}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-black/20 rounded-md px-3 py-3 text-sm bg-white text-black dark:bg-zinc-900 dark:text-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label>Price (AED) <span className="text-red-600">*</span></Label>
                <Input
                  disabled={submitting}
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Quantity <span className="text-red-600">*</span></Label>
                <Input
                  disabled={submitting}
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  min={0}
                  className="border border-black/20 py-5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-10 mb-2">
              <Button variant="ghost" disabled={submitting} onClick={() => setIsModalOpen(false)} className="cursor-pointer px-5 py-5">
                Cancel
              </Button>
              <Button disabled={submitting} onClick={handleSubmit} className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white min-w-[120px]">
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : editingProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}