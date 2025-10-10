
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105">
      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</h4>
      <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
};

export default StatCard;
