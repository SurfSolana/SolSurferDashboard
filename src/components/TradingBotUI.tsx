import React, { useState, useEffect } from 'react';
import { TradingBotHeader } from './TradingBotHeader';
import { MetricTiles } from './MetricTiles';
import { PriceChart } from './PriceChart';
import { TradeTable } from './TradeTable';
import { LastUpdated } from './LastUpdated';
import Papa from 'papaparse';

const TradingBotUI = () => {
  const [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('4h'); // Default to 4 hour view
  const [filteredData, setFilteredData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [showPrice, setShowPrice] = useState(true);
  const [showFearGreed, setShowFearGreed] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const [totalPnl, setTotalPnl] = useState(0);
  
  // Parse custom date format from the orderbook or FGI data
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Format example: "Sat, 22/FEB, 21:29:26"
      const match = dateStr.match(/(\w+), (\d+)\/(\w+), (\d+):(\d+):(\d+)/);
      if (match) {
        const [_, dayOfWeek, date, month, hours, minutes, seconds] = match;
        // Create a date string in a format JavaScript can reliably parse
        return new Date(`${month} ${date}, ${new Date().getFullYear()} ${hours}:${minutes}:${seconds}`);
      }
      return null;
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return null;
    }
  };
  
  // Function to get sentiment label and color based on value
  const getSentiment = (value) => {
    if (value <= 25) return { label: 'Extreme Fear', color: 'bg-red-600' };
    if (value <= 40) return { label: 'Fear', color: 'bg-orange-500' };
    if (value <= 60) return { label: 'Neutral', color: 'bg-yellow-400' };
    if (value <= 75) return { label: 'Greed', color: 'bg-green-500' };
    return { label: 'Extreme Greed', color: 'bg-green-700' };
  };
  
  // Function to filter data based on the selected time range
  const filterDataByTimeRange = (fullData, selectedRange, allTrades) => {
    if (!fullData || fullData.length === 0) return;
    
    // Sort data by date to ensure proper chronological order
    const sortedData = [...fullData].sort((a, b) => a.unixTime - b.unixTime);
    
    // Get the most recent timestamp in the data
    const latestPoint = sortedData[sortedData.length - 1];
    let cutoffTime = new Date(latestPoint.date);
    let includeAllClosedPositions = false; // Flag to include recent closed positions
    
    // Determine cutoff time based on selected range
    switch (selectedRange) {
      case '1h':
        cutoffTime.setHours(cutoffTime.getHours() - 1);
        includeAllClosedPositions = true; // Always show recent closed positions in shorter views
        break;
      case '4h':
        cutoffTime.setHours(cutoffTime.getHours() - 4);
        includeAllClosedPositions = true;
        break;
      case '12h':
        cutoffTime.setHours(cutoffTime.getHours() - 12);
        includeAllClosedPositions = true;
        break;
      case '1d':
        cutoffTime.setDate(cutoffTime.getDate() - 1);
        includeAllClosedPositions = true;
        break;
      case '3d':
        cutoffTime.setDate(cutoffTime.getDate() - 3);
        break;
      case '7d':
        cutoffTime.setDate(cutoffTime.getDate() - 7);
        break;
      default:
        cutoffTime.setHours(cutoffTime.getHours() - 4);
        includeAllClosedPositions = true;
    }
    
    // Create filtered data for chart
    const cutoffTimestamp = cutoffTime.getTime();
    const filtered = sortedData.filter(item => item.unixTime >= cutoffTimestamp);
    
    // Ensure we have at least 10 data points for better visualization
    if (filtered.length < 10 && sortedData.length > 10) {
      const minimumPointsNeeded = Math.min(10, sortedData.length);
      setFilteredData(sortedData.slice(-minimumPointsNeeded));
    } else {
      setFilteredData(filtered);
    }
    
    // Filter trades to match the selected time range
    if (allTrades && allTrades.length > 0) {
      // First, get all trades that have opening times within our time range
      const openTradesInRange = allTrades.filter(trade => {
        if (!trade.parsedTimestamp) return false;
        return trade.parsedTimestamp.getTime() >= cutoffTimestamp;
      });
      
      // For shorter timeframes, also include recently closed trades regardless of opening time
      let recentClosedTrades = [];
      if (includeAllClosedPositions) {
        // Get trades that closed within the last 24 hours, regardless of when they opened
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const oneDayTimestamp = oneDayAgo.getTime();
        
        recentClosedTrades = allTrades.filter(trade => {
          if (trade.status !== 'closed' || !trade.closedAt) return false;
          
          const closedAtDate = parseCustomDate(trade.closedAt);
          if (!closedAtDate) return false;
          
          // Include if it closed recently, even if it opened before our cutoff
          return closedAtDate.getTime() >= oneDayTimestamp;
        });
      }
      
      // Combine and deduplicate trades
      const combinedTrades = [...openTradesInRange];
      recentClosedTrades.forEach(trade => {
        if (!combinedTrades.find(t => t.id === trade.id)) {
          combinedTrades.push(trade);
        }
      });
      
      // Sort trades by timestamp for consistency
      const sortedTrades = combinedTrades.sort((a, b) => {
        const aTime = a.parsedTimestamp ? a.parsedTimestamp.getTime() : 0;
        const bTime = b.parsedTimestamp ? b.parsedTimestamp.getTime() : 0;
        return aTime - bTime;
      });
      
      setFilteredTrades(sortedTrades);
    }
  };
  
  // Format dateTime for X-axis display
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (timeRange === '1h' || timeRange === '4h' || timeRange === '12h') {
      return `${hours}:${minutes}`;
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month} ${hours}:${minutes}`;
    }
  };
  
  // Find nearest price data point for a given trade timestamp
  const findClosestPrice = (tradeDate) => {
    if (!data || data.length === 0) return null;
    
    // Convert tradeDate to Date object if it's not already
    const tradeDateObj = tradeDate instanceof Date ? tradeDate : new Date(tradeDate);
    
    // Sort data by the absolute difference between data timestamp and trade timestamp
    const sortedByCloseness = [...data].sort((a, b) => {
      const diffA = Math.abs(a.date - tradeDateObj);
      const diffB = Math.abs(b.date - tradeDateObj);
      return diffA - diffB;
    });
    
    // Return the closest data point
    return sortedByCloseness[0];
  };
  
  // Update filtered data when time range changes
  useEffect(() => {
    if (data.length > 0) {
      // Always ensure we have enough data to display meaningful chart
      filterDataByTimeRange(data, timeRange, trades);
    }
  }, [timeRange, data, trades]);
  
  // Default timeframe if not enough data points in selected range
  useEffect(() => {
    if (data.length > 0 && filteredData.length < 5) {
      // If we have less than 5 data points, try a wider timeframe
      const availableTimeframes = ['1h', '4h', '12h', '1d', '3d', '7d'];
      const currentIndex = availableTimeframes.indexOf(timeRange);
      
      if (currentIndex < availableTimeframes.length - 1) {
        setTimeRange(availableTimeframes[currentIndex + 1]);
      }
    }
  }, [data, filteredData, timeRange]);
  
  // Calculate trade markers for the chart
  const tradeMarkers = React.useMemo(() => {
    if (!filteredTrades || filteredTrades.length === 0) return [];
    
    // Array to hold all trade points (both openings and closings)
    let allTradePoints = [];
    
    filteredTrades.forEach(trade => {
      // Skip if timestamp parsing failed
      if (!trade.parsedTimestamp) return;
      
      // Process the opening point - this is always shown
      const openDataPoint = findClosestPrice(trade.parsedTimestamp);
      if (openDataPoint) {
        // This is an "Open Position" marker
        allTradePoints.push({
          timestamp: openDataPoint.timestamp,
          price: trade.price,
          value: openDataPoint.value,
          direction: trade.direction,
          isOpen: true, // Flag that this is an opening point
          tradeId: trade.id,
          solAmount: trade.solAmount,
          tradeValue: trade.value,
          parsedTimestamp: trade.parsedTimestamp,
          unixTime: openDataPoint.unixTime || trade.parsedTimestamp.getTime()
        });
      }
      
      // For all closed trades, always process the closing point
      if (trade.status === 'closed' && trade.closedAt && trade.closePrice) {
        const parsedClosedAt = parseCustomDate(trade.closedAt);
        if (!parsedClosedAt) return;
        
        // Find data point closest to the closing time
        const closeDataPoint = findClosestPrice(parsedClosedAt);
        if (closeDataPoint) {
          // This is a "Closed Position" marker
          allTradePoints.push({
            timestamp: closeDataPoint.timestamp,
            price: trade.closePrice,
            value: closeDataPoint.value,
            direction: trade.direction,
            isOpen: false, // Flag that this is a closing point
            tradeId: trade.id + "_close",
            solAmount: trade.solAmount,
            tradeValue: trade.value,
            realizedPnl: trade.realizedPnl,
            parsedTimestamp: parsedClosedAt,
            unixTime: closeDataPoint.unixTime || parsedClosedAt.getTime()
          });
        }
      }
    });
    
    return allTradePoints;
  }, [filteredTrades, findClosestPrice]);
  
  // Format date for chart display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };
  
  // Function to load and process data
  const refreshData = async () => {
    setLoading(true);
    try {
      // Load CSV data with cache-busting timestamp
      const csvPath = 'fgi_log.csv';
      const csvResponse = await fetch(csvPath);
      const csvText = await csvResponse.text();
      
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data
            .filter(row => row.length >= 3 && !isNaN(parseFloat(row[1])) && !isNaN(parseFloat(row[2])))
            .map(row => {
              // Row format: ["Sat, 22/FEB, 21:29:26", "172.77", "52"]
              const timestamp = row[0]; // Already without quotes due to Papa Parse
              const price = parseFloat(row[1]);
              const value = parseFloat(row[2]);
              const dateObj = parseCustomDate(timestamp);
              
              if (!dateObj) {
                console.error("Failed to parse date:", timestamp);
                return null;
              }
              
              return {
                timestamp,
                date: dateObj,
                price,
                value,
                formattedTime: dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                unixTime: dateObj.getTime()
              };
            })
            .filter(item => item !== null) // Remove any null entries from failed parsing
            // Ensure strict chronological order
            .sort((a, b) => a.unixTime - b.unixTime);
            
          if (parsedData.length > 0) {
            setData(parsedData);
            const latestData = parsedData[parsedData.length - 1];
            setCurrentValue(latestData.value);
            setCurrentPrice(latestData.price);
          }
          
          // Load JSON orders data
          loadOrdersData(parsedData);
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadOrdersData = async (chartData) => {
    try {
      const orderbookPath = 'orderBookStorage.json';
      const orderbookResponse = await fetch(orderbookPath);
      const orderbookText = await orderbookResponse.text();

      const orderbookData = JSON.parse(orderbookText);
      
      if (orderbookData && orderbookData.trades) {
        const parsedTrades = orderbookData.trades.map(trade => ({
          ...trade,
          parsedTimestamp: parseCustomDate(trade.timestamp),
          parsedClosedAt: trade.closedAt ? parseCustomDate(trade.closedAt) : null
        }));
        
        setTrades(parsedTrades);
        
        // Calculate total PnL from closed trades
        const closedTrades = parsedTrades.filter(trade => trade.status === 'closed');
        const totalPnlValue = closedTrades.reduce((sum, trade) => sum + (trade.realizedPnl || 0), 0);
        setTotalPnl(totalPnlValue);
        
        // Now that we have both data sets, apply the time filter
        filterDataByTimeRange(chartData, timeRange, parsedTrades);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading orderbook data:', error);
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);
  
  // Calculate min and max price values for Y-axis scaling
  const priceMin = filteredData.length > 0 ? Math.min(...filteredData.map(item => item.price)) * 0.995 : 0;
  const priceMax = filteredData.length > 0 ? Math.max(...filteredData.map(item => item.price)) * 1.005 : 0;

  return (
    <div className="flex flex-col max-w-6xl mx-auto p-2">

      <TradingBotHeader 
        refreshData={refreshData} 
      />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading data...</div>
        </div>
      ) : (
        <>
          <MetricTiles 
            currentValue={currentValue}
            currentPrice={currentPrice}
            totalPnl={totalPnl}
            getSentiment={getSentiment}
            data={data}
            trades={trades}
          />
          
          <PriceChart 
            filteredData={filteredData}
            showPrice={showPrice}
            showFearGreed={showFearGreed}
            showOrders={showOrders}
            setShowPrice={setShowPrice}
            setShowFearGreed={setShowFearGreed}
            setShowOrders={setShowOrders}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            formatDateTime={formatDateTime}
            tradeMarkers={tradeMarkers}
            findClosestPrice={findClosestPrice}
            priceMin={priceMin}
            priceMax={priceMax}
          />
          
          <TradeTable 
            filteredTrades={trades.filter(trade => trade.direction === 'buy')}
            formatDate={formatDate}
          />

          
          <LastUpdated 
            data={data}
          />
        </>
      )}
    </div>
  );
};

export default TradingBotUI;