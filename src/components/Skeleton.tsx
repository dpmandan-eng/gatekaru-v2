import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  key?: React.Key;
}

/**
 * Base animated shimmer / pulse skeleton block
 */
export function SkeletonBase({ className = "", style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-800/60 rounded-xl relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-slate-700/20 to-transparent" />
    </div>
  );
}

/**
 * Skeleton for single statistic metric cards (e.g., Active Users, CPU, Visitors)
 */
export function StatCardSkeleton({ className = "" }: SkeletonProps = {}) {
  return (
    <div className={`bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-4 space-y-3 shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-4 w-28" />
        <SkeletonBase className="h-8 w-8 rounded-xl" />
      </div>
      <SkeletonBase className="h-7 w-20" />
      <div className="flex items-center justify-between pt-1">
        <SkeletonBase className="h-3 w-24" />
        <SkeletonBase className="h-4 w-12 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for enterprise core pillar cards
 */
export function PillarCardSkeleton({ className = "" }: SkeletonProps = {}) {
  return (
    <div className={`bg-[#0c1439] border border-[#203273] rounded-2xl p-4 space-y-3 shadow-xl ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-3 w-20" />
        <SkeletonBase className="h-4 w-4 rounded-full" />
      </div>
      <SkeletonBase className="h-6 w-24" />
      <SkeletonBase className="h-3 w-16" />
      <SkeletonBase className="h-4 w-16 rounded-full" />
    </div>
  );
}

/**
 * Skeleton for Chart & Telemetry Visualization Cards
 */
export function ChartCardSkeleton({ title = "Loading Chart Metrics..." }: { title?: string }) {
  return (
    <div className="bg-[#0b1029]/90 border border-[#1e2a5e] rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1c2858] pb-3">
        <div className="space-y-1">
          <SkeletonBase className="h-4 w-40" />
          <SkeletonBase className="h-3 w-64" />
        </div>
        <SkeletonBase className="h-6 w-20 rounded-lg" />
      </div>

      {/* Chart Canvas Placeholder */}
      <div className="h-48 w-full bg-[#070b1a] rounded-xl p-4 flex items-end justify-between gap-2 border border-[#182552]">
        {[40, 65, 30, 85, 55, 90, 70, 45, 80, 60, 95, 75].map((heightPct, idx) => (
          <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full gap-2">
            <SkeletonBase
              className="w-full rounded-t-md"
              style={{ height: `${heightPct}%` }}
            />
            <SkeletonBase className="h-2 w-full rounded" />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <SkeletonBase className="h-3 w-32" />
        <SkeletonBase className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Activity & Data Lists (Recent Activities, Visitors, Logs)
 */
export function ListCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1c2858] pb-3">
        <SkeletonBase className="h-5 w-36" />
        <SkeletonBase className="h-6 w-24 rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#070b1a] border border-[#172450] rounded-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <SkeletonBase className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <SkeletonBase className="h-3.5 w-32" />
                <SkeletonBase className="h-2.5 w-48" />
              </div>
            </div>
            <SkeletonBase className="h-6 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Full Dashboard Skeleton Layout
 */
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e295d] pb-4">
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-48" />
          <SkeletonBase className="h-7 w-72" />
          <SkeletonBase className="h-3 w-96" />
        </div>
        <SkeletonBase className="h-8 w-44 rounded-xl" />
      </div>

      {/* Pillars / Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <PillarCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Area (Chart + Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCardSkeleton />
        </div>
        <div>
          <ListCardSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}

export default DashboardGridSkeleton;
