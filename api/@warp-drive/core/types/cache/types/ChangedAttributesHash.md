---
url: /api/@warp-drive/core/types/cache/types/ChangedAttributesHash.md
---

# &#x20;ChangedAttributesHash

```ts
type ChangedAttributesHash = Record<string, [Value | undefined, Value]>;
```

Defined in: [warp-drive-packages/core/src/types/cache.ts:18](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/core/src/types/cache.ts#L18)

A hash of changed attributes with the key being the attribute name and the value being an
array of `[oldValue, newValue]`.
