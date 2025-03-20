import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/translate/i18n/request.ts");

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery"
      }
    ]
  }
};

export default withNextIntl(nextConfig);
