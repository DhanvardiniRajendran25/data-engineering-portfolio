import type { MDXComponents } from "mdx/types";

// Required by @next/mdx. Maps markdown elements onto the site's type system
// so case-study prose inherits the same rhythm as the rest of the site
// without each .mdx file needing to know about Tailwind classes.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="mt-14 mb-4 text-2xl sm:text-3xl">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 mb-3 text-xl sm:text-2xl">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mt-4 leading-relaxed text-ink-soft">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-soft">
        {children}
      </ol>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),
    code: ({ children }) => (
      <code className="rounded bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="mt-6 overflow-x-auto rounded-brand border border-line bg-bg-elev p-4 font-mono text-sm">
        {children}
      </pre>
    ),
    ...components,
  };
}
