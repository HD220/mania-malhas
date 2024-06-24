/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["lucide-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.alternativedown.com.br",
      },
    ],
  },
};

export default nextConfig;
