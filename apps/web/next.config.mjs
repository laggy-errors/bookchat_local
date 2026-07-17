/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/google',
        destination: 'http://localhost:3001/api/auth/google',
      },
      {
        source: '/auth/google/callback',
        destination: 'http://localhost:3001/api/auth/google/callback',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3001/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
