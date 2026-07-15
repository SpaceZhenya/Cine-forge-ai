/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (config.cache && !isServer) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
