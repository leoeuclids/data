---
url: >-
  https://canary.warp-drive.io/api/@warp-drive/core/types/spec/json-api-raw/types/InnerRelationshipDocument.md
---

# &#x20;InnerRelationshipDocument\<T = `ExistingResourceIdentifierObject` | `NewResourceIdentifierObject`>

```ts
type InnerRelationshipDocument<T = ExistingResourceIdentifierObject | NewResourceIdentifierObject> = 
  | SingleResourceRelationship<T>
| CollectionResourceRelationship<T>;
```

Defined in: [warp-drive-packages/core/src/types/spec/json-api-raw.ts:253](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/core/src/types/spec/json-api-raw.ts#L253)

Represents a single {json:api} relationship, whether `to-one` or `to-many`.

See also:

* [SingleResourceRelationship](SingleResourceRelationship.md)
* [CollectionResourceRelationship](CollectionResourceRelationship.md)

## Type Parameters

### T

`T` = `ExistingResourceIdentifierObject` | `NewResourceIdentifierObject`
