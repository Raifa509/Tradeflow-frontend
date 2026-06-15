'use client';

import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Edit2Icon, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
const dummySuppliers = [
  { id: 1, refNumber: 'SUPP-2026-001', name: 'Omar Al Farsi', company: 'TechSupply FZCO', email: 'omar@techsupply.ae', phone: '+971504567890', address: 'Jebel Ali Free Zone, Dubai', isActive: true },
  { id: 2, refNumber: 'SUPP-2026-002', name: 'Rania Mahmoud', company: 'Gulf Import Trading', email: 'rania@gulfimport.ae', phone: '+971556789012', address: 'Hamriyah Free Zone, Sharjah', isActive: true },
  { id: 3, refNumber: 'SUPP-2026-003', name: 'Tariq Al Blooshi', company: 'Al Blooshi Wholesale', email: 'tariq@blooshi.ae', phone: '+971528901234', address: 'Mussafah, Abu Dhabi', isActive: false },
];

type Supplier = typeof dummySuppliers[0];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(dummySuppliers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', address: '',
  });

  const filtered = suppliers.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.refNumber.toLowerCase().includes(search.toLowerCase());

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

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone || !form.company || !form.address) {
      setError('All fields are required');
      return;
    }
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s =>
        s.id === editingSupplier.id ? { ...s, ...form } : s
      ));
    } else {
      setSuppliers(prev => [{
        id: prev.length + 1,
        refNumber: `SUPP-2026-00${prev.length + 1}`,
        ...form,
        isActive: true,
      }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search "
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
            ${statusFilter === status
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            {status === 'ALL' ? `All (${suppliers.length})`
              : status === 'ACTIVE' ? `Active (${suppliers.filter(c => c.isActive).length})`
                : `Inactive (${suppliers.filter(c => !c.isActive).length})`}
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                  No suppliers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((supplier) => (
                <TableRow key={supplier.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-blue-400 font-mono text-sm py-3">
                    {supplier.refNumber}
                  </TableCell>
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
                          <DropdownMenuItem onClick={() => openEditModal(supplier)} className="text-sm cursor-pointer ">
                            <Edit2Icon size={13} />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className=" text-sm cursor-pointer">
                            <Trash2 size={13} />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                      :
                      (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="link"
                              className="text-white text-xs cursor-pointer"
                            >
                              View
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="bg-gray-300">
                            <SheetHeader className="p-6">
                              <SheetTitle>Supplier Details</SheetTitle>
                              <SheetDescription>
                                View Supplier information
                              </SheetDescription>
                            </SheetHeader>

                            <div className="mt-4 space-y-4 px-6 ">
                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Reference No.</p>
                                <p>{supplier.refNumber}</p>
                              </div>

                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p>{supplier.name}</p>
                              </div>

                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Company</p>
                                <p>{supplier.company}</p>
                              </div>

                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p>{supplier.email}</p>
                              </div>

                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p>{supplier.phone}</p>
                              </div>

                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p>{supplier.address}</p>
                              </div>
                              <div className='space-y-1'>
                                <p className="text-sm text-red-700">Reason</p>
                                <p className="text-red-700">Not paying amount correctly</p>
                              </div>
                              <div className='space-y-1'>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant="secondary">
                                  {supplier.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      )
                    }
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
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="space-y-3">
              <div className="space-y-2.5">
                <Label>Full Name <span className="text-red-600">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Company <span className="text-red-600">*</span></Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label>Email <span className="text-red-600">*</span></Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
              <div className="space-y-2.5">
                <Label>Phone <span className="text-red-600">*</span></Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border border-black/20 py-5"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label>Address <span className="text-red-600">*</span></Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="border border-black/20 py-5"
              />
            </div>
            <div className="flex justify-end gap-4 mt-4 mb-2">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer px-5 py-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 cursor-pointer px-5 py-5 rounded-xl hover:bg-blue-700 text-white"
              >
                {editingSupplier ? 'Save Changes' : 'Add Supplier'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}