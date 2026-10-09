import { ContentNav } from "@/components/admin/content/content-nav";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <ContentNav />
      {children}
    </div>
  );
}
