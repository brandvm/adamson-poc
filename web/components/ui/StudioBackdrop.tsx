/**
 * A product-photography studio backdrop recreated in CSS: dark sweep, a soft
 * key light and a darker floor. Used behind product cut-outs instead of the
 * design's background photos, which have the product baked in (that shows as
 * a ghost copy once the cut-out moves with parallax). Resolution-independent
 * and meant to be placed in an oversized box so parallax never shows an edge.
 *
 * - warm: hero (bronze key light, upper right of centre)
 * - neutral: product slides (grey key light, top centre)
 */
type Tone = "warm" | "neutral";

const LAYERS: Record<Tone, string> = {
  warm: [
    // key light
    "radial-gradient(ellipse 34% 42% at 66% 34%, rgb(176 132 88 / 0.42), rgb(176 132 88 / 0) 100%)",
    // wide bounce
    "radial-gradient(ellipse 70% 75% at 60% 40%, rgb(92 64 40 / 0.55), rgb(92 64 40 / 0) 100%)",
    // floor: darker towards the bottom, lit band where the product would stand
    "linear-gradient(to bottom, rgb(0 0 0 / 0) 58%, rgb(0 0 0 / 0.35) 74%, rgb(0 0 0 / 0.7) 100%)",
    // vignette
    "radial-gradient(ellipse 95% 95% at 55% 45%, rgb(0 0 0 / 0) 55%, rgb(0 0 0 / 0.65) 100%)",
    "linear-gradient(#120c08, #0a0705)",
  ].join(", "),
  neutral: [
    "radial-gradient(ellipse 32% 38% at 50% 26%, rgb(118 118 118 / 0.55), rgb(118 118 118 / 0) 100%)",
    "radial-gradient(ellipse 75% 70% at 50% 35%, rgb(52 52 52 / 0.8), rgb(52 52 52 / 0) 100%)",
    "linear-gradient(to bottom, rgb(0 0 0 / 0) 55%, rgb(0 0 0 / 0.45) 78%, rgb(0 0 0 / 0.8) 100%)",
    "radial-gradient(ellipse 95% 95% at 50% 40%, rgb(0 0 0 / 0) 55%, rgb(0 0 0 / 0.7) 100%)",
    "linear-gradient(#141414, #050505)",
  ].join(", "),
};

export default function StudioBackdrop({ tone = "neutral", className = "" }: { tone?: Tone; className?: string }) {
  return <div aria-hidden className={`absolute inset-0 ${className}`} style={{ backgroundImage: LAYERS[tone] }} />;
}

/** Soft contact shadow under a floating product (place it in the product's own box). */
export function ProductShadow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute ${className}`}
      style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0) 100%)", filter: "blur(12px)" }}
    />
  );
}
