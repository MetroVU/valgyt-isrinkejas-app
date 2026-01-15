'use client';

import { Restaurant } from '@/lib/data';

interface OrderInputProps {
  restaurant: Restaurant;
  value: string;
  onChange: (value: string) => void;
}

export default function OrderInput({ restaurant, value, onChange }: OrderInputProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{restaurant.image}</span>
        <div>
          <h3 className="font-bold">{restaurant.name}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              restaurant.platform === 'bolt' ? 'bg-bolt' : 'bg-wolt'
            }`}
          >
            {restaurant.platform === 'bolt' ? 'Bolt Food' : 'Wolt'}
          </span>
        </div>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ką norėtum užsisakyti iš čia? (pvz.: 2x Margherita, Cola)"
        className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        rows={2}
      />
    </div>
  );
}
