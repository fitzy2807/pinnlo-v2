'use client';

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-gray-100 rounded-full w-16"></div>
        <div className="h-6 bg-gray-100 rounded-full w-20"></div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full p-3 animate-pulse">
      <div className="mb-6">
        <div className="h-3 bg-gray-200 rounded w-12 mb-3"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="h-3 bg-gray-200 rounded w-16 mb-3"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
      
      <div>
        <div className="h-3 bg-gray-200 rounded w-12 mb-3"></div>
        <div className="h-8 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}