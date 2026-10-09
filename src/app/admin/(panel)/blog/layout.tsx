import { BlogNav } from "@/components/admin/blog/blog-nav";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <BlogNav />
      {children}
    </div>
  );
}
