import React from 'react';
import { RiskLevel, PriorityLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | PriorityLevel | string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = true }) => {
  const l = (level || 'LOW').toUpperCase();

  let bgColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let dotColor = 'bg-emerald-500';

  if (l === 'CRITICAL' || l === 'URGENT') {
    bgColor = 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse';
    dotColor = 'bg-rose-600';
  } else if (l === 'HIGH') {
    bgColor = 'bg-amber-100 text-amber-900 border-amber-300';
    dotColor = 'bg-amber-600';
  } else if (l === 'MEDIUM') {
    bgColor = 'bg-yellow-100 text-yellow-900 border-yellow-300';
    dotColor = 'bg-yellow-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgColor}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{l}</span>
      {showScore && score !== undefined && <span className="font-mono opacity-80">({score})</span>}
    </span>
  );
};
