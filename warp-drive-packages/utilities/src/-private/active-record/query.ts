import type { QueryParamsSource } from '@warp-drive/core/types/params';
import type { TypeFromInstance } from '@warp-drive/core/types/record';
import type { ConstrainedRequestOptions, QueryRequestOptions } from '@warp-drive/core/types/request';
import type { CollectionResourceDataDocument } from '@warp-drive/core/types/spec/document';

import { buildBaseURL, buildQueryParams, type QueryUrlOptions } from '../../index.ts';
import { pluralize, underscore } from '../../string';
import { copyForwardUrlOptions, extractCacheOptions } from '../builder-utils.ts';

/**
 * Builds request options to query for resources, usually by a primary
 * type, configured for the url and header expectations of most ActiveRecord APIs.
 *
 * **Basic Usage**
 *
 * ```ts
 * import { query } from '@warp-drive/utilities/active-record';
 *
 * const data = await store.request(query('person'));
 * ```
 *
 * **With Query Params**
 *
 * ```ts
 * import { query } from '@warp-drive/utilities/active-record';
 *
 * const options = query('person', { include: ['pets', 'friends'] });
 * const data = await store.request(options);
 * ```
 *
 * **Supplying Options to Modify the Request Behavior**
 *
 * The following options are supported:
 *
 * - `host` - The host to use for the request, defaults to the `host` configured with `setBuildURLConfig`.
 * - `namespace` - The namespace to use for the request, defaults to the `namespace` configured with `setBuildURLConfig`.
 * - `resourcePath` - The resource path to use for the request, defaults to pluralizing and underscoring the supplied type
 * - `reload` - Whether to forcibly reload the request if it is already in the store, not supplying this
 *      option will delegate to the store's CachePolicy, defaulting to `false` if none is configured.
 * - `backgroundReload` - Whether to reload the request if it is already in the store, but to also resolve the
 *      promise with the cached value, not supplying this option will delegate to the store's CachePolicy,
 *      defaulting to `false` if none is configured.
 * - `urlParamsSetting` - an object containing options for how to serialize the query params (see `buildQueryParams`)
 *
 * ```ts
 * import { query } from '@warp-drive/utilities/active-record';
 *
 * const options = query('person', { include: ['pets', 'friends'] }, { reload: true });
 * const data = await store.request(options);
 * ```
 *
 * @public
 * @param identifier
 * @param query
 * @param options
 */
export function query<T>(
  type: TypeFromInstance<T>,
  query?: QueryParamsSource,
  options?: ConstrainedRequestOptions
): QueryRequestOptions<CollectionResourceDataDocument<T>, T>;
export function query(
  type: string,
  query?: QueryParamsSource,
  options?: ConstrainedRequestOptions
): QueryRequestOptions;
export function query(
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  query: QueryParamsSource = {},
  options: ConstrainedRequestOptions = {}
): QueryRequestOptions {
  const cacheOptions = extractCacheOptions(options);
  const urlOptions: QueryUrlOptions = {
    identifier: { type },
    op: 'query',
    resourcePath: pluralize(underscore(type)),
  };

  copyForwardUrlOptions(urlOptions, options);

  const url = buildBaseURL(urlOptions);
  const headers = new Headers();
  headers.append('Accept', 'application/json;charset=utf-8');
  const queryString = buildQueryParams(query, options.urlParamsSettings);

  return {
    url: queryString ? `${url}?${queryString}` : url,
    method: 'GET',
    headers,
    cacheOptions,
    op: 'query',
  };
}
