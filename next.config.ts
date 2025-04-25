import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Tell SWC/Webpack not to bundle the native add-on
    if (isServer) {
      config.externals.push(
        { 'onnxruntime-node': 'commonjs onnxruntime-node' },
        { sharp: 'commonjs sharp' }
      );
    }

    // Keep .node files as raw assets so the parser never runs on them
    config.module.rules.push({
      test: /\.node$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
