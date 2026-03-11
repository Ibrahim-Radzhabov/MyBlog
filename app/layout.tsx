import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";

import { ActionToast } from "@/components/shared/action-toast";
import { AppToaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/constants";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

function getMetadataBase() {
  try {
    return new URL(siteConfig.url);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        <Suspense fallback={null}>
          <ActionToast />
        </Suspense>
        <AppToaster />
      </body>
    </html>
  );
}
