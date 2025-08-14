import { Activity, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import HotspotMap from './HotspotMap';

const EventAggregator = ({ events, isProcessing }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    if (events.length > 0) {
      setAnimateIn(true);
      // Extract hotspot data from events
      const allHotspots = [];
      events.forEach(event => {
        if (event.location && event.location.lat && event.location.lng) {
          allHotspots.push({
            ...event.location,
            intensity: event.affected || 100,
            type: event.type,
            severity: event.severity
          });
        }
      });
      setHotspots(allHotspots);
    }
  }, [events]);

  const totalAffected = events.reduce((sum, event) => sum + (event.affected || 0), 0);
  const criticalEvents = events.filter(e => e.severity === 'critical').length;
  const totalHospitalizations = events.reduce((sum, event) => sum + (event.hospitalizations || 0), 0);


  return (
    <div className={`event-aggregator glass-container ${animateIn ? 'animate-in' : ''}`}>
      <div className="aggregator-header">
        <div className="header-icon">
          <Activity size={24} />
        </div>
        <div className="header-content">
          <h2>Event Aggregation & Risk Analysis</h2>
          <p className="subtitle">Combining social media trends, medical reports, and public health data</p>
        </div>
      </div>

      {/* Interactive Hotspot Map */}
      <HotspotMap 
        hotspots={hotspots}
        events={events}
      />

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon health-risks">
            <Activity size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{events.length}</span>
            <span className="stat-label">HEALTH RISKS</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon critical">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{criticalEvents}</span>
            <span className="stat-label">CRITICAL</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon affected">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalAffected.toLocaleString()}</span>
            <span className="stat-label">AFFECTED PERSONS</span>
          </div>
        </div>
      </div>


      <style jsx>{`
        .event-aggregator {
          margin-top: var(--spacing-xl);
          padding: var(--spacing-xl);
        }

        .aggregator-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: var(--spacing-xl);
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .header-content {
          text-align: left;
          flex: 0 1 auto;
        }

        .header-content h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
          margin-top: 2px;
        }


        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.health-risks {
          background: rgba(59, 130, 246, 0.1);
          color: rgb(59, 130, 246);
        }

        .stat-icon.critical {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
        }

        .stat-icon.affected {
          background: rgba(251, 146, 60, 0.1);
          color: rgb(251, 146, 60);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Events List */
        .events-list {
          display: grid;
          gap: var(--spacing-md);
        }

        .event-card {
          padding: var(--spacing-lg);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          transition: all var(--animation-normal) ease;
        }

        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .severity-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .severity-badge.critical {
          background: rgba(239, 68, 68, 0.15);
          color: rgb(239, 68, 68);
        }

        .severity-badge.high {
          background: rgba(251, 146, 60, 0.15);
          color: rgb(251, 146, 60);
        }

        .severity-badge.medium {
          background: rgba(250, 204, 21, 0.15);
          color: rgb(250, 204, 21);
        }

        .event-type {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .event-title {
          font-size: 1.1rem;
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-primary);
        }

        .event-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          line-height: 1.5;
        }

        .event-stats {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
        }

        .event-stats .stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .event-sources {
          font-size: 0.875rem;
          color: var(--text-muted);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--glass-border);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EventAggregator;
