"use client";

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  type?: "table" | "cards" | "form";
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 rounded animate-pulse ${className || ""}`}
    />
  );
}

export default function LoadingSkeleton({
  rows = 5,
  columns = 5,
  type = "table",
}: LoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#111111] border border-white/5 rounded-xl p-5 space-y-4"
          >
            <SkeletonPulse className="w-10 h-10 rounded-lg" />
            <SkeletonPulse className="h-8 w-24" />
            <SkeletonPulse className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="space-y-6 max-w-xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
      <div className="border-b border-white/5 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonPulse
              key={i}
              className="h-4 flex-1"
            />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-white/5 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <SkeletonPulse
                key={j}
                className="h-4 flex-1"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
