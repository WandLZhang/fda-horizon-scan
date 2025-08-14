import { TrendingUp, Globe, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const ParallelBranches = ({ trendsStatus, geminiStatus }) => {
  const [trendsAnimation, setTrendsAnimation] = useState('');
  const [geminiAnimation, setGeminiAnimation] = useState('');

  useEffect(() => {
    if (trendsStatus.status === 'processing') {
      setTrendsAnimation('processing');
    } else if (trendsStatus.status === 'completed') {
      setTrendsAnimation('completed');
    }
  }, [trendsStatus.status]);

  useEffect(() => {
    if (geminiStatus.status === 'processing') {
      setGeminiAnimation('processing');
    } else if (geminiStatus.status === 'completed') {
      setGeminiAnimation('completed');
    }
  }, [geminiStatus.status]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'idle':
        return <Clock size={20} className="status-icon idle" />;
      case 'processing':
        return <div className="spinner-small" />;
      case 'completed':
        return <CheckCircle size={20} className="status-icon success" />;
      case 'error':
        return <AlertCircle size={20} className="status-icon error" />;
      default:
        return null;
    }
  };

  const formatResult = (result, type) => {
    if (!result) return null;

    if (type === 'trends') {
      return (
        <div className="result-content">
          <div className="trends-results">
            {result.results.map((item, index) => (
              <div key={index} className="trend-item">
                <span className="trend-topic">{item.dma_name || item.topic} - {item.query_volume}</span>
                <span className={`trend-badge ${item.risk}`}>{item.trend}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'gemini') {
      return (
        <div className="result-content">
          <div className="gemini-results">
            {result.results.map((item, index) => (
              <div key={index} className="gemini-item">
                <div className="gemini-header">
                  <span className={`severity-badge ${item.severity}`}>
                    {item.severity.toUpperCase()}
                  </span>
                  <span className="gemini-date">{item.date}</span>
                </div>
                <h4 className="gemini-title">{item.title}</h4>
                <p className="gemini-summary">{item.summary}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="gemini-link">
                  View Source →
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="parallel-branches">
      <div className="branches-container">
        {/* Health Trends Branch */}
        <div className={`branch glass-container ${trendsAnimation}`}>
          <div className="branch-header">
            <div className="branch-icon">
              <TrendingUp size={24} />
            </div>
            <div className="branch-title">
              <h3>Google Health Trends API</h3>
              <p className="branch-subtitle">Pattern Detection & Analysis</p>
            </div>
            <div className="branch-status">
              {getStatusIcon(trendsStatus.status)}
              <span className="status-text">{trendsStatus.status}</span>
            </div>
          </div>
          
          <div className="branch-content">
            {trendsStatus.status === 'processing' && (
              <div className="processing-animation">
                <div className="pulse-ring"></div>
                <p className="processing-text">Analyzing health trend patterns...</p>
                <div className="data-points">
                  <span className="data-point">• Scanning search volumes</span>
                  <span className="data-point">• Detecting anomalies</span>
                  <span className="data-point">• Geographic clustering</span>
                </div>
              </div>
            )}
            
            {trendsStatus.data && formatResult(trendsStatus.data, 'trends')}
          </div>

          {trendsStatus.status === 'processing' && (
            <div className="data-flow-indicator trends-flow">
              <div className="flow-particle"></div>
              <div className="flow-particle"></div>
              <div className="flow-particle"></div>
            </div>
          )}
        </div>

        {/* Gemini RAG Branch */}
        <div className={`branch glass-container ${geminiAnimation}`}>
          <div className="branch-header">
            <div className="branch-icon gemini">
              <Globe size={24} />
            </div>
            <div className="branch-title">
              <h3>Gemini 2.5 Flash + Search</h3>
              <p className="branch-subtitle">Emerging Threats</p>
            </div>
            <div className="branch-status">
              {getStatusIcon(geminiStatus.status)}
              <span className="status-text">{geminiStatus.status}</span>
            </div>
          </div>
          
          <div className="branch-content">
            {geminiStatus.status === 'processing' && (
              <div className="processing-animation">
                <div className="pulse-ring gemini"></div>
                <p className="processing-text">Searching live sources...</p>
                <div className="data-points">
                  <span className="data-point">• Social media health trends</span>
                  <span className="data-point">• E-commerce product risks</span>
                  <span className="data-point">• Local emergency reports</span>
                </div>
              </div>
            )}
            
            {geminiStatus.data && formatResult(geminiStatus.data, 'gemini')}
          </div>

          {geminiStatus.status === 'processing' && (
            <div className="data-flow-indicator gemini-flow">
              <div className="flow-particle"></div>
              <div className="flow-particle"></div>
              <div className="flow-particle"></div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .parallel-branches {
          width: 100%;
          position: relative;
        }

        .branches-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
          position: relative;
        }

        .branch {
          min-height: 400px;
          transition: all var(--animation-normal) ease;
          position: relative;
          overflow: visible;
        }

        .branch.processing {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .branch.completed {
          border-color: rgba(0, 170, 0, 0.3);
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 
              0 8px 32px rgba(11, 87, 208, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
        }

        .branch-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--glass-border);
        }

        .branch-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--fda-blue) 0%, var(--fda-dark-blue) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .branch-icon.gemini {
          background: linear-gradient(135deg, #ff8800 0%, #ff6600 100%);
        }

        .branch-title {
          flex: 1;
        }

        .branch-title h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .branch-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
        }

        .branch-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
        }

        .status-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .status-icon.idle {
          color: var(--text-muted);
        }

        .status-icon.success {
          color: var(--alert-low);
        }

        .status-icon.error {
          color: var(--alert-critical);
        }

        .branch-content {
          padding: var(--spacing-lg);
          min-height: 250px;
        }

        .processing-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl) 0;
        }

        .pulse-ring {
          width: 60px;
          height: 60px;
          border: 3px solid var(--fda-blue);
          border-radius: 50%;
          position: relative;
          animation: pulseRing 2s ease-out infinite;
        }

        .pulse-ring.gemini {
          border-color: #ff8800;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.8);
            opacity: 1;
          }
        }

        .processing-text {
          margin-top: var(--spacing-lg);
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .data-points {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .data-point {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Data Flow Indicator */
        .data-flow-indicator {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 60px;
          background: linear-gradient(180deg, var(--fda-blue) 0%, transparent 100%);
        }

        .data-flow-indicator.gemini-flow {
          background: linear-gradient(180deg, #ff8800 0%, transparent 100%);
        }

        .flow-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--fda-blue);
          border-radius: 50%;
          animation: flowDown 2s ease-out infinite;
        }

        .gemini-flow .flow-particle {
          background: #ff8800;
        }

        .flow-particle:nth-child(2) {
          animation-delay: 0.6s;
        }

        .flow-particle:nth-child(3) {
          animation-delay: 1.2s;
        }

        @keyframes flowDown {
          0% {
            top: 0;
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        /* Results Styling */
        .result-content {
          animation: fadeIn 0.5s ease-out;
        }


        .trends-results {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
        }

        .trend-topic {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .trend-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .trend-badge.high {
          background: rgba(255, 68, 68, 0.2);
          color: var(--alert-critical);
        }

        .trend-badge.medium {
          background: rgba(255, 187, 0, 0.2);
          color: var(--alert-medium);
        }

        .gemini-results {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .gemini-item {
          padding: var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }

        .gemini-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .severity-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .severity-badge.high {
          background: rgba(255, 68, 68, 0.2);
          color: var(--alert-critical);
        }

        .severity-badge.medium {
          background: rgba(255, 187, 0, 0.2);
          color: var(--alert-medium);
        }

        .gemini-date {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .gemini-title {
          font-size: 1rem;
          margin: var(--spacing-sm) 0;
          color: var(--text-primary);
        }

        .gemini-summary {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .gemini-link {
          font-size: 0.875rem;
          color: var(--fda-blue);
          text-decoration: none;
          transition: color var(--animation-fast) ease;
        }

        .gemini-link:hover {
          color: var(--fda-light-blue);
        }

        @media (max-width: 768px) {
          .branches-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ParallelBranches;
