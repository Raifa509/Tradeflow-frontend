'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, Power, ShieldAlert, Key, Mail, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';

export default function UsersPage() {
  const [staffList, setStaffList]   = useState<any[]>([]);
  const [search, setSearch]         = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData]     = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [isSaving, setIsSaving]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(true);

  // Get current user role from localStorage
  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id: number) => {
    try {
      await api.put(`/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await api.post('/users', formData);
      setFormData({ name: '', email: '', password: '', role: 'STAFF' });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-4">
          <ShieldAlert size={40} />
        </div>
        <h3 className="text-xl font-bold text-white">Access Restricted</h3>
        <p className="text-gray-400 text-sm max-w-sm mt-2">
          This page is only accessible to Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search staff accounts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setError(''); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          Onboard New Staff
        </button>
      </div>

      <div className="rounded-xl border mt-6 border-white/10 overflow-hidden bg-[#0d1b3e]/40 px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Staff Identity</TableHead>
              <TableHead className="text-gray-400">Email Address</TableHead>
              <TableHead className="text-gray-400">Access Role</TableHead>
              <TableHead className="text-gray-400">System Status</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-10">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-12">No staff found</TableCell></TableRow>
            ) : (
              filtered.map((staff) => (
                <TableRow key={staff.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-white/10">
                        <AvatarFallback className="bg-white/10 text-blue-400 font-bold text-xs">
                          {staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium">{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono text-sm">{staff.email}</TableCell>
                  <TableCell>
                    <Badge className={staff.role === 'ADMIN'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }>
                      <Shield size={12} className="mr-1 inline" /> {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={staff.isActive
                      ? 'bg-green-500/10 text-green-400 border-0'
                      : 'bg-red-500/10 text-red-400 border-0'
                    }>
                      {staff.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {staff.role !== 'ADMIN' ? (
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer transition flex items-center gap-1.5 ml-auto
                          ${staff.isActive
                            ? 'text-red-400 border-red-500/20 hover:bg-red-500/10'
                            : 'text-green-400 border-green-500/20 hover:bg-green-500/10'
                          }`}
                      >
                        <Power size={12} />
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600 italic pr-4">Root Account</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0d1b3e] border border-[#1e2a52] rounded-2xl shadow-2xl z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a52]">
              <h3 className="text-md font-semibold text-white">Add New Staff</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Full Name</label>
                <div className="relative mt-2">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Email Address</label>
                <div className="relative mt-2">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="staff@tradeflow.ae" className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <div className="relative mt-2">
                  <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e2a52]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl cursor-pointer">
                  {isSaving ? 'Saving...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}