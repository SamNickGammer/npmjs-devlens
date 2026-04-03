import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: ".next-devlens",
  outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  transpilePackages: ["devlens"],
};

export default nextConfig;
