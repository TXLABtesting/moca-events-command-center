/** @type {import('next').NextConfig} */
// demo branch: static export for GitHub Pages.
// The demo is fully client-side (no server/DB/auth), so it exports to plain
// static HTML/JS and is served from Pages at /<repo>/.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
