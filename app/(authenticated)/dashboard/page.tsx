'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Sales This Month',
      value: `AED ${(stats?.totalSalesThisMonth || 0).toLocaleString()}`,
      change: 'Delivered orders only',
      positive: true,
      icon: TrendingUp,
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: 'All statuses',
      positive: true,
      icon: ShoppingCart,
      color: 'bg-green-500/20 text-green-400',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      change: '2 categories',
      positive: true,
      icon: Package,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      label: 'Low Stock Alerts',
      value: stats?.lowStockCount || 0,
      change: 'Below 10 units',
      positive: false,
      icon: AlertTriangle,
      color: 'bg-red-500/20 text-red-400',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
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
            <AreaChart data={stats?.salesChart || []}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1b3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [`AED ${value.toLocaleString()}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold">⚠️ Low Stock</h3>
            <p className="text-xs text-gray-400">Products below 10 units</p>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-gray-400 text-sm">No low stock items</p>
            ) : (
              stats?.recentOrders?.slice(0, 4).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{order.customer?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{order.refNumber}</p>
                  </div>
                  <Badge className={`${statusColors[order.status]} border-0`}>
                    {order.status}
                  </Badge>
                </div>
              ))
            )}
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
              {stats?.recentOrders?.map((order: any) => (
                <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">{order.refNumber}</TableCell>
                  <TableCell className="text-white font-medium">{order.customer?.name}</TableCell>
                  <TableCell className="text-gray-300">{order.customer?.company}</TableCell>
                  <TableCell className="text-gray-300">AED {order.total?.toLocaleString()}</TableCell>
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