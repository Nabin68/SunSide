import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { getSunPosition } from '../services/api';

// Custom SVG Markers
const createCustomMarker = (label, color) => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    ">
      ${label}
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const originIcon = createCustomMarker('A', '#22C55E');
const destIcon = createCustomMarker('B', '#EF4444');

const sunIcon = L.divIcon({
  html: '<div class="text-3xl animate-pulse drop-shadow-lg">☀️</div>',
  className: 'sun-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const BoundsSetter = ({ routes, selectedRouteIndex }) => {
  const map = useMap();
  useEffect(() => {
    // Force Leaflet to recalculate container size after sidebar layout changes
    map.invalidateSize();
    
    if (routes && routes.length > 0) {
      const routeToFocus = routes[selectedRouteIndex] || routes[0];
      if (routeToFocus && routeToFocus.geometry && routeToFocus.geometry.length > 0) {
        map.fitBounds(routeToFocus.geometry, { padding: [80, 80], animate: true, duration: 1.5 });
      }
    }
  }, [routes, selectedRouteIndex, map]);
  return null;
};

const SunIndicator = ({ origin, time }) => {
  const [sunPos, setSunPos] = useState(null);
  useEffect(() => {
    if (origin && time) {
      getSunPosition(origin.lat, origin.lon, time).then(data => {
        const distance = 0.015;
        const azimuthRad = (data.azimuth - 90) * (Math.PI / 180);
        const lat = origin.lat + distance * Math.sin(azimuthRad);
        const lon = origin.lon + distance * Math.cos(azimuthRad);
        setSunPos([lat, lon]);
      });
    }
  }, [origin, time]);
  if (!sunPos) return null;
  return (
    <Marker position={sunPos} icon={sunIcon}>
      <Tooltip direction="top" opacity={1}>
        <span className="font-bold">☀️ Sun direction</span>
      </Tooltip>
    </Marker>
  );
};

const MapView = ({ routes, origin, destination, bestRouteIndex, selectedRouteIndex, onRouteClick, departureTime, originName, destinationName }) => {
  return (
    <MapContainer 
      center={[origin?.lat || 51.505, origin?.lon || -0.09]} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      {routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        const isBest = idx === bestRouteIndex;
        
        return (
          <Polyline
            key={`${idx}-${isSelected}`}
            positions={route.geometry}
            pathOptions={{
              color: isBest ? '#F5A623' : '#94A3B8',
              weight: isSelected ? 8 : (isBest ? 6 : 4),
              opacity: isSelected ? 1 : 0.4,
              lineJoin: 'round',
              dashArray: isSelected ? '1, 12' : null,
              className: isSelected ? 'animate-dash' : ''
            }}
            eventHandlers={{
              click: () => onRouteClick(route)
            }}
          />
        );
      })}

      {origin && (
        <Marker position={[origin.lat, origin.lon]} icon={originIcon}>
          <Tooltip direction="top" offset={[0, -20]} opacity={1}>
            <span className="font-bold">A: {originName || 'Start'}</span>
          </Tooltip>
        </Marker>
      )}
      
      {destination && (
        <Marker position={[destination.lat, destination.lon]} icon={destIcon}>
          <Tooltip direction="top" offset={[0, -20]} opacity={1}>
            <span className="font-bold">B: {destinationName || 'End'}</span>
          </Tooltip>
        </Marker>
      )}

      {origin && <SunIndicator origin={origin} time={departureTime} />}

      <BoundsSetter routes={routes} selectedRouteIndex={selectedRouteIndex} />
    </MapContainer>
  );
};

MapView.propTypes = {
  routes: PropTypes.array.isRequired,
  origin: PropTypes.object,
  destination: PropTypes.object,
  bestRouteIndex: PropTypes.number,
  selectedRouteIndex: PropTypes.number,
  onRouteClick: PropTypes.func,
  departureTime: PropTypes.string,
  originName: PropTypes.string,
  destinationName: PropTypes.string
};

export default MapView;
