---
url: /api/@warp-drive/react/install/functions/settled.md
---

# &#x20;settled()

```ts
function settled(): Promise<void>;
```

Defined in: [install.ts:50](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/react/src/install.ts#L50)

Resolves once all pending requests started via WarpDrive's React signal
integration have settled. Only tracks requests while `TESTING` is enabled;
a no-op otherwise.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`void`>
