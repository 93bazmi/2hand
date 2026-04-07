// next.config.js
const nextTranslate = require("next-translate-plugin");

/** @type {import('next').NextConfig} */
module.exports = nextTranslate({
  reactStrictMode: true,

  // ✅ แก้ Turbopack error
  turbopack: {},

  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
});
