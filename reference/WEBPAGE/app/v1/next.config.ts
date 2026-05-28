import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/getclawix.com/v1" : "/v1",
  assetPrefix: isProd ? "/getclawix.com/v1" : "/v1",
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
