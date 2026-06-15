'use client';

import { useState, useCallback } from 'react';
import { Search, Plus, Eye, X, SlidersHorizontal, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const dummySales = [
  { id: 1, refNumber: 'ORD-2026-001', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 10097, status: 'DELIVERED', notes: 'Deliver to warehouse', createdAt: '2026-01-15', items: [{ product: 'Samsung 55" Smart TV', quantity: 2, price: 1899 }, { product: 'iPhone 15 Pro', quantity: 1, price: 4299 }] },
  { id: 2, refNumber: 'ORD-2026-002', customer: 'Fatima Al Zaabi', company: 'Zaabi Enterprises', total: 8797, status: 'CONFIRMED', notes: '', createdAt: '2026-02-10', items: [{ product: 'Dell Laptop 15"', quantity: 1, price: 3499 }, { product: 'Samsung Refrigerator 500L', quantity: 1, price: 2899 }] },
  { id: 3, refNumber: 'ORD-2026-003', customer: 'Mohammed Hassan', company: 'Hassan General Trading', total: 6597, status: 'PENDING', notes: '', createdAt: '2026-03-05', items: [{ product: 'Sony PlayStation 5', quantity: 2, price: 2199 }] },
  { id: 4, refNumber: 'ORD-2026-004', customer: 'Layla Al Ketbi', company: 'Ketbi Office Solutions', total: 5497, status: 'DELIVERED', notes: '', createdAt: '2026-03-20', items: [{ product: 'iPad Pro 12.9"', quantity: 1, price: 3999 }] },
  { id: 5, refNumber: 'ORD-2026-005', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 2199, status: 'CANCELLED', notes: '', createdAt: '2026-04-01', items: [{ product: 'Dyson V15 Vacuum', quantity: 1, price: 2199 }] },
];

type Sale = typeof dummySales[0];
type OrderItem = { product: string; quantity: number; price: number };

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const;
type Status = typeof ALL_STATUSES[number];

function emptyItem(): OrderItem {
  return { product: '', quantity: 1, price: 0 };
}

const PRICE_MIN = 0;
const PRICE_MAX = 15000;

export default function SalesPage() {
  const [sales, setSales] = useState(dummySales);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const [form, setForm] = useState({
    customer: '',
    company: '',
    notes: '',
    createdAt: new Date().toISOString().split('T')[0],
    status: 'PENDING' as Status,
  });
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const [error, setError] = useState('');

  /* ── derived ── */
  const orderTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const isPriceFiltered = priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX;

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.customer.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.refNumber.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesPrice = s.total >= priceRange[0] && s.total <= priceRange[1];
    return matchesSearch && matchesStatus && matchesPrice;
  });

  /* ── handlers ── */
  const handleView = (sale: Sale) => { setViewingSale(sale); setIsViewOpen(true); };

  const handleStatusChange = (id: number, newStatus: string) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (viewingSale?.id === id) setViewingSale(v => v ? { ...v, status: newStatus } : v);
  };

  const openCancelModal = () => {
    setCancelReason('');
    setCancelError('');
    setIsCancelOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      setCancelError('Please enter a reason for cancellation.');
      return;
    }
    if (viewingSale) {
      setSales(prev => prev.map(s =>
        s.id === viewingSale.id ? { ...s, status: 'CANCELLED', notes: `Cancelled: ${cancelReason}${s.notes ? ` | ${s.notes}` : ''}` } : s
      ));
      setViewingSale(v => v ? { ...v, status: 'CANCELLED', notes: `Cancelled: ${cancelReason}${v.notes ? ` | ${v.notes}` : ''}` } : v);
    }
    setIsCancelOpen(false);
    setIsViewOpen(false);
  };

  /* price range helpers */
  const handleMinPrice = useCallback((value: number) => {
    setPriceRange(prev => [Math.min(value, prev[1] - 500), prev[1]]);
  }, []);

  const handleMaxPrice = useCallback((value: number) => {
    setPriceRange(prev => [prev[0], Math.max(value, prev[0] + 500)]);
  }, []);

  const resetPriceRange = () => setPriceRange([PRICE_MIN, PRICE_MAX]);

  /* items helpers */
  const updateItem = (idx: number, field: keyof OrderItem, value: string) => {
    setItems(prev => prev.map((it, i) =>
      i !== idx ? it : {
        ...it,
        [field]: field === 'product' ? value : Math.max(0, Number(value)),
      }
    ));
  };
  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const openAdd = () => {
    setForm({ customer: '', company: '', notes: '', createdAt: new Date().toISOString().split('T')[0], status: 'PENDING' });
    setItems([emptyItem()]);
    setError('');
    setIsAddOpen(true);
  };

  const handleAddSubmit = () => {
    if (!form.customer.trim() || !form.company.trim()) {
      setError('Customer and company are required.');
      return;
    }
    const validItems = items.filter(i => i.product.trim());
    setSales(prev => [{
      id: Date.now(),
      refNumber: `ORD-2026-${String(prev.length + 1).padStart(3, '0')}`,
      customer: form.customer,
      company: form.company,
      total: orderTotal,
      status: form.status,
      notes: form.notes,
      createdAt: form.createdAt,
      items: validItems,
    }, ...prev]);
    setIsAddOpen(false);
  };

  return (
    <div >
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
          onClick={openAdd}
          className="bg-blue-800 cursor-pointer hover:bg-blue-800/80 text-white gap-1 py-5 px-3 rounded-xl"
        >
          <Plus size={16} />
          New Order
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center rounded-xl p-1 mt-10 gap-1">
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
              ? `All (${sales.length})`
              : `${status.charAt(0) + status.slice(1).toLowerCase()} (${sales.filter(s => s.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden px-4 mt-8">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Ref No.</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Total (AED)</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
              <TableHead className="text-gray-400">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sale) => (
                <TableRow key={sale.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">{sale.refNumber}</TableCell>
                  <TableCell className="text-white font-medium">{sale.customer}</TableCell>
                  <TableCell className="text-gray-300">{sale.company}</TableCell>
                  <TableCell className="text-gray-300">AED {sale.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[sale.status]} border-0`}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{sale.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">

                      {sale.status === 'PENDING' && (
                        <button onClick={() => handleStatusChange(sale.id, 'CONFIRMED')} className="text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer border border-yellow-400/30 px-2 py-1 rounded-lg transition">
                          Confirm
                        </button>
                      )}
                      {sale.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusChange(sale.id, 'DELIVERED')} className="text-xs text-green-400 hover:text-green-300 cursor-pointer border border-green-400/30 px-2 py-1 rounded-lg transition">
                          Deliver
                        </button>
                      )}
                      {(sale.status === 'PENDING' || sale.status === 'CONFIRMED') && (
                        <button onClick={() => { setViewingSale(sale); openCancelModal(); }} className="text-xs text-red-400 hover:text-red-300 cursor-pointer border border-red-400/30 px-2 py-1 rounded-lg transition">
                          Cancel
                        </button>
                      )}
                    </div>

                  </TableCell>
                  <TableCell className="pl-5">
                    <button onClick={() => handleView(sale)} className="text-blue-400 cursor-pointer hover:text-blue-300 transition">
                      <Eye size={15} />
                    </button></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── View Order Modal ── */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl h-[70vh] flex flex-col p-0 overflow-hidden">

          {/* Header Section (Fixed at top) */}
          <DialogHeader className="px-8 py-5 border-b border-black/5 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">
              Order Details — {viewingSale?.refNumber}
            </DialogTitle>
          </DialogHeader>

          {/* Middle Portion (Scrollable) */}
          {viewingSale && (
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Customer</p>
                  <p className="text-black font-medium">{viewingSale.customer}</p>
                </div>
                <div>
                  <p className="text-gray-400">Company</p>
                  <p className="text-black">{viewingSale.company}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <Badge className={`${statusColors[viewingSale.status]} border-0`}>{viewingSale.status}</Badge>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-black">{viewingSale.createdAt}</p>
                </div>
                {viewingSale.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Notes</p>
                    <p className="text-black">{viewingSale.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Order Items</p>
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
                      {viewingSale.items.map((item, i) => (
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
            </div>
          )}

          {/* Footer Section (Fixed at bottom) */}
          {viewingSale && (
            <div className="flex items-center justify-between border-t border-black/10 px-8 py-4 bg-gray-50/50 flex-shrink-0">
              {(viewingSale.status === 'PENDING' || viewingSale.status === 'CONFIRMED') && (
                <button
                  onClick={() => { setIsViewOpen(false); openCancelModal(); }}
                  className="text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
              <div className="text-right ml-auto">
                <p className="text-sm text-gray-400">Grand Total</p>
                <p className="text-xl font-bold text-black">AED {viewingSale.total.toLocaleString()}</p>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* ── Cancel Confirmation Modal ── */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {cancelError && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{cancelError}</p>
            )}
            <div className="space-y-2">
              <Label>Reason for cancellation <span className="text-red-500">*</span></Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation"
                className="border border-black/20 py-5"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" onClick={() => setIsCancelOpen(false)} className="cursor-pointer px-5 py-5">
                Go Back
              </Button>
              <Button onClick={handleCancelConfirm} className="bg-red-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-red-700 text-white">
                Confirm Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Order Modal ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl h-[87vh] p-0 flex flex-col">

          {/* Header */}
          <DialogHeader className="px-8 py-6 border-b shrink-0">
            <DialogTitle className="text-xl font-semibold">
              New Sales Order
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="space-y-5">
              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.customer}
                    onChange={(e) =>
                      setForm({ ...form, customer: e.target.value })
                    }
                    placeholder="e.g. Khalid Al Rashidi"
                    className="border border-black/20 py-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    placeholder="e.g. Al Rashidi Trading LLC"
                    className="border border-black/20 py-5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <Input
                    type="date"
                    value={form.createdAt}
                    onChange={(e) =>
                      setForm({ ...form, createdAt: e.target.value })
                    }
                    className="border border-black/20 py-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Status,
                      })
                    }
                    className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm bg-white text-black focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Delivery instructions, special requests…"
                  className="border border-black/20 py-5"
                />
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <Label>Products</Label>

                  <button
                    onClick={addItem}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    Add Line
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 text-xs text-gray-400 px-1">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Price (AED)</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-center"
                    >
                      <Input
                        value={item.product}
                        onChange={(e) =>
                          updateItem(idx, "product", e.target.value)
                        }
                        placeholder="Product name"
                        className="border border-black/20 py-4 text-sm"
                      />

                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", e.target.value)
                        }
                        className="border border-black/20 py-4 text-sm text-center"
                      />

                      <Input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) =>
                          updateItem(idx, "price", e.target.value)
                        }
                        className="border border-black/20 py-4 text-sm"
                      />

                      <p className="text-sm text-right text-gray-600 font-medium pr-1">
                        {(item.quantity * item.price).toLocaleString()}
                      </p>

                      <button
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        className="text-red-500 ps-3 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t bg-white px-8 py-4 shrink-0">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-black">Order Total</p>
              <p className="text-lg font-semibold text-black">
                AED {orderTotal.toLocaleString()}
              </p>

            </div>

            <div className="flex justify-end gap-3 mt-5">
              <Button
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="cursor-pointer px-5 py-5"
              >
                Cancel
              </Button>

              <Button
                onClick={handleAddSubmit}
                className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white"
              >
                Create Order
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}