import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: false, // build:css runs first and writes dist/styles.css; don't let the JS build wipe it
  sourcemap: true,
});
