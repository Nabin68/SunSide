import React, { useState, useEffect, useRef } from 'react';
import MapView from '../components/MapView';
import RouteCard from '../components/RouteCard';
import SkeletonCard from '../components/SkeletonCard';
import AboutModal from '../components/AboutModal';
import { useGeolocation } from '../hooks/useGeolocation';
import { analyzeRoute, fetchSuggestions } from '../services/api';

const HowItWorks = () => (
  <div className="p-8 text-center border-t border-gray-100 bg-gray-50/50">
    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">How SunSide Works</h3>
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <span className="text-xl mb-1">☀️</span>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Track Sun Position</p>
      </div>
      <div className="w-px h-4 bg-gray-200 mx-auto"></div>
      <div className="flex flex-col items-center">
        <span className="text-xl mb-1">🧭</span>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Compare with Bearing</p>
      </div>
      <div className="w-px h-4 bg-gray-200 mx-auto"></div>
      <div className="flex flex-col items-center">
        <span className="text-xl mb-1">💺</span>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Recommend the Best Seat</p>
      </div>
    </div>
  </div>
);

const Home = () => {
  const geo = useGeolocation();
  const [origin, setOrigin] = useState({ lat: null, lon: null, address: '' });
  const [destination, setDestination] = useState('');
  const [originInput, setOriginInput] = useState('');
  
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
  const [activeField, setActiveField] = useState(null); 

  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [error, setError] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const lastSearch = localStorage.getItem('last_sunside_search');
    if (lastSearch) {
      const data = JSON.parse(lastSearch);
      setDestination(data.destination);
    }
  }, []);

  useEffect(() => {
    if (!geo.loading && !geo.error && !originInput) {
      setOrigin({ lat: geo.lat, lon: geo.lon, address: geo.address });
      setOriginInput(geo.address);
    }
    if (isLocating && !geo.loading) {
      setIsLocating(false);
      setOriginInput(geo.address || '');
      setOrigin({ ...geo });
    }
  }, [geo.loading, geo.error, geo.lat, geo.lon, geo.address, originInput, isLocating]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = activeField === 'origin' ? originInput : destination;
      if (query?.length > 2) {
        try {
          const data = await fetchSuggestions(query);
          if (activeField === 'origin') setOriginSuggestions(data);
          else setDestSuggestions(data);
        } catch (err) {}
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [originInput, destination, activeField]);

  const handleSwap = () => {
    const oldOrigin = originInput;
    const oldDest = destination;
    setOriginInput(oldDest);
    setDestination(oldOrigin);
    setOrigin({ ...origin, lat: null, lon: null, address: oldDest });
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    geo.refresh();
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!originInput || !destination) {
      setError("Both fields are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedRoute(null);
    
    try {
      const data = await analyzeRoute({
        origin: originInput,
        destination: destination,
        departure_time: departureTime
      });
      setResults(data);
      if (data.routes && data.routes.length > 0) {
        setSelectedRoute(data.routes[data.best_route_index]);
      }
      setIsSearchExpanded(false);
      localStorage.setItem('last_sunside_search', JSON.stringify({ destination }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, field) => {
    const list = field === 'origin' ? originSuggestions : destSuggestions;
    if (e.key === 'ArrowDown') setFocusedSuggestion(prev => Math.min(prev + 1, list.length - 1));
    else if (e.key === 'ArrowUp') setFocusedSuggestion(prev => Math.max(prev - 1, 0));
    else if (e.key === 'Enter') {
      if (focusedSuggestion >= 0) {
        const item = list[focusedSuggestion];
        if (item) {
          if (field === 'origin') { setOriginInput(item.display_name); setOrigin({ ...item }); setOriginSuggestions([]); }
          else { setDestination(item.display_name); setDestSuggestions([]); }
          setFocusedSuggestion(-1); setActiveField(null); e.preventDefault();
        }
      }
    } else if (e.key === 'Escape') {
      setOriginSuggestions([]); setDestSuggestions([]); setActiveField(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-900 bg-white">
      
      {/* SIDEBAR */}
      <div className="relative w-full md:w-[380px] md:min-w-[380px] h-full flex flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.05)] bg-white border-r border-gray-100">
        
        {/* Search Section */}
        <div className={`p-6 border-b border-gray-100 transition-all duration-500 ${!isSearchExpanded && results ? 'bg-orange-50/20' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black tracking-tighter text-orange-500">SunSide</h1>
            {!isSearchExpanded && results && (
              <button 
                onClick={() => setIsSearchExpanded(true)}
                className="text-[10px] font-black text-orange-600 bg-white border border-orange-100 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-orange-50 shadow-sm mr-10"
              >
                Edit
              </button>
            )}
          </div>

          {(isSearchExpanded || !results) ? (
            <div className="space-y-4 relative animate-in fade-in zoom-in-95">
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 mb-1 block">Starting From</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={originInput}
                    onChange={(e) => { setOriginInput(e.target.value); setActiveField('origin'); }}
                    onKeyDown={(e) => handleKeyDown(e, 'origin')}
                    onFocus={() => setActiveField('origin')}
                    className="w-full bg-gray-50 border-none rounded-2xl pl-5 pr-24 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-400 transition-all"
                    placeholder="Search start..."
                  />
                  <button 
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      isLocating 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 shadow-sm'
                    }`}
                  >
                    {isLocating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                        Locating...
                      </>
                    ) : (
                      <>📍 GPS</>
                    )}
                  </button>

                  {activeField === 'origin' && originSuggestions.length > 0 && (
                    <div className="absolute z-[300] top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-y-auto max-h-60">
                      {originSuggestions.map((s, i) => (
                        <div key={i} onClick={() => { setOriginInput(s.display_name); setOrigin({ ...s }); setOriginSuggestions([]); setActiveField(null); }} className={`p-4 text-xs font-bold flex items-center gap-3 cursor-pointer border-b border-gray-50 last:border-0 ${focusedSuggestion === i ? 'bg-yellow-50 text-orange-600' : 'hover:bg-gray-50'}`}>
                          📍 <span className="truncate">{s.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 top-[4.5rem] z-[210]">
                <button onClick={handleSwap} className="w-10 h-10 bg-orange-500 text-white rounded-full shadow-lg border-4 border-white hover:bg-orange-600 active:scale-90 flex items-center justify-center font-black">⇅</button>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 mb-1 block">Destination</label>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setActiveField('dest'); }}
                  onKeyDown={(e) => handleKeyDown(e, 'dest')}
                  onFocus={() => setActiveField('dest')}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-400 transition-all"
                  placeholder="Where to?"
                />
                {activeField === 'dest' && destSuggestions.length > 0 && (
                  <div className="absolute z-[300] top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-y-auto max-h-60">
                    {destSuggestions.map((s, i) => (
                      <div key={i} onClick={() => { setDestination(s.display_name); setDestSuggestions([]); setActiveField(null); }} className={`p-4 text-xs font-bold flex items-center gap-3 cursor-pointer border-b border-gray-50 last:border-0 ${focusedSuggestion === i ? 'bg-yellow-50 text-orange-600' : 'hover:bg-gray-50'}`}>
                        🚩 <span className="truncate">{s.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 mb-1 block">Departure</label>
                <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-400 transition-all" />
              </div>

              <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 rounded-[1.2rem] font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xl transition-all disabled:bg-gray-300">
                {loading ? "Analyzing..." : "Find Best Side ☀️"}
              </button>
              {error && <p className="text-[10px] text-red-500 font-black uppercase text-center mt-2">{error}</p>}
            </div>
          ) : (
            <div className="animate-in slide-in-from-top-2 duration-500">
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Your Route</p>
                    <p className="text-sm font-bold text-gray-700 truncate">
                      {originInput.split(',')[0]} → {destination.split(',')[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">🕐 Departing:</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">{results.departure_info}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading && (
            <div className="p-6 space-y-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          
          {results && !loading && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Available Routes</h2>
                <span className="text-[10px] font-bold text-gray-300">{results.routes.length} found</span>
              </div>
              {results.routes.map((route, i) => (
                <RouteCard 
                  key={i}
                  route={route}
                  isBest={i === results.best_route_index}
                  isSelected={selectedRoute === route}
                  originName={results.origin_name}
                  destinationName={results.destination_name}
                  onClick={() => setSelectedRoute(route)}
                />
              ))}
              <HowItWorks />
            </div>
          )}

          {!results && !loading && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <span className="text-4xl mb-4 opacity-50">🗺️</span>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">
                  Enter your route to start.<br/>We'll handle the sun.
                </p>
              </div>
              <HowItWorks />
            </div>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 h-full relative z-10">
        <MapView 
          routes={results?.routes || []} 
          origin={results ? { lat: results.routes[0]?.geometry[0][0], lon: results.routes[0]?.geometry[0][1] } : (origin.lat ? { lat: origin.lat, lon: origin.lon } : null)}
          destination={results ? { lat: results.routes[0]?.geometry[results.routes[0]?.geometry.length-1][0], lon: results.routes[0]?.geometry[results.routes[0]?.geometry.length-1][1] } : null}
          bestRouteIndex={results?.best_route_index}
          selectedRouteIndex={selectedRoute ? results?.routes.indexOf(selectedRoute) : -1}
          onRouteClick={(route) => setSelectedRoute(route)}
          departureTime={departureTime}
          originName={results?.origin_name}
          destinationName={results?.destination_name}
        />
      </div>

      {/* MODALS & FLOATING UI */}
      <button 
        onClick={() => setIsAboutOpen(true)}
        className="fixed top-6 right-6 z-[999] group flex items-center gap-2"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-gray-100 text-gray-500">
          About SunSide
        </span>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all shadow-2xl border border-gray-100 font-bold text-lg">
          ⓘ
        </div>
      </button>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

    </div>
  );
};

export default Home;
