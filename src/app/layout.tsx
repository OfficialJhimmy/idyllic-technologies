import type { Metadata, Viewport } from "next";
import { manrope, neueMontreal } from "./fonts";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idyllic Technologies",
};

export const viewport: Viewport = {
  // Light is the default, so the browser is told the page is light too (form controls, scrollbars, address bar).
  colorScheme: "light",
  themeColor: "#eff4fa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the init script sets data-theme on this element before React loads.
    <html lang="en" className={`${neueMontreal.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Static string from our own code, no user input. Applies the saved theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
