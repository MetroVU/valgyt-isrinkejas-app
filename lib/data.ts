export interface Restaurant {
  id: string;
  name: string;
  platform: 'bolt' | 'wolt' | 'custom';
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceRange: '€' | '€€' | '€€€';
  image: string;
}

export interface Selection {
  oderId: string;
  date: string;
  person: 'person1' | 'person2';
  restaurants: string[]; // restaurant ids
  orders: { [restaurantId: string]: string }; // what they want to order
  submitted: boolean;
}

export interface SessionData {
  id: string;
  date: string;
  person1: Selection | null;
  person2: Selection | null;
  result: {
    matches: string[];
    winner: string | null;
    method: 'match' | 'random' | 'wheel' | 'choice' | null;
  } | null;
}

// All Restaurants from Bolt Food and Wolt in Kaunas
export const restaurants: Restaurant[] = [
  // ==================== BOLT FOOD RESTAURANTS ====================
  
  // Burgeriai & Fast Food
  {
    id: 'bolt-hesburger',
    name: 'Hesburger',
    platform: 'bolt',
    cuisine: 'Burgeriai',
    rating: 4.2,
    deliveryTime: '20-30 min',
    priceRange: '€',
    image: '🍔'
  },
  {
    id: 'bolt-kfc',
    name: 'KFC',
    platform: 'bolt',
    cuisine: 'Vištiena',
    rating: 4.3,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🍗'
  },
  {
    id: 'bolt-mcdonalds',
    name: "McDonald's",
    platform: 'bolt',
    cuisine: 'Burgeriai',
    rating: 4.0,
    deliveryTime: '20-30 min',
    priceRange: '€',
    image: '🍟'
  },
  {
    id: 'bolt-burgerking',
    name: 'Burger King',
    platform: 'bolt',
    cuisine: 'Burgeriai',
    rating: 4.1,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🍔'
  },
  {
    id: 'bolt-subway',
    name: 'Subway',
    platform: 'bolt',
    cuisine: 'Sumuštiniai',
    rating: 4.1,
    deliveryTime: '20-30 min',
    priceRange: '€',
    image: '🥪'
  },
  
  // Picos
  {
    id: 'bolt-cilipica',
    name: 'Čili Pica',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-cancan',
    name: 'Can Can Pizza',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.4,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-dominos',
    name: "Domino's Pizza",
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-charliepizza',
    name: 'Charlie Pizza',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.3,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-dodopizza',
    name: 'Dodo Pizza',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.6,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-mammapizza',
    name: 'Mamma Pizza',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.4,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-pizzaexpress',
    name: 'Pizza Express',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.3,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-americanpizza',
    name: 'American Pizza',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.4,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-milanopicerija',
    name: 'Milano Picerija',
    platform: 'bolt',
    cuisine: 'Itališka pica',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'bolt-400laipsniu',
    name: '400 laipsnių',
    platform: 'bolt',
    cuisine: 'Pica',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🔥'
  },
  
  // Azijietiška virtuvė
  {
    id: 'bolt-woktowalk',
    name: 'Wok to Walk',
    platform: 'bolt',
    cuisine: 'Azijietiška',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍜'
  },
  {
    id: 'bolt-sushiexpress',
    name: 'Sushi Express',
    platform: 'bolt',
    cuisine: 'Sushi',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'bolt-manami',
    name: 'Manami',
    platform: 'bolt',
    cuisine: 'Azijietiška',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍱'
  },
  {
    id: 'bolt-ganbei',
    name: 'Gan Bei',
    platform: 'bolt',
    cuisine: 'Azijietiška / Sushi',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€€',
    image: '🥢'
  },
  {
    id: 'bolt-rytuazija',
    name: 'Rytų Azija',
    platform: 'bolt',
    cuisine: 'Kinų / Japoniška',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🥡'
  },
  {
    id: 'bolt-hongyan',
    name: 'Hongyan kinų maistas',
    platform: 'bolt',
    cuisine: 'Kinų',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥟'
  },
  {
    id: 'bolt-awokado',
    name: 'Awokado wok&sushi',
    platform: 'bolt',
    cuisine: 'Azijietiška',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🥑'
  },
  {
    id: 'bolt-sushicity',
    name: 'Sushi City',
    platform: 'bolt',
    cuisine: 'Sushi',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'bolt-sushilounge',
    name: 'Sushi Lounge',
    platform: 'bolt',
    cuisine: 'Sushi',
    rating: 4.7,
    deliveryTime: '35-45 min',
    priceRange: '€€€',
    image: '🍣'
  },
  {
    id: 'bolt-hattorisushi',
    name: 'Hattori Sushi',
    platform: 'bolt',
    cuisine: 'Sushi',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'bolt-sushidate',
    name: 'Sushi date?',
    platform: 'bolt',
    cuisine: 'Sushi',
    rating: 4.7,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'bolt-thaihouse',
    name: 'Thai House',
    platform: 'bolt',
    cuisine: 'Tajų',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍛'
  },
  {
    id: 'bolt-saigon',
    name: 'Saigon',
    platform: 'bolt',
    cuisine: 'Vietnamietiška',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍜'
  },
  {
    id: 'bolt-pasali',
    name: 'Pas Ali',
    platform: 'bolt',
    cuisine: 'Azijietiška',
    rating: 4.4,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🥘'
  },
  
  // Kebabai
  {
    id: 'bolt-azerai',
    name: 'Azerai x Ugruzina',
    platform: 'bolt',
    cuisine: 'Kebabai',
    rating: 4.7,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🌯'
  },
  {
    id: 'bolt-haskebabs',
    name: 'Has Kebabs',
    platform: 'bolt',
    cuisine: 'Kebabai',
    rating: 4.3,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🌯'
  },
  {
    id: 'bolt-viralkebab',
    name: 'Viral Kebab',
    platform: 'bolt',
    cuisine: 'Kebabai',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🌯'
  },
  {
    id: 'bolt-kebabinn',
    name: 'Kebab inn',
    platform: 'bolt',
    cuisine: 'Kebabai',
    rating: 4.4,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🌯'
  },
  {
    id: 'bolt-gyrospoint',
    name: 'Gyros Point',
    platform: 'bolt',
    cuisine: 'Graikų / Kebabai',
    rating: 4.3,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🥙'
  },
  
  // Lietuviška virtuvė
  {
    id: 'bolt-katpedele',
    name: 'Katpėdėlė',
    platform: 'bolt',
    cuisine: 'Lietuviška',
    rating: 4.4,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥟'
  },
  {
    id: 'bolt-berneliuuzeiga',
    name: 'Bernelių Užeiga',
    platform: 'bolt',
    cuisine: 'Lietuviška',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🥘'
  },
  {
    id: 'bolt-sotussvecias',
    name: 'Sotus Svečias',
    platform: 'bolt',
    cuisine: 'Lietuviška',
    rating: 4.4,
    deliveryTime: '40-50 min',
    priceRange: '€',
    image: '🍲'
  },
  {
    id: 'bolt-cilikaimas',
    name: 'Čili Kaimas',
    platform: 'bolt',
    cuisine: 'Lietuviška',
    rating: 4.3,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥔'
  },
  
  // Vištiena
  {
    id: 'bolt-crisperia',
    name: 'Crisperia',
    platform: 'bolt',
    cuisine: 'Vištiena',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€',
    image: '🍗'
  },
  {
    id: 'bolt-crispychick',
    name: 'Crispy Chick',
    platform: 'bolt',
    cuisine: 'Vištiena',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€',
    image: '🍗'
  },
  
  // Burgeriai gourmet
  {
    id: 'bolt-bakingmad',
    name: 'Baking Mad Hidden Lab',
    platform: 'bolt',
    cuisine: 'Gourmet burgeriai',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🍔'
  },
  {
    id: 'bolt-peledine',
    name: 'Pelėdinė',
    platform: 'bolt',
    cuisine: 'BBQ burgeriai',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍔'
  },
  
  // Kita
  {
    id: 'bolt-guacamole',
    name: 'Guacamole Mexican Grill',
    platform: 'bolt',
    cuisine: 'Meksikietiška',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🌮'
  },
  {
    id: 'bolt-taluttitexmex',
    name: 'Talutti Tex Mex',
    platform: 'bolt',
    cuisine: 'Meksikietiška',
    rating: 4.3,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🌮'
  },
  {
    id: 'bolt-taluttibakes',
    name: "Talutti Bakes'n'Shakes",
    platform: 'bolt',
    cuisine: 'Amerikietiška',
    rating: 4.3,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥤'
  },
  {
    id: 'bolt-arabia',
    name: 'Arabia',
    platform: 'bolt',
    cuisine: 'Artimųjų Rytų',
    rating: 4.2,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🧆'
  },
  {
    id: 'bolt-deviindia',
    name: 'Devi India',
    platform: 'bolt',
    cuisine: 'Indiška',
    rating: 4.3,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍛'
  },
  {
    id: 'bolt-mtevani',
    name: 'Mtevani Georgian',
    platform: 'bolt',
    cuisine: 'Gruzinų',
    rating: 4.5,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥟'
  },
  {
    id: 'bolt-doda',
    name: 'Doda',
    platform: 'bolt',
    cuisine: 'Greitas maistas',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍱'
  },
  {
    id: 'bolt-wokout',
    name: 'WOKout',
    platform: 'bolt',
    cuisine: 'Azijietiška',
    rating: 4.5,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🥡'
  },
  {
    id: 'bolt-holydonut',
    name: 'Holy Donut',
    platform: 'bolt',
    cuisine: 'Desertai / Pusryčiai',
    rating: 4.5,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🍩'
  },
  {
    id: 'bolt-freshpost',
    name: 'Fresh Post',
    platform: 'bolt',
    cuisine: 'Salotos / Sveika',
    rating: 4.5,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🥗'
  },
  {
    id: 'bolt-plusplusplus',
    name: 'Plus Plus Plus',
    platform: 'bolt',
    cuisine: 'Greitas maistas',
    rating: 4.4,
    deliveryTime: '20-30 min',
    priceRange: '€',
    image: '➕'
  },
  {
    id: 'bolt-vicesushi',
    name: 'VICE Sushi & Pizza',
    platform: 'bolt',
    cuisine: 'Sushi / Pica',
    rating: 4.2,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🍣'
  },

  // ==================== WOLT RESTAURANTS ====================
  
  // Burgeriai & Fast Food
  {
    id: 'wolt-mcdonalds',
    name: "McDonald's",
    platform: 'wolt',
    cuisine: 'Burgeriai',
    rating: 3.9,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🍟'
  },
  {
    id: 'wolt-kfc',
    name: 'KFC',
    platform: 'wolt',
    cuisine: 'Vištiena',
    rating: 4.2,
    deliveryTime: '60-70 min',
    priceRange: '€€',
    image: '🍗'
  },
  {
    id: 'wolt-burgerking',
    name: 'Burger King',
    platform: 'wolt',
    cuisine: 'Burgeriai',
    rating: 3.9,
    deliveryTime: '50-60 min',
    priceRange: '€€',
    image: '🍔'
  },
  {
    id: 'wolt-hesburger',
    name: 'Hesburger',
    platform: 'wolt',
    cuisine: 'Burgeriai',
    rating: 4.1,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🍔'
  },
  {
    id: 'wolt-subway',
    name: 'Subway',
    platform: 'wolt',
    cuisine: 'Sumuštiniai',
    rating: 4.4,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🥪'
  },
  
  // Picos
  {
    id: 'wolt-charliepizza',
    name: 'Charlie Pizza',
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 3.6,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-dodopizza',
    name: 'Dodo Pizza',
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-dominos',
    name: "Domino's Pizza",
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 4.5,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-cilipica',
    name: 'Čili Pizza',
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 4.0,
    deliveryTime: '60-70 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-americanpizza',
    name: 'American Pizza',
    platform: 'wolt',
    cuisine: 'Amerikietiška pica',
    rating: 4.4,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-pizzaexpress',
    name: 'Pizza Express',
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 4.4,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-mammapizza',
    name: 'Mamma Pizza',
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 4.3,
    deliveryTime: '55-65 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-milanopicerija',
    name: 'Milano Picerija',
    platform: 'wolt',
    cuisine: 'Itališka pica',
    rating: 4.4,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🍕'
  },
  {
    id: 'wolt-400laipsniu',
    name: '400 laipsnių Wood Fired Kitchen',
    platform: 'wolt',
    cuisine: 'Pica',
    rating: 4.2,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🔥'
  },
  
  // Azijietiška virtuvė
  {
    id: 'wolt-sushiexpress',
    name: 'Sushi Express',
    platform: 'wolt',
    cuisine: 'Sushi',
    rating: 4.6,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'wolt-sushilounge',
    name: 'Sushi Lounge',
    platform: 'wolt',
    cuisine: 'Sushi',
    rating: 4.5,
    deliveryTime: '35-45 min',
    priceRange: '€€€',
    image: '🍣'
  },
  {
    id: 'wolt-rytuazija',
    name: 'Rytų Azija',
    platform: 'wolt',
    cuisine: 'Kinų / Japoniška',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🥡'
  },
  {
    id: 'wolt-ganbei',
    name: 'Gan Bei',
    platform: 'wolt',
    cuisine: 'Azijietiška / Sushi',
    rating: 4.4,
    deliveryTime: '45-55 min',
    priceRange: '€€€',
    image: '🥢'
  },
  {
    id: 'wolt-hongyan',
    name: 'Hongyan kinų maistas',
    platform: 'wolt',
    cuisine: 'Kinų',
    rating: 4.6,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🥟'
  },
  {
    id: 'wolt-sushicity',
    name: 'Sushi City',
    platform: 'wolt',
    cuisine: 'Sushi',
    rating: 4.6,
    deliveryTime: '50-60 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'wolt-hattorisushi',
    name: 'Hattori Sushi',
    platform: 'wolt',
    cuisine: 'Sushi',
    rating: 4.5,
    deliveryTime: '50-60 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'wolt-awokado',
    name: 'Awokado wok&sushi',
    platform: 'wolt',
    cuisine: 'Azijietiška',
    rating: 4.5,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🥑'
  },
  {
    id: 'wolt-manami',
    name: 'Manami',
    platform: 'wolt',
    cuisine: 'Azijietiška',
    rating: 4.3,
    deliveryTime: '70-80 min',
    priceRange: '€€',
    image: '🍱'
  },
  {
    id: 'wolt-thaihouse',
    name: 'Thai House Old Town',
    platform: 'wolt',
    cuisine: 'Tajų',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍛'
  },
  {
    id: 'wolt-saigon',
    name: 'Saigon',
    platform: 'wolt',
    cuisine: 'Vietnamietiška',
    rating: 4.6,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🍜'
  },
  {
    id: 'wolt-pasali',
    name: 'Pas Ali',
    platform: 'wolt',
    cuisine: 'Azijietiška',
    rating: 4.4,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🥘'
  },
  {
    id: 'wolt-sushidate',
    name: 'Sushi date?',
    platform: 'wolt',
    cuisine: 'Sushi',
    rating: 4.6,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍣'
  },
  {
    id: 'wolt-wokout',
    name: 'WOKout',
    platform: 'wolt',
    cuisine: 'Azijietiška',
    rating: 4.4,
    deliveryTime: '50-60 min',
    priceRange: '€€',
    image: '🥡'
  },
  {
    id: 'wolt-vicesushi',
    name: 'VICE Sushi & Pizza',
    platform: 'wolt',
    cuisine: 'Sushi / Pica',
    rating: 4.1,
    deliveryTime: '55-65 min',
    priceRange: '€€',
    image: '🍣'
  },
  
  // Kebabai
  {
    id: 'wolt-azerai',
    name: 'Azerai x Ugruzina',
    platform: 'wolt',
    cuisine: 'Kebabai',
    rating: 4.6,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🌯'
  },
  {
    id: 'wolt-haskebabs',
    name: 'Has Kebabs',
    platform: 'wolt',
    cuisine: 'Kebabai',
    rating: 3.7,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🌯'
  },
  {
    id: 'wolt-viralkebab',
    name: 'Viral Kebab',
    platform: 'wolt',
    cuisine: 'Kebabai',
    rating: 4.3,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🌯'
  },
  {
    id: 'wolt-kebabinn',
    name: 'Kebab inn',
    platform: 'wolt',
    cuisine: 'Kebabai',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€',
    image: '🌯'
  },
  
  // Lietuviška virtuvė
  {
    id: 'wolt-katpedele',
    name: 'Katpėdėlė',
    platform: 'wolt',
    cuisine: 'Lietuviška',
    rating: 3.9,
    deliveryTime: '40-50 min',
    priceRange: '€€',
    image: '🥟'
  },
  {
    id: 'wolt-berneliuuzeiga',
    name: 'Bernelių Užeiga',
    platform: 'wolt',
    cuisine: 'Lietuviška',
    rating: 4.5,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🥘'
  },
  {
    id: 'wolt-sotussvecias',
    name: 'Sotus Svečias',
    platform: 'wolt',
    cuisine: 'Lietuviška',
    rating: 4.4,
    deliveryTime: '45-55 min',
    priceRange: '€',
    image: '🍲'
  },
  
  // Vištiena
  {
    id: 'wolt-crisperia',
    name: 'Crisperia',
    platform: 'wolt',
    cuisine: 'Vištiena',
    rating: 4.4,
    deliveryTime: '30-40 min',
    priceRange: '€',
    image: '🍗'
  },
  {
    id: 'wolt-crispychick',
    name: 'Crispy Chick',
    platform: 'wolt',
    cuisine: 'Vištiena',
    rating: 4.6,
    deliveryTime: '40-50 min',
    priceRange: '€',
    image: '🍗'
  },
  
  // Burgeriai gourmet
  {
    id: 'wolt-bakingmad',
    name: 'Baking Mad Hidden Lab',
    platform: 'wolt',
    cuisine: 'Gourmet burgeriai',
    rating: 4.4,
    deliveryTime: '45-55 min',
    priceRange: '€€',
    image: '🍔'
  },
  {
    id: 'wolt-peledine',
    name: 'Pelėdinė',
    platform: 'wolt',
    cuisine: 'BBQ burgeriai',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍔'
  },
  
  // Kita
  {
    id: 'wolt-guacamole',
    name: 'Guacamole Mexican Grill',
    platform: 'wolt',
    cuisine: 'Meksikietiška',
    rating: 4.4,
    deliveryTime: '50-60 min',
    priceRange: '€€',
    image: '🌮'
  },
  {
    id: 'wolt-taluttitexmex',
    name: 'Talutti Tex Mex',
    platform: 'wolt',
    cuisine: 'Meksikietiška',
    rating: 4.2,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🌮'
  },
  {
    id: 'wolt-taluttibakes',
    name: "Talutti Bakes'n'Shakes",
    platform: 'wolt',
    cuisine: 'Amerikietiška',
    rating: 4.2,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥤'
  },
  {
    id: 'wolt-arabia',
    name: 'Arabia',
    platform: 'wolt',
    cuisine: 'Artimųjų Rytų',
    rating: 4.1,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🧆'
  },
  {
    id: 'wolt-deviindia',
    name: 'Devi India',
    platform: 'wolt',
    cuisine: 'Indiška',
    rating: 4.2,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🍛'
  },
  {
    id: 'wolt-mtevani',
    name: 'Mtevani Georgian Cuisine',
    platform: 'wolt',
    cuisine: 'Gruzinų',
    rating: 4.4,
    deliveryTime: '35-45 min',
    priceRange: '€€',
    image: '🥟'
  },
  {
    id: 'wolt-doda',
    name: 'Doda',
    platform: 'wolt',
    cuisine: 'Greitas maistas',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€€',
    image: '🍱'
  },
  {
    id: 'wolt-holydonut',
    name: 'Holy Donut',
    platform: 'wolt',
    cuisine: 'Desertai / Pusryčiai',
    rating: 4.5,
    deliveryTime: '25-35 min',
    priceRange: '€€',
    image: '🍩'
  },
  {
    id: 'wolt-freshpost',
    name: 'Fresh Post',
    platform: 'wolt',
    cuisine: 'Salotos / Sveika',
    rating: 4.5,
    deliveryTime: '30-40 min',
    priceRange: '€',
    image: '🥗'
  },
  {
    id: 'wolt-plusplusplus',
    name: 'Plus Plus Plus',
    platform: 'wolt',
    cuisine: 'Greitas maistas',
    rating: 4.4,
    deliveryTime: '20-30 min',
    priceRange: '€',
    image: '➕'
  },
  {
    id: 'wolt-gyrospoint',
    name: 'Gyros Point',
    platform: 'wolt',
    cuisine: 'Graikų',
    rating: 4.3,
    deliveryTime: '25-35 min',
    priceRange: '€',
    image: '🥙'
  },
];

// Custom restaurants added by users (stored in localStorage)
const CUSTOM_RESTAURANTS_KEY = 'food-picker-custom-restaurants';

export function getCustomRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CUSTOM_RESTAURANTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomRestaurant(restaurant: Restaurant): void {
  const customs = getCustomRestaurants();
  // Don't add duplicates
  if (!customs.find(r => r.id === restaurant.id)) {
    customs.push(restaurant);
    localStorage.setItem(CUSTOM_RESTAURANTS_KEY, JSON.stringify(customs));
  }
}

export function addCustomRestaurantsFromShared(sharedRestaurants: Restaurant[]): void {
  // Add shared custom restaurants to local storage if they don't exist
  sharedRestaurants.forEach(r => {
    if (r.platform === 'custom') {
      saveCustomRestaurant(r);
    }
  });
}

export function getAllRestaurants(): Restaurant[] {
  return [...restaurants, ...getCustomRestaurants()];
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return getAllRestaurants().find(r => r.id === id);
}

// Get full restaurant data for selected IDs (including custom restaurants)
export function getRestaurantsForIds(ids: string[]): Restaurant[] {
  const allRests = getAllRestaurants();
  return ids.map(id => allRests.find(r => r.id === id)).filter(Boolean) as Restaurant[];
}

export function getRestaurantsByPlatform(platform: 'bolt' | 'wolt' | 'custom'): Restaurant[] {
  return getAllRestaurants().filter(r => r.platform === platform);
}

// Get unique cuisines for filtering
export function getAllCuisines(): string[] {
  const allRests = getAllRestaurants();
  const cuisines = new Set(allRests.map(r => r.cuisine));
  return Array.from(cuisines).sort();
}
