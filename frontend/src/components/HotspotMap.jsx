import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HotspotMap = ({ hotspots = [], events = [] }) => {
  const mapRef = useRef(null);

  // US center coordinates
  const center = [39.8283, -98.5795];
  const zoom = 4;

  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffbb00';
      case 'low': return '#00aa00';
      default: return '#0b57d0';
    }
  };

  // Calculate radius based on intensity
  const getRadius = (intensity) => {
    const baseRadius = 10;
    const scale = Math.log(intensity + 1) * 3;
    return Math.min(baseRadius + scale, 30);
  };

  // Aggregate hotspots by location
  const aggregatedHotspots = hotspots.reduce((acc, hotspot) => {
    const key = `${hotspot.lat}-${hotspot.lng}`;
    if (!acc[key]) {
      acc[key] = {
        ...hotspot,
        totalIntensity: hotspot.intensity,
        types: [hotspot.type],
        count: 1
      };
    } else {
      acc[key].totalIntensity += hotspot.intensity;
      if (!acc[key].types.includes(hotspot.type)) {
        acc[key].types.push(hotspot.type);
      }
      acc[key].count += 1;
    }
    return acc;
  }, {});

  return (
    <div className="hotspot-map-container glass-container">
      <div className="map-header">
        <h3>US Health Trend Hotspots</h3>
        <p>Real-time geographic distribution of health incidents</p>
      </div>

      <div className="map-legend">
        <span className="legend-item">
          <span className="legend-dot critical"></span>
          Critical
        </span>
        <span className="legend-item">
          <span className="legend-dot high"></span>
          High
        </span>
        <span className="legend-item">
          <span className="legend-dot medium"></span>
          Medium
        </span>
        <span className="legend-item">
          <span className="legend-dot low"></span>
          Low
        </span>
      </div>

      <div className="map-wrapper">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          ref={mapRef}
          style={{ height: '500px', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {Object.values(aggregatedHotspots).map((hotspot, index) => (
            <CircleMarker
              key={index}
              center={[hotspot.lat, hotspot.lng]}
              radius={getRadius(hotspot.totalIntensity)}
              fillColor={getSeverityColor(hotspot.severity)}
              color={getSeverityColor(hotspot.severity)}
              weight={2}
              opacity={0.8}
              fillOpacity={0.4}
              className="pulsating-marker"
            >
              <Popup>
                <div className="hotspot-popup" style={{ color: '#000000', backgroundColor: 'white' }}>
                  <h4 style={{ color: '#000000', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600' }}>
                    {hotspot.city}, {hotspot.state}
                  </h4>
                  <p style={{ color: '#000000', margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#000000', fontWeight: '600' }}>Cases:</strong> {hotspot.totalIntensity.toLocaleString()}
                  </p>
                  <p style={{ color: '#000000', margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#000000', fontWeight: '600' }}>Severity:</strong> <span className={`severity-badge ${hotspot.severity}`}>{hotspot.severity}</span>
                  </p>
                  <p style={{ color: '#000000', margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#000000', fontWeight: '600' }}>Types:</strong> {hotspot.types.join(', ')}
                  </p>
                  {hotspot.count > 1 && (
                    <p style={{ color: '#000000', margin: '4px 0', fontSize: '0.9rem' }}>
                      <strong style={{ color: '#000000', fontWeight: '600' }}>Multiple incidents:</strong> {hotspot.count}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-value">{Object.keys(aggregatedHotspots).length}</span>
          <span className="stat-label">Active Hotspots</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {hotspots.reduce((sum, h) => sum + h.intensity, 0).toLocaleString()}
          </span>
          <span className="stat-label">Total Cases</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {[...new Set(hotspots.map(h => h.state))].length}
          </span>
          <span className="stat-label">States Affected</span>
        </div>
      </div>

      <style jsx>{`
        .hotspot-map-container {
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .map-header {
          margin-bottom: var(--spacing-lg);
        }

        .map-header h3 {
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .map-header p {
          margin: 0;
          color: var(--text-secondary);
        }

        .map-legend {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-sm);
          width: fit-content;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }

        .legend-dot.critical {
          background: #ff4444;
          animation: pulse-critical 2s ease-in-out infinite;
        }

        .legend-dot.high {
          background: #ff8800;
          animation: pulse-high 2s ease-in-out infinite;
        }

        .legend-dot.medium {
          background: #ffbb00;
          animation: pulse-medium 2s ease-in-out infinite;
        }

        .legend-dot.low {
          background: #00aa00;
        }

        .map-wrapper {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--glass-border);
          position: relative;
        }

        .map-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(11, 87, 208, 0.05) 50%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .map-stats {
          display: flex;
          gap: var(--spacing-xl);
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-md);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* Popup styles */
        :global(.hotspot-popup) {
          font-family: var(--font-primary);
          min-width: 200px;
        }

        :global(.hotspot-popup h4) {
          margin: 0 0 8px 0 !important;
          font-size: 1.1rem !important;
          color: #000000 !important;
          font-weight: 600 !important;
        }

        :global(.hotspot-popup p) {
          margin: 4px 0 !important;
          font-size: 0.9rem !important;
          color: #000000 !important;
        }

        :global(.hotspot-popup p strong) {
          color: #000000 !important;
          font-weight: 600 !important;
        }

        :global(.severity-badge) {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        :global(.severity-badge.critical) {
          background: #ff4444;
          color: white;
        }

        :global(.severity-badge.high) {
          background: #ff8800;
          color: white;
        }

        :global(.severity-badge.medium) {
          background: #ffbb00;
          color: #333;
        }

        :global(.severity-badge.low) {
          background: #00aa00;
          color: white;
        }

        /* Pulsating animation for markers */
        :global(.pulsating-marker) {
          animation: pulse-marker 2s ease-in-out infinite;
        }

        @keyframes pulse-critical {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 10px 5px rgba(255, 68, 68, 0.3);
          }
        }

        @keyframes pulse-high {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 136, 0, 0.7);
          }
          50% {
            box-shadow: 0 0 10px 5px rgba(255, 136, 0, 0.3);
          }
        }

        @keyframes pulse-medium {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 187, 0, 0.7);
          }
          50% {
            box-shadow: 0 0 10px 5px rgba(255, 187, 0, 0.3);
          }
        }

        @keyframes pulse-marker {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        /* Dark theme for Leaflet */
        :global(.leaflet-map) {
          background: #1a1a1a;
        }

        :global(.leaflet-popup-content-wrapper) {
          background: rgba(255, 255, 255, 0.98) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        :global(.leaflet-popup-content) {
          margin: 12px !important;
          color: #000000 !important;
        }

        :global(.leaflet-popup-content-wrapper .hotspot-popup) {
          color: #000000 !important;
        }

        :global(.leaflet-popup-content-wrapper .hotspot-popup *) {
          color: inherit !important;
        }

        :global(.leaflet-popup-tip) {
          background: rgba(255, 255, 255, 0.98) !important;
        }

        :global(.leaflet-popup-close-button) {
          color: #666 !important;
          font-size: 20px !important;
          font-weight: 400 !important;
        }

        :global(.leaflet-popup-close-button:hover) {
          color: #333 !important;
        }

        :global(.leaflet-control-zoom a) {
          background: rgba(11, 87, 208, 0.9) !important;
          color: white !important;
          border: none !important;
        }

        :global(.leaflet-control-zoom a:hover) {
          background: rgba(11, 87, 208, 1) !important;
        }

        @media (max-width: 768px) {
          .map-wrapper {
            height: 400px;
          }

          .map-legend {
            flex-wrap: wrap;
            gap: var(--spacing-sm);
          }

          .map-stats {
            flex-direction: column;
            gap: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default HotspotMap;
