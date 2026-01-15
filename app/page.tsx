'use client';

import { useState, useEffect, useMemo } from 'react';
import { Restaurant, getAllRestaurants, getRestaurantById, getAllCuisines, Selection, SessionData } from '@/lib/data';
import { getSessionByDate, saveSession, createSession, findMatches, pickRandom } from '@/lib/storage';
import RestaurantCard from '@/components/RestaurantCard';
import DatePicker from '@/components/DatePicker';
import PersonSelector from '@/components/PersonSelector';
import ResultsView from '@/components/ResultsView';
import SpinWheel from '@/components/SpinWheel';
import OrderInput from '@/components/OrderInput';
import AddRestaurantModal from '@/components/AddRestaurantModal';

type Step = 'date' | 'person' | 'select' | 'orders' | 'waiting' | 'results';
type SortOption = 'name' | 'rating' | 'price-low' | 'price-high';

// Helper to encode/decode selections to URL-safe string
const encodeSelections = (restaurants: string[], orders: { [key: string]: string }) => {
  const data = { r: restaurants, o: orders };
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

const decodeSelections = (encoded: string): { restaurants: string[], orders: { [key: string]: string } } | null => {
  try {
    const data = JSON.parse(decodeURIComponent(atob(encoded)));
    return { restaurants: data.r || [], orders: data.o || {} };
  } catch {
    return null;
  }
};

export default function Home() {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPerson, setCurrentPerson] = useState<'person1' | 'person2' | null>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [orders, setOrders] = useState<{ [key: string]: string }>({});
  const [session, setSession] = useState<SessionData | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelOptions, setWheelOptions] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'bolt' | 'wolt' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [person1FromUrl, setPerson1FromUrl] = useState<{ restaurants: string[], orders: { [key: string]: string } } | null>(null);
  const [copied, setCopied] = useState(false);

  // Get unique cuisines
  const cuisines = useMemo(() => getAllCuisines(), [allRestaurants]);

  // Load restaurants on mount and when custom restaurants change
  useEffect(() => {
    setAllRestaurants(getAllRestaurants());
  }, [showAddModal]); // Refresh when modal closes

  // Check URL parameters on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('d');
      const person1Data = params.get('p1');
      
      if (dateParam && person1Data) {
        // Person 2 is opening the link from Person 1
        setSelectedDate(dateParam);
        const decoded = decodeSelections(person1Data);
        if (decoded) {
          setPerson1FromUrl(decoded);
          // Create session with person1's data already filled
          const newSession: SessionData = {
            id: `session-${dateParam}`,
            date: dateParam,
            person1: {
              oderId: `person1-url`,
              date: dateParam,
              person: 'person1',
              restaurants: decoded.restaurants,
              orders: decoded.orders,
              submitted: true,
            },
            person2: null,
            result: null,
          };
          setSession(newSession);
          setCurrentPerson('person2');
          setStep('select');
        }
      }
    }
  }, []);

  // Load session when date changes (only if not loaded from URL)
  useEffect(() => {
    if (selectedDate && !person1FromUrl) {
      const existingSession = getSessionByDate(selectedDate);
      if (existingSession) {
        setSession(existingSession);
      } else {
        const newSession = createSession(selectedDate);
        setSession(newSession);
      }
    }
  }, [selectedDate, person1FromUrl]);

  // No need for polling anymore - we use URL sharing instead
  // The "waiting" step will show the shareable link

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep('person');
  };

  const handlePersonSelect = (person: 'person1' | 'person2', forceEdit: boolean = false) => {
    setCurrentPerson(person);
    
    // If person2 came from URL, skip to select
    if (person === 'person2' && person1FromUrl) {
      setStep('select');
      return;
    }
    
    // Check if this person already submitted
    if (session) {
      const personData = session[person];
      
      // Load existing selections if any (even if submitted, so they can edit)
      if (personData) {
        // Filter out invalid restaurant IDs that no longer exist
        const validRestaurants = personData.restaurants.filter((id: string) => getRestaurantById(id));
        setSelectedRestaurants(validRestaurants);
        
        // Filter orders to only include valid restaurants
        const validOrders: { [key: string]: string } = {};
        validRestaurants.forEach((id: string) => {
          if (personData.orders[id]) {
            validOrders[id] = personData.orders[id];
          }
        });
        setOrders(validOrders);
      }
      
      // If not forcing edit and already submitted, check where to go
      if (personData?.submitted && !forceEdit) {
        // Check if both have submitted
        const otherPerson = person === 'person1' ? 'person2' : 'person1';
        if (session[otherPerson]?.submitted) {
          setStep('results');
        } else {
          setStep('waiting');
        }
        return;
      }
    }
    
    setStep('select');
  };

  const handleEditChoices = () => {
    if (currentPerson) {
      handlePersonSelect(currentPerson, true);
    }
  };

  const handleRestaurantToggle = (restaurantId: string) => {
    setSelectedRestaurants(prev => {
      if (prev.includes(restaurantId)) {
        return prev.filter(id => id !== restaurantId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, restaurantId];
    });
  };

  const handleContinueToOrders = () => {
    if (selectedRestaurants.length === 3) {
      setStep('orders');
    }
  };

  const handleSubmit = () => {
    if (!currentPerson) return;

    const selection: Selection = {
      oderId: `${currentPerson}-${Date.now()}`,
      date: selectedDate,
      person: currentPerson,
      restaurants: selectedRestaurants,
      orders: orders,
      submitted: true,
    };

    if (currentPerson === 'person1') {
      // Person 1 submitting - generate shareable link
      const encoded = encodeSelections(selectedRestaurants, orders);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${baseUrl}?d=${selectedDate}&p1=${encoded}`;
      setShareableLink(link);
      
      // Save locally too
      const updatedSession: SessionData = {
        ...session!,
        person1: selection,
      };
      saveSession(updatedSession);
      setSession(updatedSession);
      setStep('waiting');
    } else {
      // Person 2 submitting - calculate results immediately
      const updatedSession: SessionData = {
        ...session!,
        person2: selection,
      };
      
      const matches = findMatches(updatedSession);
      updatedSession.result = {
        matches,
        winner: matches.length === 1 ? matches[0] : null,
        method: matches.length === 1 ? 'match' : null,
      };
      
      saveSession(updatedSession);
      setSession(updatedSession);
      setStep('results');
    }
  };

  const handleCopyLink = async () => {
    if (shareableLink) {
      try {
        await navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareableLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleShareLink = async () => {
    if (shareableLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Kur Valgom? 🍕',
          text: 'Pasirink kur valgysim kartu!',
          url: shareableLink,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePickRandom = () => {
    if (!session) return;
    
    const allOptions = [
      ...(session.person1?.restaurants || []),
      ...(session.person2?.restaurants || []),
    ];
    const uniqueOptions = [...new Set(allOptions)];
    const winner = pickRandom(uniqueOptions);
    
    const updatedSession: SessionData = {
      ...session,
      result: {
        ...session.result!,
        winner,
        method: 'random',
      },
    };
    
    saveSession(updatedSession);
    setSession(updatedSession);
  };

  const handleSpinWheel = () => {
    if (!session) return;
    
    const allOptions = [
      ...(session.person1?.restaurants || []),
      ...(session.person2?.restaurants || []),
    ];
    const uniqueOptions = [...new Set(allOptions)];
    setWheelOptions(uniqueOptions);
    setShowWheel(true);
  };

  const handleWheelResult = (winner: string) => {
    if (!session) return;
    
    const updatedSession: SessionData = {
      ...session,
      result: {
        ...session.result!,
        winner,
        method: 'wheel',
      },
    };
    
    saveSession(updatedSession);
    setSession(updatedSession);
    setShowWheel(false);
  };

  const handlePickFromMatches = () => {
    if (!session?.result?.matches) return;
    
    const winner = pickRandom(session.result.matches);
    
    const updatedSession: SessionData = {
      ...session,
      result: {
        ...session.result!,
        winner,
        method: 'random',
      },
    };
    
    saveSession(updatedSession);
    setSession(updatedSession);
  };

  const handleReset = () => {
    setStep('date');
    setSelectedDate('');
    setCurrentPerson(null);
    setSelectedRestaurants([]);
    setOrders({});
    setSession(null);
    setPlatformFilter('all');
    setSearchQuery('');
  };

  const handleAddRestaurant = (restaurant: Restaurant) => {
    setAllRestaurants(getAllRestaurants());
  };

  const handleClearInvalidSelections = () => {
    setSelectedRestaurants([]);
    setOrders({});
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPlatformFilter('all');
    setCuisineFilter('all');
    setSortBy('name');
  };

  const activeFiltersCount = [
    platformFilter !== 'all',
    cuisineFilter !== 'all',
    searchQuery !== '',
  ].filter(Boolean).length;

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let result = allRestaurants.filter(r => {
      // Platform filter
      if (platformFilter !== 'all' && r.platform !== platformFilter) {
        return false;
      }
      // Cuisine filter
      if (cuisineFilter !== 'all' && r.cuisine !== cuisineFilter) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.priceRange.length - b.priceRange.length;
        case 'price-high':
          return b.priceRange.length - a.priceRange.length;
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'lt');
      }
    });

    return result;
  }, [allRestaurants, platformFilter, cuisineFilter, searchQuery, sortBy]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Kur Valgom? 🍕
          </h1>
          <p className="text-gray-400 text-lg">
            Pasirinkite kur valgyti kartu!
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {['date', 'person', 'select', 'orders', 'results'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s
                      ? 'bg-purple-500 text-white scale-110'
                      : ['date', 'person', 'select', 'orders', 'results'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 4 && (
                  <div
                    className={`w-8 h-1 ${
                      ['date', 'person', 'select', 'orders', 'results'].indexOf(step) > i
                        ? 'bg-green-500'
                        : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        {step === 'date' && (
          <DatePicker onSelect={handleDateSelect} />
        )}

        {step === 'person' && (
          <PersonSelector 
            onSelect={handlePersonSelect} 
            session={session}
            selectedDate={selectedDate}
          />
        )}

        {step === 'select' && (
          <div className="space-y-4 md:space-y-6">
            {/* Info banner when person2 is selecting from URL */}
            {currentPerson === 'person2' && person1FromUrl && (
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
                <p className="text-blue-300">
                  👨 Jis jau pasirinko savo 3 vietas! Dabar tavo eilė pasirinkti.
                </p>
              </div>
            )}
            
            {/* Sticky header on mobile */}
            <div className="sticky-header py-4 -mx-4 px-4 md:static md:py-0 md:mx-0 md:px-0 md:bg-transparent">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-1">
                  {currentPerson === 'person1' ? '👨 Aš' : '👩 Ji'} - Pasirink 3 vietas
                </h2>
                
                {/* Selection progress bar */}
                <div className="flex justify-center items-center gap-2 mb-2">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        selectedRestaurants.length >= n
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {selectedRestaurants.length >= n ? '✓' : n}
                    </div>
                  ))}
                </div>
                
                {/* Show selected restaurants as pills */}
                {selectedRestaurants.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {selectedRestaurants.map(id => {
                      const r = getRestaurantById(id);
                      return r ? (
                        <span 
                          key={id}
                          onClick={() => handleRestaurantToggle(id)}
                          className="px-3 py-1.5 bg-purple-600 rounded-full text-sm cursor-pointer hover:bg-red-500 active:scale-95 transition-all flex items-center gap-1 touch-target"
                        >
                          {r.image} {r.name} ×
                        </span>
                      ) : (
                        <span 
                          key={id}
                          onClick={() => handleRestaurantToggle(id)}
                          className="px-3 py-1.5 bg-red-600 rounded-full text-sm cursor-pointer hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1"
                        >
                          ⚠️ Nežinoma ×
                        </span>
                      );
                    })}
                    <button
                      onClick={handleClearInvalidSelections}
                      className="px-3 py-1.5 bg-gray-700 rounded-full text-sm hover:bg-gray-600 active:scale-95 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search and filters row */}
            <div className="space-y-3">
              {/* Search bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Ieškoti..."
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500 outline-none text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl transition-all flex items-center gap-1 ${
                    showFilters || activeFiltersCount > 0
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 border border-gray-700'
                  }`}
                >
                  🎛️
                  {activeFiltersCount > 0 && (
                    <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 active:scale-95 transition-all"
                >
                  ➕
                </button>
              </div>

              {/* Expanded filters */}
              {showFilters && (
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 fade-in">
                  {/* Platform filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Platforma</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all', label: 'Visi', className: 'bg-purple-500' },
                        { value: 'bolt', label: '🚗 Bolt', className: 'bg-bolt' },
                        { value: 'wolt', label: '🛵 Wolt', className: 'bg-wolt' },
                        { value: 'custom', label: '⭐ Mano', className: 'bg-pink-500' },
                      ].map(({ value, label, className }) => (
                        <button
                          key={value}
                          onClick={() => setPlatformFilter(value as typeof platformFilter)}
                          className={`px-3 py-2 rounded-lg transition-all text-sm ${
                            platformFilter === value
                              ? `${className} text-white`
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Virtuvės tipas</label>
                    <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                      <button
                        onClick={() => setCuisineFilter('all')}
                        className={`px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap ${
                          cuisineFilter === 'all'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Visos
                      </button>
                      {cuisines.map(cuisine => (
                        <button
                          key={cuisine}
                          onClick={() => setCuisineFilter(cuisine)}
                          className={`px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap ${
                            cuisineFilter === cuisine
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Rikiuoti pagal</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'name', label: 'A-Ž' },
                        { value: 'rating', label: '⭐ Reitingas' },
                        { value: 'price-low', label: '💰 Pigiausi' },
                        { value: 'price-high', label: '💎 Brangiausi' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setSortBy(value as SortOption)}
                          className={`px-3 py-2 rounded-lg transition-all text-sm ${
                            sortBy === value
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white transition-all"
                    >
                      ✕ Išvalyti filtrus
                    </button>
                  )}
                </div>
              )}

              {/* Quick platform filter (always visible) */}
              {!showFilters && (
                <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                  {[
                    { value: 'all', label: `Visi (${allRestaurants.length})`, className: 'bg-purple-500' },
                    { value: 'bolt', label: '🚗 Bolt', className: 'bg-bolt' },
                    { value: 'wolt', label: '🛵 Wolt', className: 'bg-wolt' },
                    { value: 'custom', label: '⭐ Mano', className: 'bg-pink-500' },
                  ].map(({ value, label, className }) => (
                    <button
                      key={value}
                      onClick={() => setPlatformFilter(value as typeof platformFilter)}
                      className={`px-4 py-2 rounded-full transition-all whitespace-nowrap text-sm ${
                        platformFilter === value
                          ? `${className} text-white`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="text-center text-sm text-gray-400">
              Rasta: {filteredRestaurants.length} vietų
            </div>

            {/* Restaurant grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredRestaurants.map(restaurant => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  selected={selectedRestaurants.includes(restaurant.id)}
                  onToggle={() => handleRestaurantToggle(restaurant.id)}
                  disabled={
                    !selectedRestaurants.includes(restaurant.id) &&
                    selectedRestaurants.length >= 3
                  }
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredRestaurants.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-400 mb-4">
                  {searchQuery 
                    ? `Nerasta vietų su "${searchQuery}"` 
                    : 'Nėra vietų šioje kategorijoje'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all"
                  >
                    Išvalyti filtrus
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 transition-all"
                  >
                    ➕ Pridėti vietą
                  </button>
                </div>
              </div>
            )}

            {/* Continue button - sticky on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent md:static md:bg-transparent md:p-0 safe-bottom z-30">
              <button
                onClick={handleContinueToOrders}
                disabled={selectedRestaurants.length !== 3}
                className={`w-full md:w-auto md:px-8 py-4 rounded-xl text-lg font-bold transition-all ${
                  selectedRestaurants.length === 3
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 active:scale-95 shadow-lg pulse-glow'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedRestaurants.length === 3 
                  ? 'Tęsti →' 
                  : `Pasirink dar ${3 - selectedRestaurants.length}`}
              </button>
            </div>
            {/* Spacer for fixed button on mobile */}
            <div className="h-20 md:hidden"></div>
          </div>
        )}

        {step === 'orders' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                Ką norėtum užsisakyti? 📝
              </h2>
              <p className="text-gray-400">
                Parašyk ką norėtum iš kiekvienos vietos
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {selectedRestaurants.map(restaurantId => {
                const restaurant = getRestaurantById(restaurantId);
                if (!restaurant) return null;
                return (
                  <OrderInput
                    key={restaurantId}
                    restaurant={restaurant}
                    value={orders[restaurantId] || ''}
                    onChange={(value) => setOrders(prev => ({ ...prev, [restaurantId]: value }))}
                  />
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep('select')}
                className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all"
              >
                ← Atgal
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 shadow-lg transition-all"
              >
                Pateikti ✓
              </button>
            </div>
          </div>
        )}

        {step === 'waiting' && (
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="text-6xl">📤</div>
            <h2 className="text-2xl font-bold">Tavo pasirinkimai išsaugoti!</h2>
            <p className="text-gray-400">
              Dabar pasidalink nuoroda su savo antrąja puse, kad ji galėtų pasirinkti.
            </p>
            
            {/* Selected restaurants preview */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-3">Tu pasirinkai:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedRestaurants.map(id => {
                  const r = getRestaurantById(id);
                  return r ? (
                    <span key={id} className="px-3 py-1.5 bg-purple-600/50 rounded-full text-sm flex items-center gap-1">
                      {r.image} {r.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            {/* Shareable link */}
            <div className="bg-gray-800 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-400">Pasidalink šia nuoroda:</p>
              <div className="bg-gray-900 rounded-lg p-3 break-all text-sm text-purple-400 font-mono">
                {shareableLink || 'Generuojama...'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {copied ? '✓ Nukopijuota!' : '📋 Kopijuoti'}
                </button>
                <button
                  onClick={handleShareLink}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  📤 Dalintis
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Kai antroji pusė pasirinko, rezultatai bus rodomi jų telefone.
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleEditChoices}
                className="px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-500 active:scale-95 transition-all"
              >
                ✏️ Redaguoti pasirinkimus
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 active:scale-95 transition-all"
              >
                🔁 Pradėti iš naujo
              </button>
            </div>
          </div>
        )}

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
