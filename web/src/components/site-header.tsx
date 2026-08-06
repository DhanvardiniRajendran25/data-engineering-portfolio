"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  // Nav pill visibility. Hidden while scrolling down, shown on any scroll up
  // and whenever near the top. The wordmark and theme toggle never hide: those
  // are orientation and a control, and both should stay put.
  const [navHidden, setNavHidden] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        // 8px deadzone so a trackpad jitter does not toggle the pill.
        if (Math.abs(y - lastY) < 8) return;
        setNavHidden(y > lastY && y > 160);
        lastY = y;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // No route-change effect here on purpose. Every link in the panel closes it
  // in its own onClick, which is the event that actually caused the navigation,
  // so an effect watching pathname would be a second source of truth for the
  // same transition and trips react-hooks/set-state-in-effect for good reason.
  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";

    // Focus the first link rather than a close button. The trigger itself now
    // toggles, so there is no separate close control to land on.
    const first = dialogRef.current?.querySelector<HTMLElement>("a[href]");
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      // Focus trap. A dialog with aria-modal="true" still lets Tab walk into
      // the page behind it, which leaves keyboard users lost in content they
      // cannot see. Cycle focus within the dialog instead.
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === firstEl) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      // Return focus to whatever opened the dialog, so keyboard users resume
      // where they left off rather than at the top of the document.
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="sticky top-4 z-50 px-gutter pt-4">
      {/* Lifted above the scrim below. Without this the scrim, a later sibling
          in the same stacking context, dims the wordmark, the theme toggle and
          the very button used to dismiss it. */}
      <div className="relative z-10 flex w-full items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-bold text-accent">
          DR
        </Link>

        {/* Shown from 640px up, not 1024px. Four short labels plus the wordmark
            and the toggle measure about 420px, so collapsing them at 1024px was
            hiding a nav that had roughly 200px of room to spare and putting a
            tablet a tap away from every page. */}
        <nav
          aria-label="Primary"
          className={`glass hidden items-center gap-0.5 rounded-full border border-line px-1.5 py-1.5 text-sm font-medium shadow-brand transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:flex lg:gap-1 lg:px-2 lg:py-2 ${
            navHidden
              ? "pointer-events-none -translate-y-3 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className="relative rounded-full px-2.5 py-1.5 lg:px-4"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-ink/[0.06]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* A labelled pill rather than a hamburger. Three stacked lines are
              the most generic control on the web and read as a placeholder next
              to a site that spells everything else out in mono uppercase. The
              word is also unambiguous, which the icon is not. */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            className="glass flex h-10 items-center gap-2 rounded-full border border-line px-4 font-mono text-[10px] tracking-[0.16em] text-ink uppercase shadow-brand transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:hidden"
          >
            {open ? "Close" : "Menu"}
            <span
              aria-hidden="true"
              className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                open ? "bg-accent" : "bg-ink-faint"
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Scrim. Dims and blurs the page instead of replacing it, so the
                reader keeps their place and the menu reads as a layer over the
                site rather than a separate screen. Inside the sticky wrapper's
                stacking context, so it covers content but not the header. */}
            <motion.div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
              className="fixed inset-0 bg-ink/25 backdrop-blur-[3px] sm:hidden"
            />

            {/* Anchored panel, not a full-screen takeover. Sized to its content
                and pinned under the trigger it came from, so the relationship
                between control and panel stays visible. */}
            <div className="absolute inset-x-0 top-full z-20 flex justify-end px-gutter pt-3 sm:hidden">
              <motion.div
                ref={dialogRef}
                id="site-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6, scale: 0.98 }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: "top right" }}
                className="glass w-full max-w-[18rem] overflow-hidden rounded-brand border border-line shadow-brand"
              >
                <p className="border-b border-line px-5 pt-4 pb-3 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                  Navigate
                </p>

                <nav aria-label="Primary" className="flex flex-col py-1.5">
                  {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center justify-between px-5 py-3 text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                          isActive
                            ? "text-ink"
                            : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"
                        }`}
                      >
                        {link.label}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-accent"
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
