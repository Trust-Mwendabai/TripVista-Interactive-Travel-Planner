'use strict';
// Rough per-person, per-day estimates in USD (stay = accommodation share, food, transport). Activities are budgeted from the itinerary.
const DESTS = [
  { id: 'paris', name: 'Paris', country: 'France', icon: 'tower', c: ['#f472b6', '#6366f1'], cats: ['City', 'Culture'], climate: 'mild', season: 'Apr–Jun, Sep–Oct', cost: { stay: 140, food: 45, transport: 15 },
    blurb: 'The city of light: cafés, art and iconic architecture around every corner.',
    spots: [['Eiffel Tower summit', 30], ['Louvre Museum', 22], ['Seine river cruise', 18], ['Montmartre walking tour', 0]] },
  { id: 'bali', name: 'Bali', country: 'Indonesia', icon: 'tree', c: ['#34d399', '#0ea5e9'], cats: ['Beach', 'Nature', 'Culture'], climate: 'warm', season: 'Apr–Oct', cost: { stay: 45, food: 20, transport: 8 },
    blurb: 'Terraced rice fields, surf beaches and serene temples on the island of the gods.',
    spots: [['Ubud rice terraces', 5], ['Uluwatu temple sunset', 4], ['Surf lesson', 25], ['Mount Batur sunrise trek', 35]] },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', icon: 'torii', c: ['#fb7185', '#7c3aed'], cats: ['City', 'Culture'], climate: 'mild', season: 'Mar–May, Oct–Nov', cost: { stay: 100, food: 35, transport: 12 },
    blurb: 'Neon skylines beside quiet shrines; a city where tradition and future collide.',
    spots: [['Senso-ji temple', 0], ['Shibuya crossing & Sky', 18], ['Tsukiji food tour', 45], ['teamLab digital art', 30]] },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', icon: 'mountain', c: ['#38bdf8', '#f97316'], cats: ['Adventure', 'City', 'Nature'], climate: 'mild', season: 'Nov–Mar', cost: { stay: 60, food: 25, transport: 10 },
    blurb: 'Table Mountain, penguin beaches and world-class wine, all in one dramatic setting.',
    spots: [['Table Mountain cableway', 25], ['Boulders Beach penguins', 8], ['Cape Point tour', 40], ['Winelands tasting', 30]] },
  { id: 'victoriafalls', name: 'Victoria Falls', country: 'Zambia / Zimbabwe', icon: 'droplets', c: ['#22d3ee', '#16a34a'], cats: ['Adventure', 'Nature'], climate: 'warm', season: 'Apr–Jul (high water)', cost: { stay: 70, food: 25, transport: 10 },
    blurb: 'The Smoke that Thunders — one of the world’s greatest waterfalls and an adventure capital.',
    spots: [['Falls guided walk', 20], ['Devil’s Pool swim', 90], ['Zambezi sunset cruise', 55], ['White-water rafting', 130]] },
  { id: 'santorini', name: 'Santorini', country: 'Greece', icon: 'sunset', c: ['#60a5fa', '#f0abfc'], cats: ['Beach', 'Culture'], climate: 'warm', season: 'May–Oct', cost: { stay: 130, food: 45, transport: 10 },
    blurb: 'Whitewashed villages on volcanic cliffs, famous for sunsets over the caldera.',
    spots: [['Oia sunset viewpoint', 0], ['Caldera boat trip', 60], ['Akrotiri ruins', 14], ['Wine tasting', 30]] },
  { id: 'machupicchu', name: 'Machu Picchu', country: 'Peru', icon: 'mountain', c: ['#a3e635', '#0f766e'], cats: ['Adventure', 'Culture', 'Nature'], climate: 'cool', season: 'May–Sep', cost: { stay: 55, food: 25, transport: 20 },
    blurb: 'The lost Inca citadel high in the Andes, reached by rail or an epic trek.',
    spots: [['Machu Picchu entry', 65], ['Inca Trail (short)', 120], ['Sacred Valley tour', 40], ['Cusco city tour', 15]] },
  { id: 'newyork', name: 'New York', country: 'USA', icon: 'building', c: ['#f59e0b', '#1d4ed8'], cats: ['City', 'Culture'], climate: 'mild', season: 'Apr–Jun, Sep–Nov', cost: { stay: 200, food: 60, transport: 15 },
    blurb: 'The city that never sleeps: Broadway, museums, skyline views and endless food.',
    spots: [['Statue of Liberty ferry', 25], ['Central Park bike ride', 15], ['Broadway show', 110], ['Top of the Rock', 38]] },
  { id: 'maldives', name: 'Maldives', country: 'Maldives', icon: 'waves', c: ['#22d3ee', '#3b82f6'], cats: ['Beach', 'Nature'], climate: 'warm', season: 'Nov–Apr', cost: { stay: 220, food: 70, transport: 25 },
    blurb: 'Overwater villas, turquoise lagoons and some of the planet’s best snorkelling.',
    spots: [['Snorkel with manta rays', 70], ['Sandbank picnic', 90], ['Dolphin cruise', 45], ['Sunset fishing', 40]] },
  { id: 'serengeti', name: 'Serengeti', country: 'Tanzania', icon: 'tent', c: ['#facc15', '#b45309'], cats: ['Adventure', 'Nature'], climate: 'warm', season: 'Jun–Oct', cost: { stay: 250, food: 50, transport: 30 },
    blurb: 'Endless plains, the Great Migration and the classic African safari.',
    spots: [['Game drive (full day)', 150], ['Hot-air balloon safari', 550], ['Maasai village visit', 30], ['Ngorongoro crater tour', 200]] },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', icon: 'pyramid', c: ['#fbbf24', '#ea580c'], cats: ['Culture', 'City'], climate: 'warm', season: 'Oct–Apr', cost: { stay: 45, food: 15, transport: 6 },
    blurb: 'The pyramids, the Nile and a thousand years of bustling bazaars.',
    spots: [['Giza pyramids & Sphinx', 20], ['Egyptian Museum', 12], ['Khan el-Khalili bazaar', 0], ['Nile felucca ride', 10]] },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', icon: 'snowflake', c: ['#818cf8', '#0f172a'], cats: ['Nature', 'Adventure'], climate: 'cold', season: 'Jun–Aug, Nov–Mar (aurora)', cost: { stay: 150, food: 55, transport: 15 },
    blurb: 'Geysers, glaciers and the northern lights at the edge of the Arctic.',
    spots: [['Golden Circle tour', 90], ['Blue Lagoon', 85], ['Northern lights hunt', 80], ['Glacier hike', 120]] }
];
const CATS = ['Beach', 'City', 'Adventure', 'Culture', 'Nature'];
const dById = id => DESTS.find(d => d.id === id);
const dayCost = d => d.cost.stay + d.cost.food + d.cost.transport;
