---
url: >-
  https://canary.warp-drive.io/api/@warp-drive/core/types/cache/types/ChangedAttributesHash.md
---

# &#x20;ChangedAttributesHash

```ts
type ChangedAttributesHash = Record<string, [Value | undefined, Value]>;
```

Defined in: [warp-drive-packages/core/src/types/cache.ts:19](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/core/src/types/cache.ts#L19)

A hash of changed attributes with the key being the attribute name and the value being an
array of `[oldValue, newValue]`.
