'use client';

import { SessionData, getRestaurantById, Restaurant } from '@/lib/data';
import { useState, useEffect } from 'react';

interface ResultsViewProps {
  session: SessionData;
  onPickRandom: () => void;
  onSpinWheel: () => void;
  onPickFromMatches: () => void;
  onReset: () => void;
}

export default function ResultsView({ session, onPickRandom, onSpinWheel, onPickFromMatches, onReset }: ResultsViewProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const matches = session.result?.matches || [];
  const winner = session.result?.winner;
  const winnerRestaurant = winner ? getRestaurantById(winner) : null;

  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  const person1Restaurants: (Restaurant | undefined)[] = session.person1?.restaurants.map((id: string) => getRestaurantById(id)) || [];
  const person2Restaurants: (Restaurant | undefined)[] = session.person2?.restaurants.map((id: string) => getRestaurantById(id)) || [];

  return (
    <div className="space-y-8">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti absolute w-3 h-3"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      {/* Winner announcement */}
      {winner && winnerRestaurant && (
        <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-500/30">
          <div className="text-6xl mb-4 animate-bounce-slow">{winnerRestaurant.image}</div>
          <h2 className="text-3xl font-bold mb-2">🎉 Šiandien valgome:</h2>
          <h3 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {winnerRestaurant.name}
          </h3>
          <div className="mt-4 flex justify-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm ${winnerRestaurant.platform === 'bolt' ? 'bg-bolt' : 'bg-wolt'}`}>
              {winnerRestaurant.platform === 'bolt' ? '🚗 Bolt Food' : '🛵 Wolt'}
            </span>
            <span className="text-yellow-400">★ {winnerRestaurant.rating}</span>
            <span className="text-gray-400">{winnerRestaurant.deliveryTime}</span>
          </div>
          
          {/* Show what both wanted to order */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {session.person1?.orders[winner] && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">👨 Aš norėjau:</div>
                <div className="text-white">{session.person1.orders[winner]}</div>
              </div>
            )}
            {session.person2?.orders[winner] && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">👩 Ji norėjo:</div>
                <div className="text-white">{session.person2.orders[winner]}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match status */}
      {!winner && (
        <div className="text-center">
          {matches.length === 0 ? (
            <div className="bg-red-500/20 rounded-2xl p-8 border border-red-500/30">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-2xl font-bold mb-2">Nėra sutapimų!</h2>
              <p className="text-gray-400">Jūsų pasirinkimai nesutapo. Reikės išrinkti kitaip!</p>
            </div>
          ) : matches.length === 1 ? (
            <div className="bg-green-500/20 rounded-2xl p-8 border border-green-500/30">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">Puiku! Yra vienas sutapimas!</h2>
            </div>
          ) : (
            <div className="bg-yellow-500/20 rounded-2xl p-8 border border-yellow-500/30">
              <div className="text-6xl mb-4">🤔</div>
              <h2 className="text-2xl font-bold mb-2">Yra {matches.length} sutapimai!</h2>
              <p className="text-gray-400">Reikia išrinkti vieną iš jų.</p>
            </div>
          )}
        </div>
      )}

      {/* Selections comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person 1 selections */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">👨</span> Aš pasirinkau:
          </h3>
          <div className="space-y-3">
            {person1Restaurants.map(restaurant => {
              if (!restaurant) return null;
              const isMatch = matches.includes(restaurant.id);
              const isWinner = winner === restaurant.id;
              return (
                <div
                  key={restaurant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isWinner
                      ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 ring-2 ring-yellow-500'
                      : isMatch
                      ? 'bg-green-500/20 ring-1 ring-green-500'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <span className="text-2xl">{restaurant.image}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{restaurant.name}</div>
                    {session.person1?.orders[restaurant.id] && (
                      <div className="text-sm text-gray-400">{session.person1.orders[restaurant.id]}</div>
                    )}
                  </div>
                  {isMatch && <span className="text-green-400">✓ Sutapo</span>}
                  {isWinner && <span className="text-yellow-400">🏆</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Person 2 selections */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">👩</span> Ji pasirinko:
          </h3>
          <div className="space-y-3">
            {person2Restaurants.map(restaurant => {
              if (!restaurant) return null;
              const isMatch = matches.includes(restaurant.id);
              const isWinner = winner === restaurant.id;
              return (
                <div
                  key={restaurant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isWinner
                      ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 ring-2 ring-yellow-500'
                      : isMatch
                      ? 'bg-green-500/20 ring-1 ring-green-500'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <span className="text-2xl">{restaurant.image}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{restaurant.name}</div>
                    {session.person2?.orders[restaurant.id] && (
                      <div className="text-sm text-gray-400">{session.person2.orders[restaurant.id]}</div>
                    )}
                  </div>
                  {isMatch && <span className="text-green-400">✓ Sutapo</span>}
                  {isWinner && <span className="text-yellow-400">🏆</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decision buttons */}
      {!winner && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Kaip išrenkame? 🎲</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pick from matches (if any) */}
            {matches.length > 0 && (
              <button
                onClick={onPickFromMatches}
                className="p-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all hover:scale-105"
              >
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-bold">Iš sutapimų</div>
                <div className="text-sm opacity-80">Atsitiktinai iš {matches.length} sutapimų</div>
              </button>
            )}

            {/* Random picker */}
            <button
              onClick={onPickRandom}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105"
            >
              <div className="text-3xl mb-2">🎲</div>
              <div className="font-bold">Atsitiktinis</div>
              <div className="text-sm opacity-80">Iš visų 6 pasirinkimų</div>
            </button>

            {/* Spin wheel */}
            <button
              onClick={onSpinWheel}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all hover:scale-105"
            >
              <div className="text-3xl mb-2">🎡</div>
              <div className="font-bold">Laimės ratas</div>
              <div className="text-sm opacity-80">Sukti ratą!</div>
            </button>
          </div>
        </div>
      )}

      {/* Reset button */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all"
        >
          🔄 Pradėti iš naujo
        </button>
      </div>
    </div>
  );
}
