/**
 * ## Overview
 *
 * <blockquote style="margin: 1em; padding: .1em 1em .1em 1em; border-left: solid 1em #E34C32; background: #e0e0e0;">
 * <p>
 *   ⚠️ <strong>This is LEGACY documentation</strong> for a feature that is no longer encouraged to be used.
 *   If starting a new app or thinking of implementing a new adapter, consider writing a
 *   <a href="/ember-data/release/classes/%3CInterface%3E%20Handler">Handler</a> instead to be used with the <a href="https://github.com/emberjs/data/tree/main/packages/request#readme">RequestManager</a>
 * </p>
 * </blockquote>
 *
 * In order to properly fetch and update data, @warp-drive/legacy
 * needs to understand how to connect to your API.
 *
 * `Adapters` accept various kinds of requests from the store
 * and manage fulfillment of the request from your API.
 *
 * ### Request Flow
 *
 * When the store decides it needs to issue a request it uses the following flow to manage the request and process the data.
 *
 * - find the appropriate adapter
 * - issue the request to the adapter
 * - await the adapter's response
 *   - if an error occurs reject with the error
 *   - if no error
 *      - if there is response data
 *      - pass the response data to the appropriate serializer
 *      - update the cache using the JSON:API formatted data from the serializer's response
 *    - return the primary record(s) associated with the request
 *
 * ### Request Errors
 *
 * When a request errors and your adapter does not have the ability to recover from the error,
 * you may either reject the promise returned by your adapter method with the error or simply
 * throw the error.
 *
 * If the request was for a `createRecord` `updateRecord` or `deleteRecord` special rules
 * apply to how this error will affect the state of the store and additional properties on
 * the `Error` class may be used. See the documentation for these methods in
 * {@link MinimumAdapterInterface} for more information.
 *
 * ### Implementing an Adapter
 *
 * There are seven required adapter methods, one for each of
 * the primary request types that @warp-drive/legacy issues.
 *
 * They are:
 *
 *  - findRecord
 *  - findAll
 *  - queryRecord
 *  - query
 *  - createRecord
 *  - updateRecord
 *  - deleteRecord
 *
 * Each of these request types has a matching store method that triggers it
 * and matching `requestType` that is passed to the serializer's
 * `normalizeResponse` method.
 *
 * If your app only reads data but never writes data, it is not necessary
 * to implement the methods for create, update, and delete. This extends to
 * all of the store's find methods with the exception of `findRecord` (`findAll`,
 * `query`, `queryRecord`): if you do not use the store method in your app then
 * your Adapter does not need the method.
 *
 * ```ts
 * async function fetchData(url, options = {}) {
 *   let response = await fetch(url, options);
 *   return response.toJSON();
 * }
 *
 * export default class ApplicationAdapter {
 *   findRecord(_, { modelName }, id) {
 *     return fetchData(`./${modelName}s/${id}`);
 *   }
 *
 *   static create() {
 *     return new this();
 *   }
 * }
 * ```
 *
 * ### Adapter Resolution
 *
 * `store.adapterFor(name)` will lookup adapters defined in `app/adapters/` and
 * return an instance.
 *
 * `adapterFor` first attempts to find an adapter with an exact match on `name`,
  then falls back to checking for the presence of an adapter named `application`.

  If no adapter is found, an error will be thrown.

  ```ts
  store.adapterFor('author');

  // lookup paths (in order) =>
  //   app/adapters/author.js
  //   app/adapters/application.js
  ```

  Most requests in @warp-drive/legacy are made with respect to a particular `type` (or `modelName`)
  (e.g., "get me the full collection of **books**" or "get me the **employee** whose id is 37"). We
  refer to this as the **primary** resource `type`.

  `adapterFor` is used by the store to find an adapter with a name matching that of the primary
  resource `type` for the request, which then falls back to the `application` adapter.

  It is recommended that applications define only a single `application` adapter and serializer
  where possible, only implementing an adapter specific to the `type` when absolutely necessary.

  If you need to support multiple API versions for the same type, the per-type strategy for
  defining adapters might not be adequate.

  If you have multiple APIs or multiple API versions and the single application adapter and per-type
  strategy does not suite your needs, one strategy is to write an `application` adapter and serializer
  that make use of `options` to specify the desired format when making a request, then forwards to the
  request to the desired adapter or serializer as needed.

  ```js [app/adapters/application.js]
  export default class Adapter extends EmberObject {
    findRecord(store, schema, id, snapshot) {
      let { apiVersion } = snapshot.adapterOptions;
      return this.adapterFor(`-api-${apiVersion}`).findRecord(store, schema, id, snapshot);
    }
  }
  ```

  ### Overriding `Store.adapterFor`

  ```js
  import Store from '@ember-data/store';
  import Adapter from '@ember-data/adapter/json-api';

  class extends Store {
    #adapter = new Adapter();

    adapterFor() {
      return this.#adapter;
    }
  }
  ```


Note: If you are using Ember and would like to make use of `service` injections in your adapter, you will want to additionally `setOwner` for the Adapter.

  ```js
  import Store from '@ember-data/store';
  import Adapter from '@ember-data/adapter/json-api';
  import { getOwner, setOwner } from '@ember/owner';

  class extends Store {
    #adapter = null;

    adapterFor() {
      let adapter = this.#adapter;
      if (!adapter) {
        const owner = getOwner(this);
        adapter = new Adapter();
        setOwner(adapter, owner);
        this.#adapter = adapter;
      }

      return adapter;
    }
  }
  ```

By default when using with Ember you only need to implement this hook if you want your adapter usage to be statically analyzeable. *Ember***Data** will attempt to resolve adapters using Ember's resolver. To provide a single Adapter for your application like the above you would provide it as the default export of the file `app/adapters/application.{js/ts}`

  ### Using an Adapter

  Any adapter in `app/adapters/` can be looked up by `name` using `store.adapterFor(name)`.

  ### Default Adapters

  Applications whose API's structure endpoint URLs *very close to* or *exactly* the **REST**
  or **JSON:API** convention, the `@ember-data/adapter` package contains implementations
  these applications can extend.

  Many applications will find writing their own adapter to be allow greater flexibility,
  customization, and maintenance than attempting to override methods in these adapters.

  @module
*/

import EmberObject from '@ember/object';
import * as s from '@ember/service';

import type { Store } from '@warp-drive/core';
import { DEBUG } from '@warp-drive/core/build-config/env';
import { assert } from '@warp-drive/core/build-config/macros';
import type { ModelSchema } from '@warp-drive/core/types';

import type { AdapterPayload, MinimumAdapterInterface, SerializerOptions } from './compat.ts';
import type { Snapshot, SnapshotRecordArray } from './compat/-private.ts';

const service = s.service ?? s.inject;
/**
  An adapter is an object that receives requests from a store and
  translates them into the appropriate action to take against your
  persistence layer. The persistence layer is usually an HTTP API but
  may be anything, such as the browser's local storage. Typically the
  adapter is not invoked directly instead its functionality is accessed
  through the `store`.

  > ⚠️ CAUTION you likely want the docs for {@link MinimumAdapterInterface}
  > as extending this abstract class is unnecessary.

  ### Creating an Adapter

  Create a new subclass of `Adapter` in the `app/adapters` folder:

  ```js [app/adapters/application.js]
  import { Adapter } from '@warp-drive/legacy/adapter';

  export default class extends Adapter {
    // ...your code here
  }
  ```

  Model-specific adapters can be created by putting your adapter
  class in an `app/adapters/` + `model-name` + `.js` file of the application.

  ```js [app/adapters/post.js]
  import { Adapter } from '@warp-drive/legacy/adapter';

  export default class extends Adapter {
    // ...Post-specific adapter code goes here
  }
  ```

  `Adapter` is an abstract base class that you should override in your
  application to customize it for your backend. The minimum set of methods
  that you should implement is:

    * `findRecord()`
    * `createRecord()`
    * `updateRecord()`
    * `deleteRecord()`
    * `findAll()`
    * `query()`

  To improve the network performance of your application, you can optimize
  your adapter by overriding these lower-level methods:

    * `findMany()`


  For an example of the implementation, see `RESTAdapter`, the
  included REST adapter.

  @public
*/
export class Adapter extends EmberObject implements MinimumAdapterInterface {
  @service declare store: Store;

  declare _coalesceFindRequests: boolean;

  /**
    The `findRecord()` method is invoked when the store is asked for a record that
    has not previously been loaded. In response to `findRecord()` being called, you
    should query your persistence layer for a record with the given ID. The `findRecord`
    method should return a promise that will resolve to a JavaScript object that will be
    normalized by the serializer.

    Here is an example of the `findRecord` implementation:

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      findRecord(store, type, id, snapshot) {
        return new RSVP.Promise(function(resolve, reject) {
          $.getJSON(`/${type.modelName}/${id}`).then(function(data) {
            resolve(data);
          }, function(jqXHR) {
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @public
  */
  // @ts-expect-error
  findRecord(store: Store, type: ModelSchema, id: string, snapshot: Snapshot): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a findRecord override');
    }
  }

  /**
    The `findAll()` method is used to retrieve all records for a given type.

    Example

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      findAll(store, type) {
        return new RSVP.Promise(function(resolve, reject) {
          $.getJSON(`/${type.modelName}`).then(function(data) {
            resolve(data);
          }, function(jqXHR) {
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @param neverSet a value is never provided to this argument
    @public
  */
  findAll(
    store: Store,
    type: ModelSchema,
    neverSet: null,
    snapshotRecordArray: SnapshotRecordArray
    // @ts-expect-error
  ): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a findAll override');
    }
  }

  /**
    This method is called when you call `query` on the store.

    Example

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      query(store, type, query) {
        return new RSVP.Promise(function(resolve, reject) {
          $.getJSON(`/${type.modelName}`, query).then(function(data) {
            resolve(data);
          }, function(jqXHR) {
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @public
  */
  // @ts-expect-error
  query(store: Store, type: ModelSchema, query: Record<string, unknown>): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a query override');
    }
  }

  /**
    The `queryRecord()` method is invoked when the store is asked for a single
    record through a query object.

    In response to `queryRecord()` being called, you should always fetch fresh
    data. Once found, you can asynchronously call the store's `push()` method
    to push the record into the store.

    Here is an example `queryRecord` implementation:

    Example

    ```js [app/adapters/application.js]
    import  { Adapter, BuildURLMixin } from '@warp-drive/legacy/adapter';

    export default class ApplicationAdapter extends Adapter.extend(BuildURLMixin) {
      queryRecord(store, type, query) {
        return fetch(`/${type.modelName}`, { body: JSON.stringify(query) })
          .then((response) => response.json());
      }
    }
    ```

    @public
  */
  queryRecord(
    store: Store,
    type: ModelSchema,
    query: Record<string, unknown>,
    adapterOptions: object
    // @ts-expect-error
  ): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a queryRecord override');
    }
  }

  /**
    If the globally unique IDs for your records should be generated on the client,
    implement the `generateIdForRecord()` method. This method will be invoked
    each time you create a new record, and the value returned from it will be
    assigned to the record's `primaryKey`.

    Most traditional REST-like HTTP APIs will not use this method. Instead, the ID
    of the record will be set by the server, and your adapter will update the store
    with the new ID when it calls `didCreateRecord()`. Only implement this method if
    you intend to generate record IDs on the client-side.

    The `generateIdForRecord()` method will be invoked with the requesting store as
    the first parameter and the newly created record as the second parameter:

    ```javascript
    import { Adapter } from '@warp-drive/legacy/adapter';
    import { v4 } from 'uuid';

    export default class ApplicationAdapter extends Adapter {
      generateIdForRecord(store, type, inputProperties) {
        return v4();
      }
    }
    ```

    @param {Store} store
    @param {Model} type   the Model class of the record
    @param {Object} inputProperties a hash of properties to set on the
      newly created record.
    @return {(String|Number)} id
    @public
  */

  /**
    Proxies to the serializer's `serialize` method.

    Example

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';

    export default class ApplicationAdapter extends Adapter {
      createRecord(store, type, snapshot) {
        let data = this.serialize(snapshot, { includeId: true });
        let url = `/${type.modelName}`;

        // ...
      }
    }
    ```

    @public
  */
  serialize(snapshot: Snapshot, options: SerializerOptions): Record<string, unknown> {
    const serialized = snapshot.serialize(options);
    assert(
      `Your adapter's serialize method must return an object, but it returned ${typeof serialized}`,
      serialized && typeof serialized === 'object'
    );
    return serialized as Record<string, unknown>;
  }

  /**
    Implement this method in a subclass to handle the creation of
    new records.

    Serializes the record and sends it to the server.

    Example

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      createRecord(store, type, snapshot) {
        let data = this.serialize(snapshot, { includeId: true });

        return new RSVP.Promise(function (resolve, reject) {
          $.ajax({
            type: 'POST',
            url: `/${type.modelName}`,
            dataType: 'json',
            data: data
          }).then(function (data) {
            resolve(data);
          }, function (jqXHR) {
            jqXHR.then = null; // tame jQuery's ill mannered promises
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @public
  */
  // @ts-expect-error
  createRecord(store: Store, type: ModelSchema, snapshot: Snapshot): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a createRecord override');
    }
  }

  /**
    Implement this method in a subclass to handle the updating of
    a record.

    Serializes the record update and sends it to the server.

    The updateRecord method is expected to return a promise that will
    resolve with the serialized record. This allows the backend to
    inform the Ember Data store the current state of this record after
    the update. If it is not possible to return a serialized record
    the updateRecord promise can also resolve with `undefined` and the
    Ember Data store will assume all of the updates were successfully
    applied on the backend.

    Example

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      updateRecord(store, type, snapshot) {
        let data = this.serialize(snapshot, { includeId: true });
        let id = snapshot.id;

        return new RSVP.Promise(function(resolve, reject) {
          $.ajax({
            type: 'PUT',
            url: `/${type.modelName}/${id}`,
            dataType: 'json',
            data: data
          }).then(function(data) {
            resolve(data);
          }, function(jqXHR) {
            jqXHR.then = null; // tame jQuery's ill mannered promises
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @param {Store} store
    @param {Model} type   the Model class of the record
    @param {Snapshot} snapshot
    @return {Promise} promise
    @public
  */
  // @ts-expect-error
  updateRecord(store: Store, type: ModelSchema, snapshot: Snapshot): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a updateRecord override');
    }
  }

  /**
    Implement this method in a subclass to handle the deletion of
    a record.

    Sends a delete request for the record to the server.

    Example

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      deleteRecord(store, type, snapshot) {
        let data = this.serialize(snapshot, { includeId: true });
        let id = snapshot.id;

        return new RSVP.Promise(function(resolve, reject) {
          $.ajax({
            type: 'DELETE',
            url: `/${type.modelName}/${id}`,
            dataType: 'json',
            data: data
          }).then(function(data) {
            resolve(data)
          }, function(jqXHR) {
            jqXHR.then = null; // tame jQuery's ill mannered promises
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @param {Store} store
    @param {Model} type   the Model class of the record
    @param {Snapshot} snapshot
    @return {Promise} promise
    @public
  */
  // @ts-expect-error
  deleteRecord(store: Store, type: ModelSchema, snapshot: Snapshot): Promise<AdapterPayload> {
    if (DEBUG) {
      throw new Error('You subclassed the Adapter class but missing a deleteRecord override');
    }
  }

  /**
    By default the store will try to coalesce all `findRecord` calls within the same runloop
    into as few requests as possible by calling groupRecordsForFindMany and passing it into a findMany call.
    You can opt out of this behaviour by either not implementing the findMany hook or by setting
    coalesceFindRequests to false.

    @property coalesceFindRequests
    @public
    @type {Boolean}
  */
  get coalesceFindRequests() {
    const coalesceFindRequests = this._coalesceFindRequests;
    if (typeof coalesceFindRequests === 'boolean') {
      return coalesceFindRequests;
    }
    return (this._coalesceFindRequests = true);
  }

  set coalesceFindRequests(value: boolean) {
    this._coalesceFindRequests = value;
  }

  /**
    The store will call `findMany` instead of multiple `findRecord`
    requests to find multiple records at once if coalesceFindRequests
    is true.

    ```js [app/adapters/application.js]
    import { Adapter } from '@warp-drive/legacy/adapter';
    import RSVP from 'RSVP';
    import $ from 'jquery';

    export default class ApplicationAdapter extends Adapter {
      findMany(store, type, ids, snapshots) {
        return new RSVP.Promise(function(resolve, reject) {
          $.ajax({
            type: 'GET',
            url: `/${type.modelName}/`,
            dataType: 'json',
            data: { filter: { id: ids.join(',') } }
          }).then(function(data) {
            resolve(data);
          }, function(jqXHR) {
            jqXHR.then = null; // tame jQuery's ill mannered promises
            reject(jqXHR);
          });
        });
      }
    }
    ```

    @param {Store} store
    @param {Model} type   the Model class of the records
    @param {Array}    ids
    @param {Array} snapshots
    @return {Promise} promise
    @public
  */

  /**
    Organize records into groups, each of which is to be passed to separate
    calls to `findMany`.

    For example, if your API has nested URLs that depend on the parent, you will
    want to group records by their parent.

    The default implementation returns the records as a single group.

    @public
    @param {Store} store
    @param {Array} snapshots
    @return {Array}  an array of arrays of records, each of which is to be
                      loaded separately by `findMany`.
  */
  groupRecordsForFindMany(store: Store, snapshots: Snapshot[]): Snapshot[][] {
    return [snapshots];
  }

  /**
    This method is used by the store to determine if the store should
    reload a record from the adapter when a record is requested by
    `store.findRecord`.

    If this method returns `true`, the store will re-fetch a record from
    the adapter. If this method returns `false`, the store will resolve
    immediately using the cached record.

    For example, if you are building an events ticketing system, in which users
    can only reserve tickets for 20 minutes at a time, and want to ensure that
    in each route you have data that is no more than 20 minutes old you could
    write:

    ```javascript
    shouldReloadRecord(store, ticketSnapshot) {
      let lastAccessedAt = ticketSnapshot.attr('lastAccessedAt');
      let timeDiff = moment().diff(lastAccessedAt, 'minutes');

      if (timeDiff > 20) {
        return true;
      } else {
        return false;
      }
    }
    ```

    This method would ensure that whenever you do `store.findRecord('ticket',
    id)` you will always get a ticket that is no more than 20 minutes old. In
    case the cached version is more than 20 minutes old, `findRecord` will not
    resolve until you fetched the latest version.

    By default this hook returns `false`, as most UIs should not block user
    interactions while waiting on data update.

    Note that, with default settings, `shouldBackgroundReloadRecord` will always
    re-fetch the records in the background even if `shouldReloadRecord` returns
    `false`. You can override `shouldBackgroundReloadRecord` if this does not
    suit your use case.

    @since 1.13.0
    @param {Store} store
    @param {Snapshot} snapshot
    @return {Boolean}
    @public
  */
  shouldReloadRecord(store: Store, snapshot: Snapshot): boolean {
    return false;
  }

  /**
    This method is used by the store to determine if the store should
    reload all records from the adapter when records are requested by
    `store.findAll`.

    If this method returns `true`, the store will re-fetch all records from
    the adapter. If this method returns `false`, the store will resolve
    immediately using the cached records.

    For example, if you are building an events ticketing system, in which users
    can only reserve tickets for 20 minutes at a time, and want to ensure that
    in each route you have data that is no more than 20 minutes old you could
    write:

    ```javascript
    shouldReloadAll(store, snapshotArray) {
      let snapshots = snapshotArray.snapshots();

      return snapshots.any((ticketSnapshot) => {
        let lastAccessedAt = ticketSnapshot.attr('lastAccessedAt');
        let timeDiff = moment().diff(lastAccessedAt, 'minutes');

        if (timeDiff > 20) {
          return true;
        } else {
          return false;
        }
      });
    }
    ```

    This method would ensure that whenever you do `store.findAll('ticket')` you
    will always get a list of tickets that are no more than 20 minutes old. In
    case a cached version is more than 20 minutes old, `findAll` will not
    resolve until you fetched the latest versions.

    By default, this method returns `true` if the passed `snapshotRecordArray`
    is empty (meaning that there are no records locally available yet),
    otherwise, it returns `false`.

    Note that, with default settings, `shouldBackgroundReloadAll` will always
    re-fetch all the records in the background even if `shouldReloadAll` returns
    `false`. You can override `shouldBackgroundReloadAll` if this does not suit
    your use case.

    @since 1.13.0
    @param {Store} store
    @param {SnapshotRecordArray} snapshotRecordArray
    @return {Boolean}
    @public
  */
  shouldReloadAll(store: Store, snapshotRecordArray: SnapshotRecordArray): boolean {
    return !snapshotRecordArray.length;
  }

  /**
    This method is used by the store to determine if the store should
    reload a record after the `store.findRecord` method resolves a
    cached record.

    This method is *only* checked by the store when the store is
    returning a cached record.

    If this method returns `true` the store will re-fetch a record from
    the adapter.

    For example, if you do not want to fetch complex data over a mobile
    connection, or if the network is down, you can implement
    `shouldBackgroundReloadRecord` as follows:

    ```javascript
    shouldBackgroundReloadRecord(store, snapshot) {
      let { downlink, effectiveType } = navigator.connection;

      return downlink > 0 && effectiveType === '4g';
    }
    ```

    By default, this hook returns `true` so the data for the record is updated
    in the background.

    @since 1.13.0
    @param {Store} store
    @param {Snapshot} snapshot
    @return {Boolean}
    @public
  */
  shouldBackgroundReloadRecord(store: Store, snapshot: Snapshot): boolean {
    return true;
  }

  /**
    This method is used by the store to determine if the store should
    reload a record array after the `store.findAll` method resolves
    with a cached record array.

    This method is *only* checked by the store when the store is
    returning a cached record array.

    If this method returns `true` the store will re-fetch all records
    from the adapter.

    For example, if you do not want to fetch complex data over a mobile
    connection, or if the network is down, you can implement
    `shouldBackgroundReloadAll` as follows:

    ```javascript
    shouldBackgroundReloadAll(store, snapshotArray) {
      let { downlink, effectiveType } = navigator.connection;

      return downlink > 0 && effectiveType === '4g';
    }
    ```

    By default this method returns `true`, indicating that a background reload
    should always be triggered.

    @since 1.13.0
    @param {Store} store
    @param {SnapshotRecordArray} snapshotRecordArray
    @return {Boolean}
    @public
  */
  shouldBackgroundReloadAll(store: Store, snapshotRecordArray: SnapshotRecordArray): boolean {
    return true;
  }
}

export { BuildURLMixin } from './adapter/-private/build-url-mixin.ts';
