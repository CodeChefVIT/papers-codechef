/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  swcMinify: false,

  images: {
    domains: ["res.cloudinary.com"],
  },
  webpack: (config, options) => {
    config.resolve.alias.canvas = false;
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    return config;
  },
  async rewrites() {
    return [

      {
        source: "/1/:path*",   
        destination:
          `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_1}/image/upload/w_400,h_400,c_fill/:path*`, 
      },
      {
        source: "/2/:path*",   
        destination:
          `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_2}/image/upload/w_400,h_400,c_fill/:path*`, 
      },
      
    ];
  },

};

export default config;
