'use client';

import { useState } from 'react';
import { Search, UserPlus, Shield, Power, ShieldAlert, Key, Mail, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mocked Initial Staff Data
const initialStaff = [
  { id: 1, name: 'Raifa NP', email: 'admin@tradeflow.ae', role: 'ADMIN', isActive: true },
  { id: 2, name: 'Ahmed Al Mansoori', email: 'ahmed.m@tradeflow.ae', role: 'STAFF', isActive: true },
  { id: 3, name: 'Fatima Al Ali', email: 'fatima.a@tradeflow.ae', role: 'STAFF', isActive: false },
  { id: 4, name: 'Zayan Shafi', email: 'zayan.s@tradeflow.ae', role: 'STAFF', isActive: true },
];

export default function UsersPage() {
  const [currentUserRole] = useState<'ADMIN' | 'STAFF'>('ADMIN');
  // State
  const [staffList, setStaffList] = useState(initialStaff);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // New User Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [isSaving, setIsSaving] = useState(false);

  // Filter Logic
  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(search.toLowerCase()) ||
    staff.email.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle Deactivate / Activate
  const handleToggleStatus = (id: number) => {
    setStaffList(prev => prev.map(staff => 
      staff.id === id ? { ...staff, isActive: !staff.isActive } : staff
    ));
  };

  // Add Staff Handler
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      const newStaffItem = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: true
      };
      
      setStaffList(prev => [newStaffItem, ...prev]);
      setFormData({ name: '', email: '', password: '', role: 'STAFF' });
      setIsSaving(false);
      setIsModalOpen(false);
    }, 600);
  };

  if (currentUserRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-4">
          <ShieldAlert size={40} />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">Access Restricted</h3>
        <p className="text-gray-400 text-sm max-w-sm mt-2 leading-relaxed">
          The User Management core terminal is classified under administrative scopes only. Staff accounts cannot access this viewport.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Top Controller Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search staff accounts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-50  bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          Onboard New Staff
        </button>
      </div>

      {/* Main Staff Registry Table */}
      <div className="rounded-xl border mt-10 border-white/10 overflow-hidden bg-[#0d1b3e]/40 px-4">
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
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                  No personnel profiles matched your execution parameters.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-white/10">
                        <AvatarFallback className="bg-white/10 text-blue-400 font-bold text-xs">
                          {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium">{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono text-sm">{staff.email}</TableCell>
                  <TableCell>
                    <Badge className={
                      staff.role === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }>
                      <Shield size={12} className="mr-1 inline" /> {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      staff.isActive
                        ? 'bg-green-500/10 text-green-400 border-0'
                        : 'bg-red-500/10 text-red-400 border-0'
                    }>
                      {staff.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {staff.id !== 1 ? (
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
                      <span className="text-xs text-gray-600 italic select-none pr-4">Root Account</span>
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
          
          <div className="relative w-full max-w-md bg-[#0d1b3e] border border-[#1e2a52] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a52] bg-[#050b1f]/50">
              <h3 className="text-md font-semibold text-white tracking-wide">Staff Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Full Name</label>
                <div className="relative mt-2">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Email Address</label>
                <div className="relative  mt-2">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@tradeflow.ae"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Access Password</label>
                <div className="relative mt-2">
                  <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-[#1e2a52]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? 'Provisioning...' : 'Confirm Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}