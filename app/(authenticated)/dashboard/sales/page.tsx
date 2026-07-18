'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { getAllCustomers } from '@/lib/services/customersService';
import { getAllProducts } from '@/lib/services/inventoryService';
import { createSale, getAllSales, updateSaleStatus } from '@/lib/services/salesService';

type Status = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

type Customer = {
  id: number;
  refNumber: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  isActive: boolean;
};

type Product = {
  id: number;
  refNumber: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
};

type SalesOrderItem = {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
};

type SalesOrder = {
  id: number;
  refNumber: string;
  customerId: number;
  customer: Customer;
  status: Status;
  total: number;
  notes: string | null;
  reason: string | null;
  createdAt: string;
  items: SalesOrderItem[];
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

type FormItem = { productId: number | ''; quantity: number; price: number };

export default function SalesPage() {
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');
  const [viewingSale, setViewingSale] = useState<SalesOrder | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    customerId: '' as number | '',
    notes: '',
    items: [{ productId: '', quantity: 1, price: 0 }] as FormItem[],
  };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesData, customersData, productsData] = await Promise.all([
          getAllSales(),
          getAllCustomers(),
          getAllProducts(),
        ]);
        setSales(salesData);
        setCustomers(customersData.filter((c: Customer) => c.isActive));
        setProducts(productsData);
      } catch (err) {
        setLoadError('Failed to load sales orders. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = sales.filter((s) => {
    const matchesSearch =
      s.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.company.toLowerCase().includes(search.toLowerCase()) ||
      s.refNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (sale: SalesOrder) => {
    setViewingSale(sale);
    setIsViewOpen(true);
  };

  const handleStatusChange = async (id: number, newStatus: Status) => {
    setActionError('');
    try {
      const updated = await updateSaleStatus(id, newStatus);
      setSales((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (viewingSale?.id === id) setViewingSale(updated);
    } catch (err) {
      setActionError('Failed to update the order status. Please try again.');
    }
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0 }],
    }));
  };

  const updateItem = (
    index: number,
    field: 'productId' | 'quantity' | 'price',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        if (field === 'productId') {
          const product = products.find((p) => p.id === Number(value));
          return {
            ...item,
            productId: value ? Number(value) : '',
            price: product ? product.price : item.price,
          };
        }
        return { ...item, [field]: Math.max(0, Number(value)) };
      }),
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const openCancelModal = () => {
    setCancelReason('');
    setCancelError('');
    setIsCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Please enter a reason for cancellation.');
      return;
    }
    if (!viewingSale) return;

    setIsCancelling(true);
    setCancelError('');
    try {
      const updated = await updateSaleStatus(viewingSale.id, 'CANCELLED', cancelReason);
      setSales((prev) => prev.map((s) => (s.id === viewingSale.id ? updated : s)));
      setViewingSale(updated);
      setIsCancelOpen(false);
      setIsViewOpen(false);
    } catch (err) {
      setCancelError('Failed to cancel the order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formTotal = form.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const handleAddSubmit = async () => {
    if (!form.customerId) {
      setError('Please select a customer.');
      return;
    }
    const validItems = form.items.filter((i) => i.productId !== '');
    if (validItems.length === 0) {
      setError('Please add at least one item with a product selected.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const created = await createSale({
        customerId: Number(form.customerId),
        notes: form.notes || undefined,
        items: validItems.map((i) => ({
          productId: Number(i.productId),
          quantity: i.quantity,
          price: i.price,
        })),
      });
      setSales((prev) => [created, ...prev]);
      setIsAddOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setError('Failed to create the sales order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400 py-20 text-center">Loading sales orders...</div>;
  }

  if (loadError) {
    return <div className="text-red-400 py-20 text-center">{loadError}</div>;
  }

  return (
    <div>
      {actionError && (
        <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg mb-4">
          {actionError}
        </p>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search sales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setError('');
            setIsAddOpen(true);
          }}
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
              : `${status.charAt(0) + status.slice(1).toLowerCase()} (${sales.filter((s) => s.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl mt-8 border border-white/10 overflow-hidden px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Ref No.</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
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
                  No sales orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sale) => (
                <TableRow key={sale.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {sale.refNumber}
                  </TableCell>
                  <TableCell className="text-white font-medium">{sale.customer.name}</TableCell>
                  <TableCell className="text-gray-300">{sale.customer.company}</TableCell>
                  <TableCell className="text-gray-300">AED {sale.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[sale.status]} border-0`}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {format(new Date(sale.createdAt), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
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
                      {(sale.status === 'PENDING' || sale.status === 'CONFIRMED') && (
                        <button
                          onClick={() => { setViewingSale(sale); openCancelModal(); }}
                          className="text-xs text-red-400 hover:text-red-300 cursor-pointer border border-red-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <button
                      onClick={() => handleView(sale)}
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

      {/* Cancel Modal */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Cancel Sales Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {cancelError && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{cancelError}</p>
            )}
            <div className="space-y-2">
              <Label className="text-gray-700">
                Reason for cancellation <span className="text-red-500">*</span>
              </Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation"
                className="border border-black/20 py-5 text-black"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => setIsCancelOpen(false)}
                disabled={isCancelling}
                className="cursor-pointer px-5 py-5 text-gray-500 hover:bg-gray-100"
              >
                Go Back
              </Button>
              <Button
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="bg-red-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-red-700 text-white"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col p-0 overflow-hidden bg-white">
          <DialogHeader className="px-8 py-5 border-b border-black/5 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-black">
              Order Details — {viewingSale?.refNumber}
            </DialogTitle>
          </DialogHeader>

          {viewingSale && (
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Customer</p>
                  <p className="text-black font-medium">{viewingSale.customer.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Company</p>
                  <p className="text-black">{viewingSale.customer.company}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <Badge className={`${statusColors[viewingSale.status]} border-0`}>
                    {viewingSale.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-black">{format(new Date(viewingSale.createdAt), 'yyyy-MM-dd')}</p>
                </div>
                {viewingSale.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Notes</p>
                    <p className="text-black bg-gray-50 p-2.5 rounded-lg border border-black/5">
                      {viewingSale.notes}
                    </p>
                  </div>
                )}
                {viewingSale.status === 'CANCELLED' && viewingSale.reason && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Cancellation Reason</p>
                    <p className="text-black bg-red-50 p-2.5 rounded-lg border border-red-100">
                      {viewingSale.reason}
                    </p>
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
                      {viewingSale.items.map((item) => (
                        <tr key={item.id} className="border-t border-black/10">
                          <td className="px-4 py-2 text-black">{item.product.name}</td>
                          <td className="px-4 py-2 text-black">{item.quantity}</td>
                          <td className="px-4 py-2 text-black">AED {item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-black">
                            AED {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {viewingSale && (
            <div className="flex items-center justify-between border-t border-black/10 px-8 py-4 bg-gray-50/50 flex-shrink-0">
              {(viewingSale.status === 'PENDING' || viewingSale.status === 'CONFIRMED') && (
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
                  AED {viewingSale.total.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Order Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl h-[87vh] p-0 flex flex-col overflow-hidden bg-white text-black">
          <DialogHeader className="px-8 py-6 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-black">New Sales Order</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer <span className="text-red-600">*</span></Label>
                <select
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: e.target.value ? Number(e.target.value) : '' })
                  }
                  className="w-full border border-black/20 rounded-lg px-3 py-2.5 text-sm text-black bg-white"
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.company}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Delivery instructions, special requests..."
                  className="border border-black/20 py-5 text-black"
                />
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <Label>Order Items</Label>
                <button
                  onClick={addItem}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Line
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
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-center"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                      className="w-full border border-black/20 rounded-lg px-2 py-2.5 text-sm text-black bg-white"
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="border border-black/20 py-4 text-sm text-center text-black"
                    />

                    <Input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
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
          </div>

          <div className="border-t bg-white px-8 py-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-black">Order Total</p>
              <p className="text-lg font-semibold text-black">AED {formTotal.toLocaleString()}</p>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Button
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="cursor-pointer px-5 py-5 text-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}