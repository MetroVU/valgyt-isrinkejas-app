'use client';

import { Restaurant } from '@/lib/data';

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export default function RestaurantCard({ restaurant, selected, onToggle, disabled }: RestaurantCardProps) {
  const getPlatformBadge = () => {
    switch (restaurant.platform) {
      case 'bolt':
        return { className: 'bg-bolt', label: 'Bolt' };
      case 'wolt':
        return { className: 'bg-wolt', label: 'Wolt' };
      case 'custom':
        return { className: 'bg-gradient-to-r from-pink-500 to-purple-500', label: '⭐ Mano' };
      default:
        return { className: 'bg-gray-600', label: 'Kita' };
    }
  };

  const badge = getPlatformBadge();

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`restaurant-card relative p-4 rounded-xl text-left transition-all ${
        selected
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900'
          : disabled
          ? 'bg-gray-800/50 opacity-50 cursor-not-allowed'
          : 'bg-gray-800 hover:bg-gray-750'
      }`}
    >
      {/* Platform badge */}
      <div
        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${badge.className}`}
      >
        {badge.label}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <span className="text-purple-600 font-bold">✓</span>
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-3 mt-6">
        <div className="text-4xl">{restaurant.image}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{restaurant.name}</h3>
          <p className="text-gray-400 text-sm">{restaurant.cuisine}</p>
          
          <div className="flex items-center gap-3 mt-2 text-sm">
            {restaurant.rating > 0 && (
              <>
                <span className="text-yellow-400">★ {restaurant.rating}</span>
                <span className="text-gray-500">•</span>
              </>
            )}
            {restaurant.deliveryTime !== 'N/A' && (
              <>
                <span className="text-gray-400">{restaurant.deliveryTime}</span>
                <span className="text-gray-500">•</span>
              </>
            )}
            <span className="text-green-400">{restaurant.priceRange}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
