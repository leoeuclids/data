---
url: >-
  https://canary.warp-drive.io/api/@warp-drive/core/types/symbols/variables/Type.md
---

# &#x20;Type

```ts
const Type: "___(unique) Symbol($type)";
```

Defined in: [warp-drive-packages/core/src/types/symbols.ts:51](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/core/src/types/symbols.ts#L51)

Symbol for the name of a resource, transformation
or derivation.

### With Resources

This is an optional feature that can be used by
record implementations to provide a typescript
hint for the type of the resource.

When used, WarpDrive APIs can
take advantage of this to provide better type
safety and intellisense.

### With Derivations

Required for derivations registered with
`store.registerDerivation(derivation)`.

```ts
function concat(record: object, options: ObjectValue | null, prop: string): string {}
concat[Name] = 'concat';
```

### With Transforms

Required for new-style transformations registered
with `store.registerTransform(transform)`.

For legacy transforms, if not used,
`attr<Transform>('name')` will allow any string name.
`attr('name')` will always allow any string name.

If used, `attr<Transform>('name')` will enforce
that the name is the same as the transform name.
