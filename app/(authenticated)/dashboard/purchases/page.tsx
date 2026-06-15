'use client';

import { useState } from 'react';
import { Search, Plus, Eye, Minus } from 'lucide-react';
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
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const [form, setForm] = useState({
    supplier: '',
    company: '',
    notes: '',
    items: [{ product: '', quantity: 1, price: 0 }], // Starts with one clean initial line item
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
    if (viewingPurchase?.id === id) {
      setViewingPurchase(v => v ? { ...v, status: newStatus } : null);
    }
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { product: '', quantity: 1, price: 0 }] }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { 
        ...item, 
        [field]: field === 'product' ? value : Math.max(0, Number(value)) 
      } : item)
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
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

    if (viewingPurchase) {
      const updatedNotes = `Cancelled: ${cancelReason}${viewingPurchase.notes ? ` | ${viewingPurchase.notes}` : ''}`;

      setPurchases(prev => prev.map(p =>
        p.id === viewingPurchase.id ? { ...p, status: 'CANCELLED', notes: updatedNotes } : p
      ));
      setViewingPurchase(v => v ? { ...v, status: 'CANCELLED', notes: updatedNotes } : null);
    }

    setIsCancelOpen(false);
    setIsViewOpen(false);
  };

  const formTotal = form.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleAddSubmit = () => {
    if (!form.supplier || !form.company) {
      setError('Supplier and company are required');
      return;
    }
    
    const validItems = form.items.filter(i => i.product.trim());
    if (validItems.length === 0) {
      setError('Please add at least one item with a valid product name.');
      return;
    }

    setPurchases(prev => [{
      id: prev.length + 1,
      refNumber: `PUR-2026-${String(prev.length + 1).padStart(3, '0')}`,
      supplier: form.supplier,
      company: form.company,
      total: formTotal,
      status: 'PENDING',
      notes: form.notes,
      createdAt: format(form.date, 'yyyy-MM-dd'),
      items: validItems,
    }, ...prev]);

    setIsAddOpen(false);
    setForm({ supplier: '', company: '', notes: '', items: [{ product: '', quantity: 1, price: 0 }], date: new Date() });
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
          onClick={() => {
            setForm({ supplier: '', company: '', notes: '', items: [{ product: '', quantity: 1, price: 0 }], date: new Date() });
            setError('');
            setIsAddOpen(true);
          }}
          className="bg-blue-800 cursor-pointer hover:bg-blue-800/80 text-white gap-1 py-5 px-3 rounded-xl"
        >
          <Plus size={16} />
          New Purchase
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
              ? `All (${purchases.length})`
              : `${status.charAt(0) + status.slice(1).toLowerCase()} (${purchases.filter(p => p.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl mt-8 border border-white/10 overflow-hidden px-4">
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
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
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

                      {(purchase.status === 'PENDING' || purchase.status === 'CONFIRMED') && (
                        <button
                          onClick={() => { setViewingPurchase(purchase); openCancelModal(); }}
                          className="text-xs text-red-400 hover:text-red-300 cursor-pointer border border-red-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Cancel
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

      {/* ── Cancel Purchase Confirmation Modal (Single Global Instance) ── */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Cancel Purchase Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {cancelError && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                {cancelError}
              </p>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700">
                Reason for cancellation <span className="text-red-500">*</span>
              </Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Supplier stock shortage / incorrect pricing"
                className="border border-black/20 py-5 text-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => setIsCancelOpen(false)}
                className="cursor-pointer px-5 py-5 text-gray-500 hover:bg-gray-100"
              >
                Go Back
              </Button>
              <Button
                onClick={handleCancelConfirm}
                className="bg-red-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-red-700 text-white"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Purchase Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col p-0 overflow-hidden bg-white">
          <DialogHeader className="px-8 py-5 border-b border-black/5 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-black">
              Purchase Details — {viewingPurchase?.refNumber}
            </DialogTitle>
          </DialogHeader>

          {viewingPurchase && (
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-5">
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
                    <p className="text-black bg-gray-50 p-2.5 rounded-lg border border-black/5">{viewingPurchase.notes}</p>
                  </div>
                )}
              </div>

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
            </div>
          )}

          {/* Fixed Footer with View-to-Cancel Actions Linked */}
          {viewingPurchase && (
            <div className="flex items-center justify-between border-t border-black/10 px-8 py-4 bg-gray-50/50 flex-shrink-0">
              {(viewingPurchase.status === 'PENDING' || viewingPurchase.status === 'CONFIRMED') && (
                <button
                  onClick={() => openCancelModal()}
                  className="text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
              <div className="text-right ml-auto">
                <p className="text-sm text-gray-400">Grand Total</p>
                <p className="text-xl font-bold text-black">
                  AED {viewingPurchase.total.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Purchase Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl h-[87vh] p-0 flex flex-col overflow-hidden bg-white text-black">
          <DialogHeader className="px-8 py-6 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-black">New Purchase Order</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Name <span className="text-red-600">*</span></Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="border border-black/20 py-5 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label>Company <span className="text-red-600">*</span></Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="border border-black/20 py-5 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date <span className="text-red-600">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center gap-2 border border-black/20 rounded-lg px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition cursor-pointer text-black bg-white">
                      <CalendarIcon size={15} className="text-gray-400" />
                      {form.date ? format(form.date, 'dd MMM yyyy') : 'Pick a date'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(date) => date && setForm({ ...form, date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Incoming delivery details..."
                  className="border border-black/20 py-5 text-black"
                />
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <Label>Purchase Items</Label>
                <button
                  onClick={addItem}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Line
                </button>
              </div>

              {form.items.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-black/20 rounded-xl text-gray-400 text-sm">
                  No items added yet. Click "Add Line" to start.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 text-xs text-gray-400 px-1">
                    <span>Product</span>
                    <span>Qty</span>
                    <span>Price (AED)</span>
                    <span className="text-right">Total</span>
                    <span />
                  </div>

                  <div className="space-y-2">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-center">
                        <Input
                          value={item.product}
                          onChange={(e) => updateItem(idx, "product", e.target.value)}
                          placeholder="Product name"
                          className="border border-black/20 py-4 text-sm text-black"
                        />

                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="border border-black/20 py-4 text-sm text-center text-black"
                        />

                        <Input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => updateItem(idx, "price", e.target.value)}
                          className="border border-black/20 py-4 text-sm text-black"
                        />

                        <p className="text-sm text-right text-gray-600 font-medium pr-1">
                          {(item.quantity * item.price).toLocaleString()}
                        </p>

                        <button
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          className="text-red-500 ps-3 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-white px-8 py-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-black">Order Total</p>
              <p className="text-lg font-semibold text-black">
                AED {formTotal.toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <Button
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="cursor-pointer px-5 py-5 text-gray-500"
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