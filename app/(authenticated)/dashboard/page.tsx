'use client';

import { useState } from 'react';
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// ─── Dummy Data ───────────────────────────────────────
const salesChartData = [
  { day: 'Mon', sales: 12000 },
  { day: 'Tue', sales: 19000 },
  { day: 'Wed', sales: 8000  },
  { day: 'Thu', sales: 25000 },
  { day: 'Fri', sales: 31000 },
  { day: 'Sat', sales: 42000 },
  { day: 'Sun', sales: 18000 },
];

const recentOrders = [
  { refNumber: 'ORD-2026-001', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 10097, status: 'DELIVERED' },
  { refNumber: 'ORD-2026-002', customer: 'Fatima Al Zaabi',   company: 'Zaabi Enterprises',      total: 8797,  status: 'CONFIRMED' },
  { refNumber: 'ORD-2026-003', customer: 'Mohammed Hassan',   company: 'Hassan General Trading', total: 6597,  status: 'PENDING'   },
  { refNumber: 'ORD-2026-004', customer: 'Layla Al Ketbi',    company: 'Ketbi Office Solutions', total: 5497,  status: 'DELIVERED' },
  { refNumber: 'ORD-2026-005', customer: 'Khalid Al Rashidi', company: 'Al Rashidi Trading LLC', total: 2199,  status: 'CANCELLED' },
];

const lowStockProducts = [
  { name: 'iPad Pro 12.9"',  sku: 'ELEC-005', quantity: 3  },
  { name: 'Dyson V15 Vacuum', sku: 'APPL-003', quantity: 3  },
  { name: 'iPhone 15 Pro',   sku: 'ELEC-002', quantity: 8  },
  { name: 'Sony PlayStation 5', sku: 'ELEC-004', quantity: 6 },
];

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const stats = [
  {
    label: 'Total Sales This Month',
    value: 'AED 33,187',
    change: '+12.5%',
    positive: true,
    icon: TrendingUp,
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    label: 'Total Orders',
    value: '5',
    change: '+3 this week',
    positive: true,
    icon: ShoppingCart,
    color: 'bg-green-500/20 text-green-400',
  },
  {
    label: 'Total Products',
    value: '10',
    change: '2 categories',
    positive: true,
    icon: Package,
    color: 'bg-purple-500/20 text-purple-400',
  },
  {
    label: 'Low Stock Alerts',
    value: '4',
    change: 'Needs restock',
    positive: false,
    icon: AlertTriangle,
    color: 'bg-red-500/20 text-red-400',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Low Stock */}
      <div className="grid grid-cols-3 gap-4">

        {/* Sales Chart */}
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold">Sales This Week</h3>
            <p className="text-xs text-gray-400">Revenue over last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1b3e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`AED ${value.toLocaleString()}`, 'Sales']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold">⚠️ Low Stock</h3>
            <p className="text-xs text-gray-400">Products below 10 units</p>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.sku}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm text-white font-medium">{product.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-0">
                  {product.quantity} left
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-white font-semibold">Recent Orders</h3>
          <p className="text-xs text-gray-400">Latest 5 orders</p>
        </div>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Ref No.</TableHead>
                <TableHead className="text-gray-400">Customer</TableHead>
                <TableHead className="text-gray-400">Company</TableHead>
                <TableHead className="text-gray-400">Total (AED)</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.refNumber} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {order.refNumber}
                  </TableCell>
                  <TableCell className="text-white font-medium">{order.customer}</TableCell>
                  <TableCell className="text-gray-300">{order.company}</TableCell>
                  <TableCell className="text-gray-300">
                    AED {order.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[order.status]} border-0`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}