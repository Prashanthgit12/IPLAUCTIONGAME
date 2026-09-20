import React from 'react';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-lg-4 col-md-6 col-12">
          <div className="glass-card p-4 h-100">
            <div className="skeleton-shimmer mb-3" style={{ height: '200px', width: '100%' }}></div>
            <div className="skeleton-shimmer mb-2" style={{ height: '24px', width: '70%' }}></div>
            <div className="skeleton-shimmer mb-4" style={{ height: '16px', width: '40%' }}></div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton-shimmer" style={{ height: '20px', width: '35%' }}></div>
              <div className="skeleton-shimmer" style={{ height: '36px', width: '30%', borderRadius: '8px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="glass-card p-4">
      <div className="skeleton-shimmer mb-4" style={{ height: '30px', width: '25%' }}></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="d-flex gap-3 mb-3">
          <div className="skeleton-shimmer" style={{ height: '24px', width: '20%' }}></div>
          <div className="skeleton-shimmer" style={{ height: '24px', width: '40%' }}></div>
          <div className="skeleton-shimmer" style={{ height: '24px', width: '20%' }}></div>
          <div className="skeleton-shimmer" style={{ height: '24px', width: '20%' }}></div>
        </div>
      ))}
    </div>
  );
};
