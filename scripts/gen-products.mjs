// One-off generator for wordpress/seed/products.json: keeps the existing 13
// records and adds the model list from SITEMAP.md. Specs that aren't confirmed
// are left empty (shown as "See spec sheet") rather than invented.
import { readFileSync, writeFileSync } from "node:fs";
const file = new URL("../wordpress/seed/products.json", import.meta.url);
// The original 13 records and their order (homepage Products section order).
const ORIGINAL = ["VGt", "CS10", "MG10", "IS7c", "S10", "VGs", "CS10p", "S119", "VGx", "VGd", "VGo", "XG", "M Series"];
const existing = JSON.parse(readFileSync(file, "utf8"))
  .filter((p) => ORIGINAL.includes(p.name))
  .map((p) => ({ ...p, order: ORIGINAL.indexOf(p.name) })); // re-runnable
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const SERIES = {
  "Vergence Group": { cat: "Loudspeakers", page: "/products/loudspeakers/vergence-group", img: { VGt: "product-range/vgt.png", VGs: "product-range/vgs.png", VGx: "products-in-action/vgx.png", VGd: "products-in-action/vgd.png", VGo: "products-in-action/vgo.png" },
    models: [["VGt", "Line Source"], ["VGs", "Subwoofer"], ["VGx", "Line Source"], ["VGd", "Point Source"], ["VGo", "Point Source"]],
    blurb: "Adamson’s flagship platform: line source, subwoofer and point source cabinets with onboard amplification, built to work as one system." },
  "CS Series": { cat: "Loudspeakers", page: "/products/loudspeakers/cs-series", img: { def: "product-range/cs10.png", CS10p: "product-range/cs10p.png" },
    models: [["CS7", "Line Source"], ["CS7p", "Point Source"], ["CS10", "Line Source"], ["CS10n", "Line Source"], ["CS10p", "Point Source"], ["CS118", "Subwoofer"], ["CS119", "Subwoofer"]],
    blurb: "Compact, self-powered cabinets with Milan networking for installs and tours that need a smaller footprint." },
  "IS Series": { cat: "Loudspeakers", page: "/products/loudspeakers/is-series", img: { def: "product-range/is7c.png" },
    models: [["IS5c", "Point Source"], ["IS7", "Line Source"], ["IS7c", "Point Source"], ["IS7p", "Point Source"], ["IS7px", "Point Source"], ["IS10", "Line Source"], ["IS10n", "Line Source"], ["IS10p", "Point Source"], ["IS118", "Subwoofer"], ["IS119", "Subwoofer"], ["IS213", "Subwoofer"], ["IS219", "Subwoofer"]],
    blurb: "Installation versions of Adamson’s touring designs, finished and rigged for permanent venues." },
  "M Series": { cat: "Loudspeakers", page: "/products/loudspeakers/monitors", img: { def: "product-range/mg10.png" },
    models: [["M10", "Stage Monitor"], ["M12", "Stage Monitor"], ["M15", "Stage Monitor"], ["M212", "Stage Monitor"], ["MG10", "Stage Monitor"]],
    blurb: "Low-profile stage monitors with the same voicing as the main system." },
  "E Series": { cat: "Loudspeakers", page: "/products/loudspeakers/e-series", img: { def: "product-range/s10.png" },
    models: [["E12", "Line Source"], ["E15", "Line Source"], ["E119", "Subwoofer"], ["E219", "Subwoofer"]],
    blurb: "Large-format line source for stadiums and festivals, proven on the world’s biggest tours." },
  "S Series": { cat: "Loudspeakers", page: "/products/loudspeakers/s-series", img: { def: "product-range/s10.png", S119: "product-range/s119.png", S118: "product-range/s119.png" },
    models: [["S7", "Line Source"], ["S7p", "Point Source"], ["S10", "Line Source"], ["S10n", "Line Source"], ["S10p", "Point Source"], ["S118", "Subwoofer"], ["S119", "Subwoofer"]],
    blurb: "Lightweight, high-output line source for mid-sized touring and installs." },
  "XG Series": { cat: "Electronics", page: "/products/electronics", img: { def: "products-in-action/xg.png" },
    models: [["XG1", "Amplifier"], ["XG2", "Amplifier"], ["XG4", "Amplifier"], ["XG8", "Amplifier"]],
    blurb: "XG Integration Amplifiers: DSP, Milan networking and Class D power in a 2U chassis." },
  "Media Converters": { cat: "Electronics", page: "/products/electronics", img: { def: "technology/amplification-product.png" },
    models: [["Gateway", "Media Converter"], ["Bridge", "Media Converter"], ["USB Milan Bridge", "Media Converter"]],
    blurb: "Bring analog, AES and USB sources onto a Milan network." },
  "Network": { cat: "Electronics", page: "/products/electronics", img: { def: "technology/amplification-product.png" },
    models: [["MS8.2", "Network"]], blurb: "Milan-certified switching for Adamson systems." },
  "Racks": { cat: "Electronics", page: "/products/electronics", img: { def: "technology/amplification-product.png" },
    models: [["E-Rack", "Rack"], ["S-Rack", "Rack"], ["CS-Rack", "Rack"]], blurb: "Pre-wired amplifier and distribution racks for touring systems." },
};

const byName = new Map(existing.map((p) => [p.name, p]));
const out = [];
let order = 0;
for (const [series, s] of Object.entries(SERIES)) {
  for (const [name, type] of s.models) {
    const prev = byName.get(name);
    const img = s.img[name] ?? s.img.def;
    const base = prev ?? {
      name, type, series, range: "", spl: "", splLabel: "Max peak SPL",
      render: img.startsWith("product-range") ? { seed: img, alt: `Adamson ${name}` } : null,
      cutout: img.startsWith("product-range") ? null : { seed: img, alt: `Adamson ${name}` },
      logo: null, inRange: false,
    };
    byName.delete(name);
    out.push({
      ...base,
      type: base.type || type,
      series: base.series || series,
      category: s.cat,
      seriesUrl: s.page,
      tagline: `${type} · ${series}`,
      overview: `${name} is part of the ${series}. ${s.blurb} Designed and manufactured by Adamson in Port Perry, Ontario.`,
      specs: [
        { label: "Type", value: type },
        { label: "Series", value: series },
        ...(base.range ? [{ label: "Frequency range", value: base.range }] : []),
        ...(base.spl ? [{ label: base.splLabel || "Max peak SPL", value: base.spl }] : []),
        { label: "Networking", value: "Milan / AVB" },
      ],
      features: [
        { title: "Engineered in-house", text: "Transducers, enclosures and processing are designed and built by Adamson." },
        { title: "Predictable in the software", text: "Modelled in Blueprint AV and controlled with ArrayIntelligence." },
        { title: "Built to last", text: "Road-tested hardware and rigging, finished in Canada." },
      ],
      downloads: [
        { label: `${name} spec sheet`, url: "/support/downloads", meta: "PDF" },
        { label: `${name} user manual`, url: "/support/downloads", meta: "PDF" },
      ],
      url: `/products/p/${slug(name)}`,
      order: prev ? prev.order : 100 + order++,
    });
  }
}
// Records that aren't models (used by Products in action) stay as they were.
for (const p of byName.values()) out.push(p);
out.sort((a, b) => a.order - b.order);
writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "products");
