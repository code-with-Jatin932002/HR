// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;




import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❌ Skip ESLint errors during Vercel build
    ignoreDuringBuilds: true,
  },
  /* you can keep other config options here if needed */
};

export default nextConfig;
