"use client";

import React from "react";

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`bg-obsidian/[0.06] animate-pulse ${className}`} />;
}

export default function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" aria-hidden="true">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 flex-1 last:flex-none">
            <Pulse className="w-9 h-9 rounded-full" />
            <Pulse className="h-3 w-16 hidden md:block" />
            {i < 4 && <Pulse className="flex-1 h-px mx-4 hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <Pulse className="h-4 w-24 mb-3" />
          <Pulse className="h-9 w-64 mb-10" />
          <div className="space-y-5">
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
          </div>
        </div>
        <div className="bg-[#FBF8F2] border border-obsidian/12 p-7">
          <Pulse className="h-5 w-32 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-4">
              <Pulse className="w-10 h-10" />
              <Pulse className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
