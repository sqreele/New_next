/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PRIVATE_API_URL: process.env.NEXT_PRIVATE_API_URL,
    API_URL: process.env.API_URL,
  },

  // Image configuration
  images: {
    remotePatterns: [
       {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
          },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'pmcs.site',
        pathname: '/media/**',
      }
    ],
    domains: ['pmcs.site', 'localhost', '127.0.0.1'],
  },

  // URL rewrites
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/media/:path*`,
      },
    ]
  },

  // Additional optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  output: 'standalone', // For Docker optimization
  webpackDevMiddleware: config => {
    config.stats = 'normal'; // Or 'verbose' for more detailed logs
    return config;
  },
};

export default nextConfig;
