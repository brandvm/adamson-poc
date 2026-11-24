"use client";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

const split = (s?: string) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
const unique = (list: string[]) => [...new Set(list)].sort((a, b) => a.localeCompare(b));

/** Projects with application / region / product filters (client side; the list is small). */
export default function ProjectFilter({ projects, filters, light }: { projects: Project[]; filters: boolean; light: boolean }) {
  const [app, setApp] = useState("");
  const [region, setRegion] = useState("");
  const [product, setProduct] = useState("");

  const options = useMemo(
    () => ({
      app: unique(projects.map((p) => p.application ?? "").filter(Boolean)),
      region: unique(projects.map((p) => p.region ?? "").filter(Boolean)),
      product: unique(projects.flatMap((p) => split(p.products))),
    }),
    [projects],
  );
  const shown = projects.filter(
    (p) => (!app || p.application === app) && (!region || p.region === region) && (!product || split(p.products).includes(product)),
  );

  const select = `h-10 min-w-0 appearance-none rounded-full border bg-transparent bg-[url(/icons/chevron-down.svg)] bg-[length:0.75rem] bg-[position:right_1rem_center] bg-no-repeat pr-10 pl-4 type-body-s outline-none focus-visible:border-gold max-md:w-full ${
    light ? "border-black/15 text-black" : "border-line text-ink [&>option]:bg-raised"
  }`;
  const reset = app || region || product;

  return (
    <div className="flex flex-col gap-10 max-lg:gap-6">
      {filters && (
        <div className="flex flex-wrap items-center gap-3 max-md:grid max-md:grid-cols-1">
          {(
            [
              ["Application", app, setApp, options.app],
              ["Region", region, setRegion, options.region],
              ["Product", product, setProduct, options.product],
            ] as const
          ).map(([label, value, set, list]) => (
            <label key={label} className="contents">
              <span className="sr-only">{label}</span>
              <select value={value} onChange={(e) => set(e.target.value)} className={select}>
                <option value="">All {label === "Application" ? "applications" : label === "Region" ? "regions" : "products"}</option>
                {list.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <p className={`type-body-s ml-auto max-md:ml-0 ${light ? "text-secondary" : "text-muted"}`} aria-live="polite">
            {shown.length} {shown.length === 1 ? "project" : "projects"}
            {reset && (
              <button type="button" onClick={() => { setApp(""); setRegion(""); setProduct(""); }} className={`ml-3 underline ${light ? "text-black" : "text-ink"}`}>
                Clear filters
              </button>
            )}
          </p>
        </div>
      )}
      {shown.length ? (
        <div className="grid grid-cols-3 gap-x-4 gap-y-12 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-y-8">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} light={light} />
          ))}
        </div>
      ) : (
        <p className={`type-body-m ${light ? "text-secondary" : "text-subtle"}`}>No projects match these filters yet.</p>
      )}
    </div>
  );
}
