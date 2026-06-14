'use client';

import { useState } from 'react';
import { Search, Eye, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const dummyInvoices = [
  {
    id: 1,
    refNumber: 'INV-2026-001',
    orderRef: 'ORD-2026-001',
    customer: 'Khalid Al Rashidi',
    company: 'Al Rashidi Trading LLC',
    total: 10097,
    vat: 504.85,
    grandTotal: 10601.85,
    status: 'PAID',
    createdAt: '2026-01-15',
    items: [
      { product: 'Samsung 55" Smart TV', quantity: 2, price: 1899 },
      { product: 'iPhone 15 Pro',        quantity: 1, price: 4299 },
      { product: 'LG Washing Machine',   quantity: 1, price: 1499 },
      { product: 'Philips Air Fryer XL', quantity: 2, price: 499  },
    ],
  },
  {
    id: 2,
    refNumber: 'INV-2026-002',
    orderRef: 'ORD-2026-004',
    customer: 'Layla Al Ketbi',
    company: 'Ketbi Office Solutions',
    total: 5497,
    vat: 274.85,
    grandTotal: 5771.85,
    status: 'UNPAID',
    createdAt: '2026-03-20',
    items: [
      { product: 'iPad Pro 12.9"',       quantity: 1, price: 3999 },
      { product: 'Philips Air Fryer XL', quantity: 3, price: 499  },
    ],
  },
];

type Invoice = typeof dummyInvoices[0];

export default function InvoicesPage() {
  const [invoices, setInvoices]         = useState(dummyInvoices);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen]     = useState(false);

  const filtered = invoices.filter(inv => {
    const matchesSearch =
      inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.company.toLowerCase().includes(search.toLowerCase()) ||
      inv.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderRef.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleMarkPaid = (id: number) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'PAID' } : inv
    ));
    if (viewingInvoice?.id === id) {
      setViewingInvoice(prev => prev ? { ...prev, status: 'PAID' } : null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center rounded-xl p-1 mt-6 gap-1">
        {(['ALL', 'PAID', 'UNPAID'] as const).map((status) => (
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
              ? `All (${invoices.length})`
              : `${status} (${invoices.filter(inv => inv.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl mt-6 border border-white/10 overflow-hidden px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Invoice No.</TableHead>
              <TableHead className="text-gray-400">Order Ref</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Total (AED)</TableHead>
              <TableHead className="text-gray-400">VAT (5%)</TableHead>
              <TableHead className="text-gray-400">Grand Total</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-400 py-10">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((invoice) => (
                <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {invoice.refNumber}
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono text-sm">
                    {invoice.orderRef}
                  </TableCell>
                  <TableCell className="text-white font-medium">{invoice.customer}</TableCell>
                  <TableCell className="text-gray-300">{invoice.company}</TableCell>
                  <TableCell className="text-gray-300">
                    AED {invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    AED {invoice.vat.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    AED {invoice.grandTotal.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={invoice.status === 'PAID'
                      ? 'bg-green-500/20 text-green-400 border-0'
                      : 'bg-red-500/20 text-red-400 border-0'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{invoice.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(invoice)}
                        className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                      >
                        <Eye size={15} />
                      </button>
                      {invoice.status === 'UNPAID' && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="text-xs text-green-400 hover:text-green-300 cursor-pointer border border-green-400/30 px-2 py-1 rounded-lg transition"
                        >
                          Mark Paid
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

      {/* View Invoice Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl px-8 py-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Invoice — {viewingInvoice?.refNumber}
              </DialogTitle>
              <div className="flex items-center gap-2 mr-6">
                {viewingInvoice?.status === 'UNPAID' && (
                  <Button
                    onClick={() => handleMarkPaid(viewingInvoice.id)}
                    className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 gap-2 text-sm cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    Mark as Paid
                  </Button>
                )}
                <Button
                  onClick={handlePrint}
                  className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-sm cursor-pointer"
                >
                  🖨️ Print
                </Button>
              </div>
            </div>
          </DialogHeader>

          {viewingInvoice && (
            <div className="space-y-6 mt-2">

              {/* Company Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-black">🏢 TradeFlow ERP</h2>
                  <p className="text-sm text-gray-500">Ajman, United Arab Emirates</p>
                  <p className="text-sm text-gray-500">admin@tradeflow.ae</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black">INVOICE</p>
                  <p className="text-sm text-gray-500 font-mono">{viewingInvoice.refNumber}</p>
                  <p className="text-sm text-gray-500">Date: {viewingInvoice.createdAt}</p>
                  <Badge className={viewingInvoice.status === 'PAID'
                    ? 'bg-green-500/20 text-green-600 border-0 mt-1'
                    : 'bg-red-500/20 text-red-600 border-0 mt-1'
                  }>
                    {viewingInvoice.status}
                  </Badge>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bill To</p>
                <p className="text-black font-semibold">{viewingInvoice.customer}</p>
                <p className="text-gray-600 text-sm">{viewingInvoice.company}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Order Ref: {viewingInvoice.orderRef}
                </p>
              </div>

              {/* Items Table */}
              <div className="border border-black/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                      <th className="text-center px-4 py-3 text-gray-500 font-medium">Qty</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Unit Price</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.items.map((item, i) => (
                      <tr key={i} className="border-t border-black/10">
                        <td className="px-4 py-3 text-black">{item.product}</td>
                        <td className="px-4 py-3 text-black text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-black text-right">
                          AED {item.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-black text-right font-medium">
                          AED {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-black">AED {viewingInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">VAT (5%)</span>
                    <span className="text-black">AED {viewingInvoice.vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-black/10 pt-2">
                    <span className="text-black">Grand Total</span>
                    <span className="text-black">
                      AED {viewingInvoice.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-black/10 pt-4 text-center">
                <p className="text-xs text-gray-400">
                  Thank you for your business! Payment is due within 30 days.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  TradeFlow ERP • Ajman, UAE • admin@tradeflow.ae
                </p>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}