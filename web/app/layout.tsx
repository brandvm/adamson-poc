import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import SmoothScroll from "@/components/motion/SmoothScroll";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Adamson Systems Engineering",
  description: "Professional loudspeaker systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
