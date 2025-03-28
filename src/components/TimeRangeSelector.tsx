import React from 'react';

export const TimeRangeSelector = ({ timeRange, setTimeRange }) => {
  const timeRanges = ['1h', '4h', '12h', '1d', '3d', '7d'];
  
  return (
    <div className="flex justify-center mt-6">
      <div className="flex bg-slate-700 rounded-lg p-1 shadow-lg">
        {timeRanges.map((range) => (
          <button
            key={range}
            className={`px-5 py-2 text-sm rounded-md transition-all duration-200 ${
              timeRange === range 
                ? 'bg-blue-600 text-white font-medium shadow-inner' 
                : 'text-slate-400 hover:text-white hover:bg-slate-600'
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};
