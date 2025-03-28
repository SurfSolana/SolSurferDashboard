import React from 'react';

export const PriceTile = ({ currentPrice, lastUpdated }) => {
  return (
    <div className="surf__tile">
      <h2 className="text-xl font-semibold mb-2 text-slate-300">Current SOL Price</h2>
      <div className="text-6xl font-bold text-white">${currentPrice.toFixed(2)}</div>
      <div className="mt-2 text-sm text-slate-400">
        Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
      </div>
    </div>
  );
};
