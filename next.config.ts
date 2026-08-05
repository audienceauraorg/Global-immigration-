import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable built-in compression when running behind a custom server.
  // Next.js's compiled compression middleware loses `this` context in its
  // patched res.end(), causing "TypeError: this.getHeader is not a function".
  // A reverse proxy (nginx/caddy) should handle compression in production.
  compress: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
};

export default nextConfig;
