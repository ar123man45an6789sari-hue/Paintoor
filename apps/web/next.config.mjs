/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Security best-practice: don't advertise the framework version. */
  poweredByHeader: false,
  transpilePackages: ["@paintoor/brand", "@paintoor/mock-api"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          /* frame-ancestors keeps the sandbox preview iframe working while
             blocking stranger origins; nosniff + referrer + permissions are
             straight from the security-audit checklist. */
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://*.e2b.app" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;