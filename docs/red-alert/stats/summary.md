# Documentation

[Home](/)[Dashboard](/dashboard)
## Summary Statistics

High-level overview of the alert system. By default returns core counts and unique city/zone numbers. Use the `include` parameter to opt-in to top cities, top zones, a time-series timeline, and peak-hour detection - perfect for building dashboards with a single API call.

GET`/api/stats/summary`Returns aggregated alert statistics with optional sections

### Query Parameters

| Parameter | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| startDate | ISO 8601 | Filter data from this date onwards | all time | no |
| endDate | ISO 8601 | Filter data until this date | now | no |
| include | string | Comma-separated optional sections: topCities, topZones, timeline, peak | - (none) | no |
| topLimit | integer | Number of items in topCities / topZones (1–50) | 5 | no |
| timelineGroup | enum | Grouping interval for timeline: hour, day, week, or month | day | no |

### The `include` Parameter

Each value adds an optional section to the response. Combine multiple with commas: `include=topCities,timeline,peak`. Only requested sections are computed - keeping the default response fast.

| Value | Fields Added | Use Case | Controlled By |
| --- | --- | --- | --- |
| topCities | topCities[] - city, zone, count | Leaderboard of most targeted cities | topLimit |
| topZones | topZones[] - zone, count | Regional breakdown | topLimit |
| timeline | timeline[] - period, count | Charts and time-series graphs | timelineGroup |
| peak | peak - period, count | Identify the busiest hour in range | - |

### Timeline Grouping Formats

When using `include=timeline`, the `timelineGroup` parameter controls the bucket size and the format of the `period` field.

| timelineGroup | Period Format | Recommended For |
| --- | --- | --- |
| hour | 2024-12-01T14:00:00Z | Hourly buckets - best for short ranges (1–7 days) |
| day | 2024-12-01 | Daily buckets - best for weeks to months |
| week | 2024-W48 | Weekly buckets - best for months to a year |
| month | 2024-12 | Monthly buckets - best for long-term trends |

### Example Requests

Core stats only - totals, unique cities and zones

bash
```
1GET /api/stats/summary
```

### Response Structure

Always included

| Field | Type | Description |
| --- | --- | --- |
| totals.range | number | Total alerts in the requested date range (or all time) |
| totals.last24h | number | Alerts in the last 24 hours |
| totals.last7d | number | Alerts in the last 7 days |
| totals.last30d | number | Alerts in the last 30 days |
| uniqueCities | number | Number of distinct cities with alerts in range |
| uniqueZones | number | Number of distinct zones with alerts in range |

Optional - requires `include`

| Field | Type | Description | include |
| --- | --- | --- | --- |
| topCities[].city | string | City name | topCities |
| topCities[].zone | string | Zone the city belongs to | topCities |
| topCities[].count | number | Alert count for this city | topCities |
| topZones[].zone | string | Zone name | topZones |
| topZones[].count | number | Alert count for this zone | topZones |
| timeline[].period | string | Time bucket label (format depends on timelineGroup) | timeline |
| timeline[].count | number | Alert count in this period | timeline |
| peak.period | string | The peak hour (ISO format) | peak |
| peak.count | number | Alert count during the peak hour | peak |

### Example Responses

`GET /api/stats/summary` - no `include`, fastest possible response

json
```
1{2  "totals": {3    "range": 284500,4    "last24h": 312,5    "last7d": 2840,6    "last30d": 124007  },8  "uniqueCities": 1580,9  "uniqueZones": 4210}
```

#### include Parameter

By default only `totals`, `uniqueCities`, and `uniqueZones` are returned. Add `include=topCities,topZones,timeline,peak` to build a full dashboard - or request only what you need to keep it fast.

#### Timeline

The `timeline` section returns a time-series array perfect for charts. Control granularity with `timelineGroup` - from `hour` for detailed views to `month` for long-term trends.

#### Peak Detection

Use `include=peak` to find the single busiest hour in your date range. Great for highlighting critical moments in dashboards and reports.

#### Caching

Results are cached for 30 seconds. The `last24h`, `last7d`, and `last30d` counters are always calculated from the current time, regardless of `startDate`/`endDate` filters.
