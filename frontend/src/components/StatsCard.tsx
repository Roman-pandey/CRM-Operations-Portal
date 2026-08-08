import React from 'react';

interface StatsCardProps {
  title?: string;
  label?: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, label, value, icon, color, trend }: StatsCardProps) => {
  const displayTitle = title || label || '';

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{displayTitle}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color || 'bg-indigo-500/10 text-indigo-400'}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={trend.isPositive ? 'text-emerald-400' : 'text-red-400'}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
};
