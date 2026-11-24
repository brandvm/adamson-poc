"use client";
import { useSyncExternalStore } from "react";

/** Live result of a CSS media query. False on the server and during hydration. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
