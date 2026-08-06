/**
 * Theme + motion bootstrap, injected inline in the document head.
 *
 * Runs synchronously during HTML parsing, before first paint, so the correct
 * theme is applied without a flash of the wrong one. See the Next.js guide
 * "preventing flash before hydration".
 *
 * Kept in its own module rather than inline in the layout because it is
 * hand-written browser code with no JSX around it: isolating it keeps the
 * layout readable and makes this the single place to edit theme bootstrapping.
 */
export const THEME_SCRIPT = `(function(){try{var saved=localStorage.getItem("theme");var prefersDark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",saved||(prefersDark?"dark":"light"))}catch(e){}try{if(!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)){document.documentElement.classList.add("motion")}}catch(e){}})();`;
