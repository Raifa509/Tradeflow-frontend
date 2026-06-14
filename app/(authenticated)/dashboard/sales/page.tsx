'use client';

import { useState } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const dummySales = [
  { id: 1, refNumber: 'ORD-2026-001', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 10097, status: 'DELIVERED', notes: 'Deliver to warehouse', createdAt: '2026-01-15', items: [{ product: 'Samsung 55" Smart TV', quantity: 2, price: 1899 }, { product: 'iPhone 15 Pro', quantity: 1, price: 4299 }] },
  { id: 2, refNumber: 'ORD-2026-002', customer: 'Fatima Al Zaabi',   company: 'Zaabi Enterprises',      total: 8797,  status: 'CONFIRMED', notes: '', createdAt: '2026-02-10', items: [{ product: 'Dell Laptop 15"', quantity: 1, price: 3499 }, { product: 'Samsung Refrigerator 500L', quantity: 1, price: 2899 }] },
  { id: 3, refNumber: 'ORD-2026-003', customer: 'Mohammed Hassan',   company: 'Hassan General Trading', total: 6597,  status: 'PENDING',   notes: '', createdAt: '2026-03-05', items: [{ product: 'Sony PlayStation 5', quantity: 2, price: 2199 }] },
  { id: 4, refNumber: 'ORD-2026-004', customer: 'Layla Al Ketbi',    company: 'Ketbi Office Solutions', total: 5497,  status: 'DELIVERED', notes: '', createdAt: '2026-03-20', items: [{ product: 'iPad Pro 12.9"', quantity: 1, price: 3999 }] },
  { id: 5, refNumber: 'ORD-2026-005', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 2199,  status: 'CANCELLED', notes: '', createdAt: '2026-04-01', items: [{ product: 'Dyson V15 Vacuum', quantity: 1, price: 2199 }] },
];

type Sale = typeof dummySales[0];

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function SalesPage() {
  const [sales, setSales]               = useState(dummySales);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [viewingSale, setViewingSale]   = useState<Sale | null>(null);
  const [isViewOpen, setIsViewOpen]     = useState(false);
  const [isAddOpen, setIsAddOpen]       = useState(false);
  const [form, setForm] = useState({ customer: '', company: '', notes: '' });
  const [error, setError] = useState('');

  const filtered = sales.filter(s => {
    const matchesSearch =
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.refNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (sale: Sale) => {
    setViewingSale(sale);
    setIsViewOpen(true);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleAddSubmit = () => {
    if (!form.customer || !form.company) {
      setError('Customer and company are required');
      return;
    }
    setSales(prev => [{
      id: prev.length + 1,
      refNumber: `ORD-2026-00${prev.length + 1}`,
      customer: form.customer,
      company: form.company,
      total: 0,
      status: 'PENDING',
      notes: form.notes,
      createdAt: new Date().toISOString().split('T')[0],
      items: [],
    }, ...prev]);
    setIsAddOpen(false);
    setForm({ customer: '', company: '', notes: '' });
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search orders..."
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
          New Order
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
              ? `All (${sales.length})`
              : `${status} (${sales.filter(s => s.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl mt-6 border border-white/10 overflow-hidden px-4">
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
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {sale.refNumber}
                  </TableCell>
                  <TableCell className="text-white font-medium">{sale.customer}</TableCell>
                  <TableCell className="text-gray-300">{sale.company}</TableCell>
                  <TableCell className="text-gray-300">
                    AED {sale.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[sale.status]} border-0`}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{sale.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(sale)}
                        className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                      >
                        <Eye size={15} />
                      </button>
                      {sale.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(sale.id, 'CONFIRMED')}
                          className="text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer border border-yellow-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Confirm
                        </button>
                      )}
                      {sale.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(sale.id, 'DELIVERED')}
                          className="text-xs text-green-400 hover:text-green-300 cursor-pointer border border-green-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Order Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Order Details — {viewingSale?.refNumber}
            </DialogTitle>
          </DialogHeader>
          {viewingSale && (
            <div className="space-y-4 mt-2">
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
                  <Badge className={`${statusColors[viewingSale.status]} border-0`}>
                    {viewingSale.status}
                  </Badge>
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

              {/* Items */}
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

              <div className="flex justify-end border-t border-black/10 pt-3">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Grand Total</p>
                  <p className="text-xl font-bold text-black">
                    AED {viewingSale.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Order Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">New Sales Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="space-y-2.5">
              <Label>Customer Name <span className="text-red-600">*</span></Label>
              <Input
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
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
            <div className="space-y-2.5">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="border border-black/20 py-5"
              />
            </div>
            <div className="flex justify-end gap-4 mt-4 mb-2">
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="cursor-pointer px-5 py-5">
                Cancel
              </Button>
              <Button onClick={handleAddSubmit} className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white">
                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}