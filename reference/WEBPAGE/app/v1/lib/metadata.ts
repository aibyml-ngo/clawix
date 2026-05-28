import type { Metadata } from "next";

const siteConfig = {
  name: "Clawix",
  url: "https://getclawix.com",
  description:
    "Self-hosted multi-agent AI orchestration platform. Run AI agent swarms in isolated containers. Full governance. Zero vendor lock-in.",
  ogImage: "/og/default.png",
};

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
}

export function createMetadata({
  title,
  description,
  path = "",
  ogImage = siteConfig.ogImage,
}: PageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
  };
}

export { siteConfig };
