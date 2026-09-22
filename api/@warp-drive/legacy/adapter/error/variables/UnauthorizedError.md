---
url: /api/@warp-drive/legacy/adapter/error/variables/UnauthorizedError.md
---

&#x20;

# &#x20;UnauthorizedError

```ts
UnauthorizedError: AdapterRequestErrorConstructor<UnauthorizedError>;
```

Defined in: [warp-drive-packages/legacy/src/adapter/error.ts:346](https://github.com/leoeuclids/data/blob/7d81741dd2bfc81e2f4a70f616c093d01d9d4266/warp-drive-packages/legacy/src/adapter/error.ts#L346)

A `UnauthorizedError` equates to an HTTP `401 Unauthorized` response
status. It is used by an adapter to signal that a request to the external
API was rejected because authorization is required and has failed or has
not yet been provided.

An example use case would be to redirect the user to a login route if a
request is unauthorized:

```js [app/routes/application.js]
import { UnauthorizedError } from '@warp-drive/legacy/adapter/error';

export default class ApplicationRoute extends Route {
  @action
  error(error, transition) {
    if (error instanceof UnauthorizedError) {
      // go to the login route
      this.transitionTo('login');
      return;
    }

    // ...other error handling logic
  }
}
```
