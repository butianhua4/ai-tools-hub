# Platform Data Import

Put only real platform exports in this directory. The monitoring code treats missing files as missing data and does not invent traffic.

Supported files:

- `gsc-performance.csv`: Google Search Console Performance export. Expected columns can include `Page`, `URL`, `Clicks`, `Impressions`, `CTR`, `Position`.
- `bing-performance.csv`: Bing Webmaster Tools performance export. Expected columns can include `Top pages`, `URL`, `Clicks`, `Impressions`, `CTR`, `Average position`.
- `ahrefs-site-audit.json`: Ahrefs Webmaster Tools audit summary, for example:

```json
{
  "healthScore": 92,
  "crawledPages": 1539,
  "errors": 0,
  "warnings": 3
}
```

- `cloudflare-web-analytics.json`: Cloudflare Web Analytics summary, for example:

```json
{
  "visits": 120,
  "pageViews": 310,
  "uniques": 88
}
```

After adding real exports, check:

- `/admin/system-live`
- `/admin/seo-growth`
- `/api/seo/performance`

