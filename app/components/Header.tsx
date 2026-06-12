'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const pageTitles: Record<string, string> = {
  '/dashboard/inventory': 'Inventory',
  '/dashboard/customers': 'Customers',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/sales': 'Sales Orders',
  '/dashboard/purchases': 'Purchase Orders',
  '/dashboard/invoices': 'Invoices',
  '/dashboard/reports': 'Reports',
};

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
  const pageTitle = pageTitles[pathname];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-8 py-4">

      {/* Left */}
      <div>
        {isDashboard ? (
          <>
            <h2 className="text-xl font-medium text-white">
              {getGreeting()} , Raifa !
            </h2>

          </>
        ) : (
          <>
            <h2 className="text-md font-medium text-white">
              {pageTitle}
            </h2>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center bg-[#050b1f] rounded-full px-4 py-1.5 gap-3 cursor-pointer"
          >
            <Avatar className="w-9.5 h-9.5">
              <AvatarFallback className="bg-white/10  text-blue-800/90 font-semibold text-md">
                RA
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium tracking-wider text-white">Raifa NP</p>
              <p className="text-xs tracking-wider text-white/80">Admin</p>
            </div>
            <ChevronDown size={17} className="text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-5 top-14 w-50 bg-[#0d1b3e] border border-[#1e2a52] rounded-lg shadow-lg z-50 py-1">
              <div className="px-3 py-2 text-xs text-white/70 border-b border-[#1e2a52]">
                My Account
              </div>
              <button className="flex cursor-pointer items-center gap-2 w-full px-3 py-2.5 text-sm text-white hover:bg-white/10 transition">
                <User size={14} />
                Profile
              </button>
              <button className="flex cursor-pointer items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}