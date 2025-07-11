import { assert } from '@warp-drive/core/build-config/macros';

import { getOrSetGlobal } from '../../../types/-private.ts';
import type { Cache } from '../../../types/cache.ts';
import type { StableRecordIdentifier } from '../../../types/identifier.ts';
import type { OpaqueRecordInstance } from '../../-types/q/record-instance';

/*
 * Returns the Cache instance associated with a given
 * Model or Identifier
 */

export const CacheForIdentifierCache: Map<unknown, Cache> = getOrSetGlobal(
  'CacheForIdentifierCache',
  new Map<StableRecordIdentifier | OpaqueRecordInstance, Cache>()
);

export function setCacheFor(identifier: StableRecordIdentifier | OpaqueRecordInstance, cache: Cache): void {
  assert(
    `Illegal set of identifier`,
    !CacheForIdentifierCache.has(identifier) || CacheForIdentifierCache.get(identifier) === cache
  );
  CacheForIdentifierCache.set(identifier, cache);
}

export function removeRecordDataFor(identifier: StableRecordIdentifier | OpaqueRecordInstance): void {
  CacheForIdentifierCache.delete(identifier);
}

export function peekCache(instance: StableRecordIdentifier): Cache | null;
export function peekCache(instance: OpaqueRecordInstance): Cache;
export function peekCache(instance: StableRecordIdentifier | OpaqueRecordInstance): Cache | null {
  if (CacheForIdentifierCache.has(instance as StableRecordIdentifier)) {
    return CacheForIdentifierCache.get(instance as StableRecordIdentifier) as Cache;
  }

  return null;
}
