import React from 'react';

export const PnLTile = ({ totalPnl, closedTradesCount }) => {
  return (
    <div className="surf__tile">
      <h2 className="text-xl font-semibold mb-2 text-slate-300">Trading Performance</h2>
      <div className={`text-6xl font-bold ${totalPnl > 0 ? 'text-green-500' : totalPnl < 0 ? 'text-red-500' : 'text-white'}`}>
        ${totalPnl.toFixed(4)}
      </div>
      <div className="mt-2 text-sm text-slate-400">
        Total realized PnL from {closedTradesCount} trades
      </div>
    </div>
  );
};
