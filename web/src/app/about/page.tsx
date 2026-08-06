import type { Metadata } from "next";
import Image from "next/image";
import {
  AWARDS,
  CERTIFICATIONS,
  EDUCATION,
  LEADERSHIP,
  PROFESSIONAL,
  PUBLICATIONS,
} from "@/content/about";
import { RoleEntry } from "@/components/role-entry";
import { SkillMatrix } from "@/components/skill-matrix";

export const metadata: Metadata = {
  title: "About",
  description:
    "Engineering experience at Optum and Northeastern, education, recognition, publications, certifications, and skills.",
};

/**
 * A page section. Each gets a large display heading and generous
 * space above it, so the eye registers a real break between Experience,
 * Education, Recognition and so on rather than one continuous list.
 */
function Section({
  id,
  label,
  children,
  wide = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  /** Use the full 1600px rail instead of the narrower reading column. */
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${wide ? "shell" : "shell-content"} scroll-mt-28 pt-20 lg:pt-28`}
    >
      <div className="flex items-baseline gap-4 sm:gap-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl">{label}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-10 lg:mt-14">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="pb-24">
      <Section id="experience" label="Experience">
        <div className="border-t border-line">
          {PROFESSIONAL.map((role) => (
            <RoleEntry key={`${role.org}-${role.title}`} role={role} />
          ))}
        </div>

        <h3 className="mt-14 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Leadership
        </h3>
        <div className="mt-4 border-t border-line">
          {LEADERSHIP.map((role) => (
            <RoleEntry key={`${role.org}-${role.title}`} role={role} />
          ))}
        </div>
      </Section>

      <Section id="education" label="Education">
        <div className="space-y-8">
          {EDUCATION.map((entry) => (
            <div
              key={entry.org}
              className="rounded-brand border border-line bg-bg-elev p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden logo-plate rounded-brand-sm border border-line p-2">
                    <Image
                      src={entry.logo}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div>
                    <p className="text-xl sm:text-2xl">{entry.title}</p>
                    <p className="mt-1 text-sm text-accent">{entry.org}</p>
                  </div>
                </div>
                <div className="font-mono text-xs text-ink-faint sm:text-right">
                  <p>{entry.period}</p>
                  <p className="mt-1">{entry.location}</p>
                  {entry.grade && (
                    <p className="mt-1 text-ink-soft">GPA {entry.grade}</p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                  Coursework
                </h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.coursework.map((course) => (
                    <span
                      key={course}
                      className="rounded-full border border-line bg-bg px-3 py-1 font-mono text-[11px] text-ink-soft"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="awards" label="Recognition" wide>
        {AWARDS.map((group) => (
          <div key={group.group} className="mb-14 last:mb-0">
            <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              {group.group}
            </h3>
            <div
              className={`mt-6 grid gap-6 sm:grid-cols-2 ${
                // Columns follow the group size so a group never wraps a
                // lone card onto a second row. Classes are written out in
                // full because Tailwind cannot see interpolated names.
                group.items.length === 4
                  ? "lg:grid-cols-4"
                  : group.items.length === 3
                    ? "lg:grid-cols-3"
                    : "lg:grid-cols-2"
              }`}
            >
              {group.items.map((award) => {
                const card = (
                  <>
                    <div className="aspect-[4/3] overflow-hidden bg-ink/[0.03]">
                      <Image
                        src={award.image}
                        alt={award.title}
                        width={800}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/award:scale-[1.04] motion-reduce:transform-none"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden logo-plate rounded-full border border-line p-1">
                          <Image
                            src={award.logo}
                            alt=""
                            width={32}
                            height={32}
                            className="h-full w-full object-contain"
                          />
                        </span>
                        <p className="text-base transition-colors group-hover/award:text-accent">
                          {award.title}
                          {award.url && (
                            <span className="ml-1.5 inline-block text-ink-faint transition-transform group-hover/award:translate-x-0.5">
                              &#8599;
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-ink-soft">
                        {award.detail}
                      </p>
                    </div>
                  </>
                );

                const shell =
                  "group/award flex flex-col overflow-hidden rounded-brand border border-line bg-bg-elev";

                return award.url ? (
                  <a
                    key={award.title}
                    href={award.url}
                    target="_blank"
                    rel="noopener"
                    className={`${shell} transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
                  >
                    {card}
                  </a>
                ) : (
                  <div key={award.title} className={shell}>
                    {card}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      <Section id="publications" label="Publications">
        <ul className="border-t border-line">
          {PUBLICATIONS.map((pub) => (
            <li key={pub.url}>
              <a
                href={pub.url}
                target="_blank"
                rel="noopener"
                className="group/pub grid grid-cols-[auto_1fr] items-start gap-5 border-b border-line py-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden logo-plate rounded-brand-sm border border-line p-1.5">
                  <Image
                    src={pub.logo}
                    alt={pub.publisher}
                    width={44}
                    height={44}
                    className="h-full w-full object-contain"
                  />
                </span>
                <span>
                  <span className="block transition-colors group-hover/pub:text-accent">
                    {pub.title}
                    <span className="ml-1.5 inline-block text-ink-faint transition-transform group-hover/pub:translate-x-0.5">
                      &#8599;
                    </span>
                  </span>
                  <span className="mt-1.5 block font-mono text-xs text-ink-faint">
                    {pub.publisher} <span className="opacity-40">/</span>{" "}
                    {pub.venue} <span className="opacity-40">/</span> {pub.year}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="skills" label="Certifications and skills" wide>
        <div className="flex flex-wrap gap-3">
          {CERTIFICATIONS.map((cert) => (
            <span
              key={cert.title}
              className="flex items-center gap-3 rounded-brand-sm border border-line bg-bg-elev px-4 py-3"
            >
              <span className="logo-plate grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line p-1.5">
                <Image
                  src={cert.logo}
                  alt=""
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-sm">
                {cert.title}
                {cert.code && (
                  <span className="ml-2 font-mono text-[11px] text-ink-faint">
                    {cert.code}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-12">
          <SkillMatrix />
        </div>

      </Section>
    </div>
  );
}
