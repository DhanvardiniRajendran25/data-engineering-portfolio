"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Copies a value to the clipboard and confirms it.
 *
 * The confirmation is announced via a polite live region, not colour alone,
 * so it reaches screen readers. The reset timer is cleared on unmount so a
 * click immediately before navigating away cannot set state on a gone
 * component.
 */
export function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions or a non-secure origin.
      // The value is visible next to the button, so failing quietly is
      // acceptable; the user can still select it manually.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-ink-soft uppercase transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {copied ? "Copied" : "Copy"}
        <span className="sr-only"> {label}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? `${label} copied to clipboard` : ""}
      </span>
    </>
  );
}
