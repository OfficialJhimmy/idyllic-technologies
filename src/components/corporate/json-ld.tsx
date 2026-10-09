import { jsonLdString } from "@/lib/seo";

/** Structured data for search engines. The string is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
