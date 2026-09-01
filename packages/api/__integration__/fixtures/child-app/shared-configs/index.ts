// Fixture for testing shared modules stats generation with different `shared` configs.
// Each imported dependency is configured as shared with a different set of options
// (scoped/unscoped name, singleton flag, different versions) so that the builder emits
// consume-shared modules with different names, which the ChunkCorrelationPlugin must parse.
import * as dippy from '@tinkoff/dippy';
import * as url from '@tinkoff/url';
import * as tslib from 'tslib';

// reference imports to prevent them from being tree-shaken out of the build
console.log('Shared configs child app', dippy, url, tslib);
