import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        outDir: "../dist",
    },

    server: {
        port: 3000,
        watch: {
            usePolling: true,
            interval: 250,
        },
    },
});
