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
/**
 * Light is the default for a first visit, regardless of the OS setting.
 *
 * This previously followed `prefers-color-scheme`, which is the usual advice
 * and is why a visitor on a dark-mode machine landed on the dark theme. The
 * cream palette is the identity of this site, so a first impression is worth
 * more here than matching the OS. A returning visitor's explicit toggle still
 * wins, because a stored choice is a real preference rather than an inherited
 * default.
 *
 * `prefers-reduced-motion` is deliberately still honoured below. Colour is
 * taste; motion is an accessibility need.
 */
export const THEME_SCRIPT = `(function(){try{var saved=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",saved==="dark"||saved==="light"?saved:"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}try{if(!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)){document.documentElement.classList.add("motion")}}catch(e){}})();`;
