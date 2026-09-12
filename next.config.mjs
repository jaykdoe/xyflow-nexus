/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ["@clarkmcc/ngraph"],
}

export default nextConfig
