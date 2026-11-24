import type { BlockExtras, BlockInstance } from "@/lib/types";
import { registry } from "./registry";

/** Renders a page's blocks in order. Unknown blocks are skipped. */
export default function Blocks({ blocks, extras, preview = false }: { blocks: BlockInstance[]; extras?: BlockExtras; preview?: boolean }) {
  return (
    <>
      {blocks.map((block) => {
        const entry = registry[block.name];
        if (!entry) return null;
        const Component = entry.component;
        return <Component key={block.id} data={block.data ?? {}} extras={extras} preview={preview} />;
      })}
    </>
  );
}
