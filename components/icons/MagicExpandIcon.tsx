import React from 'react';

export const MagicExpandIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    {/* Box */}
    <rect x="7" y="7" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round" />
    {/* Arrows */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12H3m18 0h-4M12 7V3m0 18v-4" />
    {/* Sparkles */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l1.414 1.414" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.086 18.086l1.414 1.414" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l1.414-1.414" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-1.414 1.414" />
  </svg>
);