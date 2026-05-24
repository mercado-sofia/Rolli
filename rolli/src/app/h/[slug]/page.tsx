import type { Metadata } from "next";

import { InviteLanding } from "@/app/h/[slug]/invite-landing";
import { APP_NAME } from "@/lib/constants";
import {
  getInvitePreviewCopy,
  getInviteUrl,
} from "@/lib/metadata/invite-preview";
import { fetchHangoutBySlugServer } from "@/lib/services/hangouts-server";

type InvitePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: hangout } = await fetchHangoutBySlugServer(slug);
  const copy = getInvitePreviewCopy(hangout?.title);
  const pageUrl = getInviteUrl(slug);

  const ogImageUrl = `${pageUrl}/opengraph-image`;

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: pageUrl,
      siteName: APP_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [ogImageUrl],
    },
  };
}

export default function InvitePage() {
  return <InviteLanding />;
}
