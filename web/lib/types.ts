/** Shapes shared by WordPress (contract/*.json) and the components. */

export type Media = {
  id?: number;
  url: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
  mime?: string;
} | null;

export type Link = { label?: string; url?: string } | null;

export type BlockInstance = { id: string; name: string; data: Record<string, unknown> };

export type PagePayload = {
  id: number;
  slug: string;
  /** Path on this site: / for the homepage, /<slug> otherwise. */
  path?: string;
  title: string;
  status: string;
  modified: string;
  blocks: BlockInstance[];
};

export type NewsPost = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  category: string;
  /** News type (WordPress tag): Press release, Launch, Tour. */
  type?: string;
  /** Full HTML, only when one post is fetched by slug. */
  content?: string;
  dateIso?: string;
  image: Media;
};

export type NavChild = { label?: string; url?: string; text?: string };
export type NavItem = { label?: string; url?: string; dropdown?: boolean; children?: NavChild[] };

export type SiteSettings = {
  logo?: Media;
  nav?: NavItem[];
  login?: Link;
  cta?: Link;
  [key: string]: unknown;
};

/** A product record (WordPress → Products). Fields: contract/product.json. */
export type Product = {
  id: number;
  slug: string;
  name: string;
  order: number;
  type?: string;
  series?: string;
  range?: string;
  spl?: string;
  splLabel?: string;
  render?: Media;
  cutout?: Media;
  logo?: Media;
  url?: string;
  inRange?: boolean;
  category?: string;
  seriesUrl?: string;
  tagline?: string;
  overview?: string;
  specs?: { label?: string; value?: string }[];
  features?: { title?: string; text?: string }[];
  downloads?: { label?: string; url?: string; meta?: string }[];
};

/** Extra data a block needs that isn't stored in the block (latest posts, products). */
/** A case study (WordPress → Projects). Fields: contract/project.json. */
export type Project = {
  id: number;
  slug: string;
  name: string;
  url: string;
  application?: string;
  region?: string;
  location?: string;
  year?: string;
  products?: string;
  partner?: string;
  summary?: string;
  image?: Media;
  challenge?: string;
  solution?: string;
  result?: string;
  stats?: { value?: string; label?: string }[];
  quote?: { text?: string; name?: string; role?: string };
  gallery?: { image?: Media }[];
  featured?: boolean;
};

/** A downloadable file (WordPress → Documents). Fields: contract/document.json. */
export type DocumentItem = {
  id: number;
  slug: string;
  title: string;
  updated: string;
  product: string;
  series: string;
  fileType: string;
  language: string;
  version: string;
  size: string;
  file: string;
  summary: string;
  discontinued: boolean;
};

export type BlockExtras = { posts?: NewsPost[]; allPosts?: NewsPost[]; products?: Product[]; projects?: Project[]; documents?: DocumentItem[] };

/** Every block component gets its stored data plus extras. */
export type BlockProps<T> = { data: Partial<T>; extras?: BlockExtras; preview?: boolean };
