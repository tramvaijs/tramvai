# PWA Multi Example

This example demonstrates how to configure multiple Service Workers in a Tramvai PWA application.

## Features

- **Multiple Service Workers**: Two separate SWs with different scopes:
  - `/scope/` - uses `service-worker.js`
  - `/bank/` - uses `service-worker-bank.js`
- **Scope-based SW selection**: Automatic SW selection based on the current pathname
- **Workbox integration**: Both SWs use Workbox for caching strategies
- **Integration tests**: Full test coverage for multiple SW registration

## Configuration

The multiple SW configuration is defined in `tramvai.json`:

```json
{
  "pwa": {
    "sw": [
      {
        "src": "service-worker.ts",
        "dest": "service-worker.js",
        "scope": "/scope/"
      },
      {
        "src": "service-worker-bank.ts",
        "dest": "service-worker-bank.js",
        "scope": "/bank/"
      }
    ]
  }
}
```

## Project Structure

```
examples/pwa-multi/
├── src/
│   ├── service-worker.ts          # Main SW for /scope/
│   ├── service-worker-bank.ts     # Bank SW for /bank/
│   └── routes/
│       ├── scope/                 # Pages using main SW
│       └── bank/                  # Pages using bank SW
├── __integration__/
│   ├── pwa.integration.ts         # Tests for multiple SW
│   └── pwa-fixture.ts             # Test fixtures with multi-SW support
└── tramvai.json                   # PWA configuration
```

## How It Works

1. **SW Selection**: The `selectSwByScope` utility selects the appropriate SW config based on the current pathname using a "most specific match" algorithm.

2. **Registration**: Each SW is registered with its own scope, allowing different caching strategies for different parts of the application.

3. **Caching**: Both SWs use the same caching recipes from `@tramvai/pwa-recipes` but maintain separate caches.

## Running the Example

```bash
# Development
npm run start

# Production build
npm run build
npm run start:prod

# Integration tests
npm run test:integration
```

## Testing

The integration tests verify:

- Each SW is registered with the correct URL and scope
- Both SWs can coexist when visiting different scopes
- SW selection works correctly based on pathname
- Caching works for both SWs

Run tests with:

```bash
npm run test:integration
```

## See Also

- [examples/pwa](../pwa) - Basic single SW example
- [Tramvai PWA Module](../../packages/modules/pwa) - PWA module implementation
