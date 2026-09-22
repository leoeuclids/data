---
url: /api/@warp-drive/schema-dsl/types/FieldOptions.md
---

# &#x20;FieldOptions

```ts
interface FieldOptions {
  sourceKey?: string;
  type?: string;
}
```

Defined in: [fields/field.ts:11](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/schema-dsl/src/fields/field.ts#L11)

Options accepted by the [field](../functions/field.md) decorator.

## Properties

### sourceKey?

```ts
optional sourceKey?: string;
```

Defined in: [fields/field.ts:25](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/schema-dsl/src/fields/field.ts#L25)

The name of the field as returned by the API, if it differs from the
decorated property's name. Compiles onto the field's `sourceKey`.

***

### type?

```ts
optional type?: string;
```

Defined in: [fields/field.ts:17](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/schema-dsl/src/fields/field.ts#L17)

The name of a [Transformation](../../core/types/schema/concepts/types/Transformation.md) to compile onto the field's `type`.
