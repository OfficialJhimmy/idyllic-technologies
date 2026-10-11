/**
 * Light is the default. A visitor can pick dark, or "system" to follow their device. The choice is kept in
 * localStorage and applied as data-theme on the html element. With no choice stored there is no attribute,
 * and the page is light.
 */

export type ThemePreference = "light" | "dark" | "system";

export const THEME_KEY = "idyllic-theme";
const THEME_EVENT = "idyllic-theme-change";

/** Runs before first paint (inline in the head) so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"||t==="system"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export function readTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
  } catch {
    return "light";
  }
}

export function setTheme(next: ThemePreference) {
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage can be blocked. The theme still applies for this visit.
  }
  document.documentElement.setAttribute("data-theme", next);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export const nextTheme: Record<ThemePreference, ThemePreference> = { light: "dark", dark: "system", system: "light" };
