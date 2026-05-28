import type { BlogPost } from "@/types/blog";
import { siteConfig } from "./metadata";

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Clawix",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, Docker",
    description: siteConfig.description,
    url: siteConfig.url,
    author: {
      "@type": "Organization",
      name: "ClawixAI",
      url: "https://github.com/ClawixAI",
    },
    license: "https://opensource.org/licenses/MIT",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function generateBlogPostingSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    author: {
      "@type": "Person",
      name: post.frontmatter.author.name,
    },
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "Clawix",
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
    image: post.frontmatter.image
      ? `${siteConfig.url}${post.frontmatter.image}`
      : undefined,
  };
}
