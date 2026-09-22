---
url: /api/@warp-drive/core/signals/-leaked/functions/clearPaginationCache.md
---

# &#x20;clearPaginationCache()&#x20;

```ts
function clearPaginationCache(): void;
```

Defined in: [warp-drive-packages/core/src/signals/pagination-cache.ts:265](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/core/src/signals/pagination-cache.ts#L265)

Clears the module-level pagination cache used by [getPaginationCache](getPaginationCache.md).
Primarily intended for test isolation, since the cache is keyed by url and
otherwise persists for the lifetime of the module.

## Returns

`void`
