declare module "libheif-js/libheif-wasm/libheif-bundle.mjs" {
  const factory: (options?: Record<string, unknown>) => Promise<unknown> | unknown;
  export default factory;
}
