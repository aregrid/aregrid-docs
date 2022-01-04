// // Dotenv 是一个零依赖的模块，它能将环境变量中的变量从 .env 文件加载到 process.env 中
const dotenv = require("dotenv");
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import fs from "fs";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
let envFiles = [];
if (process.env.NODE_ENV) {
    envFiles = [
        /** default file */ `.env`,
        /** mode file */ `.env.${process.env.NODE_ENV}`,
    ];
    for (const file of envFiles) {
        const envConfig = dotenv.parse(fs.readFileSync(file));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
}

export default defineConfig({
    base: process.env.VITE_BASE_URL,
    assetsDir: process.env.VITE_ASSETS_DIR,
    build: process.env.VITE_OUTPUT_DIR
        ? {
              outDir: process.env.VITE_OUTPUT_DIR,
          }
        : null,
    plugins: [
        vue(),
        vueI18n({
            include: resolve(__dirname, "./src/locales/**"),
            compositionOnly: true,
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    server: {
        open: true,
        port: 8081,
    },
});
