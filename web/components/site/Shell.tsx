import type { ReactNode } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/wp";

/** Global header and footer around a page that isn't built from blocks (templates). */
export default async function Shell({ children }: { children: ReactNode }) {
  const settings = await getSettings().catch(() => ({}));
  return (
    <>
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
