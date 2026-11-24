"use client";
import { useState } from "react";
import type { BlockProps } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import { Field, FileField, Select, TextArea } from "@/components/ui/FormField";

// Careers (sitemap: "open roles and a form with resume and portfolio upload").
// Open roles as an accordion list; "Apply" picks the role in the form below.
// The form submits nowhere yet: it shows the editable success message.

type Role = { title: string; team: string; location: string; type: string; text: string };
type Data = {
  anchor: string;
  eyebrow: string;
  heading: string;
  description: string;
  roles: Role[];
  noRolesText: string;
  formEyebrow: string;
  formTitle: string;
  formText: string;
  successText: string;
};

const GENERAL = "General application";

export default function Careers({ data }: BlockProps<Data>) {
  const roles = (data.roles ?? []).filter((r) => r?.title);
  const [open, setOpen] = useState<number | null>(0);
  const [role, setRole] = useState(GENERAL);
  const [resume, setResume] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [sent, setSent] = useState(false);

  const apply = (title: string) => {
    setRole(title);
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section id={data.anchor || undefined} className="scroll-mt-24 bg-white text-black">
        <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
          <SectionHeader eyebrow={data.eyebrow} title={data.heading} description={data.description} size="h2" tone="light" />
          {roles.length === 0 ? (
            <p className="rounded-lg border border-black/8 p-10 text-center type-body-m text-secondary">{data.noRolesText}</p>
          ) : (
            <ul className="flex flex-col border-t border-black/10">
              {roles.map((r, i) => {
                const isOpen = open === i;
                return (
                  <li key={i} className="border-b border-black/10">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`role-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-6 text-left md:grid-cols-[minmax(0,1fr)_12rem_10rem_auto]"
                    >
                      <span className="type-h5">{r.title}</span>
                      <span className="type-body-s text-secondary max-md:col-start-1 max-md:row-start-2">{[r.team, r.location].filter(Boolean).join(" · ")}</span>
                      <span className="type-body-s text-secondary max-md:hidden">{r.type}</span>
                      <span className={`flex size-10 items-center justify-center rounded-full border border-black/14 transition-transform max-md:row-span-2 max-md:col-start-2 max-md:row-start-1 ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/chevron-down.svg" alt="" width={12} height={12} className="size-3 invert" />
                      </span>
                    </button>
                    <div id={`role-${i}`} hidden={!isOpen} className="pb-8">
                      <div className="flex max-w-[44rem] flex-col gap-5">
                        {r.text && <p className="whitespace-pre-line type-body-m text-secondary">{r.text}</p>}
                        <div>
                          <button type="button" onClick={() => apply(r.title)} className="h-9 rounded-full bg-black px-4 type-button text-white transition-colors hover:bg-raised">
                            Apply for this role
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section id="apply" className="scroll-mt-24 bg-page text-ink">
        <div className="site-container grid gap-16 px-margin py-section lg:grid-cols-[minmax(0,1fr)_minmax(0,46rem)] max-lg:gap-10">
          <SectionHeader layout="stacked" size="h2" eyebrow={data.formEyebrow} title={data.formTitle} description={data.formText} descriptionWidth={26} />
          {sent ? (
            <div role="status" className="self-start rounded-lg border border-line-subtle bg-raised/60 p-10 max-md:p-6">
              <p className="type-h5">{data.successText || "Thanks — your application is in."}</p>
              <button type="button" onClick={() => setSent(false)} className="mt-6 type-body-s text-accent hover:underline">Send another application</button>
            </div>
          ) : (
            <form
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Field id="career-first" label="First name" autoComplete="given-name" required />
              <Field id="career-last" label="Last name" autoComplete="family-name" required />
              <Field id="career-email" label="Email" type="email" autoComplete="email" required />
              <Field id="career-phone" label="Phone" type="tel" autoComplete="tel" />
              <Select id="career-role" label="Role" options={[GENERAL, ...roles.map((r) => r.title)]} value={role} onChange={(e) => setRole(e.target.value)} className="md:col-span-2" />
              <FileField id="career-resume" label="Resume" hint="PDF or Word, up to 10 MB" accept=".pdf,.doc,.docx" fileName={resume} onFile={setResume} required />
              <FileField id="career-portfolio" label="Portfolio" hint="Optional · PDF or ZIP, up to 25 MB" accept=".pdf,.zip" fileName={portfolio} onFile={setPortfolio} />
              <TextArea id="career-message" label="Anything else we should know?" className="md:col-span-2" />
              <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
                <label className="flex items-center gap-2 type-body-xs text-subtle">
                  <input type="checkbox" required className="size-4 accent-[#8a6e4b]" /> I agree to Adamson storing my application.
                </label>
                <button type="submit" className="h-[2.625rem] rounded-full bg-white px-5 type-button-l text-black transition-colors hover:bg-gold-50">Send application</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
