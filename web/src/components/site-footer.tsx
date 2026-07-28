export function SiteFooter() {
  return (
    <footer className="border-t border-line px-gutter py-8 text-sm text-ink-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-display text-ink">Dhanvardini Rajendran</span>
        <nav aria-label="Contact" className="flex flex-wrap gap-x-5 gap-y-2">
          <a
            className="transition-colors hover:text-ink"
            href="mailto:dhanvardini.rajendran@gmail.com"
          >
            Email
          </a>
          <a
            className="transition-colors hover:text-ink"
            href="https://www.linkedin.com/in/dhanvardini/"
            target="_blank"
            rel="noopener"
          >
            LinkedIn
          </a>
          <a
            className="transition-colors hover:text-ink"
            href="https://github.com/DhanvardiniRajendran25"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <a
            className="transition-colors hover:text-ink"
            href="/resume.pdf"
            download="Dhanvardini_Rajendran_Resume.pdf"
          >
            Resume
          </a>
        </nav>
      </div>
      <p className="mt-4 text-ink-faint">
        &copy; {new Date().getFullYear()} Dhanvardini Rajendran.
      </p>
    </footer>
  );
}
