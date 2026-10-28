// Copies the ONNX Runtime WebAssembly files into public/ort so the site serves
// them itself. Without this, Transformers.js downloads them from cdn.jsdelivr.net,
// which would be a third-party request on every first visit.
import { copyFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));

// onnxruntime-web is a dependency of @huggingface/transformers, not of the app,
// so resolve it from the transformers package.
const transformersEntry = require.resolve("@huggingface/transformers");
const fromTransformers = createRequire(transformersEntry);
const ortEntry = fromTransformers.resolve("onnxruntime-web");

let ortRoot = dirname(ortEntry);
while (!existsSync(join(ortRoot, "package.json"))) ortRoot = dirname(ortRoot);
const ortDist = join(ortRoot, "dist");

// asyncify: default build (WebGPU + WASM). Plain: Safari < 26 without WebGPU.
const wanted = /^ort-wasm-simd-threaded(\.asyncify)?\.(mjs|wasm)$/;
const target = join(root, "public", "ort");
mkdirSync(target, { recursive: true });

const files = readdirSync(ortDist).filter((name) => wanted.test(name));
for (const name of files) copyFileSync(join(ortDist, name), join(target, name));

console.log(`copy-ort-wasm: ${files.length} files -> public/ort`);
