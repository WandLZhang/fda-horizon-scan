import { useEffect, useState } from 'react';

const AnimatedFlow = ({ from, to, active }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      // Generate particles
      const newParticles = Array.from({ length: 3 }, (_, i) => ({
        id: `particle-${from}-${to}-${i}`,
        delay: i * 0.3
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active, from, to]);

  return (
    <div className="animated-flow">
      <svg className="flow-svg" viewBox="0 0 100 60">
        <defs>
          <linearGradient id={`gradient-${from}-${to}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--fda-blue)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--fda-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Main flow line */}
        <line
          x1="50"
          y1="0"
          x2="50"
          y2="60"
          stroke={`url(#gradient-${from}-${to})`}
          strokeWidth="2"
          strokeDasharray="5,5"
          className={active ? 'flow-line active' : 'flow-line'}
        />
        
        {/* Animated particles */}
        {particles.map((particle) => (
          <circle
            key={particle.id}
            cx="50"
            cy="0"
            r="3"
            fill="var(--fda-blue)"
            className="flow-particle"
            style={{
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </svg>

      <style>{`
        .animated-flow {
          height: 60px;
          width: 100%;
          display: flex;
          justify-content: center;
          position: relative;
          margin: calc(var(--spacing-lg) * -1) 0;
          z-index: 1;
        }

        .flow-svg {
          width: 100px;
          height: 60px;
        }

        .flow-line {
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .flow-line.active {
          opacity: 1;
          animation: dashFlow 2s linear infinite;
        }

        @keyframes dashFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -10;
          }
        }

        .flow-particle {
          opacity: 0;
          animation: particleFlow 2s ease-in-out infinite;
        }

        @keyframes particleFlow {
          0% {
            cy: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            cy: 60;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedFlow;
