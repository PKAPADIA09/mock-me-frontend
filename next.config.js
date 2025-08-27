/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    experimental: {
      appDir: false, // Explicitly disable App Router
    },
    typescript: {
      ignoreBuildErrors: false,
    },
  };
  
  module.exports = nextConfig;