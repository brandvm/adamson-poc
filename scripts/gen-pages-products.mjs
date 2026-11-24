// Seeds worker A's pages (Products sub-pages, Technology) into wordpress/seed/pages/.
// Copy is generic and based on Adamson's public positioning; edit it in WordPress.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
const root = new URL("../wordpress/seed/pages/", import.meta.url);
const connect = { block: "adamson/connect", data: { title: "Let’s connect", description: "We’re here to collaborate, answer questions, and problem solve.", button: { label: "Contact Us", url: "/contact" }, background: { seed: "connect/background.jpg", alt: "" }, foreground: { seed: "connect/speaker-array-cutout.png", alt: "" } } };
const img = (seed, alt = "") => ({ seed, alt });
const hero = (o) => ({ block: "adamson/page-hero", data: { eyebrow: o.eyebrow, heading: o.heading, button: o.button, wordmark: o.wordmark, background: o.background, overlay: o.overlay ?? null, anchors: o.anchors ?? [] } });
const grid = (o) => ({ block: "adamson/model-grid", data: { tone: "dark", button: null, description: "", ...o } });
const rows = (o) => ({ block: "adamson/feature-rows", data: { tone: "dark", description: "", ...o } });
function page(dir, title, order, blocks) {
  const d = new URL(dir + "/", root);
  rmSync(d, { recursive: true, force: true });
  mkdirSync(d, { recursive: true });
  writeFileSync(new URL("_page.json", d), JSON.stringify({ title, order }, null, 2) + "\n");
  blocks.forEach((b, i) => writeFileSync(new URL(`${String(i + 1).padStart(2, "0")}-${b.block.split("/")[1]}.json`, d), JSON.stringify(b, null, 2) + "\n"));
}

const SERIES = [
  { slug: "vergence-group", name: "Vergence Group", word: "VERGENCE", tag: "State-of-the-art", photo: "products-page/series-vergence.jpg", count: 5,
    intro: "Adamson’s flagship platform: line source, subwoofer and point source cabinets with onboard amplification, built to work as one system.",
    rows: [["Platform", "One system, five cabinets", "VGt, VGs, VGx, VGd and VGo share voicing, rigging and networking, so a show scales without re-tuning.", "featured-products/vgt-background.png"],
      ["Amplification", "Power on board", "Each cabinet carries its own amplification and DSP. Fewer racks, shorter set-up, less to go wrong.", "featured-products/vgx-detail.png"],
      ["Software", "Designed in Blueprint AV", "Model the room, place the arrays and hand the file straight to ArrayIntelligence on show day.", "technology/software-background.jpg"]] },
  { slug: "cs-series", name: "CS Series", word: "CS SERIES", tag: "Compact intelligence", photo: "products-page/series-cs.jpg", count: 7,
    intro: "Compact, self-powered cabinets with Milan networking for installs and tours that need a smaller footprint.",
    rows: [["Self-powered", "Amplifier modules inside", "Each CS cabinet carries an Adamson amplifier module, driven and monitored over the network.", "technology/amplification-background.jpg"],
      ["Install and tour", "One family, two jobs", "Line source, point source and subwoofers that fly in theatres or travel in a truck pack.", "applications/install-background.jpg"],
      ["Network", "Milan from the start", "Audio, control and monitoring over a single Milan AVB connection.", "technology/software-background.jpg"]] },
  { slug: "is-series", name: "IS Series", word: "IS SERIES", tag: "Integration focused", photo: "products-page/series-is.jpg", count: 12,
    intro: "Installation versions of Adamson’s touring designs, finished and rigged for permanent venues.",
    rows: [["Integration", "Built for the building", "Install hardware, weather options and finishes that sit quietly in the architecture.", "applications/install-background.jpg"],
      ["Coverage", "Point source to line source", "Twelve models cover everything from under-balcony fills to arena mains.", "products-page/series-is.jpg"],
      ["Support", "Designed with integrators", "Prediction files, drawings and specs for every model in Documentation & Downloads.", "technology/software-background.jpg"]] },
  { slug: "monitors", name: "M Series", word: "MONITORS", tag: "Stage worthy", photo: "products-page/series-m.jpg", count: 5,
    intro: "Low-profile stage monitors with the same voicing as the main system.",
    rows: [["On stage", "Low profile, high output", "Wedges that stay out of sight lines and keep up with the loudest performers.", "products-page/series-m.jpg"],
      ["Consistent", "Same voice as the mains", "Monitors share the Adamson voicing, so the stage and the room sound like one system.", "applications/touring-background.jpg"],
      ["Built to travel", "Road-ready hardware", "Rugged cabinets and handles made for nightly load-ins.", "stats/shows-and-events.jpg"]] },
  { slug: "e-series", name: "E Series", word: "E SERIES", tag: "Proven performance", photo: "products-page/series-e.jpg", count: 4,
    intro: "Large-format line source for stadiums and festivals, proven on the world’s biggest tours.",
    rows: [["Scale", "For the biggest rooms", "Long throw and high output for stadiums, arenas and festival main stages.", "applications/touring-background.jpg"],
      ["Low end", "Subwoofers to match", "E119 and E219 bring controlled, cardioid-capable low frequency to the array.", "products-page/series-e.jpg"],
      ["Proven", "Trusted on tour", "Used by touring engineers around the world, night after night.", "stats/shows-and-events.jpg"]] },
  { slug: "s-series", name: "S Series", word: "S SERIES", tag: "Set the standard", photo: "products-page/series-s.jpg", count: 7,
    intro: "Lightweight, high-output line source for mid-sized touring and installs.",
    rows: [["Weight", "Light and loud", "High output from compact, light cabinets: easier to fly, faster to set up.", "products-page/series-s.jpg"],
      ["Range", "From fills to mains", "Line source, point source and subwoofers in one matched family.", "applications/install-background.jpg"],
      ["Rigging", "Quick to deploy", "Integrated rigging designed for fast, repeatable hangs.", "applications/touring-background.jpg"]] },
];

// Loudspeakers: all six series on one page
page("products__loudspeakers", "Loudspeakers", 1, [
  hero({ eyebrow: "Products", heading: "Loudspeakers: six series, one Adamson voice", button: { label: "See all series", url: "#series" }, wordmark: "LOUDSPEAKERS", background: img("products-page/hero-2.png", "Adamson cabinets"),
    anchors: SERIES.slice(0, 4).map((s) => ({ label: s.name, meta: `${s.count} models`, url: `#${s.slug}` })) }),
  { block: "adamson/series-grid", data: { anchor: "series", eyebrow: "6 series", heading: "Loudspeakers", description: "Intelligently designed for the main stage.", button: null,
    series: SERIES.map((s) => ({ name: s.name, tag: s.tag, meta: `${s.count} models`, image: img(s.photo, `${s.name}`), link: { url: `/products/loudspeakers/${s.slug}` }, dim: s.slug === "s-series" })) } },
  ...SERIES.map((s, i) => grid({ anchor: s.slug, tone: i % 2 ? "light" : "dark", eyebrow: `${s.count} models`, heading: s.name, description: s.intro, button: { label: `Explore ${s.name}`, url: `/products/loudspeakers/${s.slug}` }, series: s.name })),
  connect,
]);

// One page per series
SERIES.forEach((s, i) => page(`products__loudspeakers__${s.slug}`, s.name, i + 1, [
  hero({ eyebrow: "Loudspeakers", heading: `${s.name}: ${s.intro}`, button: { label: "See the models", url: "#models" }, wordmark: s.word, background: img(s.photo, s.name) }),
  grid({ anchor: "models", eyebrow: `${s.count} models`, heading: "Models", series: s.name }),
  rows({ tone: "light", eyebrow: s.tag, heading: `Why ${s.name}`, rows: s.rows.map(([eyebrow, title, text, photo]) => ({ eyebrow, title, text, image: img(photo), link: null })) }),
  connect,
]));

// Electronics
page("products__electronics", "Electronics", 2, [
  hero({ eyebrow: "Products", heading: "Electronics: amplification, conversion, networking and racks", button: { label: "See amplifiers", url: "#amplifiers" }, wordmark: "ELECTRONICS", background: img("products-page/electronics-xg.png", "XG amplifier"),
    anchors: [{ label: "Amplifiers", meta: "XG Series", url: "#amplifiers" }, { label: "Media Converters", meta: "3 models", url: "#media-converters" }, { label: "Network", meta: "MS8.2", url: "#network" }, { label: "Racks", meta: "3 models", url: "#racks" }] }),
  grid({ anchor: "amplifiers", eyebrow: "Amplifiers", heading: "XG Series", description: "XG Integration Amplifiers: DSP, Milan networking and Class D power. The old site called them “XG1–2”.", series: "XG Series" }),
  rows({ tone: "light", anchor: "modules", eyebrow: "Amplifiers", heading: "Loudspeaker Modules", description: "The amplifier modules inside Vergence and CS cabinets, side by side.",
    rows: [{ eyebrow: "Vergence Group", title: "Vergence modules", text: "Onboard amplification and DSP for every Vergence cabinet, monitored over the network.", image: img("featured-products/vgx-detail.png"), link: { label: "Vergence Group", url: "/products/loudspeakers/vergence-group" } },
      { eyebrow: "CS Series", title: "CS modules", text: "Self-powered CS cabinets carry their own module, with Milan audio and control.", image: img("technology/amplification-background.jpg"), link: { label: "CS Series", url: "/products/loudspeakers/cs-series" } }] }),
  grid({ anchor: "media-converters", eyebrow: "3 models", heading: "Media Converters", description: "Bring analog, AES/EBU and USB sources onto a Milan network.", series: "Media Converters" }),
  grid({ anchor: "network", tone: "light", eyebrow: "Network", heading: "Network", description: "MS8.2 switch and Milan networking, plus the NDS and PDS distribution units.", series: "Network" }),
  grid({ anchor: "racks", eyebrow: "3 models", heading: "Racks", description: "Turn-key power distribution, network and switching.", series: "Racks" }),
  connect,
]);

// Software
page("products__software", "Software", 3, [
  hero({ eyebrow: "Products", heading: "Software: the brilliance behind the scenes", button: { label: "Downloads and updates", url: "/support/downloads" }, wordmark: "SOFTWARE", background: img("products-page/software-bg.png"), overlay: null,
    anchors: [{ label: "ArrayIntelligence", meta: "Control", url: "#arrayintelligence" }, { label: "Array Tools", meta: "Utilities", url: "#array-tools" }, { label: "Blueprint AV", meta: "Design", url: "#blueprint-av" }, { label: "Downloads", meta: "Updates", url: "#downloads-and-updates" }] }),
  rows({ eyebrow: "3 tools", heading: "Software", description: "Design, deploy and diagnose an Adamson system with free tools.",
    rows: [{ eyebrow: "Free · Windows", title: "ArrayIntelligence", text: "One platform to design, deploy and diagnose an Adamson system: room design, simulation, control and metering.", image: img("products-page/software-laptop.png"), link: { label: "Download ArrayIntelligence", url: "/support/downloads" } },
      { eyebrow: "Utilities", title: "Array Tools", text: "Field utilities for rigging, delay and system checks.", image: img("technology/software-background.jpg"), link: null },
      { eyebrow: "Design", title: "Blueprint AV", text: "Prediction and design software for Adamson systems.", image: img("technology/software-product.png"), link: null },
      { eyebrow: "Library", title: "Downloads and updates", text: "Installers, firmware and release notes, in Documentation & Downloads.", image: img("products-page/software-bg.png"), link: { label: "Go to downloads", url: "/support/downloads" } }] }),
  connect,
]);

// FletcherMachine
page("products__fletchermachine", "FletcherMachine", 4, [
  hero({ eyebrow: "Immersive", heading: "FletcherMachine: reference class spatial audio rendering", button: { label: "See the system", url: "#system" }, wordmark: "FLETCHER", background: img("products-page/fm-layer1.png"),
    anchors: [{ label: "Hardware", meta: "5 models", url: "#hardware-units" }, { label: "Renders", meta: "Gallery", url: "#renders" }, { label: "In action", meta: "Shows", url: "#in-action" }, { label: "Manual", meta: "Library", url: "/support/downloads" }] }),
  { block: "adamson/spotlight", data: { anchor: "system", eyebrow: "Immersive", heading: "FletcherMachine", description: "Reference class spatial audio rendering system.", button: { label: "Talk to us", url: "/contact" }, listLabel: "System models", tags: "Virtual, Traveler Lite, Traveler, Stage, Stage Extended", background: img("products-page/fm-layer1.png"), image: img("products-page/fm-layer2.png", "FletcherMachine spatial audio processor") } },
  rows({ tone: "light", eyebrow: "FletcherMachine", heading: "Built for immersive shows", description: "This page replaces the separate FletcherMachine website. The online manual moves to the library.",
    rows: [{ eyebrow: "Hardware", title: "Hardware units", text: "From the Virtual software version to Stage Extended for the largest productions.", image: img("products-page/fm-layer2.png"), link: null },
      { eyebrow: "Gallery", title: "Renders", text: "How objects move through the room, rendered for every seat.", image: img("technology/software-background.jpg"), link: null },
      { eyebrow: "Shows", title: "In action", text: "Immersive productions running on FletcherMachine.", image: img("stats/shows-and-events.jpg"), link: null }] }),
  connect,
]);

// Technology (one page)
const TECH = [
  ["Transducers", "Drivers designed and built in-house", "Adamson designs and manufactures its own transducers, so every cabinet starts with parts made for it.", "technology/transducers-background.jpg"],
  ["Wave shaping", "Control where the sound goes", "Waveguides and enclosure geometry keep coverage even and predictable from the front row to the back.", "products-page/series-cs.jpg"],
  ["Amplification", "Power matched to the box", "Onboard modules and XG amplifiers are tuned to the loudspeakers they drive.", "technology/amplification-background.jpg"],
  ["DSP and network", "Milan from end to end", "Processing and Milan AVB networking carry audio, control and monitoring over one connection.", "products-page/electronics-xg.png"],
  ["Software", "Design, deploy, diagnose", "Blueprint AV and ArrayIntelligence take a system from prediction to show day.", "technology/software-background.jpg"],
  ["Research and development", "Engineered in Port Perry", "Research, testing and manufacturing happen under one roof in Ontario, Canada.", "stats/building-loudspeakers.jpg"],
];
page("technology", "Technology", 2, [
  hero({ eyebrow: "Technology", heading: "Engineered in-house, from transducer to software", button: { label: "Start with transducers", url: "#transducers" }, wordmark: "TECHNOLOGY", background: img("technology/transducers-background.jpg"),
    anchors: [{ label: "Transducers", url: "#transducers" }, { label: "Wave shaping", url: "#wave-shaping" }, { label: "Amplification", url: "#amplification" }, { label: "Software", url: "#software" }] }),
  rows({ eyebrow: "6 areas", heading: "How an Adamson system is built", description: "Content for this page is still being written; the sections follow the sitemap.",
    rows: TECH.map(([eyebrow, title, text, photo]) => ({ eyebrow, title: eyebrow, text: `${title}. ${text}`, image: img(photo), link: null })) }),
  connect,
]);
console.log("pages written");
