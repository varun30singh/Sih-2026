/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",

    NEXT_PUBLIC_CHATBOT_API_URL:
      process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
      "http://localhost:4000/api/chatbot",
  },

  async rewrites() {
    return [
      {
        source: "/api/chatbot/:path*",
        destination: "http://localhost:4000/api/chatbot/:path*",
      },
    ];
  },
};

export default nextConfig;