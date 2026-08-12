import React from 'react';

/**
 * Animated skeleton loader for product cards shown during data fetching.
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of product card skeletons for initial page load.
 */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for category bar chips.
 */
export function CategoryBarSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 animate-pulse">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="shrink-0 h-20 w-28 bg-slate-200 rounded-xl"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for the hero banner.
 */
export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[520px] bg-slate-200 animate-pulse overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 p-6">
        <div className="h-8 bg-slate-300 rounded w-1/3 max-w-lg" />
        <div className="h-6 bg-slate-300 rounded w-2/3 max-w-2xl" />
        <div className="h-4 bg-slate-300 rounded w-1/2 max-w-xl" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 bg-slate-300 rounded-xl w-40" />
          <div className="h-12 bg-slate-300 rounded-xl w-40" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page skeleton for the initial app shell.
 */
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col justify-between">
      {/* Top bar skeleton */}
      <div>
        <div className="h-10 bg-emerald-900 animate-pulse" />
        {/* Nav skeleton */}
        <div className="h-16 bg-white border-b border-slate-200 animate-pulse">
          <div className="max-w-[1536px] mx-auto px-6 h-full flex items-center gap-8">
            <div className="h-8 bg-slate-200 rounded w-32" />
            <div className="flex gap-4">
              <div className="h-5 bg-slate-200 rounded w-16" />
              <div className="h-5 bg-slate-200 rounded w-16" />
              <div className="h-5 bg-slate-200 rounded w-16" />
            </div>
          </div>
        </div>
        {/* Hero skeleton */}
        <HeroBannerSkeleton />
        {/* Content skeleton */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8">
          <CategoryBarSkeleton />
          <ProductGridSkeleton count={10} />
        </div>
      </div>
      {/* Footer skeleton */}
      <div className="h-64 bg-slate-800 animate-pulse" />
    </div>
  );
}
