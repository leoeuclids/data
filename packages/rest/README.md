<p align="center">
  <img
    class="project-logo"
    src="./logos/ember-data-logo-dark.svg#gh-dark-mode-only"
    alt="EmberData REST"
    width="240px"
    title="EmberData REST"
    />
  <img
    class="project-logo"
    src="./logos/ember-data-logo-light.svg#gh-light-mode-only"
    alt="EmberData REST"
    width="240px"
    title="EmberData REST"
    />
</p>

<p align="center">Elegantly composable. Made for <strong>REST</strong>ful APIs</p>

This package provides utilities for working with **REST**ful APIs with [*Ember***Data**](https://github.com/emberjs/data/).

## Installation

Install using your javascript package manager of choice. For instance with [pnpm](https://pnpm.io/)

```no-highlight
pnpm add @ember-data/rest
```

**Tagged Releases**

- ![NPM Canary Version](https://img.shields.io/npm/v/%40ember-data/rest/canary?label=%40canary&color=FFBF00)
- ![NPM Beta Version](https://img.shields.io/npm/v/%40ember-data/rest/beta?label=%40beta&color=ff00ff)
- ![NPM Stable Version](https://img.shields.io/npm/v/%40ember-data/rest/latest?label=%40latest&color=90EE90)
- ![NPM LTS Version](https://img.shields.io/npm/v/%40ember-data/rest/lts?label=%40lts&color=0096FF)
- ![NPM LTS 4.12 Version](https://img.shields.io/npm/v/%40ember-data/rest/lts-4-12?label=%40lts-4-12&color=bbbbbb)


## Getting Started

If this package is how you are first learning about EmberData, we recommend starting with learning about the [Store](https://github.com/emberjs/data/blob/main/packages/store/README.md) and [Requests](https://github.com/emberjs/data/blob/main/packages/request/README.md)

## Request Builders

Request builders are functions that produce [Fetch Options](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). They take a few contextual inputs about the request you want to make, abstracting away the gnarlier details.

For instance, to fetch a resource from your API

```ts
import { findRecord } from '@ember-data/rest/request';

const options = findRecord('ember-developer', '1', { include: ['pets', 'friends'] });

/*
  => {
    url: 'https://api.example.com/v1/emberDevelopers/1?include=friends,pets',
    method: 'GET',
    headers: <Headers>, // 'Content-Type': 'application/json;charset=utf-8'
    op: 'findRecord';
    records: [{ type: 'ember-developer', id: '1' }]
  }
*/
```

Request builder output may be used with either `requestManager.request` or `store.request`.

URLs are stable. The same query will produce the same URL every time, even if the order of keys in
the query or values in an array changes.

URLs follow the most common REST format (camelCase pluralized resource types).

### Available Builders

- [createRecord]()
- [deleteRecord]()
- [findRecord]()
- [query]()
- [updateRecord]()
