import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-orange-50 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-100 rounded"></div>
        </div>
        <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <div className="h-3 w-16 bg-gray-100 rounded"></div>
            <div className="h-3 w-16 bg-gray-100 rounded"></div>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded-full"></div>
        </div>

        <div className="pt-2">
          <div className="h-16 w-full bg-gray-50 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
