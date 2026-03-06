# Documentation

[Home](/)[Dashboard](/dashboard)
## Distribution Statistics

Get the distribution of alerts by type (category). Useful for understanding the nature of threats over time, building pie charts, and calculating the percentage breakdown of alert types. The response includes `totalAlerts` so you can compute percentages client-side without extra requests.

GET`/api/stats/distribution`Returns alert count breakdown by category

### Query Parameters

| Parameter | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| startDate | ISO 8601 | Filter alerts from this date onwards | all time | no |
| endDate | ISO 8601 | Filter alerts until this date | now | no |
| category | string | Filter by specific alert type (exact match) | - | no |
| limit | integer | Number of categories to return (1–100) | 50 | no |
| offset | integer | Number of results to skip for pagination | 0 | no |
| sort | enum | Sort results by field: count or category | count | no |
| order | enum | Sort direction: asc or desc | desc | no |

### Example Requests

Full distribution of all alert types, sorted by count

bash
```
1GET /api/stats/distribution
```

### Response Structure

Data

| Field | Type | Description |
| --- | --- | --- |
| data[].category | string | Alert type identifier |
| data[].count | number | Total number of alerts of this type |

Meta & Pagination

| Field | Type | Description |
| --- | --- | --- |
| totalAlerts | number | Sum of all counts in the current result - useful for calculating percentages client-side |
| pagination.total | number | Total number of distinct categories matching the filters |
| pagination.limit | number | Requested limit |
| pagination.offset | number | Requested offset |
| pagination.hasMore | boolean | Whether more results are available |

### Example Response

json
```
1{2  "data": [3    {4      "category": "missiles",5      "count": 125006    },7    {8      "category": "hostileAircraftIntrusion",9      "count": 32010    },11    {12      "category": "earthQuake",13      "count": 514    }15  ],16  "totalAlerts": 12825,17  "pagination": {18    "total": 3,19    "limit": 50,20    "offset": 0,21    "hasMore": false22  }23}
```

#### Categories

The `category` field matches the alert types documented in the [Alert Types](/docs/alert-types) section. Use the `category` parameter to filter for a specific type.

#### Calculating Percentages

The `totalAlerts` field in the response is the sum of all `count` values. Divide any category's count by `totalAlerts` to get its percentage - no extra API call needed.

#### Date Filtering

Combine `startDate` and `endDate` to analyze distribution for specific campaigns or periods of conflict. For example, compare threat composition before and after a specific date.

#### Sorting & Pagination

Sort by `count` or `category` with `order=asc/desc`. Use `limit` and `offset` for pagination - check `hasMore` to know if additional pages exist.
