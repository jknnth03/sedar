import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  // define:{
  //   "process.env.BASE_URL": `"${process.env.BASE_URL}"`
  // }
});
