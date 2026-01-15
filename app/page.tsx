'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant, getAllRestaurants, getRestaurantById, getAllCuisines, addCustomRestaurantsFromShared, SessionData } from '@/lib/data';
import { findMatches } from '@/lib/storage';
import RestaurantCard from '@/components/RestaurantCard';
import ResultsView from '@/components/ResultsView';
import SpinWheel from '@/components/SpinWheel';
import AddRestaurantModal from '@/components/AddRestaurantModal';

type Step = 'home' | 'create' | 'join' | 'select' | 'waiting' | 'results';
type SortOption = 'name' | 'rating' | 'price-low' | 'price-high';

interface BlobSession {
  code: string;
  createdAt: number;
  person1: {
    selections: string[];
    submittedAt: number;
  } | null;
  person2: {
    selections: string[];
    submittedAt: number;
  } | null;
  customRestaurants: Restaurant[];
}

const LOCAL_KEY = 'food-picker-session';

export default function Home() {
  const [step, setStep] = useState<Step>('home');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [myRole, setMyRole] = useState<'person1' | 'person2' | null>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [blobSession, setBlobSession] = useState<BlobSession | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelOptions, setWheelOptions] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'bolt' | 'wolt' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const cuisines = useMemo(() => getAllCuisines(), [allRestaurants]);

  // Load restaurants
  useEffect(() => {
    setAllRestaurants(getAllRestaurants());
  }, [showAddModal]);

  // Load saved session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSessionCode(data.code);
        setMyRole(data.role);
        setSelectedRestaurants(data.selections || []);
        // Start polling to check session status
        if (data.code) {
          pollSession(data.code, data.role);
        }
      } catch {}
    }
  }, []);

  // Poll session for updates
  const pollSession = useCallback(async (code: string, role: 'person1' | 'person2' | null) => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', code }),
      });
      const data = await res.json();
      
      if (data.success && data.session) {
        const sess: BlobSession = data.session;
        setBlobSession(sess);
        
        // Add custom restaurants from session
        if (sess.customRestaurants && sess.customRestaurants.length > 0) {
          addCustomRestaurantsFromShared(sess.customRestaurants);
          setAllRestaurants(getAllRestaurants());
        }
        
        // Check if both have submitted
        if (sess.person1 && sess.person2) {
          // Build results session
          const resultsSession: SessionData = {
            id: `session-${code}`,
            date: new Date().toISOString().split('T')[0],
            person1: {
              oderId: 'person1',
              date: new Date().toISOString().split('T')[0],
              person: 'person1',
              restaurants: sess.person1.selections,
              orders: {},
              submitted: true,
            },
            person2: {
              oderId: 'person2',
              date: new Date().toISOString().split('T')[0],
              person: 'person2',
              restaurants: sess.person2.selections,
              orders: {},
              submitted: true,
            },
            result: null,
          };
          
          const matches = findMatches(resultsSession);
          resultsSession.result = {
            matches,
            winner: matches.length === 1 ? matches[0] : null,
            method: matches.length === 1 ? 'match' : null,
          };
          
          setSession(resultsSession);
          setStep('results');
          return;
        }
        
        // Determine current step based on state
        if (role === 'person1') {
          if (sess.person1) {
            setStep('waiting');
          } else {
            setStep('select');
          }
        } else if (role === 'person2') {
          if (sess.person2) {
            setStep('waiting');
          } else {
            setStep('select');
          }
        }
      }
    } catch (e) {
      console.error('Poll error:', e);
    }
  }, []);

  // Poll every 3 seconds when waiting
  useEffect(() => {
    if (step === 'waiting' && sessionCode && myRole) {
      const interval = setInterval(() => {
        pollSession(sessionCode, myRole);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step, sessionCode, myRole, pollSession]);

  // Save session state to localStorage
  const saveLocal = (code: string, role: 'person1' | 'person2', selections: string[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ code, role, selections }));
  };

  // Create new session
  const handleCreateSession = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSessionCode(data.code);
        setMyRole('person1');
        saveLocal(data.code, 'person1', []);
        setStep('select');
      } else {
        setError('Nepavyko sukurti sesijos');
      }
    } catch {
      setError('Klaida kuriant sesiją');
    }
    setIsLoading(false);
  };

  // Join existing session
  const handleJoinSession = async () => {
    if (!joinCode || joinCode.length !== 6) {
      setError('Įveskite 6 simbolių kodą');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', code: joinCode.toUpperCase() }),
      });
      const data = await res.json();
      
      if (data.success && data.session) {
        setSessionCode(joinCode.toUpperCase());
        setBlobSession(data.session);
        setMyRole('person2');
        saveLocal(joinCode.toUpperCase(), 'person2', []);
        
        // Add custom restaurants
        if (data.session.customRestaurants?.length > 0) {
          addCustomRestaurantsFromShared(data.session.customRestaurants);
          setAllRestaurants(getAllRestaurants());
        }
        
        setStep('select');
      } else {
        setError('Sesija nerasta');
      }
    } catch {
      setError('Klaida jungiantis');
    }
    setIsLoading(false);
  };

  // Submit selections
  const handleSubmit = async () => {
    if (selectedRestaurants.length === 0) {
      setError('Pasirinkite bent vieną restoraną');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Get custom restaurants to include
    const customRests = allRestaurants.filter(r => 
      r.platform === 'custom' && selectedRestaurants.includes(r.id)
    );
    
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          code: sessionCode,
          role: myRole,
          selections: selectedRestaurants,
          customRestaurants: customRests,
        }),
      });
      const data = await res.json();
      
      console.log('Submit response:', data);
      
      if (data.success) {
        saveLocal(sessionCode, myRole!, selectedRestaurants);
        // Immediately use returned session to drive UI to avoid waiting for polling
        const sess: BlobSession = data.session;
        setBlobSession(sess);

        // Bring over custom restaurants to local if present
        if (sess.customRestaurants && sess.customRestaurants.length > 0) {
          addCustomRestaurantsFromShared(sess.customRestaurants);
          setAllRestaurants(getAllRestaurants());
        }

        // If both submitted, compute results and show results
        if (sess.person1 && sess.person2) {
          const resultsSession: SessionData = {
            id: `session-${sessionCode}`,
            date: new Date().toISOString().split('T')[0],
            person1: {
              oderId: 'person1',
              date: new Date().toISOString().split('T')[0],
              person: 'person1',
              restaurants: sess.person1.selections,
              orders: {},
              submitted: true,
            },
            person2: {
              oderId: 'person2',
              date: new Date().toISOString().split('T')[0],
              person: 'person2',
              restaurants: sess.person2.selections,
              orders: {},
              submitted: true,
            },
            result: null,
          };

          const matches = findMatches(resultsSession);
          resultsSession.result = {
            matches,
            winner: matches.length === 1 ? matches[0] : null,
            method: matches.length === 1 ? 'match' : null,
          };

          setSession(resultsSession);
          setStep('results');
        } else {
          // Otherwise, move to waiting state immediately for current role
          if (myRole === 'person1' || myRole === 'person2') {
            setStep('waiting');
          }
          // Still kick off a poll to sync partner state
          await pollSession(sessionCode, myRole);
        }
      } else {
        setError(data.error || 'Nepavyko išsaugoti');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Klaida siunčiant');
    }
    setIsLoading(false);
  };

  // Toggle restaurant selection
  const toggleRestaurant = (id: string) => {
    setSelectedRestaurants(prev => {
      if (prev.includes(id)) {
        return prev.filter(r => r !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  // Handle adding custom restaurant
  const handleAddRestaurant = (restaurant: Restaurant) => {
    setAllRestaurants(getAllRestaurants());
    toggleRestaurant(restaurant.id);
    setShowAddModal(false);
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Results handlers
  const handlePickRandom = () => {
    const matches = session?.result?.matches ?? [];
    const p1 = session?.person1?.restaurants ?? [];
    const p2 = session?.person2?.restaurants ?? [];
    const pool = matches.length > 0 ? matches : Array.from(new Set([...p1, ...p2]));
    if (pool.length === 0) return;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    setSession(prev => prev ? {
      ...prev,
      result: { ...prev.result!, winner, method: 'random' }
    } : null);
  };

  const handleSpinWheel = () => {
    const matches = session?.result?.matches ?? [];
    const p1 = session?.person1?.restaurants ?? [];
    const p2 = session?.person2?.restaurants ?? [];
    const pool = matches.length > 0 ? matches : Array.from(new Set([...p1, ...p2]));
    if (pool.length === 0) return;
    // Use restaurant IDs for the wheel options; SpinWheel resolves names
    setWheelOptions(pool);
    setShowWheel(true);
  };

  const handleWheelResult = (winner: string) => {
    // Winner is a restaurant ID
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        result: { ...prev.result!, winner, method: 'wheel' }
      } : null);
    }
    setShowWheel(false);
  };

  const handlePickFromMatches = () => {
    if (!session?.result?.matches || session.result.matches.length === 0) return;
    const winner = session.result.matches[Math.floor(Math.random() * session.result.matches.length)];
    setSession(prev => prev ? {
      ...prev,
      result: { ...prev.result!, winner, method: 'match' }
    } : null);
  };

  // Reset everything
  const handleReset = () => {
    localStorage.removeItem(LOCAL_KEY);
    setStep('home');
    setSessionCode('');
    setJoinCode('');
    setMyRole(null);
    setSelectedRestaurants([]);
    setSession(null);
    setBlobSession(null);
    setError('');
  };

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = allRestaurants;
    
    if (platformFilter !== 'all') {
      filtered = filtered.filter(r => r.platform === platformFilter);
    }
    
    if (cuisineFilter !== 'all') {
      filtered = filtered.filter(r => r.cuisine === cuisineFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query)
      );
    }
    
    // Sort
    const priceValue = (p: string) => p === '€' ? 1 : p === '€€' ? 2 : 3;
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'price-low': return priceValue(a.priceRange) - priceValue(b.priceRange);
        case 'price-high': return priceValue(b.priceRange) - priceValue(a.priceRange);
        default: return 0;
      }
    });
    
    return filtered;
  }, [allRestaurants, platformFilter, cuisineFilter, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            🍕 Kur Valgom?
          </h1>
          <p className="text-gray-400 mt-2">Pasirinkite kartu, kur valgyti!</p>
        </div>

        {/* Home Screen */}
        {step === 'home' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-center">Pradėti naują sesiją</h2>
              <p className="text-sm text-gray-400 text-center">
                Sukurkite sesiją ir pasidalinkite kodu su partneriu
              </p>
              <button
                onClick={handleCreateSession}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? '⏳ Kuriama...' : '✨ Sukurti sesiją'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-500">arba</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-center">Prisijungti prie sesijos</h2>
              <p className="text-sm text-gray-400 text-center">
                Įveskite 6 simbolių kodą, kurį gavote
              </p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                className="w-full px-4 py-4 rounded-xl bg-gray-900 border border-gray-700 text-center text-2xl font-mono tracking-widest focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                maxLength={6}
              />
              <button
                onClick={handleJoinSession}
                disabled={isLoading || joinCode.length !== 6}
                className="w-full py-4 rounded-xl bg-gray-700 text-white font-bold text-lg hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? '⏳ Jungiamasi...' : '🔗 Prisijungti'}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center text-red-300">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Select Restaurants */}
        {step === 'select' && (
          <div className="space-y-4">
            {/* Session code display for person1 */}
            {myRole === 'person1' && (
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-purple-500/30 rounded-2xl p-4 text-center space-y-2">
                <p className="text-sm text-gray-300">Jūsų sesijos kodas:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-widest text-purple-400">
                    {sessionCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">Pasakykite šį kodą savo partneriui</p>
              </div>
            )}

            {/* Person indicator */}
            <div className="text-center py-2">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                myRole === 'person1' 
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {myRole === 'person1' ? '💕 Aš' : '💙 Tu'}
              </span>
            </div>

            {/* Selection count */}
            <div className="text-center">
              <span className="text-sm text-gray-400">
                Pasirinkta: <span className="text-white font-bold">{selectedRestaurants.length}</span> / 3
              </span>
            </div>

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Ieškoti restorano..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full py-2 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2"
            >
              <span>⚙️ Filtrai ir rūšiavimas</span>
              <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Filters panel */}
            {showFilters && (
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                {/* Platform filter */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Platforma:</p>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'bolt', 'wolt', 'custom'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatformFilter(p as any)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          platformFilter === p
                            ? p === 'bolt' ? 'bg-emerald-500 text-white'
                            : p === 'wolt' ? 'bg-sky-500 text-white'
                            : p === 'custom' ? 'bg-pink-500 text-white'
                            : 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {p === 'all' ? 'Visi' : p === 'bolt' ? 'Bolt' : p === 'wolt' ? 'Wolt' : 'Mano'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuisine filter */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Virtuvė:</p>
                  <select
                    value={cuisineFilter}
                    onChange={(e) => setCuisineFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="all">Visos virtuvės</option>
                    {cuisines.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Rūšiuoti:</p>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="name">Pagal pavadinimą</option>
                    <option value="rating">Pagal reitingą</option>
                    <option value="price-low">Kaina: žemiausia</option>
                    <option value="price-high">Kaina: aukščiausia</option>
                  </select>
                </div>
              </div>
            )}

            {/* Add custom restaurant button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-600 text-gray-400 hover:border-pink-500 hover:text-pink-400 transition-all"
            >
              ➕ Pridėti savo restoraną
            </button>

            {/* Restaurant list */}
            <div className="grid gap-3">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  selected={selectedRestaurants.includes(restaurant.id)}
                  onToggle={() => toggleRestaurant(restaurant.id)}
                  disabled={!selectedRestaurants.includes(restaurant.id) && selectedRestaurants.length >= 3}
                />
              ))}
            </div>

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Restoranų nerasta
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center text-red-300">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleSubmit}
                  disabled={selectedRestaurants.length === 0 || isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? '⏳ Siunčiama...' : `✓ Patvirtinti (${selectedRestaurants.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Waiting Screen */}
        {step === 'waiting' && (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-pulse">⏳</div>
            <h2 className="text-2xl font-semibold">Laukiame...</h2>
            <p className="text-gray-400">
              {myRole === 'person1' 
                ? 'Laukiame, kol partneris pasirinko savo restoranus'
                : 'Laukiame kito žmogaus pasirinkimo'}
            </p>
            
            {myRole === 'person1' && (
              <div className="bg-gray-800/50 rounded-2xl p-4 space-y-2">
                <p className="text-sm text-gray-400">Sesijos kodas:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-widest text-purple-400">
                    {sessionCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 active:scale-95 transition-all"
              >
                🔁 Pradėti iš naujo
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'results' && session && (
          <>
            <ResultsView
              session={session}
              onPickRandom={handlePickRandom}
              onSpinWheel={handleSpinWheel}
              onPickFromMatches={handlePickFromMatches}
              onReset={handleReset}
            />
            {showWheel && (
              <SpinWheel
                options={wheelOptions}
                onResult={handleWheelResult}
                onClose={() => setShowWheel(false)}
              />
            )}
          </>
        )}

        {/* Add Restaurant Modal */}
        {showAddModal && (
          <AddRestaurantModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddRestaurant}
          />
        )}
      </div>
    </main>
  );
}
