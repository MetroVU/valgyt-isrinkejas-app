'use client';

import { useState } from 'react';
import { Restaurant, saveCustomRestaurant } from '@/lib/data';

interface AddRestaurantModalProps {
  onClose: () => void;
  onAdd: (restaurant: Restaurant) => void;
}

const FOOD_EMOJIS = ['🍕', '🍔', '🍗', '🍣', '🍜', '🍛', '🌮', '🌯', '🥙', '🥗', '🍱', '🥟', '🍝', '🥘', '🍲', '🥩', '🍩', '☕', '🥤', '🍦'];

export default function AddRestaurantModal({ onClose, onAdd }: AddRestaurantModalProps) {
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍽️');
  const [priceRange, setPriceRange] = useState<'€' | '€€' | '€€€'>('€€');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !cuisine.trim()) return;

    const newRestaurant: Restaurant = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      platform: 'custom',
      cuisine: cuisine.trim(),
      rating: 0,
      deliveryTime: 'N/A',
      priceRange,
      image: selectedEmoji,
    };

    saveCustomRestaurant(newRestaurant);
    onAdd(newRestaurant);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 fade-in">
      <div className="bg-gray-900 rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto slide-up safe-bottom">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">➕ Pridėti vietą</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-2 -mr-2"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Pavadinimas *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pvz. Mano mėgstama picerija"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              required
            />
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Virtuvės tipas *</label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="pvz. Pica, Burgeriai, Azijietiška..."
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              required
            />
          </div>

          {/* Emoji selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Pasirink ikoną</label>
            <div className="flex flex-wrap gap-2">
              {FOOD_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 text-xl rounded-lg transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-purple-500 scale-110'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Kainų kategorija</label>
            <div className="flex gap-2">
              {(['€', '€€', '€€€'] as const).map(price => (
                <button
                  key={price}
                  type="button"
                  onClick={() => setPriceRange(price)}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    priceRange === price
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-2">Peržiūra:</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedEmoji}</span>
              <div>
                <div className="font-bold">{name || 'Pavadinimas'}</div>
                <div className="text-sm text-gray-400">{cuisine || 'Virtuvės tipas'}</div>
              </div>
              <span className="ml-auto text-green-400">{priceRange}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !cuisine.trim()}
            className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
              name.trim() && cuisine.trim()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Pridėti
          </button>
        </form>
      </div>
    </div>
  );
}
