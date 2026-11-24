/** Figma "Arrow link": 60px round glass button with a right arrow. */
export default function ArrowLink({ href = "#", label, size = 60, className = "" }: { href?: string; label: string; size?: number; className?: string }) {
  const rem = size / 16;
  return (
    <a
      href={href}
      aria-label={label}
      style={{ width: `${rem}rem`, height: `${rem}rem` }}
      className={`flex shrink-0 items-center justify-center rounded-full border border-line bg-action-secondary backdrop-blur-[5px] transition-colors duration-200 hover:bg-action-secondary-hover hover:border-action-secondary-border-hover ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/arrow-right-line.svg" alt="" width={20} height={20} className="size-5" />
    </a>
  );
}
