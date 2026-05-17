import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: 'https://mooseeka.com',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
