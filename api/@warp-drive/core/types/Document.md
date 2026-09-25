---
url: https://canary.warp-drive.io/api/@warp-drive/core/types/Document.md
---

# &#x20;~~Document\<T, M *extends* [`Meta`](spec/json-api-raw/types/Meta.md) | `undefined` = [`Meta`](spec/json-api-raw/types/Meta.md) | `undefined`, E *extends* `object` = `object`, EM *extends* [`Meta`](spec/json-api-raw/types/Meta.md) | `undefined` = `M`>~~&#x20;

```ts
type Document<T, M extends Meta | undefined = Meta | undefined, E extends object = object, EM extends Meta | undefined = M> = ReactiveDocument<T, M, E, EM>;
```

Defined in: [warp-drive-packages/core/src/index.ts:50](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/core/src/index.ts#L50)

## Type Parameters

### T

`T`

### M

`M` *extends* [`Meta`](spec/json-api-raw/types/Meta.md) | `undefined` = [`Meta`](spec/json-api-raw/types/Meta.md) | `undefined`

### E

`E` *extends* `object` = `object`

### EM

`EM` *extends* [`Meta`](spec/json-api-raw/types/Meta.md) | `undefined` = `M`

## Deprecated

use [ReactiveDocument](../reactive/types/ReactiveDocument.md) instead
