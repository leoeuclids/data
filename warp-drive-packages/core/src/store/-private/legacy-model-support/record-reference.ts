import { assert } from '@warp-drive/core/build-config/macros';

import type { StableRecordIdentifier } from '../../../types/identifier.ts';
import type { SingleResourceDocument } from '../../../types/spec/json-api-raw.ts';
import type { OpaqueRecordInstance } from '../../-types/q/record-instance.ts';
import type { NotificationType } from '../managers/notification-manager.ts';
import { defineSignal } from '../new-core-tmp/reactivity/signal.ts';
import type { Store } from '../store-service.ts';

/**
   A `RecordReference` is a low-level API that allows users and
   addon authors to perform meta-operations on a record.

   @class RecordReference
   @public
*/
export default class RecordReference {
  declare store: Store;
  // unsubscribe token given to us by the notification manager
  ___token!: object;
  ___identifier: StableRecordIdentifier;

  declare _ref: number;

  constructor(store: Store, identifier: StableRecordIdentifier) {
    this.store = store;
    this.___identifier = identifier;
    this.___token = store.notifications.subscribe(
      identifier,
      (_: StableRecordIdentifier, bucket: NotificationType, notifiedKey?: string) => {
        if (bucket === 'identity' || (bucket === 'attributes' && notifiedKey === 'id')) {
          this._ref++;
        }
      }
    );
  }

  destroy() {
    this.store.notifications.unsubscribe(this.___token);
  }

  get type(): string {
    return this.identifier().type;
  }

  /**
     The `id` of the record that this reference refers to.

     Together, the `type` and `id` properties form a composite key for
     the identity map.

     Example

     ```javascript
     let userRef = store.getReference('user', 1);

     userRef.id(); // '1'
     ```

    @public
     @return {String} The id of the record.
  */
  id() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this._ref; // consume the tracked prop
    return this.___identifier.id;
  }

  /**
     The `identifier` of the record that this reference refers to.

     Together, the `type` and `id` properties form a composite key for
     the identity map.

     Example

     ```javascript
     let userRef = store.getReference('user', 1);

     userRef.identifier(); // '1'
     ```

    @public
     @return {String} The identifier of the record.
  */
  identifier(): StableRecordIdentifier {
    return this.___identifier;
  }

  /**
     How the reference will be looked up when it is loaded. Currently
     this always returns `identity` to signify that a record will be
     loaded by its `type` and `id`.

     Example

     ```javascript
     const userRef = store.getReference('user', 1);

     userRef.remoteType(); // 'identity'
     ```

     @public
     @return {String} 'identity'
  */
  remoteType(): 'identity' {
    return 'identity';
  }

  /**
    This API allows you to provide a reference with new data. The
    simplest usage of this API is similar to `store.push`: you provide a
    normalized hash of data and the object represented by the reference
    will update.

    If you pass a promise to `push`, Ember Data will not ask the adapter
    for the data if another attempt to fetch it is made in the
    interim. When the promise resolves, the underlying object is updated
    with the new data, and the promise returned by *this function* is resolved
    with that object.

    For example, `recordReference.push(promise)` will be resolved with a
    record.

     Example

     ```javascript
     let userRef = store.getReference('user', 1);

     // provide data for reference
     userRef.push({
       data: {
         id: "1",
         type: "user",
         attributes: {
           username: "@user"
         }
       }
     }).then(function(user) {
       userRef.value() === user;
     });
     ```

    @public
    @param objectOrPromise a JSON:API ResourceDocument or a promise resolving to one
    @return a promise for the value (record or relationship)
  */
  push(objectOrPromise: SingleResourceDocument | Promise<SingleResourceDocument>): Promise<OpaqueRecordInstance> {
    // TODO @deprecate pushing unresolved payloads
    return Promise.resolve(objectOrPromise).then((data) => {
      return this.store.push(data);
    });
  }

  /**
    If the entity referred to by the reference is already loaded, it is
    present as `reference.value`. Otherwise the value returned by this function
    is `null`.

     Example

     ```javascript
     let userRef = store.getReference('user', 1);

     userRef.value(); // user
     ```

    @public
     @return {Model} the record for this RecordReference
  */
  value(): OpaqueRecordInstance | null {
    return this.store.peekRecord(this.___identifier);
  }

  /**
     Triggers a fetch for the backing entity based on its `remoteType`
     (see `remoteType` definitions per reference type).

     Example

     ```javascript
     let userRef = store.getReference('user', 1);

     // load user (via store.find)
     userRef.load().then(...)
     ```

    @public
     @return {Promise<record>} the record for this RecordReference
  */
  load() {
    const id = this.id();
    if (id !== null) {
      return this.store.findRecord(this.type, id);
    }
    assert(`Unable to fetch record of type ${this.type} without an id`);
  }

  /**
     Reloads the record if it is already loaded. If the record is not
     loaded it will load the record via `store.findRecord`

     Example

     ```javascript
     let userRef = store.getReference('user', 1);

     // or trigger a reload
     userRef.reload().then(...)
     ```

    @public
     @return {Promise<record>} the record for this RecordReference
  */
  reload() {
    const id = this.id();
    if (id !== null) {
      return this.store.findRecord(this.type, id, { reload: true });
    }
    assert(`Unable to fetch record of type ${this.type} without an id`);
  }
}

defineSignal(RecordReference.prototype, '_ref');
