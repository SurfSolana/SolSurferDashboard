import React from 'react';
import { SentimentGauge } from './SentimentGauge';
import { PriceTile } from './PriceTile';
import { PnLTile } from './PnLTile';

export const MetricTiles = ({ currentValue, currentPrice, totalPnl, getSentiment, data, trades }) => {
  const sentiment = getSentiment(currentValue);
  
  return (
    <div className="">

      <div className="flex flex-wrap md:gap-4 md:flex-nowrap">
        {/* Gauge Tile */}
        <div className="w-1/3 pr-1 md:pr-0 md:w-1/5">
          <SentimentGauge 
            currentValue={currentValue}
            sentiment={sentiment}
          />
        </div>
        
        {/* Price Tile */}
        <div className="w-2/3 pl-1 md:pl-0 md:w-2/5">
          <PriceTile 
            currentPrice={currentPrice}
            lastUpdated={data.length > 0 ? new Date(data[data.length - 1].date) : null}
          />
        </div>

        <div className="w-full md:w-2/5">
          <PnLTile 
            totalPnl={totalPnl}
            closedTradesCount={trades.filter(t => t.status === 'closed').length}
          />
        </div>
      </div>

    </div>
  );
};
