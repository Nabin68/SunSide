import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { COLORS } from '../utils/theme';

const RouteCard = ({ route, isBest, originAddress, destinationName }) => {
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleShare = () => {
    const text = `Traveling to ${destinationName}? Sit on the ${route.recommended_side} side! 🌤️ via SunSide`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-orange-50 transition-all duration-500 ease-out animate-in slide-in-from-bottom-10">
      {isBest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 border-2 border-white">
          <span>👑</span> Best Choice
        </div>
      )}

      <div className="flex justify-between items-start mb-4 mt-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Route {route.route_index + 1}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {formatDuration(route.duration_seconds)} • {formatDistance(route.distance_meters)}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
          route.recommended_side === 'LEFT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          Sit on {route.recommended_side}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
            <span>Left Side</span>
            <span>Right Side</span>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-orange-400 transition-all duration-1000 ease-out" 
              style={{ width: `${route.left_percent}%` }}
            />
            <div 
              className="h-full bg-blue-400 transition-all duration-1000 ease-out" 
              style={{ width: `${route.right_percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold mt-1.5">
            <span className="text-orange-600">{route.left_percent}% Sun</span>
            <span className="text-blue-600">{route.right_percent}% Sun</span>
          </div>
        </div>

        <div className="pt-1">
          <div className={`p-4 rounded-xl flex items-start gap-3 ${
            route.recommended_side === 'LEFT' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
          }`}>
            <div className="text-xl pt-0.5">
              {route.recommended_side === 'LEFT' ? '✅' : '⚠️'}
            </div>
            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
              {route.recommended_side === 'LEFT' 
                ? "Optimal comfort on the LEFT. You'll avoid most direct sunlight during this trip." 
                : "The sun will be primarily on the left. We recommend sitting on the RIGHT side."}
            </p>
          </div>
        </div>

        <button 
          onClick={handleShare}
          className="w-full py-3 rounded-xl border-2 border-gray-100 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? '✅ Copied!' : '📤 Share Result'}
        </button>
      </div>
    </div>
  );
};

RouteCard.propTypes = {
  route: PropTypes.object.isRequired,
  isBest: PropTypes.bool,
  originAddress: PropTypes.string,
  destinationName: PropTypes.string,
};

export default RouteCard;
