import type { CollectionRelationship } from '../../../types/cache/relationship.ts';
import type { StableRecordIdentifier } from '../../../types/identifier.ts';
import type { Links, Meta, PaginationLinks } from '../../../types/spec/json-api-raw.ts';
import { computeLocalState } from '../-diff.ts';
import type { UpgradedMeta } from '../-edge-definition.ts';
import type { RelationshipState } from '../-state.ts';
import { createState } from '../-state.ts';

export interface CollectionEdge {
  definition: UpgradedMeta;
  identifier: StableRecordIdentifier;
  state: RelationshipState;

  remoteMembers: Set<StableRecordIdentifier>;
  remoteState: StableRecordIdentifier[];

  additions: Set<StableRecordIdentifier> | null;
  removals: Set<StableRecordIdentifier> | null;

  meta: Meta | null;
  links: Links | PaginationLinks | null;

  localState: StableRecordIdentifier[] | null;
  /**
   * Whether the localState for this edge is out-of-sync
   * with the remoteState.
   *
   * if state.hasReceivedData=false we are also
   * not dirty since there is nothing to sync with.
   *
   */
  isDirty: boolean;
  transactionRef: number;
  /**
   * Whether data for this edge has been accessed at least once
   * via `graph.getData`
   *
   */
  accessed: boolean;

  _diff?: {
    add: Set<StableRecordIdentifier>;
    del: Set<StableRecordIdentifier>;
  };
}

export function createCollectionEdge(definition: UpgradedMeta, identifier: StableRecordIdentifier): CollectionEdge {
  return {
    definition,
    identifier,
    state: createState(),
    remoteMembers: new Set(),
    remoteState: [],
    additions: null,
    removals: null,

    meta: null,
    links: null,

    localState: null,
    isDirty: false,
    transactionRef: 0,
    accessed: false,
    _diff: undefined,
  };
}

export function legacyGetCollectionRelationshipData(
  source: CollectionEdge,
  getRemoteState: boolean
): CollectionRelationship {
  source.accessed = true;
  const payload: CollectionRelationship = {};

  if (source.state.hasReceivedData) {
    payload.data = getRemoteState ? source.remoteState.slice() : computeLocalState(source);
  }

  if (source.links) {
    payload.links = source.links;
  }

  if (source.meta) {
    payload.meta = source.meta;
  }

  return payload;
}
