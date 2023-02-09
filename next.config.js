/** @type {import('path')} path */
// const path = require(`path`)

/** @type {import('next').NextConfig} nextConfig */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    loader: `akamai`,
    path: `./`,
  },
  sassOptions: {
    includePaths: [`./styles`],
  },

  pageExtensions: [`tsx`],
  trailingSlash: false,
  cleanDistDir: true,
  // distDir: `dist`,
}

module.exports = nextConfig
