import { Manrope } from "next/font/google";
import localFont from "next/font/local";

/**
 * Headings: Neue Montreal, self-hosted from src/fonts (woff2).
 * TODO: the supplied licence file says "Demo / Trial". Idyllic must provide a web licence before launch.
 */
export const neueMontreal = localFont({
  src: [
    { path: "../fonts/NeueMontreal-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/NeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/NeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/NeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--nf-heading",
  display: "swap",
});

/** Body: Manrope through next/font/google. Downloaded at build time and self-hosted. */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});
