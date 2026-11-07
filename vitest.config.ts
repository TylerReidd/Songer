import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/support/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts", "src/**/*.test.ts"],
    env: { DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://songbook:songbook@localhost:5433/songbook" },
    // Integration tests share one database; run files serially to avoid interference.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
