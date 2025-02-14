/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    
    remotePatterns: [
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
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/:path*`,
      },
    ]
  }
};

export default nextConfig;
