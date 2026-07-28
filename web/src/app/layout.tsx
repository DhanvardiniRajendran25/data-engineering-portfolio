import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "variable",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dhanvardinirajendran25.github.io"),
  title: {
    default: "Dhanvardini Rajendran",
    template: "%s · Dhanvardini Rajendran",
  },
  description:
    "Dhanvardini Rajendran builds data pipelines, backend systems, and AI features that ship to production.",
};

// Runs before first paint (see Next.js guide: preventing-flash-before-hydration).
// Sets data-theme from localStorage/OS preference, and only adds the
// `.motion` class when the visitor hasn't asked for reduced motion, so
// scroll/reveal animations added in later phases can safely gate on it.
const THEME_SCRIPT = `(function(){try{var saved=localStorage.getItem("theme");var prefersDark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",saved||(prefersDark?"dark":"light"))}catch(e){}try{if(!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)){document.documentElement.classList.add("motion")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
