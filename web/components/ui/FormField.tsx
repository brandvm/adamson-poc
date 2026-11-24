// Form controls in the style guide's Form Input style (pill/rounded field,
// Border/Default, gold on focus). Tone "light" for white sections.
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Tone = "dark" | "light";

const base = (tone: Tone) =>
  `w-full border bg-transparent px-4 type-body-s outline-none transition-colors focus:border-gold ${
    tone === "light" ? "border-black/14 text-black placeholder:text-charcoal-400" : "border-line text-ink placeholder:text-muted"
  }`;

export function Label({ children, htmlFor, tone = "dark", required }: { children: ReactNode; htmlFor: string; tone?: Tone; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={`type-body-xs ${tone === "light" ? "text-secondary" : "text-subtle"}`}>
      {children}
      {required && <span className="text-accent"> *</span>}
    </label>
  );
}

export function Field({ label, id, tone = "dark", className = "", required, ...rest }: { label: string; id: string; tone?: Tone } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <Label htmlFor={id} tone={tone} required={required}>{label}</Label>
      <input id={id} name={id} required={required} className={`h-11 rounded-full ${base(tone)}`} {...rest} />
    </div>
  );
}

export function TextArea({ label, id, tone = "dark", className = "", required, ...rest }: { label: string; id: string; tone?: Tone } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <Label htmlFor={id} tone={tone} required={required}>{label}</Label>
      <textarea id={id} name={id} rows={5} required={required} className={`resize-y rounded-md py-3 ${base(tone)}`} {...rest} />
    </div>
  );
}

export function Select({ label, id, tone = "dark", options, className = "", required, ...rest }: { label: string; id: string; tone?: Tone; options: string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <Label htmlFor={id} tone={tone} required={required}>{label}</Label>
      <select id={id} name={id} required={required} className={`h-11 appearance-none rounded-full ${base(tone)} ${tone === "light" ? "" : "[&>option]:bg-raised"}`} {...rest}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/** File upload in the same style: a dashed drop area showing the chosen file's name. */
export function FileField({ label, id, tone = "dark", hint, fileName, onFile, accept, required }: { label: string; id: string; tone?: Tone; hint?: string; fileName?: string; onFile: (name: string) => void; accept?: string; required?: boolean }) {
  const light = tone === "light";
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id} tone={tone} required={required}>{label}</Label>
      <label
        htmlFor={id}
        className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-4 text-center transition-colors focus-within:border-gold hover:border-gold ${light ? "border-black/20" : "border-line"}`}
      >
        <span className={`type-body-s ${light ? "text-black" : "text-ink"}`}>{fileName || "Choose a file"}</span>
        {hint && <span className={`type-body-xs ${light ? "text-secondary" : "text-muted"}`}>{hint}</span>}
        <input id={id} name={id} type="file" accept={accept} required={required} className="sr-only" onChange={(e) => onFile(e.target.files?.[0]?.name ?? "")} />
      </label>
    </div>
  );
}

/** Filter pill (light or dark), pressed when active. */
export function Pill({ active, onClick, children, tone = "dark" }: { active: boolean; onClick: () => void; children: ReactNode; tone?: Tone }) {
  const light = tone === "light";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full border px-4 type-button transition-colors ${
        active
          ? light ? "border-black bg-black text-white" : "border-white bg-white text-black"
          : light ? "border-black/15 text-black hover:bg-black/5" : "border-line text-ink hover:bg-action-secondary-hover"
      }`}
    >
      {children}
    </button>
  );
}
