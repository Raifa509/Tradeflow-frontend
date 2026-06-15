'use client';

import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
      { product: 'iPhone 15 Pro', quantity: 1, price: 4299 },
      { product: 'LG Washing Machine', quantity: 1, price: 1499 },
      { product: 'Philips Air Fryer XL', quantity: 2, price: 499 },
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
      { product: 'iPad Pro 12.9"', quantity: 1, price: 3999 },
      { product: 'Philips Air Fryer XL', quantity: 3, price: 499 },
    ],
  },
];

type Invoice = typeof dummyInvoices[0];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(dummyInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

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

  const handleMarkPaid = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'PAID' } : inv
    ));
  };

  const handleView = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = invoice.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; color: #1f2937; text-align: left;">${item.product}</td>
        <td style="padding: 12px 16px; color: #1f2937; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 16px; color: #1f2937; text-align: right;">AED ${item.price.toLocaleString()}</td>
        <td style="padding: 12px 16px; color: #1f2937; text-align: right; font-weight: 500;">AED ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const statusBadgeStyle = invoice.status === 'PAID'
      ? 'background-color: #dcfce7; color: #166534;'
      : 'background-color: #fee2e2; color: #991b1b;';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.refNumber}</title>
          <meta charset="utf-8" />
         <style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 40px;
    background-color: #fafafa;
    color: #111827;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .invoice-card {
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
                0 2px 4px -1px rgba(0, 0, 0, 0.03);
    border: 1px solid #f3f4f6;
  }

  @media print {
    body {
      background-color: white;
      padding: 0;
    }

    .invoice-card {
      box-shadow: none;
      border: none;
      border-radius: 0;
      max-width: 100%;
    }

    .no-print {
      display: none !important;
    }
  }
</style>
        </head>
        <body>
          <div class="no-print" style="w: 800px; margin: 0 auto 24px auto; display: flex; justify-content: flex-end;">
            <button onclick="window.print()" style="background-color: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);">
              Print / Save as PDF
            </button>
          </div>
          <div class="invoice-card">
         <div style="text-align:center; margin-bottom:20px;">
  

  <h1
    style="
      margin:0;
      font-size:28px;
      font-weight:800;
      letter-spacing:-0.05em;
      color:#111827;
    "
  >
    TAX INVOICE
  </h1>
</div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;margin-top:15px">
            
              <div>
<img
    src="${window.location.origin}/logo.png"
    alt="TradeFlow Logo"
    style="width:120px; display:block; margin:0 auto 10px -5;"
  />
                <h2 style="margin: 5px 0 6px 0; font-size: 22px; font-weight: 700; color: #111827;">TradeFlow ERP</h2>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Sharjah, United Arab Emirates</p>
                <p style="margin: 2px 0 0 0; font-size: 14px; color: #6b7280;">+971 501234567</p>
              </div>
              <div style="text-align: right;">
               
                <p style="margin: 0; font-family: monospace; font-size: 14px; color: #4b5563; font-weight: 600;">${invoice.refNumber}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Date: ${invoice.createdAt}</p>
                <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; font-size: 12px; font-weight: 600; border-radius: 9999px; ${statusBadgeStyle}">${invoice.status}</span>
              </div>
            </div>

            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 32px; border: 1px solid #f3f4f6;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Bill To</p>
              <p style="margin: 0 0 2px 0; font-size: 16px; font-weight: 600; color: #111827;">${invoice.customer}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">${invoice.company}</p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">Order Ref: <span style="font-family: monospace; font-weight: 600;">${invoice.orderRef}</span></p>
            </div>

            <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead style="background-color: #f9fafb;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <th style="text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 500;">Product</th>
                    <th style="text-align: center; padding: 12px 16px; color: #4b5563; font-weight: 500; width: 60px;">Qty</th>
                    <th style="text-align: right; padding: 12px 16px; color: #4b5563; font-weight: 500; width: 120px;">Unit Price</th>
                    <th style="text-align: right; padding: 12px 16px; color: #4b5563; font-weight: 500; width: 120px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
              <div style="width: 260px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #4b5563;">
                  <span>Subtotal</span>
                  <span style="color: #111827;">AED ${invoice.total.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #4b5563;">
                  <span>VAT (5%)</span>
                  <span style="color: #111827;">AED ${invoice.vat.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0 0 0; font-size: 16px; font-weight: 700; border-top: 1px solid #e5e7eb; color: #111827; margin-top: 6px;">
                  <span>Grand Total</span>
                  <span>AED ${invoice.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; font-weight: 500;">Thank you for your business!</p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1;">TradeFlow ERP • Sharjah, UAE • +971 501234567 </p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search invoices"
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
              : `${status.charAt(0) + status.slice(1).toLowerCase()} (${invoices.filter(inv => inv.status === status).length})`}
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
                    {invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {invoice.vat.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {invoice.grandTotal.toLocaleString()}
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
                      {
                        invoice.status === 'PAID' && (
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
                            title="Open PDF Invoice in New Tab"
                          >
                            <Eye size={15} />
                          </button>
                        )
                      }
                      {invoice.status === 'UNPAID' && (
                        <button
                          onClick={(e) => handleMarkPaid(invoice.id, e)}
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
    </div>
  );
}