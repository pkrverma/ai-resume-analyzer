import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);

  const percentage = score / 100;

  // Get grade text based on score
  const getGradeText = (score: number): string => {
    if(score >= 90) return "Outstanding";
    if(score >= 80) return "Excellent";
    if(score >= 70) return "Very Good";
    if(score >= 60) return "Good";
    if(score >= 50) return "Fair";
    return "Poor";
  };

  // Get grade color based on score
  const getGradeColor = (score: number): string => {
    if(score >= 90) return "text-purple-600"; // Outstanding - Purple
    if(score >= 80) return "text-green-600";  // Excellent - Green
    if(score >= 70) return "text-blue-600";   // Very Good - Blue
    if(score >= 60) return "text-yellow-600"; // Good - Yellow
    if(score >= 50) return "text-orange-600"; // Fair - Orange
    return "text-red-600"; // Poor - Red
  };

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const runConfetti = () => {
    if (!gaugeRef.current) return;
    
    // Get gauge position relative to viewport for origin
    const rect = gaugeRef.current.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;
    
    // Multiple bursts for longer duration and more particles
    const duration = 500;
    const end = Date.now() + duration;
    
    const burst = () => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: {
          x: originX,
          y: originY
        },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      });
      
      // Additional burst with different angle
      confetti({
        particleCount: 100,
        spread: 120,
        origin: {
          x: originX,
          y: originY
        },
        colors: ['#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C']
      });
    };
    
    // Initial burst
    burst();
    
    // Continue bursting for duration
    const interval = setInterval(() => {
      if (Date.now() < end) {
        burst();
      } else {
        clearInterval(interval);
      }
    }, 250); // New burst every 250ms
  };

  useEffect(() => {
    // Trigger confetti for excellent scores (>80) automatically
    if (score > 80) {
      // Delay to ensure gauge is fully rendered and positioned
      const timer = setTimeout(() => {
        runConfetti();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center" ref={gaugeRef}>
      <div className="relative w-32 h-16 sm:w-36 sm:h-18 md:w-40 md:h-20">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient
              id="gaugeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Foreground arc with rounded ends */}
          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - percentage)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-sm sm:text-base md:text-lg font-semibold pt-3 sm:pt-4 mt-3 sm:mt-4">{score}/100</div>
          <p className={`m-0 p-0 text-xs sm:text-sm font-medium ${getGradeColor(score)}`}>{getGradeText(score)}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
