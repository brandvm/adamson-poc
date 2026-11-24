import type { Metadata } from "next";
import PageView from "@/components/site/PageView";

export const metadata: Metadata = { title: "Products · Adamson" };

// Products Overview (Figma 507:1245). Content: WordPress page "products".
export default function Products() {
  return <PageView slug="products" />;
}
