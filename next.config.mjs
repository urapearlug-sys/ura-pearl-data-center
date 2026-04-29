/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    eslint: { ignoreDuringBuilds: true },
    images: {
        unoptimized: true,
    },
    // Reduce serverless bundle size so "Deploying outputs" doesn't hit internal error / size limits
    experimental: {
        outputFileTracingExcludes: {
            '/api/**': [
                'node_modules/@swc/core-linux-x64-gnu',
                'node_modules/@swc/core-linux-x64-musl',
                'node_modules/eslint',
                'node_modules/@eslint',
                'node_modules/typescript',
                'prisma/migrations',
                'prisma/*.ts',
            ],
        },
    },
    generateBuildId: async () => {
        const commit = process.env.VERCEL_GIT_COMMIT_SHA;
        if (commit) return `v1-${commit.slice(0, 7)}`;
        return `v1-${Date.now()}`;
    },
    async headers() {
        const noCache = { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' };
        const isProd = process.env.NODE_ENV === 'production';
        const headers = [
            { source: '/images/:path*', headers: [noCache] },
            { source: '/:path*', headers: [noCache] },
        ];
        // Only no-cache _next/static in production; in dev this can cause ChunkLoadError (timeout) when loading app/layout
        if (isProd) {
            headers.splice(1, 0,
                { source: '/_next/static/media/:path*', headers: [noCache] },
                { source: '/_next/static/chunks/:path*', headers: [noCache] },
                { source: '/_next/static/:path*', headers: [noCache] }
            );
        }
        return headers;
    },
};

export default nextConfig;
