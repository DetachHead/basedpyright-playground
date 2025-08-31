## Building the Server

> npm run build

## Running the Server

> node index.js

## Pyright Version Cache

The server caches downloaded versions of Pyright under `pyright_local`. To
limit disk usage, only the 20 most recently used versions are retained. When
this limit is exceeded, the least-recently-used version is removed
automatically. Usage information is persisted so the cache survives server
restarts.
