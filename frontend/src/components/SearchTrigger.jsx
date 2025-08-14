import { useState } from 'react';
import { Search, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

const SearchTrigger = ({ onSearch, isScanning }) => {
  const [query, setQuery] = useState('');

  const quickSearches = [
    { label: "Viral TikTok Health Challenges", query: "tiktok health challenges emergency room hospitalizations teens 2025" },
    { label: "DIY Medical Treatments on Reddit", query: "reddit DIY medical treatments home remedies hospitalizations" },
    { label: "Unregulated Wellness Products", query: "etsy amazon mushroom supplements peptides nootropics unregulated" },
    { label: "Gray Market Weight Loss Drugs", query: "ozempic alternatives overseas imports social media weight loss" },
    { label: "3D Printed Medical Devices", query: "3D printed dental aligners DIY medical devices home manufacturing" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isScanning) {
      onSearch(query);
    }
  };

  const handleQuickSearch = (searchQuery) => {
    if (!isScanning) {
      setQuery(searchQuery);
      onSearch(searchQuery);
    }
  };

  return (
    <div className="search-trigger glass-container">
      <div className="search-header">
        <p>Discover emerging health threats from social media, e-commerce, and local reports before they reach FDA's radar</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Enter surveillance query (e.g., viral health trends, DIY treatments, emerging supplements)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isScanning}
          />
          <button 
            type="submit" 
            className="btn btn-primary search-btn"
            disabled={isScanning || !query.trim()}
          >
            {isScanning ? (
              <>
                <div className="spinner-small" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Start Scan</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="quick-searches">
        <p className="quick-label">Quick Searches:</p>
        <div className="quick-buttons">
          {quickSearches.map((item, index) => (
            <button
              key={index}
              className="btn btn-glass quick-btn"
              onClick={() => handleQuickSearch(item.query)}
              disabled={isScanning}
              title={item.query}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .search-trigger {
          padding: var(--spacing-xl);
          width: 100%;
          max-width: 800px;
        }

        .search-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .search-header h2 {
          margin-bottom: var(--spacing-sm);
        }

        .search-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .search-form {
          margin-bottom: var(--spacing-xl);
        }

        .input-group {
          display: flex;
          gap: var(--spacing-md);
        }

        .input-field {
          flex: 1;
        }

        .search-btn {
          min-width: 150px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .quick-searches {
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--glass-border);
        }

        .quick-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-md);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .quick-buttons {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .quick-btn {
          font-size: 0.9rem;
        }

        .quick-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }

          .search-btn {
            width: 100%;
          }

          .quick-buttons {
            flex-direction: column;
          }

          .quick-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchTrigger;
