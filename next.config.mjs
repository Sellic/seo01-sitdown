// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '.': ['./prisma/dev.db'],
    },
  },
}

export default nextConfig
