
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
  // Port 9002 is used to avoid conflicts with other services that might run on default ports like 3000.
  // Removed TypeScript and ESLint ignore flags to ensure errors are caught during build.
  // Ensure any TypeScript or ESLint errors are fixed before building for production.
  // typescript: {
  //   ignoreBuildErrors: true, // Removed
  // },
  // eslint: {
  //   ignoreDuringBuilds: true, // Removed
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh', // Add this for user avatars
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
