// Content for the homepage concept (Figma: Adamson › Exploration › "Page - Home", node 627:5019).
// Slide 1 copy comes from Figma. Slides 2–4 follow the same pattern with copy from adamson.ai;
// swap them for final copy when it's approved.

export const nav = [
  { label: 'Products', dropdown: true },
  { label: 'Technology', dropdown: false },
  { label: 'Applications', dropdown: true },
  { label: 'Support', dropdown: true },
  { label: 'Company', dropdown: true },
];

export const heardAt = [
  { name: 'Linkin Park', context: 'From Zero World Tour' },
  { name: 'D-Block Europe', context: 'PTSD2 Arena Tour' },
  { name: 'Imagine Dragons', context: 'Loom World Tour' },
  { name: 'Warsaw Theatre', context: 'Brooklyn, NY' },
  { name: 'L’Auditorium de la Maison', context: 'Montréal' },
  { name: 'Paul McCartney', context: 'FOH Paul (PAB) Boothroyd' },
  { name: 'Lady Gaga', context: 'FOH Chris Rabold' },
];

export type Slide = {
  word: string; // the category word in the sentence
  category: string;
  name: string;
  description: string;
  spec?: string;
  chipLabel?: string;
  chips?: string[];
  activeChip?: number;
  primary: string;
  secondary: string;
  image: string; // background-removed cut-out in public/home/
  thumb: string;
  wordmark: string; // big frosted word behind the product
  // /home-stack cards explain the category (the product image stays as proof of it).
  // Copy is a draft for approval; families come from the sitemap and adamson.ai.
  card: { wordmark: string; title: string; text: string; families: string[]; primary: string; secondary: string; imageMax?: number /* em; for tall products */ };
  wordmarkSvg?: boolean; // true = use the exported Figma vector (Vergence only)
};

export const slides: Slide[] = [
  {
    word: 'loudspeakers,',
    category: 'Loudspeakers',
    name: 'Vergence Group',
    description: 'Large-format line array for stadium and arena main hangs.',
    spec: 'VGt · 151 dB max peak SPL · 50 Hz – 20 kHz',
    chipLabel: 'Models',
    chips: ['VGx', 'VGt', 'VGs', 'VGd', 'VGo'],
    activeChip: 1,
    primary: 'Explore Vergence',
    secondary: 'All loudspeakers',
    image: 'product-vergence.png',
    thumb: 'thumb-base.png',
    wordmark: 'VERGENCE',
    card: {
      wordmark: 'LOUDSPEAKERS',
      title: 'Loudspeakers',
      text: 'Line arrays, subwoofers and monitors for the world’s biggest stages and the rooms built around them.',
      families: ['Vergence', 'CS', 'IS', 'M', 'E', 'S'],
      primary: 'Explore loudspeakers',
      secondary: 'Find the right system',
    },
    wordmarkSvg: true,
  },
  {
    word: 'electronics,',
    category: 'Electronics',
    name: 'XG Integration Amplifiers',
    description: 'Amplification built for integration projects.',
    chipLabel: 'In electronics',
    chips: ['XG amplifiers', 'Media converters', 'Network', 'Racks'],
    activeChip: 0,
    primary: 'Explore XG',
    secondary: 'All electronics',
    image: 'product-xg.png',
    thumb: 'thumb-2.png',
    wordmark: 'XG',
    card: {
      wordmark: 'ELECTRONICS',
      title: 'Electronics',
      text: 'Amplification and networking that power and connect every Adamson system.',
      families: ['XG amplifiers', 'Media converters', 'Network', 'Racks'],
      primary: 'Explore electronics',
      secondary: 'XG amplifiers',
    },
  },
  {
    word: 'software',
    category: 'Software',
    name: 'Array Intelligence',
    description: 'Design and control your Adamson system with ease.',
    spec: 'Fall 2026 software & firmware update available',
    chipLabel: 'In software',
    chips: ['Array Intelligence', 'Array Tools'],
    activeChip: 0,
    primary: 'Explore Array Intelligence',
    secondary: 'Download',
    image: 'product-array-intelligence.png',
    thumb: 'thumb-3.png',
    wordmark: 'ARRAY',
    card: {
      wordmark: 'SOFTWARE',
      title: 'Software',
      text: 'Design, predict and control your system, before and during the show.',
      families: ['Array Intelligence', 'Array Tools'],
      primary: 'Explore software',
      secondary: 'Download Array Intelligence',
      imageMax: 15.5,   // the laptop is much taller than the other products
    },
  },
  {
    word: 'immersive audio.',
    category: 'Immersive',
    name: 'Fletcher Machine',
    description: 'Spatial audio, perfected.',
    primary: 'Explore Fletcher Machine',
    secondary: 'See it in action',
    image: 'product-fletcher.png',
    thumb: 'thumb-4.png',
    wordmark: 'FLETCHER',
    card: {
      wordmark: 'IMMERSIVE',
      title: 'Immersive audio',
      text: 'Spatial audio that places sound anywhere in the room.',
      families: ['Fletcher Machine'],
      primary: 'Explore immersive',
      secondary: 'See it in action',
    },
  },
];

// Product tiles that gather around a category word on hover (Figma "Home - Section - Product
// Group" states), in px relative to the 762px-wide sentence. One group per slide, same order.
export const tiles: { x: number; y: number; img: string }[][] = [
  [ // loudspeakers
    { x: 200, y: -18, img: 'float-4.png' }, { x: 430, y: 8, img: 'float-1.png' }, { x: 19, y: 25, img: 'float-5.png' },
    { x: 390, y: 117, img: 'float-2.png' }, { x: 107, y: 159, img: 'float-3.png' },
  ],
  [ // electronics
    { x: 493, y: -17, img: 'float-4.png' }, { x: 722, y: 8, img: 'float-1.png' }, { x: 313, y: 25, img: 'float-5.png' },
    { x: 682, y: 117, img: 'float-2.png' }, { x: 400, y: 159, img: 'float-3.png' },
  ],
  [ // software
    { x: 38, y: 55, img: 'float-4.png' }, { x: -62, y: 122, img: 'float-5.png' },
    { x: 231, y: 106, img: 'float-1.png' }, { x: 112, y: 203, img: 'float-3.png' },
  ],
  [ // immersive audio
    { x: 396, y: 55, img: 'float-4.png' }, { x: 297, y: 123, img: 'float-5.png' },
    { x: 705, y: 107, img: 'float-1.png' }, { x: 470, y: 203, img: 'float-3.png' },
  ],
];

// Products section (Figma "03 Products · Tab · Loudspeakers · Series", node 636:7407).
// Loudspeakers is from Figma; the other tabs are filled from the same families as the category
// cards. Images: Figma has none yet for E and S Series, so those cards show without one.
export type ProductTile = { name: string; tagline: string; models?: number; image?: string };
export type ProductTab = {
  label: string;
  // The big number on the first tile; it counts to the new value when the tab changes.
  // Counts are the product pages per category in the sitemap (the "+N" under each series):
  // Loudspeakers 5+7+12+5+4+7 = 40, Electronics 4+3+2 = 9 (≈50 product pages in all).
  // Software has no product pages listed yet, so it counts its two tools.
  count: { label: string; value: number; cta: string };
  items: ProductTile[];
};
export const productTabs: ProductTab[] = [
  {
    label: 'Loudspeakers',
    count: { label: 'Loudspeaker models', value: 40, cta: 'View Loudspeakers' },
    items: [
      { name: 'Vergence Group', tagline: 'State-of-the-art', models: 5, image: 'series-vergence.png' },
      { name: 'CS Series', tagline: 'Compact intelligence', models: 7, image: 'series-cs.png' },
      { name: 'IS Series', tagline: 'Integration focused', models: 12, image: 'series-is.png' },
      { name: 'Monitors', tagline: 'Stage worthy', models: 5, image: 'series-monitors.png' },
      { name: 'E Series', tagline: 'Proven performance', models: 4 },
      { name: 'S Series', tagline: 'Set the standard', models: 7 },
    ],
  },
  {
    label: 'Electronics',
    count: { label: 'Electronics models', value: 9, cta: 'View Electronics' },
    items: [
      { name: 'XG Series Amplifiers', tagline: 'Power for every integration project', models: 4, image: 'thumb-2.png' },
      { name: 'Loudspeaker Modules', tagline: 'Amplification built into the cabinet' },
      { name: 'Media Converters', tagline: 'Gateway, Bridge and USB Milan Bridge', models: 3 },
      { name: 'Network', tagline: 'Switches built for Milan networks' },
      { name: 'Racks', tagline: 'Touring and install rack systems', models: 2 },
    ],
  },
  {
    label: 'Software',
    count: { label: 'Software tools', value: 2, cta: 'View Software' },
    items: [
      { name: 'Array Intelligence', tagline: 'Design and control your Adamson system with ease', image: 'thumb-3.png' },
      { name: 'Array Tools', tagline: 'Utilities for system set-up and tuning' },
    ],
  },
  {
    label: 'Immersive',
    count: { label: 'Immersive systems', value: 1, cta: 'View Immersive' },
    items: [{ name: 'Fletcher Machine', tagline: 'Spatial audio, perfected', image: 'thumb-4.png' }],
  },
];
