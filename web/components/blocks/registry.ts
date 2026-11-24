/* eslint-disable @typescript-eslint/no-explicit-any */
// Block name (WordPress) → React component. Used by the page (server) and by
// the editor's live preview (client), so every block must render on both.
import type { ComponentType } from "react";
import type { BlockProps } from "@/lib/types";
import Hero from "./Hero";
import VideoScrub from "./VideoScrub";
import FeaturedProducts from "./FeaturedProducts";
import ProductRange from "./ProductRange";
import ProductsInAction from "./ProductsInAction";
import Applications from "./Applications";
import Technology from "./Technology";
import Stats from "./Stats";
import Timeline from "./Timeline";
import Testimonials from "./Testimonials";
import Videos from "./Videos";
import News from "./News";
import GlobalSupport from "./GlobalSupport";
import Connect from "./Connect";
import PageHero from "./PageHero";
import SeriesGrid from "./SeriesGrid";
import CategoryBento from "./CategoryBento";
import Spotlight from "./Spotlight";
import FeatureGrid from "./FeatureGrid"; // worker B (40–49)
import MediaText from "./MediaText"; // worker B (40–49)
import ProjectGrid from "./ProjectGrid"; // worker B (40–49)
import ModelGrid from "./ModelGrid"; // worker A (30–39)
import FeatureRows from "./FeatureRows"; // worker A (30–39)
import TextMedia from "./TextMedia"; // worker C (50–69)
import CardGrid from "./CardGrid"; // worker C (50–69)
import DocumentLibrary from "./DocumentLibrary"; // worker C (50–69)
import LoginPanel from "./LoginPanel"; // worker C (50–69)
import Careers from "./Careers"; // worker C (50–69)
import ContactRegions from "./ContactRegions"; // worker C (50–69)
import NewsList from "./NewsList"; // worker C (50–69)

export type BlockNeed = "posts" | "products" | "projects" | "allPosts" | "documents";
type Entry = { component: ComponentType<BlockProps<any>>; needs?: BlockNeed[] };

export const registry: Record<string, Entry> = {
  "adamson/hero": { component: Hero }, // 01 Hero
  "adamson/video-scrub": { component: VideoScrub }, // (new) Video scrub
  "adamson/featured-products": { component: FeaturedProducts }, // 02 Featured products
  "adamson/product-range": { component: ProductRange, needs: ["products"] }, // 03 Products
  "adamson/products-in-action": { component: ProductsInAction, needs: ["products"] }, // 04 Products in action
  "adamson/applications": { component: Applications }, // 05 Applications
  "adamson/technology": { component: Technology }, // 06 Technology
  "adamson/stats": { component: Stats }, // 07 Why Adamson
  "adamson/timeline": { component: Timeline }, // 08 Timeline
  "adamson/testimonials": { component: Testimonials }, // 09 Trusted by top engineers
  "adamson/videos": { component: Videos }, // 10 Featured videos
  "adamson/news": { component: News, needs: ["posts"] }, // 11 News
  "adamson/global-support": { component: GlobalSupport }, // 12 Global support
  "adamson/connect": { component: Connect }, // 13 Let's connect
  // Products Overview page (Figma 507:1245)
  "adamson/page-hero": { component: PageHero }, // 01 Hero
  "adamson/series-grid": { component: SeriesGrid }, // 02 Loudspeakers
  "adamson/category-bento": { component: CategoryBento }, // 03 Electronics, 04 Software
  "adamson/spotlight": { component: Spotlight }, // 05 Immersive · FletcherMachine
  "adamson/feature-grid": { component: FeatureGrid }, // 40 Applications pages (worker B)
  "adamson/media-text": { component: MediaText }, // 41 Applications pages (worker B)
  "adamson/project-grid": { component: ProjectGrid, needs: ["projects"] }, // 42 Projects (worker B)
  "adamson/model-grid": { component: ModelGrid, needs: ["products"] }, // 30 Products sub-pages
  "adamson/feature-rows": { component: FeatureRows }, // 31 Technology, category pages
  "adamson/text-media": { component: TextMedia }, // 50 Support, Company (worker C)
  "adamson/card-grid": { component: CardGrid }, // 51 Support, Company hubs (worker C)
  "adamson/document-library": { component: DocumentLibrary, needs: ["documents"] }, // 52 Downloads (worker C)
  "adamson/login-panel": { component: LoginPanel }, // 53 Login (worker C)
  "adamson/careers": { component: Careers }, // 54 Careers (worker C)
  "adamson/contact-regions": { component: ContactRegions }, // 55 Contact (worker C)
  "adamson/news-list": { component: NewsList, needs: ["allPosts"] }, // 56 News (worker C)
};
