---
url: >-
  https://canary.warp-drive.io/api/@warp-drive/core/types/utils/types/WithPartial.md
---

# &#x20;WithPartial\<T, K *extends* keyof `T`>

```ts
type WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

Defined in: [warp-drive-packages/core/src/types/utils.ts:10](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/core/src/types/utils.ts#L10)

Makes the properties named in `K` optional on `T`, leaving the rest as-is.

## Type Parameters

### T

`T`

### K

`K` *extends* keyof `T`

## Example

```ts
interface User { id: string; name: string; }
type PartialName = WithPartial<User, 'name'>; // { id: string; name?: string }
```
