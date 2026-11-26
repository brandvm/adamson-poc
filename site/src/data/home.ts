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
