import React from 'react';

interface StatusBadgeProps {
  status: string;
  type: 'customer' | 'challan' | 'stock' | 'product';
}

export const StatusBadge = ({ status, type }: StatusBadgeProps) => {
  const getStyles = () => {
    if (type === 'customer') {
      switch (status) {
        case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'LEAD': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'INACTIVE': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      }
    }
    if (type === 'challan') {
      switch (status) {
        case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'DRAFT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      }
    }
    if (type === 'stock') {
      switch (status) {
        case 'NORMAL': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'LOW': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      }
    }
    if (type === 'product') {
      switch (status) {
        case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'INACTIVE': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      }
    }
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {status}
    </span>
  );
};
