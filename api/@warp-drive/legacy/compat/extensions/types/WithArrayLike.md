---
url: >-
  https://canary.warp-drive.io/api/@warp-drive/legacy/compat/extensions/types/WithArrayLike.md
---

&#x20;

# &#x20;WithArrayLike\<T>

```ts
type WithArrayLike<T> = T extends infer U[] ? U & Omit<typeof EmberArrayLikeFeatures, "firstObject" | "lastObject"> & {
  firstObject: T | undefined;
  lastObject: T | undefined;
} : T[] & Omit<typeof EmberArrayLikeFeatures, "firstObject" | "lastObject"> & {
  firstObject: T | undefined;
  lastObject: T | undefined;
};
```

Defined in: [warp-drive-packages/legacy/src/compat/extensions.ts:387](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/legacy/src/compat/extensions.ts#L387)

Adds Ember's classic array-like API (as registered by [EmberArrayLikeExtension](../variables/EmberArrayLikeExtension.md))
to the type of a reactive array resource.

## Type Parameters

### T

`T`
