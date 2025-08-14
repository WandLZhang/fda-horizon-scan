import { useState, useEffect, useRef } from 'react';
import './material.css';
import SearchTrigger from './components/SearchTrigger';
import ParallelBranches from './components/ParallelBranches';
import EventAggregator from './components/EventAggregator';
import SurveillanceDashboard from './components/SurveillanceDashboard';
import AnimatedFlow from './components/AnimatedFlow';
import HotspotMap from './components/HotspotMap';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({
    trends: { status: 'idle', data: null },
    gemini: { status: 'idle', data: null }
  });
  const [aggregatedEvents, setAggregatedEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  
  // Refs for autoscrolling
  const branchesRef = useRef(null);
  const aggregatorRef = useRef(null);
  const dashboardRef = useRef(null);
  const hasScrolledToBranches = useRef(false);
  const hasScrolledToAggregator = useRef(false);

  // Use Cloud Functions Gen2 endpoints
  const API_BASE_URL = 'https://us-central1-wz-fda-horizon-scan.cloudfunctions.net';
  
  console.log('Using Cloud Functions URL:', API_BASE_URL);

  // Smooth scroll helper function
  const smoothScrollTo = (element, offset = 100) => {
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle search trigger with STREAMING for BOTH endpoints
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsScanning(true);
    setScanProgress({
      trends: { status: 'processing', data: null },
      gemini: { status: 'processing', data: null }
    });
    setAggregatedEvents([]);
    setAlerts([]);
    setHotspots([]);
    
    // Reset scroll flags for new search
    hasScrolledToBranches.current = false;
    hasScrolledToAggregator.current = false;
    
    // Scroll to branches section after a short delay to ensure rendering
    setTimeout(() => {
      if (branchesRef.current) {
        smoothScrollTo(branchesRef.current);
        hasScrolledToBranches.current = true;
      }
    }, 300);

    // Track streaming results for both endpoints
    const searchResults = [];
    const trendsResults = [];
    
    try {
      // 1. Start streaming SEARCH results via SSE
      const searchEventSource = new EventSource(`${API_BASE_URL}/searchHealthTrendsStream?query=${encodeURIComponent(query)}`);
      
      searchEventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('Search SSE Connected:', data.timestamp);
        } else if (data.type === 'result') {
          // Add streamed search result
          searchResults.push(data.data);
          
          // Update UI with partial results
          setScanProgress(prev => ({
            ...prev,
            gemini: {
              status: 'processing',
              data: {
                source: 'Gemini 2.5 Flash (Streaming)',
                results: [...searchResults],
                model: 'gemini-2.5-flash',
                query: query,
                timestamp: data.timestamp
              }
            }
          }));
          
          // Ensure branches section is visible when first result arrives
          if (searchResults.length === 1 && !hasScrolledToBranches.current) {
            if (branchesRef.current) {
              smoothScrollTo(branchesRef.current);
              hasScrolledToBranches.current = true;
            }
          }
        } else if (data.type === 'complete') {
          console.log(`Search streaming complete: ${data.total} results`);
          
          // Mark Gemini as complete
          setScanProgress(prev => ({
            ...prev,
            gemini: {
              status: 'completed',
              data: {
                source: 'Gemini 2.5 Flash (Streaming)',
                results: searchResults,
                model: 'gemini-2.5-flash',
                query: query,
                timestamp: data.timestamp
              }
            }
          }));
          
          searchEventSource.close();
        } else if (data.type === 'error') {
          console.error('Search SSE Error:', data.error);
          setScanProgress(prev => ({
            ...prev,
            gemini: {
              status: 'error',
              data: {
                source: 'Gemini 2.5 Flash',
                results: [],
                error: data.error
              }
            }
          }));
          searchEventSource.close();
        }
      };
      
      searchEventSource.onerror = (error) => {
        console.error('Search EventSource error:', error);
        searchEventSource.close();
        
        // Fallback to non-streaming endpoint
        fetch(`${API_BASE_URL}/searchHealthTrends`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
        .then(r => r.json())
        .then(data => {
          setScanProgress(prev => ({
            ...prev,
            gemini: {
              status: 'completed',
              data: data
            }
          }));
        })
        .catch(err => {
          setScanProgress(prev => ({
            ...prev,
            gemini: {
              status: 'error',
              data: {
                source: 'Gemini 2.5 Flash',
                results: [],
                error: err.message
              }
            }
          }));
        });
      };

      // 2. Start streaming TRENDS data via SSE
      const trendsEventSource = new EventSource(`${API_BASE_URL}/getHealthTrendsStream?query=${encodeURIComponent(query)}`);
      
      trendsEventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('Trends SSE Connected:', data.timestamp);
        } else if (data.type === 'trend') {
          // Add streamed trend result
          trendsResults.push(data.data);
          
          // Update UI with partial results
          setScanProgress(prev => ({
            ...prev,
            trends: {
              status: 'processing',
              data: {
                source: 'Google Health Trends API (Streaming)',
                api_version: 'v1beta',
                results: [...trendsResults],
                query: query,
                timestamp: data.timestamp
              }
            }
          }));
          
          // Ensure branches section is visible when first trend arrives
          if (trendsResults.length === 1 && !hasScrolledToBranches.current) {
            if (branchesRef.current) {
              smoothScrollTo(branchesRef.current);
              hasScrolledToBranches.current = true;
            }
          }
        } else if (data.type === 'complete') {
          console.log(`Trends streaming complete: ${data.total} results`);
          
          // Mark Trends as complete
          setScanProgress(prev => ({
            ...prev,
            trends: {
              status: 'completed',
              data: {
                source: 'Google Health Trends API (Streaming)',
                api_version: 'v1beta',
                results: trendsResults,
                date_range: {
                  start: '2025-01-01',
                  end: new Date().toISOString().split('T')[0]
                },
                query: query,
                timestamp: data.timestamp
              }
            }
          }));
          
          trendsEventSource.close();
        } else if (data.type === 'error') {
          console.error('Trends SSE Error:', data.error);
          setScanProgress(prev => ({
            ...prev,
            trends: {
              status: 'error',
              data: {
                source: 'Google Health Trends API',
                results: [],
                error: data.error
              }
            }
          }));
          trendsEventSource.close();
        }
      };
      
      trendsEventSource.onerror = (error) => {
        console.error('Trends EventSource error:', error);
        trendsEventSource.close();
        
        // Fallback to non-streaming endpoint
        fetch(`${API_BASE_URL}/getHealthTrends`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
        .then(r => r.json())
        .then(data => {
          console.log('Trends fallback response:', data);
          setScanProgress(prev => ({
            ...prev,
            trends: {
              status: 'completed',
              data: data
            }
          }));
        })
        .catch(err => {
          setScanProgress(prev => ({
            ...prev,
            trends: {
              status: 'error',
              data: {
                source: 'Google Health Trends API',
                results: [],
                error: err.message
              }
            }
          }));
        });
      };
      
    } catch (error) {
      console.error('Error during search:', error);
      setScanProgress({
        trends: {
          status: 'error',
          data: {
            source: 'Google Health Trends API',
            results: [],
            error: error.message
          }
        },
        gemini: {
          status: 'error',
          data: {
            source: 'Gemini 2.5 Flash',
            results: [],
            error: error.message
          }
        }
      });
      setIsScanning(false);
    }
  };

  // Scroll to Event Aggregator when it renders with data
  useEffect(() => {
    if (aggregatedEvents.length > 0 && !hasScrolledToAggregator.current) {
      // Delay to ensure the aggregator section is fully rendered
      setTimeout(() => {
        if (aggregatorRef.current) {
          smoothScrollTo(aggregatorRef.current);
          hasScrolledToAggregator.current = true;
        }
      }, 500);
    }
  }, [aggregatedEvents]);

  // CLIENT-SIDE aggregation when both data sources are ready
  useEffect(() => {
    if ((scanProgress.trends.status === 'completed' || scanProgress.trends.status === 'error') && 
        (scanProgress.gemini.status === 'completed' || scanProgress.gemini.status === 'error')) {
      
      // Aggregate data client-side
      const events = [];
      const hotspotData = [];
      let totalSearchAffected = 0;
      let totalTrendsAffected = 0;
      
      // Process search results (incidents)
      if (scanProgress.gemini.data && scanProgress.gemini.data.results) {
        scanProgress.gemini.data.results.forEach((result, idx) => {
          const event = {
            id: `search-${idx}`,
            type: 'incident',
            title: result.title,
            source: result.source,
            severity: result.severity,
            date: result.date,
            description: result.summary,
            location: result.location,
            affected: result.affected || 0,
            url: result.url
          };
          events.push(event);
          
          if (result.location && result.location.lat && result.location.lng) {
            hotspotData.push({
              lat: result.location.lat,
              lng: result.location.lng,
              intensity: result.affected || 100,
              city: result.location.city,
              state: result.location.state,
              type: 'incident',
              severity: result.severity
            });
          }
          
          totalSearchAffected += result.affected || 0;
        });
      }
      
      // Process trends data (market volume) - add as events for better metric visibility
      if (scanProgress.trends.data && scanProgress.trends.data.results) {
        scanProgress.trends.data.results.forEach((trend, idx) => {
          // Create trend events for metrics
          const trendEvent = {
            id: `trend-${idx}`,
            type: 'trend',
            title: `High search volume in ${trend.location.city}`,
            source: 'Google Health Trends',
            severity: trend.risk,
            description: `Query volume: ${trend.query_volume}, Trend: ${trend.trend}, DMA: ${trend.dma_name}`,
            location: trend.location,
            affected: trend.affected || 0,
            trending: trend.trend
          };
          events.push(trendEvent);
          
          // Add to hotspots for heatmap
          if (trend.location && trend.location.lat && trend.location.lng) {
            hotspotData.push({
              lat: trend.location.lat,
              lng: trend.location.lng,
              intensity: trend.query_volume,
              city: trend.location.city,
              state: trend.location.state,
              type: 'trend',
              severity: trend.risk,
              dma: trend.dma_name,
              trend: trend.trend,
              affected: trend.affected
            });
          }
          
          totalTrendsAffected += trend.affected || 0;
        });
      }
      
      // Set aggregated data
      setAggregatedEvents(events);
      setAlerts(events.filter(e => e.severity === 'critical' || e.severity === 'high'));
      setHotspots(hotspotData);
      setIsScanning(false);
    }
  }, [scanProgress]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-badge">
            <span className="badge-text">FDA</span>
            <span className="badge-divider">|</span>
            <span className="badge-text">CDRH</span>
          </div>
          <h1>Horizon Scan: Surveillance System</h1>
          <div className="alert-banner">
            ⚠️ ACTIVE: Real-Time Adverse Events & Emerging Threats • Gemini 2.5 + Google Search • 50 States
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Search Trigger Section */}
        <section className="search-section fade-in">
          <SearchTrigger 
            onSearch={handleSearch}
            isScanning={isScanning}
          />
        </section>

        {/* Animated Flow Connector */}
        {searchQuery && (
          <AnimatedFlow 
            from="search" 
            to="branches" 
            active={isScanning}
          />
        )}

        {/* Parallel Branches Section */}
        {searchQuery && (
          <section className="branches-section slide-up" ref={branchesRef}>
            <ParallelBranches 
              trendsStatus={scanProgress.trends}
              geminiStatus={scanProgress.gemini}
            />
          </section>
        )}

        {/* Animated Flow Connector */}
        {scanProgress.trends.data && scanProgress.gemini.data && (
          <AnimatedFlow 
            from="branches" 
            to="aggregator" 
            active={!isScanning && aggregatedEvents.length === 0}
          />
        )}

        {/* Event Aggregator Section */}
        {scanProgress.trends.data && scanProgress.gemini.data && (
          <section className="aggregator-section fade-in" ref={aggregatorRef}>
            <EventAggregator 
              events={aggregatedEvents}
              isProcessing={isScanning}
            />
          </section>
        )}

        {/* Animated Flow Connector */}
        {aggregatedEvents.length > 0 && (
          <AnimatedFlow 
            from="aggregator" 
            to="dashboard" 
            active={false}
          />
        )}

        {/* Surveillance Dashboard Section */}
        {aggregatedEvents.length > 0 && (
          <section className="dashboard-section slide-up" ref={dashboardRef}>
            <SurveillanceDashboard 
              alerts={alerts}
              events={aggregatedEvents}
            />
          </section>
        )}
      </main>

      <style>{`
        .app {
          min-height: 100vh;
          background: var(--bg-gradient);
          padding: 0;
          margin: 0;
        }

        .app-header {
          padding: var(--spacing-xl) var(--spacing-2xl);
          text-align: center;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .header-content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-md);
          background: rgba(11, 87, 208, 0.2);
          border: 1px solid var(--fda-blue);
          border-radius: var(--radius-sm);
          margin-bottom: var(--spacing-md);
        }

        .badge-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--fda-light-blue);
          letter-spacing: 0.1em;
        }

        .badge-divider {
          color: var(--fda-blue);
          opacity: 0.5;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: var(--spacing-sm) 0;
          background: linear-gradient(135deg, #fff 0%, var(--fda-light-blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-top: var(--spacing-sm);
        }

        .tech-stack {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: var(--spacing-xs);
          font-style: italic;
        }

        .alert-banner {
          display: inline-block;
          margin-top: var(--spacing-lg);
          padding: var(--spacing-sm) var(--spacing-lg);
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #ff8888;
          font-weight: 600;
          font-size: 0.9rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .app-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-2xl);
        }

        section {
          margin-bottom: var(--spacing-2xl);
        }

        .search-section {
          display: flex;
          justify-content: center;
        }

        .branches-section,
        .aggregator-section,
        .dashboard-section {
          margin-top: var(--spacing-2xl);
        }

        /* Smooth scroll behavior for the entire page */
        html {
          scroll-behavior: smooth;
        }
        
        /* Visual indicator for scrolling */
        .scroll-indicator {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          width: 3px;
          height: 60px;
          background: linear-gradient(180deg, var(--fda-blue) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1000;
        }
        
        .scroll-indicator.active {
          opacity: 1;
          animation: scrollPulse 1.5s ease-in-out;
        }
        
        @keyframes scrollPulse {
          0% {
            opacity: 0;
            height: 30px;
          }
          50% {
            opacity: 1;
            height: 60px;
          }
          100% {
            opacity: 0;
            height: 30px;
          }
        }

        @media (max-width: 768px) {
          .app-main {
            padding: var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
