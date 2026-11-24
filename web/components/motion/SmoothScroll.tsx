"use client";
// Lenis smooth scrolling on the shared GSAP ticker, so ScrollTrigger scrubs
// and pins stay in step (ported from wf-template recipes/smooth-scroll).
// Off under reduced motion and inside the editor's block preview.
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "./gsap";

export default function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion() || window.location.pathname.startsWith("/block-preview")) return;
    const lenis = new Lenis({ lerp: 0.1, allowNestedScroll: true });
    lenis.on("scroll", ScrollTrigger.update);
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
