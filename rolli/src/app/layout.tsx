import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

import { APP_NAME, PUBLIC_ASSETS } from "@/lib/constants";

import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-display",
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
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
