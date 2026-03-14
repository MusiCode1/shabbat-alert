# Documentation

[Home](/)[Dashboard](/dashboard)
## API Reference

### Alert Data Structure

#### General "alert" Event (Array of Alerts)

When listening to the general "alert" event, you'll receive an array of alert objects:

json
```
1[2  {3    "type": "missiles",4    "title": "Rocket/Missile Alert",5    "cities": ["Tel Aviv", "Jerusalem", "Haifa"],6    "instructions": "Take cover in a safe location"7  }8]
```

#### Specific Alert Type Events (Single Alert Object)

When listening to specific alert type events (e.g., "missiles", "earthQuake"), you'll receive a single alert object:

json
```
1{2  "type": "missiles",3  "title": "Rocket/Missile Alert",4  "cities": ["Tel Aviv", "Jerusalem", "Haifa"],5  "instructions": "Take cover in a safe location"6}
```

#### Field Descriptions

`type`Alert type (see alert types section)

`title`Official alert title

`cities`Array of city names targeted by the alert

`instructions`Official instructions for the population (from "desc" field)
