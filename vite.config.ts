import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages: set VITE_BASE=/YourRepoName/ when building (see README).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
});
