import React from 'react';

export const TradingBotHeader = ({ refreshData }) => {
  return (
    <div className="flex items-center justify-between mt-5 mb-5">
      <img className="h-10 mr-2" src="/logo-surfsolana-solsurfer.svg" alt="SolSurfer" />
      <h1 className="text-4xl tracking-tight font-bold flex-1">SolSurfer</h1>
      <button 
        onClick={refreshData}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        Refresh Data
      </button>
    </div>
  );
};

