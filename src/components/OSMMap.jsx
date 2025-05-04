"use client";

import React, { useEffect, useRef } from 'react';

const OSMMap = () => {
  const mapRef = useRef(null);
  
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // La Salle Campus Barcelona coordinates
      const lat = 41.40874;
      const lon = 2.12185;
      
      // Load Leaflet script dynamically
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletScript.crossOrigin = '';
      document.head.appendChild(leafletScript);
      
      // Load Leaflet CSS
      if (!document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);
      }
      
      // Initialize map after script is loaded
      leafletScript.onload = () => {
        if (!mapRef.current._leaflet_id) {
          const L = window.L;
          const map = L.map(mapRef.current).setView([lat, lon], 16);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Add marker for La Salle Campus
          L.marker([lat, lon])
            .addTo(map)
            .bindPopup('La Salle Campus Barcelona')
            .openPopup();
        }
      };
    }
    
    return () => {
      // Cleanup when component unmounts
      if (mapRef.current && mapRef.current._leaflet_id && window.L) {
        window.L.map(mapRef.current).remove();
      }
    };
  }, []);
  
  return (
    <div id="map" ref={mapRef} className="h-full w-full rounded-lg" />
  );
};

export default OSMMap; 