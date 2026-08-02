import type { Metadata } from "next";
import Image from "next/image";
import {
  AWARDS,
  CERTIFICATIONS,
  EDUCATION,
  LEADERSHIP,
  PROFESSIONAL,
  PUBLICATIONS,
  SKILL_GROUPS,
} from "@/content/about";
import { RoleEntry } from "@/components/role-entry";

export const metadata: Metadata = {
  title: "About",
  description:
    "Engineering experience at Optum and Northeastern, education, recognition, publications, certifications, and skills.",
};

/** Section label in the left rail, with the section body filling the rest. */
function Section({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-28 border-t border-line pt-8" id={id}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-12">
        <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase lg:sticky lg:top-28 lg:self-start">
          {label}
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="shell section-y space-y-20">
      <Section id="experience" label="Experience">
        <div className="border-t border-line">
          {PROFESSIONAL.map((role) => (
            <RoleEntry key={`${role.org}-${role.title}`} role={role} />
          ))}
        </div>

        <h3 className="mt-12 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Leadership
        </h3>
        <div className="mt-4 border-t border-line">
          {LEADERSHIP.map((role) => (
            <RoleEntry key={`${role.org}-${role.title}`} role={role} />
          ))}
        </div>
      </Section>

      <Section id="education" label="Education">
        <div className="grid gap-6 lg:grid-cols-2">
          {EDUCATION.map((entry) => (
            <div
              key={entry.org}
              className="rounded-brand border border-line bg-bg-elev p-6"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-brand-sm border border-line bg-bg p-1.5">
                  <Image
                    src={entry.logo}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </span>
                <div>
                  <p className="text-lg">{entry.org}</p>
                  <p className="font-mono text-xs text-ink-faint">
                    {entry.period}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-lg">{entry.title}</p>
              <p className="mt-2 text-sm text-ink-soft">{entry.detail}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {entry.coursework.map((course) => (
                  <span
                    key={course}
                    className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-soft"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="awards" label="Recognition">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2">
          {AWARDS.map((group) => (
            <div key={group.group}>
              <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                {group.group}
              </h3>
              <ul className="mt-5 space-y-5">
                {group.items.map((award) => {
                  const body = (
                    <>
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-brand-sm border border-line bg-bg-elev p-1.5">
                        <Image
                          src={award.logo}
                          alt=""
                          width={44}
                          height={44}
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <span>
                        <span className="block group-hover/award:text-accent">
                          {award.title}
                          {award.url && (
                            <span className="ml-1.5 inline-block text-ink-faint transition-transform group-hover/award:translate-x-0.5">
                              &#8599;
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm text-ink-soft">
                          {award.detail}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={award.title}>
                      {award.url ? (
                        <a
                          href={award.url}
                          target="_blank"
                          rel="noopener"
                          className="group/award flex gap-4 rounded-brand-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="flex gap-4">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
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
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-brand-sm border border-line bg-bg-elev p-1.5">
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

      <Section id="skills" label="Certifications &amp; Skills">
        <div className="flex flex-wrap gap-3">
          {CERTIFICATIONS.map((cert) => (
            <span
              key={cert}
              className="flex items-center gap-3 rounded-brand-sm border border-line bg-bg-elev px-4 py-3"
            >
              <Image
                src="/logos/aws.webp"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="text-sm">{cert}</span>
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-brand border border-line bg-line sm:grid-cols-2">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label} className="bg-bg p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg">{group.label}</h3>
                <span className="font-mono text-[11px] text-ink-faint">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
