// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true,
//   },
//   esbuild: {
//     loader: "jsx",
//     include: /src\/.*\.[jt]sx?$/,
//     exclude: [],
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       loader: {
//         ".js": "jsx",
//       },
//     },
//   },
//   // define:{
//   //   "process.env.BASE_URL": `"${process.env.BASE_URL}"`
//   // }
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "mui-core": ["@mui/material", "@mui/system", "@mui/styles"],
          "mui-icons": ["@mui/icons-material"],
          "form-libs": ["react-hook-form", "notistack"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          "date-utils": ["dayjs"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
      "react-hook-form",
      "@reduxjs/toolkit",
      "react-redux",
      "dayjs",
    ],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
