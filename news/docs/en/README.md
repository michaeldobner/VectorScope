# VectorScope News · Documentation

[Deutsche Version](../de/README.md) · [Back to the module](../../README.md)

This documentation describes the module NEWS: how to use it, which sources it reads, how reports become stories and what counts as important, how it is built and what happens with data. Why NEWS is built this way is in the [concept](../../KONZEPT.md) (German). Hosting, server and development of the collection are described in the [documentation of the collection](../../../docs/en/README.md).

| Document | Content | Audience |
|---|---|---|
| [User guide](user-guide.md) | Views, sections, stories, perspectives, 2-minute briefing, settings, what is new | Everyone |
| [Sources](sources.md) | The 35 feeds, groups and weights, the check in the lab, rejected candidates | Everyone |
| [Stories and importance](stories.md) | Grouping by meaning, sections, the three signals of importance, texts, pictures, translation | Everyone, development |
| [Architecture](architecture.md) | Collector on the server, one round, format of the edition, app, tests | Development |
| [Privacy and legal](privacy-and-legal.md) | Requests, storage, third party content, licences | Everyone |

## NEWS at a glance

| | |
|---|---|
| Purpose | The news of the day as stories, with the perspectives of many outlets side by side |
| Sources | 35 feeds from 29 outlets in 12 countries, each checked in the test lab |
| Views | Top, Other view, DE · CH · AT, World, Business, Tech, Science, Culture, Sport, 2-minute briefing |
| Updates | The collector on the own server builds a new edition every 10 minutes, the app asks every 5 minutes |
| Language | App in German or English, reports in German, English or the original |
| Perspective | German-speaking or global |
| Address | The own server, path `/news/` |
| Version | 0.1.1 |
