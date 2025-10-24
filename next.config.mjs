import { env } from "./src/env/server.mjs";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

import removeImports from "next-remove-imports";

export default defineNextConfig({
  async redirects() {
    return [
      {
        source: "/i/u/static/*",
        destination: "https://us-assets.i.posthog.com/static/:splat",
        permanent: true,
      },
      {
        source: "/i/u/*",
        destination: "https://us.i.posthog.com/:splat",
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(removeImports());
    }
    return config;
  },
});
