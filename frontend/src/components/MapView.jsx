import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { getSunPosition } from '../services/api';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Sun Icon
const sunIcon = L.divIcon({
  html: '<div class="text-3xl animate-pulse">☀️</div>',
  className: 'sun-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const BoundsSetter = ({ routes }) => {
  const map = useMap();
  useEffect(() => {
    if (routes && routes.length > 0) {
      const allPoints = routes.flatMap(r => r.geometry);
      if (allPoints.length > 0) {
        map.fitBounds(allPoints, { padding: [100, 100], animate: true, duration: 1.5 });
      }
    }
  }, [routes, map]);
  return null;
};

const SunIndicator = ({ origin, time }) => {
  const [sunPos, setSunPos] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (origin && time) {
      getSunPosition(origin.lat, origin.lon, time).then(data => {
        // Calculate a point some distance from origin based on azimuth
        const distance = 0.02; // Roughly 2km for display
        const azimuthRad = (data.azimuth - 90) * (Math.PI / 180); // Adjust for map orientation
        const lat = origin.lat + distance * Math.sin(azimuthRad);
        const lon = origin.lon + distance * Math.cos(azimuthRad);
        setSunPos([lat, lon]);
      });
    }
  }, [origin, time]);

  if (!sunPos) return null;
  return <Marker position={sunPos} icon={sunIcon} />;
};

const MapView = ({ routes, origin, destination, bestRouteIndex, selectedRouteIndex, onRouteClick, departureTime }) => {
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
              weight: isSelected ? 8 : 4,
              opacity: isSelected ? 1 : 0.4,
              lineJoin: 'round',
              dashArray: isSelected ? '1, 12' : null,
              className: isSelected ? 'animate-dash' : ''
            }}
            eventHandlers={{
              click: () => onRouteClick(route)
            }}
          >
            {/* Smooth transition effect handled via CSS className if supported, 
                or just React re-render */}
          </Polyline>
        );
      })}

      {origin && <Marker position={[origin.lat, origin.lon]} />}
      {destination && <Marker position={[destination.lat, destination.lon]} />}

      {origin && <SunIndicator origin={origin} time={departureTime} />}

      <BoundsSetter routes={routes} />
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
};

export default MapView;
