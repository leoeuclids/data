---
url: /api/@warp-drive/core/signals/-leaked/functions/waitFor.md
---

# &#x20;waitFor()

```ts
function waitFor<K>(promise: Promise<K>): Promise<K>;
```

Defined in: [warp-drive-packages/core/src/signals/reactivity/configure.ts:228](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/core/src/signals/reactivity/configure.ts#L228)

Wraps `promise` using the configured [SignalHooks.waitFor](../../../configure/types/SignalHooks.md#waitfor), if any,
for things like test-waiters. Returns `promise` unchanged if no
`waitFor` hook is configured.

## Type Parameters

### K

`K`

## Parameters

### promise

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`K`>

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`K`>
