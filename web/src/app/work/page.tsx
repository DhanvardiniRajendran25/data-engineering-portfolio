import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Data engineering, backend, and AI case studies by Dhanvardini Rajendran.",
};

export default function WorkPage() {
  return (
    <PagePlaceholder
      title="Work"
      phase="Phase C (archive index of all case studies)"
    />
  );
}
