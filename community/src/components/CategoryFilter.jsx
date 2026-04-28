import React from 'react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'awareness', label: 'Awareness' },
  { key: 'activation', label: 'Activation' },
  { key: 'application', label: 'Application' },
  { key: 'ascension', label: 'Ascension' },
  { key: 'general', label: 'General' },
];

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            active === key
              ? 'bg-teal text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-teal/5 border border-teal/10'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
