import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite cualquier hostname
      },
      {
        protocol: 'http',
        hostname: '**', // Permite cualquier hostname
      }
    ],
    unoptimized: false, // Mantener optimización de imágenes
  },
};

export default nextConfig;
