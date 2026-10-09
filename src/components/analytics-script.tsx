import Script from "next/script";

/**
 * Loads Google Analytics only when a measurement ID is set. Components never call it directly: they use
 * track() from src/lib/analytics.ts. TODO: add a consent notice before launch if Idyllic needs one.
 */
export function AnalyticsScript() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}</Script>
    </>
  );
}
