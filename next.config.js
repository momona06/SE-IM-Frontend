/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            destination: "https://backend-msr-overflowlab.app.secoder.net/:path*",
        }];
    }
};

module.exports = nextConfig;
