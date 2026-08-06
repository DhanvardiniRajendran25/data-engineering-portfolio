"use client";

import Image from "next/image";
import { useState } from "react";
import type { Role } from "@/content/about";

/**
 * One role. Logo, title, org, and period are always visible; the detail
 * bullets expand on hover.
 *
 * Hover is not the only way in: the row is a real <button> that toggles on
 * click and keyboard, and it also expands on focus. Hover-only disclosure
 * would hide this content from touch and keyboard users entirely.
 */
export function RoleEntry({ role }: { role: Role }) {
  const [pinned, setPinned] = useState(false);

  return (
    <div
      className="group border-b border-line"
      data-open={pinned ? "true" : undefined}
    >
      <button
        type="button"
        onClick={() => setPinned((open) => !open)}
        aria-expanded={pinned}
        className="grid w-full grid-cols-[auto_1fr] items-center gap-5 py-7 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:gap-6"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden logo-plate rounded-brand-sm border border-line p-2 sm:h-16 sm:w-16">
          <Image
            src={role.logo}
            alt=""
            width={64}
            height={64}
            className="h-full w-full object-contain"
          />
        </span>

        <span className="grid gap-1 lg:grid-cols-[1fr_auto] lg:items-baseline lg:gap-8">
          <span>
            <span className="block text-xl sm:text-2xl">{role.title}</span>
            <span className="mt-1 block text-sm text-accent">{role.org}</span>
          </span>
          <span className="font-mono text-xs whitespace-nowrap text-ink-faint lg:text-right">
            {role.period}
            <span className="mx-2 opacity-40">/</span>
            {role.location}
          </span>
        </span>
      </button>

      {/* Expands on hover, on keyboard focus within, and when pinned open */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] group-data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none">
        <div className="overflow-hidden">
          <ul className="grid gap-3 pb-8 pl-[4.75rem] sm:pl-[5.5rem]">
            {role.points.map((point) => (
              <li
                key={point}
                className="border-l border-line pl-4 text-sm leading-relaxed text-ink-soft"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
