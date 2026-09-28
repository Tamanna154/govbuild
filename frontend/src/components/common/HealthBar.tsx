import React from 'react';

interface HealthBarProps {
  score: number;
  showText?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({ score, showText = true }) => {
  const s = Math.max(0, Math.min(100, score || 0));

  let color = 'bg-emerald-500';
  let textColor = 'text-emerald-700';

  if (s < 40) {
    color = 'bg-rose-600';
    textColor = 'text-rose-700 font-bold';
  } else if (s < 60) {
    color = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else if (s < 80) {
    color = 'bg-yellow-500';
    textColor = 'text-yellow-700';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        {showText && <span className="text-slate-500 font-medium">Health Score</span>}
        <span className={`font-mono text-xs ${textColor}`}>{s}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500 ease-out rounded-full`} style={{ width: `${s}%` }} />
      </div>
    </div>
  );
};
