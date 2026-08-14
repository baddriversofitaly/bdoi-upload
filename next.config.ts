import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/invia-le-tue-clip.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/info--regole.html",
        destination: "/info",
        permanent: true,
      },
      {
        source: "/contattaci.html",
        destination: "/contatti",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
