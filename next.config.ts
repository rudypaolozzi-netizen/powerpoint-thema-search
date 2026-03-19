import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",   // Export statique pour Vercel / GitHub Pages
  trailingSlash: true,
  images: {
    unoptimized: true, // Nécessaire pour export statique
  },
};

export default nextConfig;
