'use client'
import React from 'react'
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  PackageSearch,
  FileText,
  BarChart3,
  LogOut,
  BookUser,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { label: 'Customers', href: '/dashboard/customers', icon: Users },
  { label: 'Users', href: '/dashboard/users', icon: BookUser },
  { label: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
  { label: 'Sales Orders', href: '/dashboard/sales', icon: ShoppingCart },
  { label: 'Purchase Orders', href: '/dashboard/purchases', icon: PackageSearch },
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen py-6 px-4">
      {/* logo */}
      <img
        src="/logo.png"
        alt="Login Image"
        className="w-40 ms-4"
      />
      <Separator className="bg-[#1e2a52] mt-5" />
      {/* nav links */}
      <nav className="flex-1 space-y-1 mt-12">
        {
          navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                    ? 'bg-blue-800/50 text-white shadow-md'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
                {link.label === 'Inventory' && (
                  <Badge className="ml-auto bg-red-500/20 text-red-300 text-xs border-0">
                    Low
                  </Badge>
                )}
              </Link>
            )
          })
        }
      </nav>
      <Separator className="bg-[#1e2a52] my-5" />
      <button
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
      >
        <LogOut size={18} />
        Logout
      </button>

    </div>
  )
}

export default Sidebar