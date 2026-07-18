'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab]       = useState<'SALES' | 'INVENTORY'>('SALES');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [salesData, setSalesData]       = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [loading, setLoading]           = useState(false);

  // Fetch Sales Report
  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/reports/sales', { params });
      setSalesData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Inventory Report
  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/inventory');
      setInventoryData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'SALES') fetchSalesReport();
    else fetchInventoryReport();
  }, [activeTab]);

  // Stats
  const totalRevenue  = salesData.reduce((sum, s) => sum + s.total, 0);
  const totalOrders   = salesData.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalStockValue = inventoryData?.totalValue || 0;
  const lowStockCount   = inventoryData?.products?.filter((p: any) => p.quantity < 10).length || 0;

  // Export CSV
  const exportCSV = () => {
    if (activeTab === 'SALES') {
      const headers = ['Ref No,Customer,Company,Total (AED),Status,Date'];
      const rows = salesData.map(s =>
        `${s.refNumber},${s.customer?.name},${s.customer?.company},${s.total},${s.status},${new Date(s.createdAt).toLocaleDateString()}`
      );
      downloadCSV([...headers, ...rows].join('\n'), 'sales-report.csv');
    } else {
      const headers = ['Ref No,Product,SKU,Category,Stock,Price (AED),Stock Value (AED)'];
      const rows = (inventoryData?.products || []).map((p: any) =>
        `${p.refNumber},${p.name},${p.sku},${p.category},${p.quantity},${p.price},${p.price * p.quantity}`
      );
      downloadCSV([...headers, ...rows].join('\n'), 'inventory-report.csv');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
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
                ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              {tab === 'SALES' ? 'Sales Report' : 'Inventory Report'}
            </button>
          ))}
        </div>
        <Button onClick={exportCSV} className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 gap-2 cursor-pointer">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* SALES REPORT */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">From:</span>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white/5 border-white/10 text-white w-44" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">To:</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white/5 border-white/10 text-white w-44" />
            </div>
            <Button onClick={fetchSalesReport} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              Apply Filter
            </Button>
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); fetchSalesReport(); }} className="text-sm cursor-pointer text-gray-400 hover:text-white">
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-500/20 text-blue-400' },
              { label: 'Total Orders',  value: totalOrders, icon: ShoppingCart, color: 'bg-green-500/20 text-green-400' },
              { label: 'Avg Order Value', value: `AED ${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'bg-purple-500/20 text-purple-400' },
            ].map(card => (
              <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{card.label}</p>
                    <p className="text-lg font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-10">Loading...</TableCell></TableRow>
                ) : salesData.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-10">No sales found</TableCell></TableRow>
                ) : (
                  salesData.map((sale) => (
                    <TableRow key={sale.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-blue-400 font-mono text-sm py-3">{sale.refNumber}</TableCell>
                      <TableCell className="text-white font-medium">{sale.customer?.name}</TableCell>
                      <TableCell className="text-gray-300">{sale.customer?.company}</TableCell>
                      <TableCell className="text-gray-300">AED {sale.total?.toLocaleString()}</TableCell>
                      <TableCell><Badge className={`${statusColors[sale.status]} border-0`}>{sale.status}</Badge></TableCell>
                      <TableCell className="text-gray-300">{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Products',   value: inventoryData?.products?.length || 0,       icon: Package,    color: 'bg-blue-500/20 text-blue-400'  },
              { label: 'Total Stock Value', value: `AED ${totalStockValue.toLocaleString()}`,  icon: TrendingUp, color: 'bg-green-500/20 text-green-400' },
              { label: 'Low Stock Items',  value: lowStockCount,                               icon: Package,    color: 'bg-red-500/20 text-red-400'    },
            ].map(card => (
              <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{card.label}</p>
                    <p className="text-lg font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-10">Loading...</TableCell></TableRow>
                ) : (
                  (inventoryData?.products || []).map((product: any) => (
                    <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-blue-400 font-mono text-sm py-3">{product.refNumber}</TableCell>
                      <TableCell className="text-white font-medium">{product.name}</TableCell>
                      <TableCell className="text-gray-300 font-mono">{product.sku}</TableCell>
                      <TableCell><Badge className="bg-blue-500/20 text-blue-400 border-0">{product.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={product.quantity < 10 ? 'bg-red-500/20 text-red-400 border-0' : 'bg-green-500/20 text-green-400 border-0'}>
                          {product.quantity < 10 ? `⚠️ ${product.quantity}` : product.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">AED {product.price?.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">AED {(product.price * product.quantity)?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}