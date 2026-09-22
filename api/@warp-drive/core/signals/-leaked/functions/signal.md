---
url: /api/@warp-drive/core/signals/-leaked/functions/signal.md
---

# &#x20;signal()

```ts
function signal<T extends object, K extends string>(
   target: T, 
   key: K, 
   descriptor?: DecoratorPropertyDescriptor
): void;
```

Defined in: [warp-drive-packages/core/src/signals/reactivity/signal.ts:107](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/core/src/signals/reactivity/signal.ts#L107)

Decorator version of creating a signal.

## Type Parameters

### T

`T` *extends* `object`

### K

`K` *extends* `string`

## Parameters

### target

`T`

### key

`K`

### descriptor?

`DecoratorPropertyDescriptor`

## Returns

`void`
