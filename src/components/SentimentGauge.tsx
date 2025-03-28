import React from 'react';

export const SentimentGauge = ({ currentValue, sentiment }) => {
  // Calculate the needle rotation for the fear/greed gauge
  const getNeedleRotation = (value) => {
    // Convert value (0-100) to degrees (0-180)
    // We need to adjust by -90 degrees because SVG rotation starts from the positive x-axis
    return ((value / 100) * 180) - 90;
  };

  return (
    <div className="surf__tile">
      <div className="relative w-full px-1.5">

        <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet">
          {/* Define gradient for the gauge */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" /> {/* Extreme Fear - Red */}
              <stop offset="25%" stopColor="#F97316" /> {/* Fear - Orange */}
              <stop offset="50%" stopColor="#FACC15" /> {/* Neutral - Yellow */}
              <stop offset="75%" stopColor="#22C55E" /> {/* Greed - Light Green */}
              <stop offset="100%" stopColor="#15803D" /> {/* Extreme Greed - Dark Green */}
            </linearGradient>
          </defs>
          
          {/* Single gauge background with gradient fill */}
          <path
            d="M 20 150 A 130 130 0 0 1 280 150"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="30"
            strokeLinecap="round"
          />
          
          {/* Needle with improved visibility */}
          <g transform={`rotate(${getNeedleRotation(currentValue)}, 150, 150)`}>
            <line x1="150" y1="150" x2="150" y2="50" stroke="white" strokeWidth="4" strokeOpacity="1" />
            <circle cx="150" cy="150" r="10" fill="white" fillOpacity="1" />
          </g>
        </svg>
      </div>
      
      {/* Current value and label */}
      <div className="text-center">
        <div className="text-6xl font-bold text-white">{currentValue}</div>
        <div className={`text-lg font-semibold mt-2 px-4 py-1 rounded-full ${sentiment.color} inline-block shadow-lg`}>
          {sentiment.label}
        </div>
      </div>
    </div>
  );
};
