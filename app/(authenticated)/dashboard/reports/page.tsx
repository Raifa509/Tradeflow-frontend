'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, TrendingUp, Package, ShoppingCart } from 'lucide-react';

// ─── Dummy Sales Data ─────────────────────────────────
const dummySalesReport = [
  { refNumber: 'ORD-2026-001', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 10097, status: 'DELIVERED', date: '2026-01-15' },
  { refNumber: 'ORD-2026-002', customer: 'Fatima Al Zaabi',   company: 'Zaabi Enterprises',      total: 8797,  status: 'DELIVERED', date: '2026-02-10' },
  { refNumber: 'ORD-2026-003', customer: 'Mohammed Hassan',   company: 'Hassan General Trading', total: 6597,  status: 'PENDING',   date: '2026-03-05' },
  { refNumber: 'ORD-2026-004', customer: 'Layla Al Ketbi',    company: 'Ketbi Office Solutions', total: 5497,  status: 'DELIVERED', date: '2026-03-20' },
  { refNumber: 'ORD-2026-005', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 2199,  status: 'CANCELLED', date: '2026-04-01' },
];

// ─── Dummy Inventory Data ─────────────────────────────
const dummyInventoryReport = [
  { refNumber: 'PROD-2026-001', name: 'Samsung 55" Smart TV',     sku: 'ELEC-001', category: 'Electronics', quantity: 25, price: 1899 },
  { refNumber: 'PROD-2026-002', name: 'iPhone 15 Pro',            sku: 'ELEC-002', category: 'Electronics', quantity: 8,  price: 4299 },
  { refNumber: 'PROD-2026-003', name: 'Dell Laptop 15"',          sku: 'ELEC-003', category: 'Electronics', quantity: 12, price: 3499 },
  { refNumber: 'PROD-2026-004', name: 'Sony PlayStation 5',       sku: 'ELEC-004', category: 'Electronics', quantity: 6,  price: 2199 },
  { refNumber: 'PROD-2026-005', name: 'iPad Pro 12.9"',           sku: 'ELEC-005', category: 'Electronics', quantity: 3,  price: 3999 },
  { refNumber: 'PROD-2026-006', name: 'LG Washing Machine 8kg',   sku: 'APPL-001', category: 'Appliances',  quantity: 15, price: 1499 },
  { refNumber: 'PROD-2026-007', name: 'Samsung Refrigerator 500L',sku: 'APPL-002', category: 'Appliances',  quantity: 10, price: 2899 },
  { refNumber: 'PROD-2026-008', name: 'Dyson V15 Vacuum',         sku: 'APPL-003', category: 'Appliances',  quantity: 3,  price: 2199 },
  { refNumber: 'PROD-2026-009', name: 'Bosch Dishwasher 14 Place',sku: 'APPL-004', category: 'Appliances',  quantity: 7,  price: 1799 },
  { refNumber: 'PROD-2026-010', name: 'Philips Air Fryer XL',     sku: 'APPL-005', category: 'Appliances',  quantity: 20, price: 499  },
];

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab]   = useState<'SALES' | 'INVENTORY'>('SALES');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');

  // ─── Filter Sales by Date ─────────────────────────────
  const filteredSales = dummySalesReport.filter(s => {
    if (!startDate && !endDate) return true;
    const date = new Date(s.date);
    const from = startDate ? new Date(startDate) : null;
    const to   = endDate   ? new Date(endDate)   : null;
    if (from && date < from) return false;
    if (to   && date > to)   return false;
    return true;
  });

  // ─── Sales Stats ──────────────────────────────────────
  const deliveredSales  = filteredSales.filter(s => s.status === 'DELIVERED');
  const totalRevenue    = deliveredSales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders     = filteredSales.length;
  const avgOrderValue   = totalOrders > 0 ? totalRevenue / deliveredSales.length : 0;

  // ─── Inventory Stats ──────────────────────────────────
  const totalStockValue = dummyInventoryReport.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount   = dummyInventoryReport.filter(p => p.quantity < 10).length;

  // ─── Export CSV ───────────────────────────────────────
  const exportCSV = () => {
    if (activeTab === 'SALES') {
      const headers = ['Ref No,Customer,Company,Total (AED),Status,Date'];
      const rows = filteredSales.map(s =>
        `${s.refNumber},${s.customer},${s.company},${s.total},${s.status},${s.date}`
      );
      downloadCSV([...headers, ...rows].join('\n'), 'sales-report.csv');
    } else {
      const headers = ['Ref No,Product,SKU,Category,Stock,Price (AED),Stock Value (AED)'];
      const rows = dummyInventoryReport.map(p =>
        `${p.refNumber},${p.name},${p.sku},${p.category},${p.quantity},${p.price},${p.price * p.quantity}`
      );
      downloadCSV([...headers, ...rows].join('\n'), 'inventory-report.csv');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
          {(['SALES', 'INVENTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab === 'SALES' ? 'Sales Report' : 'Inventory Report'}
            </button>
          ))}
        </div>

        {/* Export Button */}
        <Button
          onClick={exportCSV}
          className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 gap-2 cursor-pointer"
        >
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* ── SALES REPORT ── */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">

          {/* Date Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white w-44"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/5  border-white/10 text-white w-44"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-sm cursor-pointer text-gray-400 hover:text-white transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Revenue</p>
                  <p className="text-lg font-bold text-white">
                    AED {totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ShoppingCart size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Orders</p>
                  <p className="text-lg font-bold text-white">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Order Value</p>
                  <p className="text-lg font-bold text-white">
                    AED {avgOrderValue ? avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="rounded-xl border border-white/10 overflow-hidden px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-400">Ref No.</TableHead>
                  <TableHead className="text-gray-400">Customer</TableHead>
                  <TableHead className="text-gray-400">Company</TableHead>
                  <TableHead className="text-gray-400">Total (AED)</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                      No sales found for selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.refNumber} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-blue-400 font-mono text-sm py-3">
                        {sale.refNumber}
                      </TableCell>
                      <TableCell className="text-white font-medium">{sale.customer}</TableCell>
                      <TableCell className="text-gray-300">{sale.company}</TableCell>
                      <TableCell className="text-gray-300">AED {sale.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[sale.status]} border-0`}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{sale.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── INVENTORY REPORT ── */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Package size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Products</p>
                  <p className="text-lg font-bold text-white">{dummyInventoryReport.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Stock Value</p>
                  <p className="text-lg font-bold text-white">
                    AED {totalStockValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Package size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Low Stock Items</p>
                  <p className="text-lg font-bold text-white">{lowStockCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-xl border border-white/10 overflow-hidden px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-400">Ref No.</TableHead>
                  <TableHead className="text-gray-400">Product</TableHead>
                  <TableHead className="text-gray-400">SKU</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">Stock</TableHead>
                  <TableHead className="text-gray-400">Price (AED)</TableHead>
                  <TableHead className="text-gray-400">Stock Value (AED)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyInventoryReport.map((product) => (
                  <TableRow key={product.refNumber} className="border-white/10 hover:bg-white/5">
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
                    <TableCell>
                      <Badge className={product.quantity < 10
                        ? 'bg-red-500/20 text-red-400 border-0'
                        : 'bg-green-500/20 text-green-400 border-0'
                      }>
                        {product.quantity < 10 ? ` ${product.quantity}` : product.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      AED {product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      AED {(product.price * product.quantity).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}