---
url: /api/@warp-drive/legacy/compat/utils/functions/expectId.md
---

&#x20;

# &#x20;expectId()

```ts
function expectId(id: string | number): string;
function expectId(id: null): never;
```

## Call Signature

```ts
function expectId(id: string | number): string;
```

Defined in: [warp-drive-packages/legacy/src/compat/utils.ts:172](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/legacy/src/compat/utils.ts#L172)

Like [formattedId](formattedId.md), but asserts that `id` is not `null` rather
than allowing and passing through `null`.

### Parameters

#### id

`string` | `number`

### Returns

`string`

## Call Signature

```ts
function expectId(id: null): never;
```

Defined in: [warp-drive-packages/legacy/src/compat/utils.ts:178](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/legacy/src/compat/utils.ts#L178)

Throws, since `id` is `null`.

### Parameters

#### id

`null`

### Returns

`never`
