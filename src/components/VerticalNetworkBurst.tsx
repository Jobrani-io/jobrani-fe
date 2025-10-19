import { useEffect, useState } from 'react';

const VerticalNetworkBurst = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <svg 
        className={`w-full h-full transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        viewBox="0 0 300 600" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
          
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="300" height="600" fill="url(#bgGradient)" />
        
        {/* Central cluster - main node */}
        <circle 
          cx="150" 
          cy="300" 
          r="8" 
          fill="hsl(var(--primary))"
          className="animate-pulse"
        />
        
        {/* Central cluster - surrounding nodes */}
        <circle cx="130" cy="290" r="4" fill="hsl(var(--primary))" opacity="0.8" />
        <circle cx="170" cy="290" r="4" fill="hsl(var(--primary))" opacity="0.8" />
        <circle cx="130" cy="310" r="4" fill="hsl(var(--primary))" opacity="0.8" />
        <circle cx="170" cy="310" r="4" fill="hsl(var(--primary))" opacity="0.8" />
        
        {/* Upward expansion - Wave 1 */}
        <g className="animate-[expand-up-1_8s_ease-in-out_infinite]">
          <circle cx="150" cy="240" r="6" fill="hsl(var(--primary))" opacity="0.7" />
          <circle cx="120" cy="220" r="4" fill="hsl(var(--primary))" opacity="0.5" />
          <circle cx="180" cy="220" r="4" fill="hsl(var(--primary))" opacity="0.5" />
          <circle cx="150" cy="180" r="5" fill="hsl(var(--primary))" opacity="0.4" />
          <circle cx="100" cy="160" r="3" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="200" cy="160" r="3" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="150" cy="120" r="4" fill="hsl(var(--primary))" opacity="0.2" />
          <circle cx="130" cy="80" r="3" fill="hsl(var(--primary))" opacity="0.1" />
          <circle cx="170" cy="80" r="3" fill="hsl(var(--primary))" opacity="0.1" />
          <circle cx="150" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.1" />
        </g>
        
        {/* Downward expansion - Wave 1 */}
        <g className="animate-[expand-down-1_8s_ease-in-out_infinite]">
          <circle cx="150" cy="360" r="6" fill="hsl(var(--primary))" opacity="0.7" />
          <circle cx="120" cy="380" r="4" fill="hsl(var(--primary))" opacity="0.5" />
          <circle cx="180" cy="380" r="4" fill="hsl(var(--primary))" opacity="0.5" />
          <circle cx="150" cy="420" r="5" fill="hsl(var(--primary))" opacity="0.4" />
          <circle cx="100" cy="440" r="3" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="200" cy="440" r="3" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="150" cy="480" r="4" fill="hsl(var(--primary))" opacity="0.2" />
          <circle cx="130" cy="520" r="3" fill="hsl(var(--primary))" opacity="0.1" />
          <circle cx="170" cy="520" r="3" fill="hsl(var(--primary))" opacity="0.1" />
          <circle cx="150" cy="560" r="2" fill="hsl(var(--primary))" opacity="0.1" />
        </g>
        
        {/* Connection lines - upward */}
        <g className="animate-[connect-up_8s_ease-in-out_infinite]">
          <line x1="150" y1="300" x2="150" y2="240" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.6" />
          <line x1="150" y1="240" x2="120" y2="220" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="150" y1="240" x2="180" y2="220" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="150" y1="240" x2="150" y2="180" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.3" />
          <line x1="150" y1="180" x2="100" y2="160" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.2" />
          <line x1="150" y1="180" x2="200" y2="160" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.2" />
          <line x1="150" y1="180" x2="150" y2="120" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.2" />
          <line x1="150" y1="120" x2="130" y2="80" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.1" />
          <line x1="150" y1="120" x2="170" y2="80" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.1" />
          <line x1="150" y1="120" x2="150" y2="40" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.1" />
        </g>
        
        {/* Connection lines - downward */}
        <g className="animate-[connect-down_8s_ease-in-out_infinite]">
          <line x1="150" y1="300" x2="150" y2="360" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.6" />
          <line x1="150" y1="360" x2="120" y2="380" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="150" y1="360" x2="180" y2="380" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="150" y1="360" x2="150" y2="420" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.3" />
          <line x1="150" y1="420" x2="100" y2="440" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.2" />
          <line x1="150" y1="420" x2="200" y2="440" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.2" />
          <line x1="150" y1="420" x2="150" y2="480" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.2" />
          <line x1="150" y1="480" x2="130" y2="520" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.1" />
          <line x1="150" y1="480" x2="170" y2="520" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.1" />
          <line x1="150" y1="480" x2="150" y2="560" stroke="url(#connectionGradient)" strokeWidth="1" opacity="0.1" />
        </g>
        
        {/* Secondary wave - subtle expansion */}
        <g className="animate-[expand-secondary_10s_ease-in-out_infinite_2s]">
          <circle cx="110" cy="250" r="2" fill="hsl(var(--secondary))" opacity="0.3" />
          <circle cx="190" cy="250" r="2" fill="hsl(var(--secondary))" opacity="0.3" />
          <circle cx="110" cy="350" r="2" fill="hsl(var(--secondary))" opacity="0.3" />
          <circle cx="190" cy="350" r="2" fill="hsl(var(--secondary))" opacity="0.3" />
          <circle cx="80" cy="200" r="2" fill="hsl(var(--secondary))" opacity="0.2" />
          <circle cx="220" cy="200" r="2" fill="hsl(var(--secondary))" opacity="0.2" />
          <circle cx="80" cy="400" r="2" fill="hsl(var(--secondary))" opacity="0.2" />
          <circle cx="220" cy="400" r="2" fill="hsl(var(--secondary))" opacity="0.2" />
        </g>
      </svg>
      
    </div>
  );
};

export default VerticalNetworkBurst;