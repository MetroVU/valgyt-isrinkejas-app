'use client';

import { useState, useEffect, useRef } from 'react';
import { getRestaurantById } from '@/lib/data';

interface SpinWheelProps {
  options: string[];
  onResult: (winner: string) => void;
  onClose: () => void;
}

export default function SpinWheel({ options, onResult, onClose }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const restaurants = options.map(id => getRestaurantById(id)).filter(Boolean);
  const hasOptions = restaurants.length > 0;

  useEffect(() => {
    drawWheel();
  }, [options, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!hasOptions) {
      // Clear canvas and skip drawing when there are no options
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const sliceAngle = (2 * Math.PI) / options.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw slices
    restaurants.forEach((restaurant, i) => {
      if (!restaurant) return;

      const startAngle = i * sliceAngle + (rotation * Math.PI) / 180;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(restaurant.image + ' ' + restaurant.name, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰', centerX, centerY);
  };

  const spin = () => {
    if (spinning) return;
    if (!hasOptions || options.length === 0) return;

    setSpinning(true);
    setWinner(null);

    // Random number of full rotations (5-10) plus random position
    const fullRotations = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + fullRotations * 360 + randomAngle;

    // Animate the spin
    const duration = 5000;
    const startTime = Date.now();
    const startRotation = rotation;
    const targetRotation = totalRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determine winner based on final position
        const normalizedRotation = currentRotation % 360;
        const sliceAngle = 360 / options.length;
        // The pointer is at the top (270 degrees in canvas coordinates)
        const winningIndex = Math.floor(((360 - normalizedRotation + 270) % 360) / sliceAngle) % options.length;
        
        setWinner(options[winningIndex]);
        setSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleConfirm = () => {
    if (winner) {
      onResult(winner);
    }
  };

  const winnerRestaurant = winner ? getRestaurantById(winner) : null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 fade-in">
      <div className="bg-gray-900 rounded-t-2xl md:rounded-2xl p-4 md:p-6 w-full max-w-lg max-h-[95vh] overflow-y-auto slide-up safe-bottom">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">🎡 Laimės ratas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-2 -mr-2"
          >
            ×
          </button>
        </div>

        {/* Wheel */}
        <div className="relative flex justify-center mb-4 md:mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] md:border-l-[15px] border-r-[12px] md:border-r-[15px] border-t-[20px] md:border-t-[25px] border-l-transparent border-r-transparent border-t-red-500"></div>
          </div>
          
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="rounded-full shadow-2xl max-w-[280px] md:max-w-[350px] w-full h-auto"
            style={{ aspectRatio: '1/1' }}
          />
        </div>

        {!hasOptions && (
          <div className="text-center text-sm text-gray-400 mb-4">
            Nėra pasirinkimų ratui. Pirmiausia pasirinkite restoranus.
          </div>
        )}

        {/* Winner announcement */}
        {winner && winnerRestaurant && (
          <div className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 mb-4">
            <div className="text-3xl md:text-4xl mb-2">{winnerRestaurant.image}</div>
            <div className="text-lg md:text-xl font-bold text-yellow-400">{winnerRestaurant.name}</div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!winner ? (
            <button
              onClick={spin}
              disabled={spinning || !hasOptions}
              className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${
                spinning || !hasOptions
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
              }`}
            >
              {spinning ? '🎰 Sukasi...' : '🎰 Sukti!'}
            </button>
          ) : (
            <>
              <button
                onClick={spin}
                className="flex-1 py-4 rounded-xl bg-gray-700 text-white hover:bg-gray-600 active:scale-95 transition-all"
              >
                🔄 Dar kartą
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:scale-105 active:scale-95 transition-all"
              >
                ✓ Patvirtinti
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
