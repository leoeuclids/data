---
url: >-
  https://canary.warp-drive.io/api/@warp-drive/build-config/deprecations/variables/DEPRECATE_NON_UNIQUE_PAYLOADS.md
---

# &#x20;DEPRECATE\_NON\_UNIQUE\_PAYLOADS&#x20;

```ts
const DEPRECATE_NON_UNIQUE_PAYLOADS: boolean = true;
```

Defined in: [deprecations.ts:245](https://github.com/leoeuclids/data/blob/0fd5d1bd1f071adcf6d45a917c87f4348a980a32/warp-drive-packages/build-config/src/deprecations.ts#L245)

Deprecates when the data for a hasMany relationship contains
duplicate identifiers.

Previously, relationships would silently de-dupe the data
when received, but this behavior is being removed in favor
of erroring if the same related record is included multiple
times.

For instance, in JSON:API the below relationship data would
be considered invalid:

```json
{
 "data": {
  "type": "article",
   "id": "1",
   "relationships": {
     "comments": {
       "data": [
         { "type": "comment", "id": "1" },
         { "type": "comment", "id": "2" },
         { "type": "comment", "id": "1" } // duplicate
       ]
    }
 }
}
```

To resolve this deprecation, either update your server to
not include duplicate data, or implement normalization logic
in either a request handler or serializer which removes
duplicate data from relationship payloads.

## Until

6.0
