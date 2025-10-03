import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

interface ConfettiProps {
  trigger: boolean;
  sourceX: number;
  sourceY: number;
}

const Confetti: React.FC<ConfettiProps> = ({ trigger, sourceX, sourceY }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const colors = [
    '#FFD700', // Bright Gold
    '#FF4757', // Bright Red
    '#2ED573', // Bright Green
    '#5352ED', // Bright Purple
    '#FF6B35', // Orange
    '#70A1FF', // Light Blue
    '#FF3838', // Crimson
    '#7BED9F', // Mint Green
    '#FFA502', // Bright Orange
    '#3742FA', // Royal Blue
    '#FF6B9D', // Pink
    '#C44569', // Magenta
    '#F8B500', // Amber
    '#00D2D3', // Cyan
    '#FF5722', // Deep Orange
  ];

  const createConfettiPiece = (id: number): ConfettiPiece => {
    const angle = (Math.PI / 6) + (Math.random() * (2 * Math.PI / 3)); // 30° to 150° spread for wider burst
    const velocity = 4 + Math.random() * 5; // Random velocity between 4-9 for more energetic burst
    
    return {
      id,
      x: sourceX + (Math.random() - 0.5) * 10, // Small random offset from exact center
      y: sourceY + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(angle) * velocity, // Negative for upward initial movement
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12, // Slightly faster rotation
      size: 5 + Math.random() * 7, // Size between 5-12px for better visibility
    };
  };

  useEffect(() => {
    if (!trigger || sourceX === 0 || sourceY === 0) return;

    console.log('Confetti triggered at:', sourceX, sourceY);

    // Create multiple waves of confetti for a more spectacular effect
    const createConfettiBurst = (delay: number, count: number) => {
      setTimeout(() => {
        const newPieces = Array.from({ length: count }, (_, i) => 
          createConfettiPiece(Date.now() + i + delay)
        );
        setPieces(currentPieces => [...currentPieces, ...newPieces]);
      }, delay);
    };

    // Initial burst
    createConfettiBurst(0, 60);
    // Second wave
    createConfettiBurst(300, 40);
    // Third wave
    createConfettiBurst(600, 30);
    // Fourth wave
    createConfettiBurst(900, 25);

    let animationFrame: number;
    const gravity = 0.35;
    const friction = 0.985;

    const animate = () => {
      setPieces(currentPieces => {
        const updatedPieces = currentPieces
          .map(piece => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            vx: piece.vx * friction,
            vy: piece.vy + gravity,
            rotation: piece.rotation + piece.rotationSpeed,
          }))
          .filter(piece => piece.y < window.innerHeight + 50); // Remove pieces that have fallen off screen

        if (updatedPieces.length > 0) {
          animationFrame = requestAnimationFrame(animate);
        }

        return updatedPieces;
      });
    };

    animationFrame = requestAnimationFrame(animate);

    // Clear confetti after 6 seconds to ensure at least 5 seconds of visibility
    const timeout = setTimeout(() => {
      setPieces([]);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }, 6000);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      clearTimeout(timeout);
    };
  }, [trigger, sourceX, sourceY]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.6 ? '50%' : '0%', // Mix of circles and squares
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Add shadow for better visibility
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;