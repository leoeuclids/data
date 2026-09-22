---
url: /api/@warp-drive/core/types/schema/fields/functions/isLegacyResourceSchema.md
---

# &#x20;isLegacyResourceSchema()

```ts
function isLegacyResourceSchema(schema: 
  | ResourceSchema
  | ObjectSchema): schema is LegacyResourceSchema;
```

Defined in: [warp-drive-packages/core/src/types/schema/fields.ts:2542](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/core/src/types/schema/fields.ts#L2542)

A type utility to narrow a schema to LegacyResourceSchema

## Parameters

### schema

| [`ResourceSchema`](../types/ResourceSchema.md)
| [`ObjectSchema`](../types/ObjectSchema.md)

## Returns

`schema is LegacyResourceSchema`
