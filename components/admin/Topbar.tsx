"use client";

import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  adminName: string;
}

export default function Topbar({ title, adminName }: TopbarProps) {
  return (
    <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-[#f5f0e8] tracking-wide">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-[#f5f0e8] placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/50 w-56 transition-colors"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell size={18} className="text-white/40" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c9a84c] rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] text-xs font-bold">
          {adminName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
