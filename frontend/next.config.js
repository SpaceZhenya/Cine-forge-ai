/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
};

module.exports = nextConfig;
