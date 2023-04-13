/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            destination: "https://se-im-backend-test-overflowlab.app.secoder.net/:path*",
        }];
    }
};

module.exports = nextConfig;
