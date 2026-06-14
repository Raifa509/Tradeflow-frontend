'use client';

import { useState } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const dummyPurchases = [
  { id: 1, refNumber: 'PUR-2026-001', supplier: 'Omar Al Farsi', company: 'TechSupply FZCO', total: 22490, status: 'DELIVERED', notes: 'Monthly electronics restock', createdAt: '2026-01-10', items: [{ product: 'Samsung 55" Smart TV', quantity: 5, price: 1700 }, { product: 'iPhone 15 Pro', quantity: 3, price: 3900 }] },
  { id: 2, refNumber: 'PUR-2026-002', supplier: 'Rania Mahmoud', company: 'Gulf Import Trading', total: 18990, status: 'CONFIRMED', notes: 'Appliances restock Q1', createdAt: '2026-02-05', items: [{ product: 'LG Washing Machine 8kg', quantity: 5, price: 1300 }] },
  { id: 3, refNumber: 'PUR-2026-003', supplier: 'Tariq Al Blooshi', company: 'Al Blooshi Wholesale', total: 9990, status: 'PENDING', notes: '', createdAt: '2026-03-15', items: [{ product: 'Sony PlayStation 5', quantity: 3, price: 1999 }] },
];

type Purchase = typeof dummyPurchases[0];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState(dummyPurchases);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    supplier: '',
    company: '',
    notes: '',
    items: [] as { product: string; quantity: number; price: number }[],
    date: new Date(),
  });
  const [error, setError] = useState('');

  const filtered = purchases.filter(p => {
    const matchesSearch =
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.refNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (purchase: Purchase) => {
    setViewingPurchase(purchase);
    setIsViewOpen(true);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };
  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { product: '', quantity: 1, price: 0 }] }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const formTotal = form.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const handleAddSubmit = () => {
    if (!form.supplier || !form.company) {
      setError('Supplier and company are required');
      return;
    }
    setPurchases(prev => [{
      id: prev.length + 1,
      refNumber: `PUR-2026-00${prev.length + 1}`,
      supplier: form.supplier,
      company: form.company,
      total: formTotal,
      status: 'PENDING',
      notes: form.notes,
      createdAt: format(form.date, 'yyyy-MM-dd'),
      items: form.items,

    }, ...prev]);
    setIsAddOpen(false);
    setForm({ supplier: '', company: '', notes: '', items: [], date: new Date() });
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-800 cursor-pointer hover:bg-blue-800/80 text-white gap-1 py-5 px-3 rounded-xl"
        >
          <Plus size={16} />
          New Purchase
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center rounded-xl p-1 mt-6 gap-1">
        {(['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all
              ${statusFilter === status
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            {status === 'ALL'
              ? `All (${purchases.length})`
              : `${status} (${purchases.filter(p => p.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl mt-6 border border-white/10 overflow-hidden px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Ref No.</TableHead>
              <TableHead className="text-gray-400">Supplier</TableHead>
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Total (AED)</TableHead>
              <TableHead className="text-gray-400 ps-5">Status</TableHead>
              <TableHead className="text-gray-400 ps-6">Date</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
              <TableHead className="text-gray-400">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((purchase) => (
                <TableRow key={purchase.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {purchase.refNumber}
                  </TableCell>
                  <TableCell className="text-white font-medium">{purchase.supplier}</TableCell>
                  <TableCell className="text-gray-300">{purchase.company}</TableCell>
                  <TableCell className="text-gray-300">AED {purchase.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[purchase.status]} border-0`}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{purchase.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">

                      {purchase.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(purchase.id, 'CONFIRMED')}
                          className="text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer border border-yellow-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Confirm
                        </button>
                      )}
                      {purchase.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(purchase.id, 'DELIVERED')}
                          className="text-xs text-green-400 hover:text-green-300 cursor-pointer border border-green-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <button
                      onClick={() => handleView(purchase)}
                      className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                    >
                      <Eye size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Purchase Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Purchase Details — {viewingPurchase?.refNumber}
            </DialogTitle>
          </DialogHeader>
          {viewingPurchase && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Supplier</p>
                  <p className="text-black font-medium">{viewingPurchase.supplier}</p>
                </div>
                <div>
                  <p className="text-gray-400">Company</p>
                  <p className="text-black">{viewingPurchase.company}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <Badge className={`${statusColors[viewingPurchase.status]} border-0`}>
                    {viewingPurchase.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-black">{viewingPurchase.createdAt}</p>
                </div>
                {viewingPurchase.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Notes</p>
                    <p className="text-black">{viewingPurchase.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Purchase Items</p>
                <div className="border border-black/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-gray-500">Product</th>
                        <th className="text-left px-4 py-2 text-gray-500">Qty</th>
                        <th className="text-left px-4 py-2 text-gray-500">Price</th>
                        <th className="text-left px-4 py-2 text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingPurchase.items.map((item, i) => (
                        <tr key={i} className="border-t border-black/10">
                          <td className="px-4 py-2 text-black">{item.product}</td>
                          <td className="px-4 py-2 text-black">{item.quantity}</td>
                          <td className="px-4 py-2 text-black">AED {item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-black">AED {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end border-t border-black/10 pt-3">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Grand Total</p>
                  <p className="text-xl font-bold text-black">
                    AED {viewingPurchase.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Purchase Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl px-8 py-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">New Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Supplier Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label>Supplier Name <span className="text-red-600">*</span></Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Company <span className="text-red-600">*</span></Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="border border-black/20 py-5"
              />
            </div>
            <div className="space-y-2.5">
              <Label>Purchase Date <span className="text-red-600">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-2 border border-black/20 rounded-md px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition">
                    <CalendarIcon size={15} className="text-gray-400" />
                    {form.date ? format(form.date, 'dd MMM yyyy') : 'Pick a date'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(date) => date && setForm({ ...form, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Products Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Purchase Items</Label>
                <button
                  onClick={addItem}
                  className="text-xs text-blue-400 hover:text-blue-300 border border-blue-400/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              {form.items.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-black/20 rounded-xl text-gray-400 text-sm">
                  No items added yet. Click "Add Item" to start.
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-1 text-xs text-gray-400 font-medium">
                    <span className="col-span-5">Product</span>
                    <span className="col-span-2">Qty</span>
                    <span className="col-span-3">Price (AED)</span>
                    <span className="col-span-1 text-right">Total</span>
                    <span className="col-span-1" />
                  </div>

                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        placeholder="Product name"
                        value={item.product}
                        onChange={(e) => updateItem(index, 'product', e.target.value)}
                        className="col-span-5 border border-black/20 py-4 text-sm"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="col-span-2 border border-black/20 py-4 text-sm"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                        className="col-span-3 border border-black/20 py-4 text-sm"
                      />
                      <span className="col-span-1 text-xs text-gray-500 text-right">
                        {(item.quantity * item.price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="col-span-1 text-red-400 hover:text-red-300 text-center transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className="flex justify-end pt-2 border-t border-black/10">
                    <p className="text-sm font-semibold text-black">
                      Total: AED {formTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4 mb-2">
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="cursor-pointer px-5 py-5">
                Cancel
              </Button>
              <Button onClick={handleAddSubmit} className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white">
                Create Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}