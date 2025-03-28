import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  Legend,
  ComposedChart,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { ChartControls } from './ChartControls';
import { TimeRangeSelector } from './TimeRangeSelector';

export const PriceChart = ({ 
  filteredData, 
  showPrice, 
  showFearGreed, 
  showOrders,
  setShowPrice,
  setShowFearGreed,
  setShowOrders,
  timeRange, 
  setTimeRange, 
  formatDateTime,
  tradeMarkers,
  findClosestPrice,
  priceMin,
  priceMax
}) => {
  // Sentiment boundary values for reference lines
  const SENTIMENT_BOUNDARIES = {
    EXTREME_FEAR: 14,
    FEAR: 35,
    GREED: 65,
    EXTREME_GREED: 82
  };

  // Format price for tooltip
  const formatPrice = (value) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="w-full p-2">
      <div className="surf__tile">
        <ChartControls 
          showPrice={showPrice}
          showFearGreed={showFearGreed}
          showOrders={showOrders}
          setShowPrice={setShowPrice}
          setShowFearGreed={setShowFearGreed}
          setShowOrders={setShowOrders}
          dataPointsCount={filteredData.length}
        />
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <defs>
                {/* Area fill gradient for Fear/Greed */}
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                </linearGradient>
                
                {/* Vertical gradient for the line that matches the fear/greed scale */}
                <linearGradient id="lineGradient" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#DC2626" /> {/* Red - Extreme Fear (0) */}
                  <stop offset="25%" stopColor="#F97316" /> {/* Orange - Fear (25) */}
                  <stop offset="50%" stopColor="#FACC15" /> {/* Yellow - Neutral (50) */}
                  <stop offset="75%" stopColor="#22C55E" /> {/* Light Green - Greed (75) */}
                  <stop offset="100%" stopColor="#15803D" /> {/* Dark Green - Extreme Greed (100) */}
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="unixTime" 
                type="number"
                domain={['auto', 'auto']}
                scale="time"
                stroke="#666"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(unixTime) => {
                  const date = new Date(unixTime);
                  return formatDateTime(date);
                }}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
                allowDataOverflow={false}
                padding={{ left: 0, right: 0 }}
              />
              {/* Fear/Greed Y-axis (left) */}
              <YAxis 
                yAxisId="fear-greed"
                domain={[0, 100]} 
                stroke="#666" 
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickCount={5}
                axisLine={false}
                tickLine={false}
                hide={!showFearGreed}
              />
              {/* Price Y-axis (right) */}
              <YAxis 
                yAxisId="price"
                orientation="right"
                domain={[priceMin, priceMax]}
                stroke="#666" 
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={formatPrice}
                tickCount={5}
                axisLine={false}
                tickLine={false}
                hide={!showPrice}
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#333" 
                opacity={0.5}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20, 20, 30, 0.9)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  fontSize: '14px',
                  padding: '8px 12px',
                }}
                formatter={(value, name) => {
                  if (name === 'Fear/Greed') {
                    // Return value and indicator color based on the value
                    let color;
                    if (value <= 25) color = "#DC2626";
                    else if (value <= 40) color = "#F97316";
                    else if (value <= 60) color = "#FACC15";
                    else if (value <= 75) color = "#22C55E";
                    else color = "#15803D";
                    
                    return [<span style={{ color }}>{value}</span>, name];
                  }
                  
                  // For price
                  if (name === 'SOL Price') {
                    return [`$${value.toFixed(2)}`, name];
                  }
                  
                  return [value, name];
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload.date) {
                    const date = new Date(payload[0].payload.date);
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                  }
                  return value;
                }}
                animationDuration={300}
              />
              <Legend />
              
              {/* Sentiment boundary reference lines */}
              {showFearGreed && (
                <>
                  {/* Extreme Fear boundary - Red */}
                  <ReferenceLine 
                    y={SENTIMENT_BOUNDARIES.EXTREME_FEAR} 
                    yAxisId="fear-greed"
                    stroke="#DC2626" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    label={{
                      value: "Extreme Fear", 
                      position: 'insideTopRight',
                      fill: '#DC2626',
                      fontSize: 10,
                      offset: 5
                    }}
                  />
                  
                  {/* Fear boundary - Orange */}
                  <ReferenceLine 
                    y={SENTIMENT_BOUNDARIES.FEAR} 
                    yAxisId="fear-greed"
                    stroke="#F97316" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    label={{
                      value: "Fear", 
                      position: 'insideTopRight',
                      fill: '#F97316',
                      fontSize: 10,
                      offset: 5
                    }}
                  />
                  
                  {/* Greed boundary - Light Green */}
                  <ReferenceLine 
                    y={SENTIMENT_BOUNDARIES.GREED} 
                    yAxisId="fear-greed"
                    stroke="#22C55E" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    label={{
                      value: "Greed", 
                      position: 'insideTopRight',
                      fill: '#22C55E',
                      fontSize: 10,
                      offset: 5
                    }}
                  />
                  
                  {/* Extreme Greed boundary - Dark Green */}
                  <ReferenceLine 
                    y={SENTIMENT_BOUNDARIES.EXTREME_GREED} 
                    yAxisId="fear-greed"
                    stroke="#15803D" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    label={{
                      value: "Extreme Greed", 
                      position: 'insideTopRight',
                      fill: '#15803D',
                      fontSize: 10,
                      offset: 5
                    }}
                  />
                </>
              )}
              
              {/* Fear/Greed Area */}
              {showFearGreed && (
                <Area 
                  yAxisId="fear-greed"
                  type="monotone" 
                  dataKey="value" 
                  name="Fear/Greed"
                  stroke="none"
                  fillOpacity={1}
                  fill="url(#colorGradient)" 
                />
              )}
              
              {/* Fear/Greed Line */}
              {showFearGreed && (
                <Line 
                  yAxisId="fear-greed"
                  type="monotone" 
                  dataKey="value" 
                  name="Fear/Greed"
                  stroke="url(#lineGradient)" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ 
                    r: 8, 
                    strokeWidth: 2, 
                    fill: '#1A1A2E',
                    stroke: ({payload}) => {
                      // Color the active dot based on the value
                      const value = payload.value;
                      if (value <= 25) return "#DC2626";
                      else if (value <= 40) return "#F97316";
                      else if (value <= 60) return "#FACC15";
                      else if (value <= 75) return "#22C55E";
                      else return "#15803D";
                    }
                  }} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              )}
              
              {/* Price Line */}
              {showPrice && (
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="price" 
                  name="SOL Price" 
                  stroke="#9CA3AF" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ 
                    r: 8, 
                    strokeWidth: 2, 
                    fill: '#1A1A2E',
                    stroke: "#9CA3AF"
                  }} 
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              )}
              
              {/* Trade Order Markers */}
              {showOrders && showPrice && tradeMarkers.map((trade, index) => {
                // Find the closest data point to use for time alignment
                const matchingDataPoint = filteredData.find(point => 
                  point.timestamp === trade.timestamp
                ) || findClosestPrice(trade.parsedTimestamp);
                
                if (!matchingDataPoint) return null;
                
                // For opening points: light green filled circle
                // For closing points: red filled circle 
                const isOpeningPoint = trade.isOpen;
                const fillColor = isOpeningPoint ? '#4ADE80' : '#EF4444';
                const strokeColor = isOpeningPoint ? '#16A34A' : '#DC2626';
                
                return (
                  <ReferenceDot
                    key={`trade-${index}-${isOpeningPoint ? 'open' : 'close'}`}
                    x={matchingDataPoint.unixTime}
                    y={trade.price}
                    yAxisId="price"
                    r={7}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    isFront={true}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend for order markers */}
        {showOrders && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 p-2 bg-slate-700 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-slate-300">Open Position</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-300">Closed Position</span>
            </div>
          </div>
        )}
        
        {/* Time range selector */}
        <TimeRangeSelector
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      </div>
    </div>
  );
};
