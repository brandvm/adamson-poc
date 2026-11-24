"use client";
// One shared GSAP with ScrollTrigger registered (ported from wf-template
// recipes/smooth-scroll/gsap.ts). Import gsap from here, never from "gsap",
// so every animation shares the ticker that drives Lenis.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, Flip);

/** Read at call time: the setting can change while the page is open. */
export const reducedMotion = () =>
  typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, Flip };
