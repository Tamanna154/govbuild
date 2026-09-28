import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'border-slate-200 bg-white',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border shadow-sm transition hover:shadow-md ${color} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{value}</div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-slate-100 rounded-xl text-gov-700">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 text-xs text-slate-500 font-medium">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
