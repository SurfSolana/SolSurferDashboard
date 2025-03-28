import React from 'react';

export const LastUpdated = ({ data }) => {
  const formatDateTime = (date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="mt-4 mb-2 text-slate-400 text-center">
      <div>
        Data last updated: {data && data.length > 0 
          ? formatDateTime(new Date(data[data.length - 1].date))
          : 'No data available'
        }
      </div>
      <div className="mt-1">
        Dashboard refreshed: {formatDateTime(new Date())}
      </div>
    </div>
  );
};
