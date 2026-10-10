# Cloudflare Radar check 2026-10-10T12:42:33.271Z

Token in the lab: no

| Request | HTTP | ms | Type | CORS | Start of the answer |
|---|---|---|---|---|---|
| outages, without token | 400 | 103 | application/json |  | {"success":false,"errors":[{"code":9106,"message":"Missing X-Auth-Key, X-Auth-Email or Authorization headers"}],"messages":[],"result":null}  |
| anomalies, without token | 400 | 67 | application/json |  | {"success":false,"errors":[{"code":9106,"message":"Missing X-Auth-Key, X-Auth-Email or Authorization headers"}],"messages":[],"result":null}  |
| annotations, without token | 400 | 35 | application/json |  | {"success":false,"errors":[{"code":9106,"message":"Missing X-Auth-Key, X-Auth-Email or Authorization headers"}],"messages":[],"result":null}  |

| Page | HTTP | ms | Type | Bytes | Hints |
|---|---|---|---|---|---|
| https://radar.cloudflare.com/outage-center | 403 | 29 | text/html; charset=UTF-8 | 5671 | mentions outage |
| https://radar.cloudflare.com/outage-center.rss | 403 | 20 | text/html; charset=UTF-8 | 5683 | mentions outage |
| https://radar.cloudflare.com/rss | 403 | 17 | text/html; charset=UTF-8 | 5620 |  |
| https://blog.cloudflare.com/tag/outage/rss/ | 200 | 63 | application/rss+xml; charset=utf-8 | 506808 | feed, mentions outage |
| https://blog.cloudflare.com/tag/cloudflare-radar/rss/ | 200 | 40 | application/rss+xml; charset=utf-8 | 511382 | feed, mentions outage |
