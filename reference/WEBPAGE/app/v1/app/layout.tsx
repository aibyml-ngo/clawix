import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Clawix | Self-Hosted AI Agent Orchestration",
    template: "%s | Clawix",
  },
  description:
    "Self-hosted multi-agent AI orchestration platform. Run AI agent swarms in isolated containers. Full governance. Zero vendor lock-in.",
  metadataBase: new URL("https://getclawix.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getclawix.com",
    siteName: "Clawix",
    title: "Clawix | Self-Hosted AI Agent Orchestration",
    description:
      "Self-hosted multi-agent AI orchestration platform. Run AI agent swarms in isolated containers. Full governance. Zero vendor lock-in.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clawix | Self-Hosted AI Agent Orchestration",
    description:
      "Self-hosted multi-agent AI orchestration platform. Run AI agent swarms in isolated containers. Full governance. Zero vendor lock-in.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID &&
          process.env.NEXT_PUBLIC_UMAMI_URL && (
            <Script
              src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              strategy="afterInteractive"
            />
          )}
      </body>
    </html>
  );
}
