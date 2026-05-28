import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
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
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
