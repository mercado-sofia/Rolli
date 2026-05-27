import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { APP_NAME, PUBLIC_ASSETS } from "@/lib/constants";

import "./globals.css";

export const viewport: Viewport = {
  viewportFit: "cover",
};

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "A temporary anonymous disposable camera and social deduction experience for friend groups.",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description:
      "Anonymous photos, delayed reveal, and a playful guessing game for friend hangouts.",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description:
      "Anonymous photos, delayed reveal, and a playful guessing game for friend hangouts.",
  },
  icons: {
    icon: PUBLIC_ASSETS.images.logo,
    apple: PUBLIC_ASSETS.images.logo,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} h-full`}>
      <body className="min-h-full overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
