import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixe la racine du workspace (plusieurs lockfiles possibles sur la machine).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
