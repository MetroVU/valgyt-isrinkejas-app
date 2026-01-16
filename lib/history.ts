import { Restaurant, getRestaurantById } from '@/lib/data';

const HISTORY_KEY = 'food-picker-history';

export interface DecisionEntry {
  id: string; // restaurant id
  method: 'random' | 'wheel' | 'match' | 'suggest' | 'choice';
  date: string; // ISO date
}

export function getHistory(): DecisionEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordDecision(id: string, method: DecisionEntry['method']): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const entry: DecisionEntry = { id, method, date: new Date().toISOString() };
  const next = [entry, ...history].slice(0, 100); // cap history
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function getTopRestaurants(limit = 5): { restaurant: Restaurant; count: number }[] {
  const history = getHistory();
  const counts: Record<string, number> = {};
  for (const h of history) counts[h.id] = (counts[h.id] || 0) + 1;
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({ restaurant: getRestaurantById(id)!, count }));
  return entries.filter(e => !!e.restaurant);
}

export function getTopCuisines(limit = 3): { cuisine: string; count: number }[] {
  const history = getHistory();
  const counts: Record<string, number> = {};
  for (const h of history) {
    const r = getRestaurantById(h.id);
    if (!r) continue;
    counts[r.cuisine] = (counts[r.cuisine] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cuisine, count]) => ({ cuisine, count }));
}
