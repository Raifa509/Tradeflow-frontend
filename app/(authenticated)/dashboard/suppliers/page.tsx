'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit2Icon, MoreHorizontal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/lib/services/suppliersService';
import { getStoredUser } from '@/lib/services/authService';

type Supplier = {
  id: number;
  refNumber: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  reason?: string;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', address: '',
  });
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [supplierToDeactivate, setSupplierToDeactivate] = useState<Supplier | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setUserRole(user.role);
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(s => {
    const matchesSearch =
      (s.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.company?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.phone?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.address?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.refNumber?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? s.isActive : !s.isActive;

    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm({ name: '', company: '', email: '', phone: '', address: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name, company: supplier.company,
      email: supplier.email, phone: supplier.phone, address: supplier.address,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.company || !form.address) {
      setError('All fields are required');
      return;
    }
    try {
      setError('');
      setSubmitting(true);
      if (editingSupplier) {
        const updated = await updateSupplier(editingSupplier.id, form);
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updated : s));
      } else {
        const created = await createSupplier(form);
        setSuppliers(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred while saving the supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDeactivateFlow = (supplier: Supplier) => {
    setSupplierToDeactivate(supplier);
    setCancelReason('');
    setCancelError('');
    setIsCancelOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!supplierToDeactivate) return;
    if (!cancelReason.trim()) {
      setCancelError('Please provide a reason for deactivation.');
      return;
    }
    try {
      setCanceling(true);
      setCancelError('');
      await deleteSupplier(supplierToDeactivate.id);
      setSuppliers(prev => prev.map(s =>
        s.id === supplierToDeactivate.id ? { ...s, isActive: false, reason: cancelReason } : s
      ));
      setIsCancelOpen(false);
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || 'Failed to deactivate supplier.');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          onClick={openAddModal}
          className="bg-blue-800 cursor-pointer hover:bg-blue-800/80 text-white gap-1 py-5 px-3 rounded-xl"
        >
          <Plus size={16} />
          Add Supplier
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center rounded-xl p-1 mt-10">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all
              ${statusFilter === status ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            {status === 'ALL' ? `All (${suppliers.length})`
              : status === 'ACTIVE' ? `Active (${suppliers.filter(s => s.isActive).length})`
                : `Inactive (${suppliers.filter(s => !s.isActive).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl mt-8 border border-white/10 overflow-hidden px-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Ref No.</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Phone</TableHead>
              <TableHead className="text-gray-400">Address</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading suppliers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <p className="text-red-400">{fetchError}</p>
                  <button onClick={fetchSuppliers} className="text-blue-400 text-sm mt-2 hover:underline">
                    Try again
                  </button>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                  No suppliers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((supplier) => (
                <TableRow key={supplier.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">{supplier.refNumber}</TableCell>
                  <TableCell className="text-white font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-gray-300">{supplier.company}</TableCell>
                  <TableCell className="text-gray-300">{supplier.email}</TableCell>
                  <TableCell className="text-gray-300">{supplier.phone}</TableCell>
                  <TableCell className="text-gray-300">{supplier.address}</TableCell>
                  <TableCell>
                    <Badge className={supplier.isActive
                      ? 'bg-green-500/20 text-green-400 border-0'
                      : 'bg-red-500/20 text-red-400 border-0'
                    }>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.isActive ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1">
                          <DropdownMenuItem onClick={() => openEditModal(supplier)} className="text-sm cursor-pointer gap-2">
                            <Edit2Icon size={13} />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            {...(userRole === 'ADMIN' && { onClick: () => triggerDeactivateFlow(supplier) })}
                            className={`text-sm gap-2 text-red-400 focus:text-red-400 ${userRole === 'ADMIN' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                          >
                            <Trash2 size={13} />Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Sheet>
                        <SheetTrigger className="text-white text-xs cursor-pointer hover:underline bg-transparent border-0 p-0">
                        View
                        </SheetTrigger>
                        <SheetContent className="bg-gray-300">
                          <SheetHeader className="p-6">
                            <SheetTitle>Supplier Details</SheetTitle>
                            <SheetDescription>View supplier information</SheetDescription>
                          </SheetHeader>
                          <div className="mt-4 space-y-4 px-6">
                            {[
                              { label: 'Reference No.', value: supplier.refNumber },
                              { label: 'Name', value: supplier.name },
                              { label: 'Company', value: supplier.company },
                              { label: 'Email', value: supplier.email },
                              { label: 'Phone', value: supplier.phone },
                              { label: 'Address', value: supplier.address },
                              { label: 'Reason', value: supplier.reason },
                            ].map(({ label, value }) => (
                              <div key={label} className="space-y-1">
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-gray-900 font-medium">{value ?? '-'}</p>
                              </div>
                            ))}
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge variant="secondary">{supplier.isActive ? 'Active' : 'Inactive'}</Badge>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="space-y-3">
              <div className="space-y-2.5">
                <Label className="text-black">Full Name <span className="text-red-600">*</span></Label>
                <Input disabled={submitting} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-black/20 text-black py-5" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-black">Company <span className="text-red-600">*</span></Label>
                <Input disabled={submitting} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="border border-black/20 text-black py-5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-black">Email <span className="text-red-600">*</span></Label>
                <Input disabled={submitting} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-black/20 text-black py-5" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-black">Phone <span className="text-red-600">*</span></Label>
                <Input disabled={submitting} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-black/20 text-black py-5" />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="text-black">Address <span className="text-red-600">*</span></Label>
              <Input disabled={submitting} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border border-black/20 text-black py-5" />
            </div>
            <div className="flex justify-end gap-4 mt-4 mb-2">
              <Button variant="ghost" disabled={submitting} onClick={() => setIsModalOpen(false)} className="cursor-pointer px-5 py-5">Cancel</Button>
              <Button disabled={submitting} onClick={handleSubmit} className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white min-w-[120px]">
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : editingSupplier ? 'Save Changes' : 'Add Supplier'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Modal */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">
              Deactivate Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {cancelError && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{cancelError}</p>
            )}
            <div className="space-y-2">
              <Label className="text-gray-700">
                Reason for deactivation <span className="text-red-500">*</span>
              </Label>
              <Input
                disabled={canceling}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Contract ended / supplier no longer active"
                className="border border-black/20 py-5 text-black"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" disabled={canceling} onClick={() => setIsCancelOpen(false)} className="cursor-pointer px-5 py-5 text-gray-500 hover:bg-gray-100">
                Go Back
              </Button>
              <Button disabled={canceling} onClick={handleDeactivateConfirm} className="bg-red-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-red-700 text-white min-w-[140px]">
                {canceling ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : 'Confirm Inactive'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}