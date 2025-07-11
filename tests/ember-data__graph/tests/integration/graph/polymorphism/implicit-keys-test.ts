import type { Store } from '@warp-drive/core';
import { recordIdentifierFor } from '@warp-drive/core';
import { graphFor } from '@warp-drive/core/graph/-private';
import type { CollectionResourceDocument } from '@warp-drive/core/types/spec/json-api-raw';
import { Type } from '@warp-drive/core/types/symbols';
import { module, test } from '@warp-drive/diagnostic';
import { setupTest } from '@warp-drive/diagnostic/ember';
import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

module('Integration | Graph | Implicit Keys', function (hooks) {
  setupTest(hooks);

  test('Non-polymorphic records do not trigger polymorphic assertions when they share the same key with another record', async function (assert) {
    const { owner } = this;
    class User extends Model {
      @attr declare name: string;
      @belongsTo('organization', { async: false, inverse: null }) declare organization: Organization;
      [Type] = 'user' as const;
    }
    class Product extends Model {
      @attr declare name: string;
      @belongsTo('organization', { async: false, inverse: null }) declare organization: Organization;
      [Type] = 'product' as const;
    }
    class Organization extends Model {
      @attr declare name: string;
      [Type] = 'organization' as const;
    }
    owner.register('model:user', User);
    owner.register('model:product', Product);
    owner.register('model:organization', Organization);

    const store = owner.lookup('service:store') as unknown as Store;
    const graph = graphFor(store);
    let user!: User, product!: Product, organization!: Organization;

    await assert.expectNoAssertion(() => {
      const data: CollectionResourceDocument<'user' | 'product' | 'organization'> = {
        data: [
          {
            type: 'user',
            id: '1',
            attributes: { name: 'Chris' },
            relationships: {
              organization: { data: { type: 'organization', id: '1 ' } },
            },
          },
          {
            type: 'product',
            id: '1',
            attributes: { name: 'Awesome Relationships' },
            relationships: {
              organization: { data: { type: 'organization', id: '1 ' } },
            },
          },
          {
            type: 'organization',
            id: '1',
            attributes: { name: 'Ember.js' },
          },
        ],
      };
      [user, product, organization] = store.push<User | Organization | Product>(data) as [User, Product, Organization];
    });

    const userIdentifier = recordIdentifierFor(user);
    const productIdentifier = recordIdentifierFor(product);
    const organizationIdentifier = recordIdentifierFor(organization);

    const userOrg = graph.get(userIdentifier, 'organization');
    const userImpl = graph.get(organizationIdentifier, userOrg.definition.inverseKey);
    const productOrg = graph.get(productIdentifier, 'organization');
    const productImpl = graph.get(organizationIdentifier, productOrg.definition.inverseKey);

    assert.notEqual(userImpl, productImpl, 'We have separate implicit caches');
  });
});
