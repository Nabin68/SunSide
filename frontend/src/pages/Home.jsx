import React, { useState, useEffect, useRef } from 'react';
import MapView from '../components/MapView';
import RouteCard from '../components/RouteCard';
import SkeletonCard from '../components/SkeletonCard';
import { useGeolocation } from '../hooks/useGeolocation';
import { analyzeRoute, fetchSuggestions } from '../services/api';
import { COLORS } from '../utils/theme';

const Home = () => {
  const geo = useGeolocation();
  const [origin, setOrigin] = useState({ lat: null, lon: null, address: '' });
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [error, setError] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const autocompleteRef = useRef(null);

  // Load last search
  useEffect(() => {
    const lastSearch = localStorage.getItem('last_sunside_search');
    if (lastSearch) {
      const data = JSON.parse(lastSearch);
      setDestination(data.destination);
    }
  }, []);

  useEffect(() => {
    if (!geo.loading && !geo.error) {
      setOrigin({ lat: geo.lat, lon: geo.lon, address: geo.address });
    }
  }, [geo.loading, geo.error, geo.lat, geo.lon, geo.address]);

  // Debounced autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destination.length > 2 && showAutocomplete) {
        try {
          const data = await fetchSuggestions(destination);
          setSuggestions(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [destination, showAutocomplete]);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!origin.address) {
      setError("Please provide a starting point.");
      return;
    }
    if (!destination) {
      setError("Please enter a destination.");
      return;
    }
    if (origin.address.toLowerCase().trim() === destination.toLowerCase().trim()) {
      setError("Origin and destination cannot be the same.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedRoute(null);
    setIsPanelCollapsed(window.innerWidth < 768); // Collapse on mobile after search

    try {
      const payload = {
        origin_lat: origin.lat,
        origin_lon: origin.lon,
        destination: destination,
        departure_time: departureTime
      };
      const data = await analyzeRoute(payload);
      setResults(data);
      setSelectedRoute(data.routes[data.best_route_index]);
      
      // Save to localStorage
      localStorage.setItem('last_sunside_search', JSON.stringify({ destination }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const isTimeInPast = () => {
    return new Date(departureTime) < new Date();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans text-gray-900 bg-gray-100">
      {/* Navbar / Logo */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg w-fit pointer-events-auto border border-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 12H16M16 12L14 10M16 12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-black text-sm tracking-tighter">SunSide</span>
        </div>
      </div>

      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapView 
          routes={results?.routes || []} 
          origin={origin.lat ? { lat: origin.lat, lon: origin.lon } : null}
          destination={results ? { lat: results.routes[0].geometry[results.routes[0].geometry.length-1][0], lon: results.routes[0].geometry[results.routes[0].geometry.length-1][1] } : null}
          bestRouteIndex={results?.best_route_index}
          selectedRouteIndex={selectedRoute?.route_index}
          onRouteClick={(route) => setSelectedRoute(route)}
          departureTime={departureTime}
        />
      </div>

      {/* Summary Banner */}
      {results && !loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl text-center text-sm font-bold border-2 border-white/20 backdrop-blur-sm">
            🌤️ Sit on the <span className="underline decoration-2 underline-offset-4">{results.routes[results.best_route_index].recommended_side}</span> side for the most comfortable journey
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="relative z-10 p-4 md:p-8 flex flex-col md:flex-row gap-6 h-full pointer-events-none">
        
        {/* Search Panel */}
        <div className={`bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md pointer-events-auto border border-white/50 transition-all duration-500 ease-in-out self-start ${
          isPanelCollapsed ? 'h-20 overflow-hidden' : 'h-auto'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black tracking-tight">Plan Your Trip</h2>
            <button 
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isPanelCollapsed ? '▼' : '▲'}
            </button>
          </div>

          <div className="space-y-5">
            {/* Origin Input */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Starting From</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={origin.address}
                  onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
                  placeholder={geo.loading ? "Locating you..." : "Enter starting point"}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-400 transition-all"
                />
                {geo.loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {geo.denied && (
                <p className="text-[10px] text-orange-600 font-bold ml-1">Location access denied. Please enter manually.</p>
              )}
            </div>

            {/* Destination Input */}
            <div className="space-y-1 relative" ref={autocompleteRef}>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Heading To</label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowAutocomplete(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Where to?"
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-400 transition-all"
              />
              {/* Autocomplete Dropdown */}
              {showAutocomplete && suggestions.length > 0 && (
                <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
                  {suggestions.map((s, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        setDestination(s.display_name);
                        setShowAutocomplete(false);
                      }}
                      className="p-4 text-xs font-medium hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 truncate"
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
              {error && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-wider">{error}</p>}
            </div>

            {/* Time Picker */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Departure Time</label>
              <input 
                type="datetime-local" 
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-400 transition-all"
              />
              {isTimeInPast() && (
                <p className="text-[10px] text-orange-600 font-bold ml-1">⚠️ This time is in the past.</p>
              )}
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-300' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? "Analyzing..." : "Find Best Side ☀️"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 flex flex-col items-center md:items-end justify-end md:justify-start gap-4 pb-12 md:pb-0">
          {loading ? (
            <SkeletonCard />
          ) : (
            selectedRoute && (
              <RouteCard 
                route={selectedRoute} 
                isBest={selectedRoute.route_index === results?.best_route_index} 
                originAddress={origin.address}
                destinationName={results?.destination_name || destination}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
