import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dhanvardini Rajendran: engineering experience, skills, education, and recognition.",
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      title="About"
      phase="Phase E (story, experience, skills, education, awards)"
    />
  );
}
