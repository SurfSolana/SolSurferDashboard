import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TradeTable = ({ filteredTrades, formatDate }) => {
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('status');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Filter state
  const [showOpenPositions, setShowOpenPositions] = useState(true);
  const [showClosedPositions, setShowClosedPositions] = useState(true);

  // Apply filters to show only buy orders based on filter criteria
  const filteredTrades2 = useMemo(() => {
    return filteredTrades.filter(trade => {
      // Filter by direction (buy orders only)
      if (trade.direction !== 'buy') return false;
      
      // Filter by position status (open/closed)
      if (trade.status === 'open' && !showOpenPositions) return false;
      if (trade.status === 'closed' && !showClosedPositions) return false;
      
      return true;
    });
  }, [filteredTrades, showOpenPositions, showClosedPositions]);

  // Apply sorting to trades
  const sortedTrades = useMemo(() => {
    return [...filteredTrades2].sort((a, b) => {
      let aValue, bValue;
      
      // Handle different field types
      if (sortField === 'timestamp') {
        aValue = a.parsedTimestamp ? a.parsedTimestamp.getTime() : 0;
        bValue = b.parsedTimestamp ? b.parsedTimestamp.getTime() : 0;
      } else if (sortField === 'closedAt') {
        aValue = a.parsedClosedAt ? a.parsedClosedAt.getTime() : 0;
        bValue = b.parsedClosedAt ? b.parsedClosedAt.getTime() : 0;
      } else if (sortField === 'price' || sortField === 'solAmount' || sortField === 'value' || sortField === 'realizedPnl' || sortField === 'upnl') {
        aValue = a[sortField] || 0;
        bValue = b[sortField] || 0;
      } else if (sortField === 'status') {
        // Special handling for status to ensure 'open' comes before 'closed'
        aValue = a[sortField] === 'open' ? 0 : 1;
        bValue = b[sortField] === 'open' ? 0 : 1;
      } else {
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
      }
      
      // Apply sort direction
      return sortDirection === 'asc' 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }, [filteredTrades2, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTrades.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTrades, currentPage, itemsPerPage]);

  // Handle pagination navigation
  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Handle sort click
  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-3 w-3 ml-1 inline-block text-blue-400" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        {sortDirection === 'asc' ? (
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        )}
      </svg>
    );
  };

  // Check if trade is profitable
  const isProfitable = (trade) => {
    if (trade.status === 'closed') {
      return (trade.realizedPnl || 0) > 0;
    } else {
      return (trade.upnl || 0) > 0;
    }
  };

  // Toggle row expansion
  const toggleExpand = (tradeId) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  return (
    <div className="w-full p-2 mt-4">
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">SOL Positions</h2>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-sm">Items per page:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-800 text-white border-0 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
              aria-label="Select number of items per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-3 bg-slate-800 border-b border-slate-700 flex flex-wrap gap-4 items-center">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Filters:</div>
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showOpenPositions} 
                onChange={(e) => setShowOpenPositions(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                Open Positions
              </span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showClosedPositions} 
                onChange={(e) => setShowClosedPositions(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-300 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
                Closed Positions
              </span>
            </label>
          </div>
          
          <div className="ml-auto">
            <span className="text-xs text-slate-400">
              {filteredTrades2.length} positions match filters
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="w-10 px-2 py-3"></th>
                {/* Status column */}
                <th 
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => handleSortClick('status')}
                  aria-sort={sortField === 'status' ? sortDirection : 'none'}
                >
                  <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white">
                    Status {getSortIndicator('status')}
                  </div>
                </th>
                {/* Opened column */}
                <th 
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => handleSortClick('timestamp')}
                  aria-sort={sortField === 'timestamp' ? sortDirection : 'none'}
                >
                  <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white">
                    Opened {getSortIndicator('timestamp')}
                  </div>
                </th>
                {/* Entry Price column */}
                <th 
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => handleSortClick('price')}
                  aria-sort={sortField === 'price' ? sortDirection : 'none'}
                >
                  <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white">
                    Entry Price {getSortIndicator('price')}
                  </div>
                </th>
                {/* SOL Amount column */}
                <th 
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => handleSortClick('solAmount')}
                  aria-sort={sortField === 'solAmount' ? sortDirection : 'none'}
                >
                  <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white">
                    SOL Amount {getSortIndicator('solAmount')}
                  </div>
                </th>
                {/* USDC Value column */}
                <th 
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => handleSortClick('value')}
                  aria-sort={sortField === 'value' ? sortDirection : 'none'}
                >
                  <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white">
                    USDC Value {getSortIndicator('value')}
                  </div>
                </th>
                {/* P&L column */}
                <th 
                  className="px-4 py-3 text-left cursor-pointer"
                  onClick={() => handleSortClick(sortField === 'realizedPnl' ? 'upnl' : 'realizedPnl')}
                  aria-sort={sortField === 'realizedPnl' || sortField === 'upnl' ? sortDirection : 'none'}
                >
                  <div className="flex items-center text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white">
                    P&L {getSortIndicator(sortField === 'realizedPnl' ? 'realizedPnl' : 'upnl')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.length > 0 ? (
                paginatedTrades.map((trade) => (
                  <React.Fragment key={trade.id}>
                    <motion.tr 
                      className={`${
                        expandedTrade === trade.id ? 'bg-slate-750' : 
                        isProfitable(trade) ? 'bg-green-900/10' : 'bg-red-900/5'
                      } hover:bg-slate-750 transition-colors border-b border-slate-800 cursor-pointer`}
                      onClick={() => toggleExpand(trade.id)}
                      aria-expanded={expandedTrade === trade.id}
                      aria-controls={`details-${trade.id}`}
                      whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}
                      initial={false}
                    >
                      <td className="px-3 py-3 text-center">
                        <div className="flex justify-center items-center h-full">
                          <motion.div
                            animate={{ rotate: expandedTrade === trade.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {expandedTrade === trade.id ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </motion.div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          trade.status === 'open' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                        }`}>
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{formatDate(trade.parsedTimestamp)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">${trade.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{trade.solAmount.toFixed(6)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">${trade.value.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        (trade.status === 'closed' ? trade.realizedPnl || 0 : trade.upnl || 0) > 0 
                          ? 'text-green-400' 
                          : (trade.status === 'closed' ? trade.realizedPnl || 0 : trade.upnl || 0) < 0 
                            ? 'text-red-400' 
                            : 'text-slate-300'
                      }`}>
                        {trade.status === 'closed' 
                          ? (trade.realizedPnl || 0).toFixed(6)
                          : (trade.upnl || 0).toFixed(6)}
                      </td>
                    </motion.tr>
                    
                    {/* Expanded detail row with animation */}
                    <AnimatePresence>
                      {expandedTrade === trade.id && (
                        <motion.tr 
                          className="bg-slate-800" 
                          id={`details-${trade.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <td colSpan="7" className="px-4 py-4">
                            <motion.div 
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            >
                              {/* Position Details Section */}
                              <motion.div 
                                className="rounded-lg overflow-hidden shadow-lg"
                                whileHover={{ scale: 1.02, y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <div className="bg-gradient-to-r from-blue-900/70 to-blue-700/50 px-4 py-3 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <h3 className="text-sm font-semibold text-blue-200">Position Details</h3>
                                </div>
                                <div className="bg-gradient-to-b from-slate-750 to-slate-800 p-4">
                                  <div className="space-y-2">
                                    <motion.div 
                                      className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.2 }}
                                    >
                                      <span className="text-xs text-slate-400">Position ID:</span>
                                      <span className="text-xs text-slate-300 truncate max-w-xs">{trade.id}</span>
                                    </motion.div>
                                    <motion.div 
                                      className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.25 }}
                                    >
                                      <span className="text-xs text-slate-400">Opened:</span>
                                      <span className="text-xs text-slate-300">{formatDate(trade.parsedTimestamp)}</span>
                                    </motion.div>
                                    
                                    {trade.status === 'closed' && (
                                      <motion.div 
                                        className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                      >
                                        <span className="text-xs text-slate-400">Closed:</span>
                                        <span className="text-xs text-slate-300">{formatDate(trade.parsedClosedAt)}</span>
                                      </motion.div>
                                    )}
                                    
                                    <motion.div 
                                      className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.35 }}
                                    >
                                      <span className="text-xs text-slate-400">Entry Price:</span>
                                      <span className="text-xs text-slate-300">${trade.price.toFixed(6)}</span>
                                    </motion.div>
                                    
                                    {trade.status === 'closed' && trade.closePrice && (
                                      <motion.div 
                                        className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                      >
                                        <span className="text-xs text-slate-400">Exit Price:</span>
                                        <span className="text-xs text-slate-300">${trade.closePrice.toFixed(6)}</span>
                                      </motion.div>
                                    )}
                                    
                                    <motion.div 
                                      className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.45 }}
                                    >
                                      <span className="text-xs text-slate-400">SOL Amount:</span>
                                      <span className="text-xs text-slate-300">{trade.solAmount.toFixed(8)}</span>
                                    </motion.div>
                                    
                                    <motion.div 
                                      className="flex justify-between items-center"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.5 }}
                                    >
                                      <span className="text-xs text-slate-400">USDC Value:</span>
                                      <span className="text-xs text-slate-300">${trade.value.toFixed(6)}</span>
                                    </motion.div>
                                  </div>
                                </div>
                              </motion.div>
                              
                              {/* Performance Section */}
                              <motion.div 
                                className="rounded-lg overflow-hidden shadow-lg"
                                whileHover={{ scale: 1.02, y: -5 }}
                                transition={{ type: "spring", stiffness: 300, duration: 0.4, delay: 0.2}}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                              >
                                <div className="bg-gradient-to-r from-green-900/70 to-green-700/50 px-4 py-3 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                  </svg>
                                  <h3 className="text-sm font-semibold text-green-200">Performance</h3>
                                </div>
                                <div className="bg-gradient-to-b from-slate-750 to-slate-800 p-4">
                                  <div className="space-y-2">
                                    <motion.div 
                                      className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.25 }}
                                    >
                                      <span className="text-xs text-slate-400">Status:</span>
                                      <span className={`text-xs font-medium ${trade.status === 'open' ? 'text-blue-400' : 'text-purple-400'}`}>
                                        {trade.status === 'open' ? 'OPEN' : 'CLOSED'}
                                      </span>
                                    </motion.div>
                                    
                                    {trade.status === 'open' ? (
                                      <motion.div 
                                        className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                      >
                                        <span className="text-xs text-slate-400">Unrealized P&L:</span>
                                        <span className={`text-xs font-medium ${(trade.upnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          ${(trade.upnl || 0).toFixed(6)}
                                        </span>
                                      </motion.div>
                                    ) : (
                                      <>
                                        <motion.div 
                                          className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                          initial={{ opacity: 0, x: 10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.35 }}
                                        >
                                          <span className="text-xs text-slate-400">Realized P&L:</span>
                                          <span className={`text-xs font-medium ${(trade.realizedPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${(trade.realizedPnl || 0).toFixed(6)}
                                          </span>
                                        </motion.div>
                                        
                                        {trade.batchClose && (
                                          <motion.div 
                                            className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                          >
                                            <span className="text-xs text-slate-400">Batch Close:</span>
                                            <span className="text-xs text-blue-400">Yes (Part of combined order)</span>
                                          </motion.div>
                                        )}
                                        
                                        {trade.closeId && (
                                          <motion.div 
                                            className="flex justify-between items-center border-b border-slate-700/50 pb-2"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.45 }}
                                          >
                                            <span className="text-xs text-slate-400">Close Transaction:</span>
                                            <span className="text-xs text-slate-300 truncate max-w-xs">{trade.closeId}</span>
                                          </motion.div>
                                        )}
                                      </>
                                    )}
                                    
                                    {/* Price change percentage for closed trades */}
                                    {trade.status === 'closed' && trade.closePrice && (
                                      <motion.div 
                                        className="flex justify-between items-center"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                      >
                                        <span className="text-xs text-slate-400">Price Change:</span>
                                        <span className={`text-xs font-medium ${
                                          trade.closePrice > trade.price
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                        }`}>
                                          {((Math.abs(trade.closePrice - trade.price) / trade.price) * 100).toFixed(2)}%
                                          {trade.closePrice > trade.price ? ' profit' : ' loss'}
                                        </span>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-400">
                    No buy orders found in the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTrades.length)} of {sortedTrades.length} positions
            </div>
            <div className="flex items-center">
              <nav className="flex space-x-1" aria-label="Pagination">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  aria-label="Go to first page"
                  className={`flex items-center justify-center h-8 w-8 rounded ${
                    currentPage === 1 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                  className={`flex items-center justify-center h-8 w-8 rounded ${
                    currentPage === 1 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show current page and nearby pages
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                      className={`flex items-center justify-center h-8 w-8 rounded text-sm ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white font-medium' 
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page"
                  className={`flex items-center justify-center h-8 w-8 rounded ${
                    currentPage === totalPages 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Go to last page"
                  className={`flex items-center justify-center h-8 w-8 rounded ${
                    currentPage === totalPages 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};