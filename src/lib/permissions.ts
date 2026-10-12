/**
 * Who can do what in the admin. There are two roles. The database stores them as "owner" and "editor";
 * the screens call them Admin and Content.
 *
 * Admin: everything, including inviting and removing people.
 * Content: products, blog posts, website content (FAQs, testimonials, clients) and the media library.
 * Not for Content: brands, categories and their spec templates, enquiries (they hold customers' details), and the team.
 */

export type Role = "owner" | "editor";

export const ROLE_LABEL: Record<Role, string> = { owner: "Admin", editor: "Content" };

export const ROLE_SUMMARY: Record<Role, string> = {
  owner: "Can do everything, including inviting people and changing their access.",
  editor: "Can add and edit products, blog posts and website content. Cannot manage brands, categories, enquiries or the team.",
};

export type Section = "dashboard" | "activity" | "products" | "blog" | "content" | "media" | "settings" | "categories" | "brands" | "enquiries" | "team";

const contentSections: readonly Section[] = ["dashboard", "activity", "products", "blog", "content", "media", "settings"];

export function canAccess(role: Role, section: Section): boolean {
  return role === "owner" || contentSections.includes(section);
}

export const isRole = (value: unknown): value is Role => value === "owner" || value === "editor";
