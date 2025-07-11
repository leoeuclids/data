/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { warn } from '@ember/debug';
import type EmberObject from '@ember/object';

import type { Store } from '@warp-drive/core';
import { DEBUG } from '@warp-drive/core/build-config/env';
import { assert } from '@warp-drive/core/build-config/macros';
import type { ModelSchema } from '@warp-drive/core/types';
import type { LegacyBelongsToField, LegacyHasManyField } from '@warp-drive/core/types/schema/fields';
import { camelize, dasherize, singularize } from '@warp-drive/utilities/string';

import type { MinimumSerializerInterface } from '../compat.ts';
import type { Snapshot } from '../compat/-private.ts';
import { coerceId } from './-private/utils.ts';
import { JSONSerializer } from './json.ts';

function makeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * <blockquote style="margin: 1em; padding: .1em 1em .1em 1em; border-left: solid 1em #E34C32; background: #e0e0e0;">
  <p>
    ⚠️ <strong>This is LEGACY documentation</strong> for a feature that is no longer encouraged to be used.
    If starting a new app or thinking of implementing a new adapter, consider writing a
    <a href="/ember-data/release/classes/%3CInterface%3E%20Handler">Handler</a> instead to be used with the <a href="https://github.com/emberjs/data/tree/main/packages/request#readme">RequestManager</a>
  </p>
  </blockquote>

  Normally, applications will use the `RESTSerializer` by implementing
  the `normalize` method.

  This allows you to do whatever kind of munging you need and is
  especially useful if your server is inconsistent and you need to
  do munging differently for many different kinds of responses.

  See the `normalize` documentation for more information.

  ## Across the Board Normalization

  There are also a number of hooks that you might find useful to define
  across-the-board rules for your payload. These rules will be useful
  if your server is consistent, or if you're building an adapter for
  an infrastructure service, like Firebase, and want to encode service
  conventions.

  For example, if all of your keys are underscored and all-caps, but
  otherwise consistent with the names you use in your models, you
  can implement across-the-board rules for how to convert an attribute
  name in your model to a key in your JSON.

  ```js [app/serializers/application.js]
  import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';
  import { underscore } from '<app-name>/utils/string-utils';

  export default class ApplicationSerializer extends RESTSerializer {
    keyForAttribute(attr, method) {
      return underscore(attr).toUpperCase();
    }
  }
  ```

  You can also implement `keyForRelationship`, which takes the name
  of the relationship as the first parameter, the kind of
  relationship (`hasMany` or `belongsTo`) as the second parameter, and
  the method (`serialize` or `deserialize`) as the third parameter.

  @class RESTSerializer
  @public
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RESTSerializer: any = (JSONSerializer as typeof EmberObject).extend({
  /**
   `keyForPolymorphicType` can be used to define a custom key when
   serializing and deserializing a polymorphic type. By default, the
   returned key is `${key}Type`.

   Example

    ```js [app/serializers/post.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';

    export default class ApplicationSerializer extends RESTSerializer {
      keyForPolymorphicType(key, relationship) {
        let relationshipKey = this.keyForRelationship(key);

        return 'type-' + relationshipKey;
      }
    }
    ```

    @public
  */
  keyForPolymorphicType(key: string, type: string, method: 'serialize' | 'deserialize'): string {
    // @ts-expect-error
    const relationshipKey = this.keyForRelationship(key);

    return `${relationshipKey}Type`;
  },

  /**
    Normalizes a part of the JSON payload returned by
    the server. You should override this method, munge the hash
    and call super if you have generic normalization to do.

    It takes the type of the record that is being normalized
    (as a Model class), the property where the hash was
    originally found, and the hash to normalize.

    For example, if you have a payload that looks like this:

    ```js
    {
      "post": {
        "id": 1,
        "title": "Rails is omakase",
        "comments": [ 1, 2 ]
      },
      "comments": [{
        "id": 1,
        "body": "FIRST"
      }, {
        "id": 2,
        "body": "Rails is unagi"
      }]
    }
    ```

    The `normalize` method will be called three times:

    * With `App.Post`, `"posts"` and `{ id: 1, title: "Rails is omakase", ... }`
    * With `App.Comment`, `"comments"` and `{ id: 1, body: "FIRST" }`
    * With `App.Comment`, `"comments"` and `{ id: 2, body: "Rails is unagi" }`

    You can use this method, for example, to normalize underscored keys to camelized
    or other general-purpose normalizations. You will only need to implement
    `normalize` and manipulate the payload as desired.

    For example, if the `IDs` under `"comments"` are provided as `_id` instead of
    `id`, you can specify how to normalize just the comments:

    ```js [app/serializers/post.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';

    export default class ApplicationSerializer extends RESTSerializer {
      normalize(model, hash, prop) {
        if (prop === 'comments') {
          hash.id = hash._id;
          delete hash._id;
        }

        return super.normalize(...arguments);
      }
    }
    ```

    On each call to the `normalize` method, the third parameter (`prop`) is always
    one of the keys that were in the original payload or in the result of another
    normalization as `normalizeResponse`.

    @public
    @param {Model} modelClass
    @param {Object} resourceHash
    @param {String} prop
    @return {Object}
  */

  /**
    Normalizes an array of resource payloads and returns a JSON-API Document
    with primary data and, if any, included data as `{ data, included }`.

    @private
  */
  _normalizeArray(store: Store, modelName: string, arrayHash: unknown, prop: string): object {
    const documentHash = {
      data: [],
      included: [],
    };

    const modelClass = store.modelFor(modelName);
    const serializer = store.serializerFor(modelName);

    makeArray(arrayHash).forEach((hash) => {
      // @ts-expect-error
      const { data, included } = this._normalizePolymorphicRecord(store, hash, prop, modelClass, serializer);
      // @ts-expect-error
      documentHash.data.push(data);
      if (included) {
        documentHash.included = documentHash.included.concat(included);
      }
    });

    return documentHash;
  },

  _normalizePolymorphicRecord(
    store: Store,
    hash: object,
    prop: string,
    primaryModelClass: ModelSchema,
    primarySerializer: MinimumSerializerInterface
  ): object {
    let serializer = primarySerializer;
    let modelClass = primaryModelClass;

    const primaryHasTypeAttribute = primaryModelClass.fields.has('type');

    // @ts-expect-error all the errors
    if (!primaryHasTypeAttribute && hash.type) {
      // Support polymorphic records in async relationships
      // @ts-expect-error all the errors
      const type = this.modelNameFromPayloadKey(hash.type);

      if (store.schema.hasResource({ type })) {
        serializer = store.serializerFor(type);
        modelClass = store.modelFor(type);
      }
    }

    // @ts-expect-error all the errors
    return serializer.normalize(modelClass, hash, prop);
  },

  /**
    @private
  */
  _normalizeResponse(
    store: Store,
    primaryModelClass: ModelSchema,
    payload: object,
    id: string | null,
    requestType: string,
    isSingle: boolean
  ): object {
    const documentHash = {
      data: null,
      included: [],
    };
    // @ts-expect-error
    const meta = this.extractMeta(store, primaryModelClass, payload);
    if (meta) {
      assert(
        'The `meta` returned from `extractMeta` has to be an object, not "' + typeof meta + '".',
        typeof meta === 'object'
      ); // @ts-expect-error
      documentHash.meta = meta;
    }

    const keys = Object.keys(payload);

    for (let i = 0, length = keys.length; i < length; i++) {
      const prop = keys[i];
      let modelName = prop;
      let forcedSecondary = false;

      /*
        If you want to provide sideloaded records of the same type that the
        primary data you can do that by prefixing the key with `_`.

        Example

        ```
        {
          users: [
            { id: 1, title: 'Tom', manager: 3 },
            { id: 2, title: 'Yehuda', manager: 3 }
          ],
          _users: [
            { id: 3, title: 'Tomster' }
          ]
        }
        ```

        This forces `_users` to be added to `included` instead of `data`.
       */
      if (prop.charAt(0) === '_') {
        forcedSecondary = true;
        modelName = prop.substr(1);
      }

      const type = this.modelNameFromPayloadKey(modelName);
      if (!store.schema.hasResource({ type })) {
        if (DEBUG) {
          // @ts-expect-error
          warn(this.warnMessageNoModelForKey(modelName, type), false, {
            id: 'ds.serializer.model-for-key-missing',
          });
        }
        continue;
      }

      // eslint-disable-next-line no-var
      var isPrimary = !forcedSecondary && this.isPrimaryType(store, type, primaryModelClass);
      const value = payload[prop];

      if (value === null) {
        continue;
      }

      assert(
        'The adapter returned an array for the primary data of a `queryRecord` response. `queryRecord` should return a single record.',
        !(requestType === 'queryRecord' && isPrimary && Array.isArray(value))
      );

      /*
        Support primary data as an object instead of an array.

        Example

        ```
        {
          user: { id: 1, title: 'Tom', manager: 3 }
        }
        ```
       */
      if (isPrimary && !Array.isArray(value)) {
        // @ts-expect-error
        const { data, included } = this._normalizePolymorphicRecord(store, value, prop, primaryModelClass, this);
        documentHash.data = data;
        if (included) {
          documentHash.included = documentHash.included.concat(included);
        }
        continue;
      }
      // @ts-expect-error
      const { data, included } = this._normalizeArray(store, type, value, prop);

      if (included) {
        documentHash.included = documentHash.included.concat(included);
      }

      if (isSingle) {
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        data.forEach((resource) => {
          /*
            Figures out if this is the primary record or not.

            It's either:

            1. The record with the same ID as the original request
            2. If it's a newly created record without an ID, the first record
               in the array
           */
          const isUpdatedRecord = isPrimary && coerceId(resource.id) === id;
          const isFirstCreatedRecord = isPrimary && !id && !documentHash.data;

          if (isFirstCreatedRecord || isUpdatedRecord) {
            documentHash.data = resource;
          } else {
            // @ts-expect-error
            documentHash.included.push(resource);
          }
        });
      } else {
        if (isPrimary) {
          documentHash.data = data;
        } else {
          if (data) {
            documentHash.included = documentHash.included.concat(data);
          }
        }
      }
    }

    return documentHash;
  },

  isPrimaryType(store: Store, modelName: string, primaryModelClass: ModelSchema): boolean {
    return dasherize(modelName) === primaryModelClass.modelName;
  },

  /**
    This method allows you to push a payload containing top-level
    collections of records organized per type.

    ```js
    {
      "posts": [{
        "id": "1",
        "title": "Rails is omakase",
        "author", "1",
        "comments": [ "1" ]
      }],
      "comments": [{
        "id": "1",
        "body": "FIRST"
      }],
      "users": [{
        "id": "1",
        "name": "@d2h"
      }]
    }
    ```

    It will first normalize the payload, so you can use this to push
    in data streaming in from your server structured the same way
    that fetches and saves are structured.

    @public
  */
  pushPayload(store: Store, payload: object): void {
    const documentHash = {
      data: [],
      included: [],
    };

    for (const prop in payload) {
      const type = this.modelNameFromPayloadKey(prop);
      if (!store.schema.hasResource({ type })) {
        if (DEBUG) {
          // @ts-expect-error
          warn(this.warnMessageNoModelForKey(prop, type), false, {
            id: 'ds.serializer.model-for-key-missing',
          });
        }
        continue;
      }
      const ModelSchema = store.modelFor(type);
      const typeSerializer = store.serializerFor(ModelSchema.modelName);

      makeArray(payload[prop]).forEach((hash) => {
        const { data, included } = typeSerializer.normalize(ModelSchema, hash, prop);
        // @ts-expect-error
        documentHash.data.push(data);
        if (included) {
          documentHash.included = documentHash.included.concat(included);
        }
      });
    }

    store.push(documentHash);
  },

  /**
    This method is used to convert each JSON root key in the payload
    into a modelName that it can use to look up the appropriate model for
    that part of the payload.

    For example, your server may send a model name that does not correspond with
    the name of the model in your app. Let's take a look at an example model,
    and an example payload:

    ```js [app/models/post.js]
    import Model from '@ember-data/model';

    export default class Post extends Model {}
    ```

    ```javascript
      {
        "blog/post": {
          "id": "1
        }
      }
    ```

    Ember Data is going to normalize the payload's root key for the modelName. As a result,
    it will try to look up the "blog/post" model. Since we don't have a model called "blog/post"
    (or a file called app/models/blog/post.js in ember-cli), Ember Data will throw an error
    because it cannot find the "blog/post" model.

    Since we want to remove this namespace, we can define a serializer for the application that will
    remove "blog/" from the payload key whenver it's encountered by Ember Data:

    ```js [app/serializers/application.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';

    export default class ApplicationSerializer extends RESTSerializer {
      modelNameFromPayloadKey(payloadKey) {
        if (payloadKey === 'blog/post') {
          return super.modelNameFromPayloadKey(payloadKey.replace('blog/', ''));
        } else {
         return super.modelNameFromPayloadKey(payloadKey);
        }
      }
    }
    ```

    After refreshing, Ember Data will appropriately look up the "post" model.

    By default the modelName for a model is its
    name in dasherized form. This means that a payload key like "blogPost" would be
    normalized to "blog-post" when Ember Data looks up the model. Usually, Ember Data
    can use the correct inflection to do this for you. Most of the time, you won't
    need to override `modelNameFromPayloadKey` for this purpose.

    @public
    @return the model's modelName
  */
  modelNameFromPayloadKey(key: string): string {
    return dasherize(singularize(key));
  },

  // SERIALIZE

  /**
    Called when a record is saved in order to convert the
    record into JSON.

    By default, it creates a JSON object with a key for
    each attribute and belongsTo relationship.

    For example, consider this model:

    ```js [app/models/comment.js]
    import Model, { attr, belongsTo } from '@ember-data/model';

    export default class Comment extends Model {
      @attr title
      @attr body

      @belongsTo('user') author
    }
    ```

    The default serialization would create a JSON object like:

    ```js
    {
      "title": "Rails is unagi",
      "body": "Rails? Omakase? O_O",
      "author": 12
    }
    ```

    By default, attributes are passed through as-is, unless
    you specified an attribute type (`attr('date')`). If
    you specify a transform, the JavaScript value will be
    serialized when inserted into the JSON hash.

    By default, belongs-to relationships are converted into
    IDs when inserted into the JSON hash.

    ## IDs

    `serialize` takes an options hash with a single option:
    `includeId`. If this option is `true`, `serialize` will,
    by default include the ID in the JSON object it builds.

    The adapter passes in `includeId: true` when serializing
    a record for `createRecord`, but not for `updateRecord`.

    ## Customization

    Your server may expect a different JSON format than the
    built-in serialization format.

    In that case, you can implement `serialize` yourself and
    return a JSON hash of your choosing.

    ```js [app/serializers/post.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';

    export default class ApplicationSerializer extends RESTSerializer {
      serialize(snapshot, options) {
        let json = {
          POST_TTL: snapshot.attr('title'),
          POST_BDY: snapshot.attr('body'),
          POST_CMS: snapshot.hasMany('comments', { ids: true })
        };

        if (options.includeId) {
          json.POST_ID_ = snapshot.id;
        }

        return json;
      }
    }
    ```

    ## Customizing an App-Wide Serializer

    If you want to define a serializer for your entire
    application, you'll probably want to use `eachAttribute`
    and `eachRelationship` on the record.

    ```js [app/serializers/application.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';
    import { pluralize } from '<app-name>/utils/string-utils';

    export default class ApplicationSerializer extends RESTSerializer {
      serialize(snapshot, options) {
        let json = {};

        snapshot.eachAttribute(function(name) {
          json[serverAttributeName(name)] = snapshot.attr(name);
        });

        snapshot.eachRelationship(function(name, relationship) {
          if (relationship.kind === 'hasMany') {
            json[serverHasManyName(name)] = snapshot.hasMany(name, { ids: true });
          }
        });

        if (options.includeId) {
          json.ID_ = snapshot.id;
        }

        return json;
      }
    }

    function serverAttributeName(attribute) {
      return attribute.underscore().toUpperCase();
    }

    function serverHasManyName(name) {
      return serverAttributeName(singularize(name)) + "_IDS";
    }
    ```

    This serializer will generate JSON that looks like this:

    ```js
    {
      "TITLE": "Rails is omakase",
      "BODY": "Yep. Omakase.",
      "COMMENT_IDS": [ 1, 2, 3 ]
    }
    ```

    ## Tweaking the Default JSON

    If you just want to do some small tweaks on the default JSON,
    you can call super first and make the tweaks on the returned
    JSON.

    ```js [app/serializers/post.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';

    export default class ApplicationSerializer extends RESTSerializer {
      serialize(snapshot, options) {
        let json = super.serialize(snapshot, options);

        json.subject = json.title;
        delete json.title;

        return json;
      }
    }
    ```

    @public
  */
  serialize(snapshot: Snapshot, options: object): object {
    // @ts-expect-error
    return this._super(...arguments);
  },

  /**
    You can use this method to customize the root keys serialized into the JSON.
    The hash property should be modified by reference (possibly using something like _.extend)
    By default the REST Serializer sends the modelName of a model, which is a camelized
    version of the name.

    For example, your server may expect underscored root objects.

    ```js [app/serializers/application.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';
    import { underscore } from '<app-name>/utils/string-utils';

    export default class ApplicationSerializer extends RESTSerializer {
      serializeIntoHash(data, type, record, options) {
        let root = underscore(type.modelName);
        data[root] = this.serialize(record, options);
      }
    }
    ```

    @public
  */
  serializeIntoHash(hash: object, typeClass: ModelSchema, snapshot: Snapshot, options: object): void {
    const normalizedRootKey = this.payloadKeyFromModelName(typeClass.modelName);
    hash[normalizedRootKey] = this.serialize(snapshot, options);
  },

  /**
    You can use `payloadKeyFromModelName` to override the root key for an outgoing
    request. By default, the RESTSerializer returns a camelized version of the
    model's name.

    For a model called TacoParty, its `modelName` would be the string `taco-party`. The RESTSerializer
    will send it to the server with `tacoParty` as the root key in the JSON payload:

    ```js
    {
      "tacoParty": {
        "id": "1",
        "location": "Matthew Beale's House"
      }
    }
    ```

    For example, your server may expect dasherized root objects:

    ```js [app/serializers/application.js]
    import { RESTSerializer } from '@warp-drive/legacy/serializer/rest';
    import { dasherize } from '<app-name>/utils/string-utils';

    export default class ApplicationSerializer extends RESTSerializer {
      payloadKeyFromModelName(modelName) {
        return dasherize(modelName);
      }
    }
    ```

    Given a `TacoParty` model, calling `save` on it would produce an outgoing
    request like:

    ```js
    {
      "taco-party": {
        "id": "1",
        "location": "Matthew Beale's House"
      }
    }
    ```

    @public
  */
  payloadKeyFromModelName(modelName: string): string {
    return camelize(modelName);
  },

  /**
    You can use this method to customize how polymorphic objects are serialized.
    By default the REST Serializer creates the key by appending `Type` to
    the attribute and value from the model's camelcased model name.

    @public
  */
  serializePolymorphicType(
    snapshot: Snapshot,
    json: object,
    relationship: LegacyHasManyField | LegacyBelongsToField
  ): void {
    const name = relationship.name;
    const typeKey = this.keyForPolymorphicType(name, relationship.type, 'serialize');
    const belongsTo = snapshot.belongsTo(name);

    if (!belongsTo) {
      json[typeKey] = null;
    } else {
      // @ts-expect-error
      json[typeKey] = camelize(belongsTo.modelName);
    }
  },

  /**
    You can use this method to customize how a polymorphic relationship should
    be extracted.

    @public
    @param {Object} relationshipType
    @param {Object} relationshipHash
    @param {Object} relationshipOptions
    @return {Object}
   */
  extractPolymorphicRelationship(
    relationshipType: string,
    relationshipHash: object,
    relationshipOptions?: object
  ): object {
    // @ts-expect-error
    const { key, resourceHash, relationshipMeta } = relationshipOptions;

    // A polymorphic belongsTo relationship can be present in the payload
    // either in the form where the `id` and the `type` are given:
    //
    //   {
    //     message: { id: 1, type: 'post' }
    //   }
    //
    // or by the `id` and a `<relationship>Type` attribute:
    //
    //   {
    //     message: 1,
    //     messageType: 'post'
    //   }
    //
    // The next code checks if the latter case is present and returns the
    // corresponding JSON-API representation. The former case is handled within
    // the base class JSONSerializer.
    const isPolymorphic = relationshipMeta.options.polymorphic;
    const typeProperty = this.keyForPolymorphicType(key, relationshipType, 'deserialize');

    if (isPolymorphic && resourceHash[typeProperty] !== undefined && typeof relationshipHash !== 'object') {
      const type = this.modelNameFromPayloadKey(resourceHash[typeProperty]);
      return {
        id: coerceId(relationshipHash),
        type: type,
      };
    }
    // @ts-expect-error
    return this._super(...arguments);
  },
});

if (DEBUG) {
  RESTSerializer.reopen({
    warnMessageNoModelForKey(prop, typeKey) {
      return (
        'Encountered "' +
        prop +
        '" in payload, but no model was found for model name "' +
        typeKey +
        '" (resolved model name using ' +
        this.constructor.toString() +
        '.modelNameFromPayloadKey("' +
        prop +
        '"))'
      );
    },
  });
}

export { EmbeddedRecordsMixin } from './-private/embedded-records-mixin.ts';

export { RESTSerializer };
