'use client';
import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const dummyProducts = [
  { id: 1, refNumber: 'PROD-2026-001', name: 'Samsung 55" Smart TV',    sku: 'ELEC-001', price: 1899, quantity: 25, category: 'Electronics' },
  { id: 2, refNumber: 'PROD-2026-002', name: 'iPhone 15 Pro',           sku: 'ELEC-002', price: 4299, quantity: 8,  category: 'Electronics' },
  { id: 3, refNumber: 'PROD-2026-003', name: 'Dell Laptop 15"',         sku: 'ELEC-003', price: 3499, quantity: 12, category: 'Electronics' },
  { id: 4, refNumber: 'PROD-2026-004', name: 'Sony PlayStation 5',      sku: 'ELEC-004', price: 2199, quantity: 6,  category: 'Electronics' },
  { id: 5, refNumber: 'PROD-2026-005', name: 'iPad Pro 12.9"',          sku: 'ELEC-005', price: 3999, quantity: 3,  category: 'Electronics' },
  { id: 6, refNumber: 'PROD-2026-006', name: 'LG Washing Machine 8kg',  sku: 'APPL-001', price: 1499, quantity: 15, category: 'Appliances' },
  { id: 7, refNumber: 'PROD-2026-007', name: 'Samsung Refrigerator 500L', sku: 'APPL-002', price: 2899, quantity: 10, category: 'Appliances' },
  { id: 8, refNumber: 'PROD-2026-008', name: 'Dyson V15 Vacuum',        sku: 'APPL-003', price: 2199, quantity: 3,  category: 'Appliances' },
  { id: 9, refNumber: 'PROD-2026-009', name: 'Bosch Dishwasher 14 Place', sku: 'APPL-004', price: 1799, quantity: 7, category: 'Appliances' },
  { id: 10, refNumber: 'PROD-2026-010', name: 'Philips Air Fryer XL',   sku: 'APPL-005', price: 499,  quantity: 20, category: 'Appliances' },
];

type Product = typeof dummyProducts[0];

export default function InventoryPage() {
  const [products, setProducts]         = useState(dummyProducts);
  const [search, setSearch]             = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Electronics' | 'Appliances'>('ALL');
  const [stockFilter, setStockFilter]   = useState<'ALL' | 'LOW'>('ALL');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError]               = useState('');
  const [form, setForm] = useState({
    name: '', sku: '', price: '', quantity: '', category: 'Electronics',
  });

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.refNumber.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ? true : p.category === categoryFilter;

    const matchesStock =
      stockFilter === 'ALL' ? true : p.quantity < 10;

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

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.price || !form.quantity) {
      setError('All fields are required');
      return;
    }
    if (editingProduct) {
      setProducts(prev => prev.map(p =>
        p.id === editingProduct.id ? {
          ...p,
          name: form.name,
          sku: form.sku,
          price: Number(form.price),
          quantity: Number(form.quantity),
          category: form.category,
        } : p
      ));
    } else {
      setProducts(prev => [{
        id: prev.length + 1,
        refNumber: `PROD-2026-0${String(prev.length + 1).padStart(2, '0')}`,
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
      }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
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
        {/* Category Filter */}
        <div className="flex items-center rounded-xl p-1">
          {(['ALL', 'Electronics', 'Appliances'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all
                ${categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {cat === 'ALL'
                ? `All (${products.length})`
                : `${cat} (${products.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Low Stock Filter */}
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {product.refNumber}
                  </TableCell>
                  <TableCell className="text-white font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-300 font-mono">{product.sku}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 pl-6">
                    {product.price.toLocaleString()}
                  </TableCell>
                  <TableCell  >
                    <Badge className={product.quantity < 10
                      ? 'bg-red-500/20 text-red-400 border-0'
                      : 'bg-green-500/20 text-green-400 border-0'
                    }>
                      {product.quantity < 10 ? ` ${product.quantity}` : product.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="ps-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                      >
                        <Pencil size={15} />
                      </button>
            
                    </div>
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
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="space-y-2.5">
              <Label>Product Name <span className="text-red-600">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-black/20 py-5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label>SKU <span className="text-red-600">*</span></Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="ELEC-001"
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Category <span className="text-red-600">*</span></Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-black/20 rounded-md px-3 py-3 text-sm"
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
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Quantity <span className="text-red-600">*</span></Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  min={0}
                  className="border border-black/20 py-5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-10 mb-2">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer px-5 py-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white"
              >
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}