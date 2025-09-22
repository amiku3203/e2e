 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 👈 disable strict mode

  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
};

module.exports = nextConfig;
