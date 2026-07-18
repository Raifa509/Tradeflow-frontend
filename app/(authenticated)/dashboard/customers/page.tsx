'use client'
import React, { useEffect, useState } from 'react'
import { Search, Plus, Trash2, MoreHorizontal, Edit2Icon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getAllCustomers, createCustomer, updateCustomer } from '@/lib/services/customersService';
import { getStoredUser } from '@/lib/services/authService';

type Customer = {
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

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', address: '',
  })
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [customerToDeactivate, setCustomerToDeactivate] = useState<Customer | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setUserRole(user.role);
    }

    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };



  const filteredCustomers = customers.filter(item => {
    const matchesSearch =
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.company?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.phone?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.address?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.refNumber?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? item.isActive : !item.isActive;

    return matchesSearch && matchesStatus;
  });


  const triggerDeactivateFlow = (customer: Customer) => {
    setCustomerToDeactivate(customer);
    setCancelReason('');
    setCancelError('');
    setIsCancelOpen(true);
  };
  const handleCancelConfirm = async () => {
    if (!customerToDeactivate) return;
    if (!cancelReason.trim()) {
      setCancelError('Please provide a reason for deactivation.');
      return;
    }
    try {
      setCanceling(true);
      setCancelError('');

      const updatedCustomer = await updateCustomer(customerToDeactivate.id, {
        isActive: false,
        reason: cancelReason
      });

      setCustomers(prev => prev.map(c => c.id === customerToDeactivate.id ? updatedCustomer : c));
      setIsCancelOpen(false);
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || 'Failed to deactivate customer.');
    } finally {
      setCanceling(false);
    }
  };
  const openAddModal = () => {
    setEditingCustomer(null);
    setForm({ name: '', company: '', email: '', phone: '', address: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name, email: customer.email,
      phone: customer.phone, company: customer.company, address: customer.address,
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

      if (editingCustomer) {
        const updatedData = await updateCustomer(editingCustomer.id, form);
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedData : c));
      } else {
        const newCustomerData = await createCustomer(form);
        setCustomers(prev => [newCustomerData, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred while saving the customer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 py-4 w-80 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-blue-800 cursor-pointer hover:bg-blue-800/80 text-white gap-1 py-5 px-3 rounded-xl"
        >
          <Plus size={16} />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center rounded-xl p-1 mt-10">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all
              ${statusFilter === status ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            {status === 'ALL' ? `All (${customers.length})`
              : status === 'ACTIVE' ? `Active (${customers.filter(c => c.isActive).length})`
                : `Inactive (${customers.filter(c => !c.isActive).length})`}
          </button>
        ))}
      </div>

      {/* table */}
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
                    <span>Loading customers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <p className="text-red-400">{fetchError}</p>
                  <button onClick={fetchCustomers} className="text-blue-400 text-sm mt-2 hover:underline">
                    Try again
                  </button>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">{customer.refNumber}</TableCell>
                  <TableCell className="text-white font-medium">{customer.name}</TableCell>
                  <TableCell className="text-gray-300">{customer.company}</TableCell>
                  <TableCell className="text-gray-300">{customer.email}</TableCell>
                  <TableCell className="text-gray-300">{customer.phone}</TableCell>
                  <TableCell className="text-gray-300">{customer.address}</TableCell>
                  <TableCell>
                    <Badge className={customer.isActive
                      ? 'bg-green-500/20 text-green-400 border-0'
                      : 'bg-red-500/20 text-red-400 border-0'
                    }>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.isActive ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1">
                          <DropdownMenuItem onClick={() => openEditModal(customer)} className="text-sm cursor-pointer gap-2">
                            <Edit2Icon size={13} />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem {...userRole === 'ADMIN' && {
                            onClick: () => triggerDeactivateFlow(customer)
                          }} className={`text-sm  gap-2 text-red-400 focus:text-red-400 ${userRole === 'ADMIN' ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
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
                            <SheetTitle>Customer Details</SheetTitle>
                            <SheetDescription>View customer information</SheetDescription>
                          </SheetHeader>
                          <div className="mt-4 space-y-4 px-6">
                            {[
                              { label: 'Reference No.', value: customer.refNumber },
                              { label: 'Name', value: customer.name },
                              { label: 'Company', value: customer.company },
                              { label: 'Email', value: customer.email },
                              { label: 'Phone', value: customer.phone },
                              { label: 'Address', value: customer.address },
                              { label: "Reason", value: customer.reason }
                            ].map(({ label, value }) => (
                              <div key={label} className="space-y-1">
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-gray-900 font-medium">{value}</p>
                              </div>
                            ))}
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge variant="secondary">{customer.isActive ? 'Active' : 'Inactive'}</Badge>
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="mt-5 space-y-3">
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
            <div className="flex justify-end gap-4 mt-15 mb-2">
              <Button variant="ghost" disabled={submitting} onClick={() => setIsModalOpen(false)} className="cursor-pointer px-5 py-5">Cancel</Button>
              <Button disabled={submitting} onClick={handleSubmit} className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white min-w-[120px]">
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : editingCustomer ? 'Save Changes' : 'Add Customer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Deactivate/Cancel Customer Status Modal */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">
              Deactivate Customer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {cancelError && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                {cancelError}
              </p>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700">
                Reason for deactivation <span className="text-red-500">*</span>
              </Label>
              <Input
                disabled={canceling}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Account no longer active / requested closure"
                className="border border-black/20 py-5 text-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button
                variant="ghost"
                disabled={canceling}
                onClick={() => setIsCancelOpen(false)}
                className="cursor-pointer px-5 py-5 text-gray-500 hover:bg-gray-100"
              >
                Go Back
              </Button>
              <Button
                disabled={canceling}
                onClick={handleCancelConfirm}
                className="bg-red-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-red-700 text-white min-w-[140px]"
              >
                {canceling ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Confirm Inactive'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CustomersPage;