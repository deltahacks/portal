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

export default defineNextConfig(
  removeImports({
    reactStrictMode: true,
    swcMinify: true,
    // Enable Turbo Pack
    experimental: {
      // turbo: {
      //   rules: {
      //     "*.svg": {
      //       loaders: ["@svgr/webpack"],
      //       as: "*.js",
      //     },
      //   },
      // },
    },
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
  })
);
