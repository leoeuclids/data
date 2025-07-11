import EmberObject from '@ember/object';

import type { LegacyAttributeField } from '@warp-drive/core/types/schema/fields';

export interface Transform {
  /**
    When given a deserialized value from a record attribute this
    method must return the serialized value.

    Example

    ```javascript
    serialize(deserialized, options) {
      return deserialized ? null : Number(deserialized);
    }
    ```

    @public
    @param deserialized The deserialized value
    @param options hash of options passed to `attr`
    @return The serialized value
  */
  serialize(value: unknown, options: LegacyAttributeField['options']): unknown;

  /**
    When given a serialized value from a JSON object this method must
    return the deserialized value for the record attribute.

    Example

    ```javascript
    deserialize(serialized, options) {
      return empty(serialized) ? null : Number(serialized);
    }
    ```

    @public
    @param serialized The serialized value
    @param options hash of options passed to `attr`
    @return The deserialized value
  */
  deserialize(value: unknown, options: LegacyAttributeField['options']): unknown;
}

/**
  The `Transform` class is used to serialize and deserialize model
  attributes when they are saved or loaded from an
  adapter. Subclassing `Transform` is useful for creating custom
  attributes. All subclasses of `Transform` must implement a
  `serialize` and a `deserialize` method.

  Example

  ```js [app/transforms/temperature.js]

  // Converts centigrade in the JSON to fahrenheit in the app
  export default class TemperatureTransform {
    deserialize(serialized, options) {
      return (serialized *  1.8) + 32;
    }

    serialize(deserialized, options) {
      return (deserialized - 32) / 1.8;
    }

    static create() {
      return new this();
    }
  }
  ```

  Usage

  ```js [app/models/requirement.js]
  import { Model, attr } from '@warp-drive/legacy/model';

  export default class RequirementModel extends Model {
    @attr('string') name;
    @attr('temperature') temperature;
  }
  ```

  The options passed into the `attr` function when the attribute is
  declared on the model is also available in the transform.

  ```js [app/models/post.js]
  import { Model, attr } from '@warp-drive/legacy/model';

  export default class PostModel extends Model {
    @attr('string') title;
    @attr('markdown', {
      markdown: {
        gfm: false,
        sanitize: true
      }
    })
    markdown;
  }
  ```

  ```js [app/transforms/markdown.js]
  export default class MarkdownTransform {
    serialize(deserialized, options) {
      return deserialized.raw;
    }

    deserialize(serialized, options) {
      let markdownOptions = options.markdown || {};

      return marked(serialized, markdownOptions);
    }

    static create() {
      return new this();
    }
  }
  ```

  @class Transform
  @public
 */
export const Transform: typeof EmberObject = EmberObject;
