import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";
import { getInvitePreviewCopy } from "@/lib/hangout/invite-preview";
import { fetchHangoutBySlugServer } from "@/lib/services/hangouts-server";

export const runtime = "edge";

export const alt = "Rolli hangout invitation";
export const size = { width: 1200, height: 630 };
/** JPEG keeps previews under WhatsApp's ~300KB image limit (PNG often exceeds it). */
export const contentType = "image/jpeg";

type OgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function InviteOpenGraphImage({ params }: OgImageProps) {
  const { slug } = await params;
  const { data: hangout } = await fetchHangoutBySlugServer(slug);
  const copy = getInvitePreviewCopy(hangout?.title);

  const displayTitle =
    copy.imageHeading.length > 48
      ? `${copy.imageHeading.slice(0, 45)}…`
      : copy.imageHeading;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          backgroundColor: "#fbc2eb",
          color: "#1a1a1a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 40 }}>📸</span>
          <span>{APP_NAME}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "920px",
          }}
        >
          <p style={{ margin: 0, fontSize: 26, color: "#5c1036" }}>
            {"You're invited"}
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 64,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {displayTitle}
          </h1>
          <p style={{ margin: 0, fontSize: 28, lineHeight: 1.35, color: "#3d3d3d" }}>
            {copy.imageTagline}
          </p>
        </div>

        <p style={{ margin: 0, fontSize: 22, color: "#5c1036" }}>
          Anonymous camera · reveal later · guess the perspectives
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
