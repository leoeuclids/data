import { createConfig } from '@warp-drive/internal-config/vite/config.js';

export const externals = ['@ember/object', '@ember/debug'];

export const entryPoints = [
  // build-config
  // './src/build-config/index.ts',
  // './src/build-config/babel-macros.ts',
  // './src/build-config/env.ts',
  // './src/build-config/macros.ts',
  // './src/build-config/debugging.ts',
  // './src/build-config/deprecations.ts',
  // './src/build-config/canary-features.ts',

  // request
  './src/index.ts',
  './src/request.ts',

  // core-types
  './src/types/cache/**.ts',
  './src/types/json/**.ts',
  './src/types/schema/**.ts',
  './src/types/spec/**.ts',
  './src/types/cache.ts',
  './src/types/graph.ts',
  './src/types/identifier.ts',
  './src/types.ts',
  './src/types/params.ts',
  './src/types/record.ts',
  './src/types/request.ts',
  './src/types/symbols.ts',
  './src/types/utils.ts',
  // non-public
  './src/types/-private.ts',
  './src/types/runtime.ts',
  './src/utils/string.ts',

  // store
  './src/store.ts',
  './src/store/-private.ts',
  './src/configure.ts',

  // graph
  './src/graph/-private.ts',

  // schema-record
  './src/reactive.ts',
  './src/reactive/-private.ts',

  // build-config
  './src/build-config.ts',
  './src/build-config/babel-macros.ts',
  './src/build-config/env.ts',
  './src/build-config/macros.ts',
  './src/build-config/debugging.ts',
  './src/build-config/deprecations.ts',
  './src/build-config/canary-features.ts',
];

export default createConfig(
  {
    entryPoints,
    externals,
  },
  import.meta.resolve
);
