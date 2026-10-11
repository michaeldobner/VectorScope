# Privacy and legal

[Deutsche Version](../de/datenschutz-und-recht.md) · [Overview](README.md)

## What leaves the device

| Request | To | Contains |
|---|---|---|
| The edition | The own server, `/data/news.json` | Nothing, the file is the same for everyone |
| Pictures | The servers of the outlets | The usual request of a browser. The outlet sees the IP address but no referring page, NEWS sends no referrer |
| Articles | The outlet, when you open an article | Like any visit to a website |

NEWS uses no location, no account, no ads and no analytics.

## What stays on the device

In `localStorage` of the server's address, every key starts with `vectorscope.news.`:

| Key | Content |
|---|---|
| `ui`, `msg`, `persp`, `view` | The settings |
| `seen` | Ids of opened stories, only those of the current edition |
| `visit` | Time of the last visit |
| `counts` | Number of sources per story at the last visit, for "+3 sources" |
| `edition` | The last edition, for starting without a connection |

Clearing the website data in Safari removes everything.

## What the server stores

Only public reports of the outlets: the current edition, translations of headlines and teasers for seven days, picture addresses for three days, the state of the feeds. The collector stores nothing about users. Full texts are neither read nor stored.

## Third party content

NEWS shows headlines, short teasers and preview pictures as the outlets provide them in their feeds and pages, with the name of the outlet and a link to the original. Pictures are not copied but loaded from the outlet. The full text stays with the outlet. The rights to the content belong to the respective outlets. NEWS is a personal, non-commercial project.

Translated titles are marked as translated, the original is one tap away. Translation uses DeepL or the Google endpoint.

## Licences

| Part | Licence |
|---|---|
| Code of VectorScope | MIT, see [LICENSE](../../../LICENSE) |
| Model `paraphrase-multilingual-MiniLM-L12-v2` | Apache 2.0 |
| Fonts Inter and Newsreader | SIL Open Font License 1.1 |
| Headlines, teasers, pictures | with the respective outlets |
