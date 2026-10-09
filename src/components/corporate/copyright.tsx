"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The copyright line with the current year. The server fills in the year it was built, and the browser
 * replaces it with this year, so the line is right even on a page that was built last year.
 */
export function Copyright({ template }: { template: string }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => new Date().getFullYear());
  return <p>{template.replace("{year}", String(year))}</p>;
}
