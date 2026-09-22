---
url: /api/@warp-drive/legacy/model-fragments/variables/FragmentArrayExtension.md
---

&#x20;

# &#x20;FragmentArrayExtension

```ts
const FragmentArrayExtension: {
  features: typeof FragmentArray;
  kind: "array";
  name: "fragment-array";
};
```

Defined in: [warp-drive-packages/legacy/src/model-fragments/extensions/fragment-array.ts:95](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/legacy/src/model-fragments/extensions/fragment-array.ts#L95)

A schema extension that adds the [FragmentArray](../classes/FragmentArray.md) API to migrated
`ModelFragments` array resources.

## Type Declaration

### features

```ts
features: typeof FragmentArray;
```

The features ([FragmentArray](../classes/FragmentArray.md)) added by this extension.

### kind

```ts
kind: "array";
```

This extension applies to `'array'` schemas.

### name

```ts
name: "fragment-array";
```

The registered name of this extension.
