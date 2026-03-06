# Documentation

[Home](/)[Dashboard](/dashboard)
## Cities Statistics

Get a breakdown of alerts by city. By default, responses are lean - only city name, zone, and count. Use the `include` parameter to opt-in to extra fields like translations and coordinates, keeping bandwidth low when you don't need them.

GET`/api/stats/cities`Returns paginated city alert statistics

### Query Parameters

| Parameter | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| startDate | ISO 8601 | Filter alerts from this date onwards | all time | no |
| endDate | ISO 8601 | Filter alerts until this date | now | no |
| limit | integer | Number of cities to return (1–500) | 10 | no |
| offset | integer | Number of results to skip for pagination | 0 | no |
| search | string | Search by city name (partial match, 1–100 chars) | - | no |
| zone | string | Filter by zone/region name (exact match) | - | no |
| sort | enum | Sort results by field: count, city, or zone | count | no |
| order | enum | Sort direction: asc or desc | desc | no |
| include | string | Comma-separated list of optional fields: translations, coords | - (none) | no |

### The `include` Parameter

By default the response only contains `city`, `cityZone`, and `count`. Additional fields must be explicitly requested via the `include` parameter to minimize response size and database load.

| Value | Fields Added | Use Case | ~Size Impact |
| --- | --- | --- | --- |
| translations | `translations.name`, `translations.zone` (en, ru, ar) | Multi-language UIs | +~200 bytes/city |
| coords | `lat`, `lng` | Map rendering | +~30 bytes/city |

### Example Requests

Top 5 cities by alert count - minimal response, no extra fields

bash
```
1GET /api/stats/cities?limit=5
```

### Response Structure

Always included

| Field | Type | Description |
| --- | --- | --- |
| data[].city | string | City name in Hebrew |
| data[].cityZone | string | Zone/region the city belongs to |
| data[].count | number | Total number of alerts for this city |

Optional - requires `include`

| Field | Type | Description | include |
| --- | --- | --- | --- |
| data[].translations | object | Translated name & zone in en, ru, ar | translations |
| data[].lat | number | Latitude coordinate | coords |
| data[].lng | number | Longitude coordinate | coords |

Pagination

| Field | Type | Description |
| --- | --- | --- |
| pagination.total | number | Total number of matching cities |
| pagination.limit | number | Requested limit |
| pagination.offset | number | Requested offset |
| pagination.hasMore | boolean | Whether more results are available |

### Example Responses

`GET /api/stats/cities?limit=2` - no `include`, smallest possible response

json
```
1{2  "data": [3    {4      "city": "אזור",5      "cityZone": "דן",6      "count": 12697    },8    {9      "city": "בית דגן",10      "cityZone": "השפלה",11      "count": 126812    }13  ],14  "pagination": {15    "total": 1580,16    "limit": 2,17    "offset": 0,18    "hasMore": true19  }20}
```

#### include Parameter

By default, only `city`, `cityZone`, and `count` are returned. Add `include=translations` for multilingual names,`include=coords` for lat/lng, or `include=translations,coords` for both. This keeps responses fast and small when you don't need the extra data.

#### Search

Use `search` to filter cities by name with partial matching - for example, `search=אשק` will match **אשקלון**.

#### Zone Filtering

Use `zone` to narrow results to a specific region like `דן`, `השפלה`, or `הנגב`. Combine with `sort=city&order=asc` for an alphabetical list within a zone.

#### Sorting & Pagination

Sort by `count`, `city`, or `zone` with `order=asc/desc`. Use `limit` and `offset` for pagination - the `pagination` object in the response tells you `total` and `hasMore`.
