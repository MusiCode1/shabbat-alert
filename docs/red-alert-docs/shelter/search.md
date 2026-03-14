# Documentation

[Home](/)[Dashboard](/dashboard)
## Shelter Search

Find nearby shelters using geospatial search. This endpoint uses a spatial index (KDBush) for fast nearest-neighbor queries. Results are sorted by distance from the search center.

GET`/api/shelter/search`Find shelters near a given location

### Query Parameters

| Parameter | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| lat | number | Latitude of the search center (-90 to 90) | - | yes |
| lon | number | Longitude of the search center (-180 to 180) | - | yes |
| limit | integer | Maximum number of results to return (1-500) | 10 | no |
| radiusKm | number | Search radius in kilometers | unlimited | no |
| wheelchairOnly | boolean | Filter to only return wheelchair accessible shelters | false | no |
| shelterType | string | Filter by shelter type (e.g., "public", "private") | - | no |
| city | string | Filter by city name | - | no |

### Example Requests

Find 10 nearest shelters to Tel Aviv

bash
```
1GET /api/shelter/search?lat=32.0853&lon=34.7818
```

### Response Structure

| Field | Type | Description |
| --- | --- | --- |
| success | boolean | Whether the request was successful |
| count | number | Number of results returned |
| results[].id | number | Unique shelter identifier |
| results[].address | string | Street address of the shelter |
| results[].city | string | City name |
| results[].building_name | string | Building name or description |
| results[].lat | number | Latitude coordinate |
| results[].lon | number | Longitude coordinate |
| results[].distance_meters | number | Distance from search center in meters |
| results[].distance_km | number | Distance from search center in kilometers |
| results[].capacity | number | Maximum capacity of the shelter |
| results[].wheelchair_accessible | boolean | Whether the shelter has wheelchair access |
| results[].has_stairs | boolean | Whether there are stairs to access the shelter |
| results[].shelter_type | string | Type of shelter (e.g., public, private) |
| results[].shelter_type_he | string | Shelter type in Hebrew |
| results[].area_sqm | number | Shelter area in square meters |
| results[].is_official | boolean | Whether this is an official shelter |
| results[].notes | string | Additional notes about the shelter |

### Example Response

`GET /api/shelter/search?lat=32.0853&lon=34.7818`

json
```
1{2  "success": true,3  "count": 10,4  "results": [5    {6      "id": 1234,7      "address": "רחוב הרצל 15",8      "city": "תל אביב",9      "building_name": "מרכז קהילתי",10      "lat": 32.0861,11      "lon": 34.7892,12      "distance_meters": 250,13      "distance_km": 0.25,14      "capacity": 150,15      "wheelchair_accessible": true,16      "has_stairs": false,17      "shelter_type": "public",18      "shelter_type_he": "ציבורי",19      "area_sqm": 120,20      "is_official": true,21      "notes": "פתוח 24/7 בזמן חירום"22    },23    {24      "id": 1235,25      "address": "רחוב דיזנגוף 42",26      "city": "תל אביב",27      "building_name": "בניין מגורים",28      "lat": 32.0845,29      "lon": 34.7850,30      "distance_meters": 420,31      "distance_km": 0.42,32      "capacity": 50,33      "wheelchair_accessible": false,34      "has_stairs": true,35      "shelter_type": "private",36      "shelter_type_he": "פרטי",37      "area_sqm": 40,38      "is_official": false,39      "notes": null40    }41  ]42}
```

#### Distance Calculation

Distances are calculated using the Haversine formula and returned in both meters and kilometers. Results are sorted by distance in ascending order.

#### Shelter Types

Shelters can be either `public` (official, government-run) or`private`. The `is_official` field indicates official shelters. Private shelters may have restricted access.
