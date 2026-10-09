import { ArrowLink } from "@/components/corporate/arrow-link";
import { PageHero } from "@/components/corporate/page-hero";

export default function NotFound() {
  return (
    <PageHero title="Page not found" body="The page you are looking for is not here. It may have moved, or the address may have a typo.">
      <div className="pt-2">
        <ArrowLink href="/">Back to the home page</ArrowLink>
      </div>
    </PageHero>
  );
}
