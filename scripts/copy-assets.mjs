// Copies static assets shipped inside node_modules into /public so the
// browser can load them without bundler interop issues (e.g. the pdf.js worker).
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const assets = [
  {
    src: "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
    dest: "public/pdf.worker.min.mjs",
  },
];

for (const asset of assets) {
  const srcPath = join(root, asset.src);
  const destPath = join(root, asset.dest);
  if (!existsSync(srcPath)) {
    console.warn(`[copy-assets] missing: ${asset.src}`);
    continue;
  }
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
  console.log(`[copy-assets] ${asset.src} -> ${asset.dest}`);
}
