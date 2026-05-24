import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";
import { getInvitePreviewCopy } from "@/lib/metadata/invite-preview";
import { fetchHangoutBySlugServer } from "@/lib/services/hangouts-server";

export const runtime = "edge";

export const alt = "Rolli hangout invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "64px",
          background:
            "linear-gradient(135deg, #fef3c7 0%, #fbcfe8 45%, #e9d5ff 100%)",
          color: "#2d2a4a",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 36,
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 44 }}>📸</span>
          <span>{APP_NAME}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 28,
              opacity: 0.85,
            }}
          >
            {"You're invited"}
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {displayTitle}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.4,
              opacity: 0.9,
            }}
          >
            {copy.imageTagline}
          </p>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 24,
            opacity: 0.75,
          }}
        >
          Anonymous camera · hidden until reveal · guess the perspectives
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
