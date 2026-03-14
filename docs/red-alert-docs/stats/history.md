# Documentation

[Home](/)[Dashboard](/dashboard)
## History Statistics

Retrieve detailed historical records of alerts with full city data. Each alert includes the list of cities that were targeted simultaneously. By default, only city IDs and names are returned - use the `include` parameter to add translations and coordinates as needed.

GET`/api/stats/history`Returns paginated alert history with nested city data

### Query Parameters

| Parameter | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| startDate | ISO 8601 | Filter alerts from this date onwards | all time | no |
| endDate | ISO 8601 | Filter alerts until this date | now | no |
| limit | integer | Number of alerts to return (1–100) | 20 | no |
| offset | integer | Number of results to skip for pagination | 0 | no |
| cityId | integer | Filter by city ID (exact match) | - | no |
| cityName | string | Filter by city name in Hebrew (exact match) | - | no |
| search | string | Search by city name (partial match, 1–100 chars) | - | no |
| category | string | Filter by alert type (e.g. missiles, drones, earthquakes) | - | no |
| sort | enum | Sort results by field: timestamp or type | timestamp | no |
| order | enum | Sort direction: asc or desc | desc | no |
| include | string | Comma-separated optional fields: translations, coords | - (none) | no |

### The `include` Parameter

By default, each city in the `cities` array only contains `id` and `name`. Use `include` to opt-in to additional fields. This significantly reduces response size when you don't need translations or coordinates.

| Value | Fields Added to Each City | Use Case |
| --- | --- | --- |
| translations | `translations.name` (en, ru, ar) | Multi-language alert feeds |
| coords | `lat`, `lng` | Plotting alerts on a map |

### City Filter Priority

Three parameters filter by city: `cityId`, `cityName`, and `search`. Only one is applied at a time, in this priority order:

cityId→cityName→search
### Example Requests

Latest 20 alerts - minimal response

bash
```
1GET /api/stats/history
```

### Response Structure

Always included

| Field | Type | Description |
| --- | --- | --- |
| data[].id | number | Unique alert ID |
| data[].timestamp | string | ISO 8601 timestamp of the alert |
| data[].type | string | Alert category (e.g. missiles, drones) |
| data[].cities[].id | number | City ID |
| data[].cities[].name | string | City name in Hebrew |

Optional - requires `include`

| Field | Type | Description | include |
| --- | --- | --- | --- |
| data[].cities[].translations | object | Translated name in en, ru, ar | translations |
| data[].cities[].lat | number | Latitude coordinate | coords |
| data[].cities[].lng | number | Longitude coordinate | coords |

Pagination

| Field | Type | Description |
| --- | --- | --- |
| pagination.total | number | Total number of matching alerts |
| pagination.limit | number | Requested limit |
| pagination.offset | number | Requested offset |
| pagination.hasMore | boolean | Whether more results are available |

### Example Responses

`GET /api/stats/history?limit=2` - no `include`, lean response

json
```
1{2  "data": [3    {4      "id": 10523,5      "timestamp": "2023-11-15T14:30:00.000Z",6      "type": "missiles",7      "cities": [8        {9          "id": 45,10          "name": "תל אביב - יפו"11        },12        {13          "id": 46,14          "name": "רמת גן"15        }16      ]17    },18    {19      "id": 10522,20      "timestamp": "2023-11-15T14:25:00.000Z",21      "type": "missiles",22      "cities": [23        {24          "id": 12,25          "name": "אשדוד"26        }27      ]28    }29  ],30  "pagination": {31    "total": 5420,32    "limit": 2,33    "offset": 0,34    "hasMore": true35  }36}
```

#### include Parameter

By default, each city only has `id` and `name`. Add `include=translations` for multilingual names,`include=coords` for lat/lng, or `include=translations,coords` for both. Keeping it lean saves significant bandwidth on large history queries.

#### Nested Cities

Each alert contains a `cities` array because a single alert event often targets multiple locations simultaneously. The same city can appear across many different alerts.

#### Date Range

Use `startDate` and `endDate` together to query specific time windows - for example, a single day of conflict or a specific military operation. Both accept ISO 8601 format.

#### City Filters

Three ways to filter by city: `cityId` for exact ID lookup,`cityName` for exact Hebrew name match, and `search` for partial name matching. Only one applies at a time - `cityId` takes highest priority.
