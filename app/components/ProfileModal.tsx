'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building, MapPin, Shield, Save, Lock, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Raifa NP',
    email: 'admin@tradeflow.ae',
    role: 'Admin',
    company: 'TradeFlow ERP',
    location: 'Sharjah , United Arab Emirates',
  });

  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose(); 
    }, 800);
  };

  // Modal content layout template
  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose} 
      />

      {/* Modal Box Container */}
      <div className="relative w-full max-w-2xl bg-[#0d1b3e] border border-[#1e2a52] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Header Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a52] bg-[#050b1f]/50">
          <div className="flex items-center gap-2 text-white">
            <User size={18} className="text-blue-400" />
            <h2 className="text-md font-semibold tracking-wide">Account Profile</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body Wrap */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Avatar and Identity Status summary section */}
          <div className="flex items-center gap-5 p-4 bg-[#050b1f]/40 border border-[#1e2a52] rounded-xl">
            <Avatar className="w-16 h-16 border border-blue-500/20">
              <AvatarFallback className="bg-white/10 text-white font-bold text-lg">
                RA
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">{profile.name}</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-medium py-0 px-2">
                  <Shield size={10} className="mr-1 inline" /> {profile.role}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 font-mono">{profile.email}</p>
            </div>
          </div>

          {/* Form Input Fields Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Full Name</label>
              <div className="relative mt-2">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Email Address</label>
              <div className="relative mt-2">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Organization</label>
              <div className="relative mt-2">
                <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <Input
                  value={profile.company}
                  disabled
                  className="pl-9 bg-white/5 border-white/5 text-gray-200 cursor-not-allowed select-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Location</label>
              <div className="relative mt-2">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          {/* Core System Security Info Notification */}
          <div className="bg-[#050b1f]/30 border border-[#1e2a52] rounded-xl p-4 flex items-start gap-3">
            <Lock size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Your profile changes apply instantly to system transactions. Scope metrics are configured under core UAE regional calculations (VAT 5%).
            </p>
          </div>

          {/* Action Call Controls Footer */}
          <div className="flex justify-end gap-3 pt-4 mt-10 border-t border-[#1e2a52]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save size={14} />
              {isSaving ? 'Saving Changes...' : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}