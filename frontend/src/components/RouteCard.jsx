import React, { useState } from 'react';
import PropTypes from 'prop-types';

const RouteCard = ({ route, isBest, isSelected, originName, destinationName, onClick }) => {
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins} min`;
    return `${hrs}h ${mins}m`;
  };

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const text = `Traveling from ${originName} to ${destinationName}? Sit on the ${route.recommended_side} side (Route ${route.route_index + 1})! 🌤️ via SunSide`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ensure minimum sliver for visibility
  const leftW = Math.max(route.left_percent, route.right_percent > 95 ? 4 : 0);
  const rightW = Math.max(route.right_percent, route.left_percent > 95 ? 4 : 0);

  return (
    <div 
      onClick={onClick}
      className={`relative bg-white rounded-3xl shadow-lg p-6 pt-8 w-full cursor-pointer transition-all duration-300 border-2 ${
        isSelected ? 'border-orange-500 scale-[1.02] ring-4 ring-orange-50' : (isBest ? 'border-orange-200' : 'border-gray-100 hover:border-gray-200')
      }`}
    >
      {isBest && (
        <div className="absolute -top-3 left-6 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 border-2 border-white">
          🏆 Best Comfort
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-gray-800 tracking-tight">
              Route {route.route_index + 1}
            </h3>
            <span className="text-xs font-bold text-gray-400">
               · {formatDuration(route.duration_seconds)}
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
            {route.sun_period.replace(' ', ' · ')} · {formatDistance(route.distance_meters)}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-wider uppercase border-2 ${
          route.recommended_side === 'LEFT' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          Recommend {route.recommended_side}
        </div>
      </div>
      
      <p className="text-[9px] text-gray-400 font-bold mb-4">Est. by road speed · actual may vary</p>

      <div className="space-y-4">
        <div>
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
            <div 
              className="h-full bg-[#F5A623] transition-all duration-1000 ease-out" 
              style={{ width: `${leftW}%` }}
            />
            <div 
              className="h-full bg-[#3B82F6] transition-all duration-1000 ease-out" 
              style={{ width: `${rightW}%` }}
            />
          </div>
          {/* Color Legend */}
          <div className="flex justify-between items-center mt-2 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F5A623]"></div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-[#F5A623]">Left {Math.round(route.left_percent)}%</span>
            </div>
            <div className="flex-1 mx-4 h-[1px] bg-gray-100"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-tighter text-[#3B82F6]">{Math.round(route.right_percent)}% Right</span>
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-4 space-y-2 border border-gray-100">
          <div className="flex justify-between text-[10px] font-bold text-gray-500">
            <span>🕐 Departs: {route.departure_time_str}</span>
            <span>🏁 Arrives: ~{formatTime(route.arrival_time)}</span>
          </div>
          <p className="text-xs font-bold text-gray-700 leading-tight">
            ☀️ {route.exposure_summary}
          </p>
          <p className="text-[10px] text-gray-400 font-medium leading-tight">
            {route.recommendation_reason}
          </p>
        </div>

        {route.worst_segment_note && (
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-3 flex items-start gap-2">
            <span className="text-xs">⚠️</span>
            <p className="text-[10px] font-bold text-red-600 leading-tight">
              {route.worst_segment_note}
            </p>
          </div>
        )}

        <button 
          onClick={handleShare}
          className="w-full py-3 rounded-2xl bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100"
        >
          {copied ? '✅ Copied!' : '📤 Share Results'}
        </button>
      </div>
    </div>
  );
};

RouteCard.propTypes = {
  route: PropTypes.object.isRequired,
  isBest: PropTypes.bool,
  isSelected: PropTypes.bool,
  originName: PropTypes.string,
  destinationName: PropTypes.string,
  onClick: PropTypes.func
};

export default RouteCard;
