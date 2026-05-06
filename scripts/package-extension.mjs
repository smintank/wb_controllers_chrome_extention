import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(rootDir, "dist", "chrome-extension");

const runtimePaths = [
  "_locales",
  "assets",
  "src",
  "background.js",
  "icon.png",
  "manifest.json",
  "popup.html",
  "popup.js",
  "styles.css"
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const relativePath of runtimePaths) {
  await cp(path.join(rootDir, relativePath), path.join(distDir, relativePath), {
    recursive: true
  });
}

console.log(`Packaged runtime extension files into ${distDir}`);
