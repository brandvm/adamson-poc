"use client";
import { useState } from "react";
import type { BlockProps, Link } from "@/lib/types";
import { Eyebrow } from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/FormField";
import NextLink from "next/link";

// Login Panel (sitemap: three levels — public, approved clients, admins).
// Left: what each access level gets. Right: a sign-in card. UI only: there is
// no account system yet, so submitting shows the editable "not connected" note.

type Level = { title: string; text: string };
type Data = {
  eyebrow: string;
  heading: string;
  text: string;
  levels: Level[];
  formTitle: string;
  submitLabel: string;
  requestText: string;
  requestLink: Link;
  notConnected: string;
};

export default function LoginPanel({ data }: BlockProps<Data>) {
  const [sent, setSent] = useState(false);
  const levels = (data.levels ?? []).filter((l) => l?.title);

  return (
    <section className="bg-page text-ink">
      <div className="site-container grid gap-16 px-margin py-section lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] max-lg:gap-10">
        <div className="flex min-w-0 flex-col gap-6">
          {data.eyebrow && <Eyebrow>{data.eyebrow}</Eyebrow>}
          {data.heading && <h1 className="type-h1">{data.heading}</h1>}
          {data.text && <p className="max-w-[32rem] type-body-l text-subtle">{data.text}</p>}
          {levels.length > 0 && (
            <ol className="mt-6 flex flex-col">
              {levels.map((l, i) => (
                <li key={i} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-t border-line-subtle py-6">
                  <span className="type-counter text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="type-h5">{l.title}</h2>
                    {l.text && <p className="type-body-s text-subtle">{l.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="self-start rounded-lg border border-line-subtle bg-raised/60 p-10 backdrop-blur-[32px] max-md:p-6 lg:sticky lg:top-28">
          <h2 className="type-h4">{data.formTitle || "Sign in"}</h2>
          {sent ? (
            <p role="status" className="mt-6 rounded-md border border-line p-5 type-body-s text-subtle">
              {data.notConnected || "Sign-in isn’t connected yet. Please contact your Adamson representative."}
            </p>
          ) : (
            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Field id="login-email" label="Email" type="email" autoComplete="email" required />
              <Field id="login-password" label="Password" type="password" autoComplete="current-password" required />
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 type-body-xs text-subtle">
                  <input type="checkbox" className="size-4 accent-[#8a6e4b]" /> Keep me signed in
                </label>
                <NextLink href="/contact" className="type-body-xs text-accent hover:underline">Forgot password?</NextLink>
              </div>
              <button type="submit" className="mt-2 h-[2.625rem] rounded-full bg-gold px-5 type-button-l text-white transition hover:brightness-110">
                {data.submitLabel || "Sign in"}
              </button>
            </form>
          )}
          {(data.requestText || data.requestLink?.label) && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-6">
              {data.requestText && <p className="type-body-s text-subtle">{data.requestText}</p>}
              {data.requestLink?.label && <Button link={data.requestLink} variant="secondary" />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
