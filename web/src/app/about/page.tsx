import type { Metadata } from "next";
import {
  AWARDS,
  CERTIFICATIONS,
  EDUCATION,
  LEADERSHIP,
  PROFESSIONAL,
  PUBLICATIONS,
  SKILL_GROUPS,
  type Role,
} from "@/content/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dhanvardini Rajendran: engineering experience at Optum and Northeastern, skills, education, publications, and recognition.",
};

function SectionHeading({ id, label }: { id: string; label: string }) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 border-b border-line pb-4 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase"
    >
      {label}
    </h2>
  );
}

function RoleEntry({ role }: { role: Role }) {
  return (
    <div className="grid gap-2 py-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-10">
      <div>
        <p className="font-mono text-xs text-ink-faint">{role.period}</p>
        <p className="mt-1 font-mono text-xs text-ink-faint">{role.location}</p>
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl">{role.title}</h3>
        <p className="mt-1 text-sm text-accent">{role.org}</p>
        <ul className="mt-4 max-w-measure space-y-2">
          {role.points.map((point) => (
            <li key={point} className="text-ink-soft">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="shell section-y">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl">About</h1>

      {/* Opening, first person */}
      <div className="mt-8 max-w-measure space-y-5 text-lg text-ink-soft">
        <p>
          I grew up in Thanjavur, a temple town in Tamil Nadu, and studied
          computer science at SASTRA University. That is where I got obsessed
          with the question underneath engineering: not just how to move data,
          but what happens when the data is wrong, late, or never arrives.
        </p>
        <p>
          That took me to Optum, UnitedHealth Group, where I spent two and a
          half years building the pipelines healthcare decisions run on. The
          work taught me that a pipeline is a promise. If the data is wrong
          downstream, the whole chain breaks.
        </p>
        <p>
          I came to Boston for my MS in Information Systems at Northeastern to
          go deeper on cloud architecture, AI-driven pipelines, and data
          platform design. Today I build data systems end to end, and I am
          looking for a team where the data infrastructure is the product
          rather than an afterthought.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {CERTIFICATIONS.map((cert) => (
          <span
            key={cert}
            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-soft"
          >
            {cert}
          </span>
        ))}
      </div>

      {/* Experience */}
      <section className="mt-20">
        <SectionHeading id="experience" label="Experience" />
        <div className="divide-y divide-line">
          {PROFESSIONAL.map((role) => (
            <RoleEntry key={`${role.org}-${role.title}`} role={role} />
          ))}
        </div>

        <h3 className="mt-10 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Leadership
        </h3>
        <div className="divide-y divide-line border-t border-line">
          {LEADERSHIP.map((role) => (
            <RoleEntry key={`${role.org}-${role.title}`} role={role} />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-20">
        <SectionHeading id="skills" label="Skills" />
        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-lg">{group.label}</h3>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-ink-soft">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-20">
        <SectionHeading id="education" label="Education" />
        <div className="divide-y divide-line">
          {EDUCATION.map((entry) => (
            <div
              key={entry.org}
              className="grid gap-2 py-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-10"
            >
              <p className="font-mono text-xs text-ink-faint">{entry.period}</p>
              <div>
                <h3 className="text-xl sm:text-2xl">{entry.title}</h3>
                <p className="mt-1 text-sm text-accent">{entry.org}</p>
                <p className="mt-3 max-w-measure text-ink-soft">
                  {entry.detail}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
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
            </div>
          ))}
        </div>

        <h3 className="mt-10 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Publications
        </h3>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {PUBLICATIONS.map((pub) => (
            <li key={pub.title} className="py-5">
              <p className="max-w-measure">{pub.title}</p>
              <p className="mt-1 font-mono text-xs text-ink-faint">
                {pub.venue}, {pub.year}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Awards */}
      <section className="mt-20">
        <SectionHeading id="awards" label="Recognition" />
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {AWARDS.map((group) => (
            <div key={group.group}>
              <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                {group.group}
              </h3>
              <ul className="mt-4 space-y-6">
                {group.items.map((award) => (
                  <li key={award.title}>
                    <p className="text-lg">{award.title}</p>
                    <p className="mt-1 max-w-measure text-sm text-ink-soft">
                      {award.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
