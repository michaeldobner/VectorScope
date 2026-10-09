# VectorScope · Documentation

[Deutsche Version](../de/README.md) · [Back to the project](../../README.md)

This documentation describes the VectorScope collection as a whole: how the repository is built, how it is published, how to develop in it and where it is heading. Every module has its own documentation for its features.

## Collection

| Document | Contents | Audience |
|---|---|---|
| [Architecture](architecture.md) | Repository structure, module registry, shared shell, build, addresses, service worker scopes, storage | Development |
| [Development](development.md) | Setup, scripts, unit tests, repository checks, smoke test, test lab, releases, adding a module, conventions | Development |
| [Deployment](deployment.md) | GitHub Pages, CORS proxy on Vercel, updates on devices, troubleshooting | Operations |
| [Own server](server.md) | App, proxy, collector, database and raw archive on an own server with Coolify, setup, switching over, operations | Operations |
| [Roadmap](roadmap.md) | What is next, what needs a server, what is deferred | Everyone |

## Modules

| Module | Documentation |
|---|---|
| AIR · Airspace | [User guide](../../air/docs/en/user-guide.md), [Calculations](../../air/docs/en/calculations.md), [Data sources](../../air/docs/en/data-sources.md), [Design](../../air/docs/en/design.md), [Architecture](../../air/docs/en/architecture.md), [Development](../../air/docs/en/development.md), [Privacy and legal](../../air/docs/en/privacy-and-legal.md) |
| INTEL · Intelligence feed | [User guide](../../intel/docs/en/user-guide.md), [Sources](../../intel/docs/en/sources.md), [Matching](../../intel/docs/en/matching.md), [Architecture](../../intel/docs/en/architecture.md), [Privacy and legal](../../intel/docs/en/privacy-and-legal.md) |
| [Shared shell](../../shared/README.md) | Tokens, hub styles, icons, fonts |

## VectorScope at a glance

| | |
|---|---|
| Purpose | Personal live situational awareness, one module per question |
| Modules | AIR live, INTEL live |
| Platform | Progressive web apps for iPhone and iPad, run in every modern browser |
| Hosting | GitHub Pages, proxy on Vercel |
| Privacy | No account, no server-side storage, location only on the device |
| Address | https://michaeldobner.github.io/VectorScope/ |
| Version | 0.19.0 |
