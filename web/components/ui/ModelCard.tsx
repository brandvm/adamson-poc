import type { Product } from "@/lib/types";
import Img from "@/components/ui/Img";
import StudioBackdrop, { ProductShadow } from "@/components/ui/StudioBackdrop";

/**
 * Card / Model: one product, linking to its product page. The studio render
 * fills the card; a cut-out sits on the CSS studio backdrop instead. Chip
 * (type) top-left, name (D5) and key spec at the bottom.
 */
export default function ModelCard({ product: p }: { product: Product }) {
  const Tag = p.url ? "a" : "div";
  return (
    <Tag
      {...(p.url ? { href: p.url } : {})}
      className="group relative block aspect-[540/460] overflow-clip rounded-lg bg-card"
    >
      {p.render?.url ? (
        <Img media={p.render} alt={p.render.alt || p.name} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]" />
      ) : (
        <>
          <StudioBackdrop className="absolute inset-0" />
          {p.cutout?.url && (
            <div className="absolute inset-x-[12%] top-[16%] bottom-[24%] transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.04]">
              <ProductShadow className="absolute inset-x-[10%] -bottom-[6%] h-[12%]" />
              <Img media={p.cutout} alt={p.cutout.alt || p.name} className="relative size-full object-contain" />
            </div>
          )}
        </>
      )}
      <div className="absolute inset-x-0 top-0 h-[7.5rem] bg-linear-to-b from-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[10rem] bg-linear-to-b from-transparent to-black/85" />
      {p.type && (
        <span className="absolute top-5 left-5 rounded-full border border-line bg-glass px-3 py-[0.4375rem] type-tag text-ink backdrop-blur-[5px]">{p.type}</span>
      )}
      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 max-md:inset-x-5 max-md:bottom-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="type-h5 text-ink">{p.name}</h3>
          {(p.range || p.series) && <p className="truncate type-body-s text-subtle">{p.range || p.series}</p>}
        </div>
        {p.spl && (
          <div className="shrink-0 text-right">
            <p className="type-h6 text-ink">{p.spl}</p>
            <p className="type-body-xs text-subtle">{p.splLabel || "Max peak SPL"}</p>
          </div>
        )}
      </div>
    </Tag>
  );
}
