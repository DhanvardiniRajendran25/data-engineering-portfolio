import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgCard,
  loadOgFonts,
} from "@/lib/og-card";

export const alt = `${SITE.name}, ${SITE.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Site-wide share card. Applies to every route that does not define its own,
 * which after the project cards means Home, Work, About and Contact.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow={SITE.role}
        title={SITE.name}
        body={SITE.description}
        chips={["Data", "AI", "Backend"]}
      />
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
