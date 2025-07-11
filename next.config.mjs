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

export default nextConfig;
