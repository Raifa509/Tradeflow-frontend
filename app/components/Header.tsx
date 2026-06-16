'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut, ChevronDown, User } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { getStoredUser, logout, UserType } from '@/lib/services/authService';


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
  '/dashboard/users':'Users'
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter()
  const isDashboard = pathname === '/dashboard';
  const pageTitle = pageTitles[pathname] + " " + "Module";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserType | null>(() => getStoredUser());

  useEffect(() => {
    if (!userDetails) {
      router.push('/')
    }
  }, [])
  return (
    <>
      <div className="flex items-center justify-between px-8 py-4">

        {/* Left */}
        <div>
          {isDashboard ? (
            <>
              <h2 className="text-xl font-medium text-white">
                {getGreeting()} , {userDetails?.name}
              </h2>

            </>
          ) : (
            <>
              <h2 className="text-xl font-medium text-white">
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
                  {userDetails?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium tracking-wider text-white">{userDetails?.name}</p>
                <p className="text-xs tracking-wider text-white/80">{
                  userDetails?.role === 'ADMIN' ? 'Admin' : 'Staff'
                }</p>
              </div>

            </button>


          </div>

        </div>

      </div>

    </>
  );
}