/** @type {import('next').NextConfig} */

let DEBUG = true;

const nextConfig = {
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            destination: DEBUG ? "http://localhost:8000/:path*" : "https://se-im-backend-overflowlab.app.secoder.net/:path*",
        }];
    }
};

module.exports = nextConfig;
