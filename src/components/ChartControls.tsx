import React from 'react';

export const ChartControls = ({ 
  showPrice, 
  showFearGreed, 
  showOrders,
  setShowPrice, 
  setShowFearGreed, 
  setShowOrders,
  dataPointsCount 
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-4">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={showPrice}
            onChange={() => setShowPrice(!showPrice)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="ml-2 text-sm text-slate-400">Price</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={showFearGreed}
            onChange={() => setShowFearGreed(!showFearGreed)}
            className="form-checkbox h-5 w-5 text-green-500 rounded"
          />
          <span className="ml-2 text-sm text-blue-400">Fear & Greed</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={showOrders}
            onChange={() => setShowOrders(!showOrders)}
            className="form-checkbox h-5 w-5 text-orange-500 rounded"
          />
          <span className="ml-2 text-sm text-orange-400">Orders</span>
        </label>
      </div>
      <div className="text-xs text-slate-400">
        {dataPointsCount > 0 ? (
          <>Showing {dataPointsCount} data points</>
        ) : (
          <>No data in selected timeframe</>
        )}
      </div>
    </div>
  );
};
