---
url: /api/@warp-drive/core/types/runtime/functions/getRuntimeConfig.md
---

# &#x20;getRuntimeConfig()

```ts
function getRuntimeConfig(): {
  debug: Partial<LOG_CONFIG>;
  mirage?: boolean;
};
```

Defined in: [warp-drive-packages/core/src/types/runtime.ts:52](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/core/src/types/runtime.ts#L52)

Returns the current WarpDrive runtime configuration.

## Returns

### debug

```ts
debug: Partial<LOG_CONFIG>;
```

the currently active logging configuration, see
[the debugging flags](../../../build-config/debugging/index.md)

### mirage?

```ts
optional mirage?: boolean;
```

whether requests should be treated as being served by Mirage,
see [setIsMaybeMirage](setIsMaybeMirage.md)

## Example

```ts
const { debug, mirage } = getRuntimeConfig();
```
