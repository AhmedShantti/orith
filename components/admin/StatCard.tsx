"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
      ? "text-red-400"
      : "text-white/30";

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-5 hover:border-[#c9a84c]/20 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-[#c9a84c]/10 group-hover:bg-[#c9a84c]/15 transition-colors">
          <Icon size={20} className="text-[#c9a84c]" />
        </div>
        {trend !== "neutral" && (
          <span className={`text-xs font-medium ${trendColor}`}>
            {trend === "up" ? "+" : "-"}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#f5f0e8] mb-1">{value}</p>
      <p className="text-sm text-white/40">{title}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${trendColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
