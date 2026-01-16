import { Restaurant, getRestaurantById, getAllRestaurants } from '@/lib/data';

export function suggestAlternatives(p1: string[], p2: string[], max = 3): Restaurant[] {
  const union = Array.from(new Set([...(p1 || []), ...(p2 || [])]));
  const all = getAllRestaurants();

  const chosen = new Set(union);
  const chosenCuisines = new Set(
    union
      .map(id => getRestaurantById(id))
      .filter((r): r is Restaurant => !!r)
      .map(r => r.cuisine)
  );

  // Prefer restaurants matching chosen cuisines, not already selected
  const candidates = all.filter(r => !chosen.has(r.id) && chosenCuisines.has(r.cuisine));

  // If not enough, fill with highest-rated not chosen
  const fill = all.filter(r => !chosen.has(r.id) && !chosenCuisines.has(r.cuisine));

  const sorted = [...candidates, ...fill].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return sorted.slice(0, max);
}
