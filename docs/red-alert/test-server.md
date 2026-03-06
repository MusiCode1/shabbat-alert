# Documentation

[Home](/)[Dashboard](/dashboard)
## Test Server & Simulation

### Development & Testing Environment

We provide a dedicated `/test` namespace designed for developing and testing your integration. This environment allows you to simulate various alert scenarios without waiting for real-world events.

#### Custom Timing

Control how often alerts are generated (e.g., every 5 seconds, 1 minute).

#### Alert Filtering

Choose exactly which alert types to receive (e.g., only missiles).

#### City Targeting

Specify target cities to simulate alerts for your specific location.

### Configuration Parameters

Pass these parameters in the `query` object or as `headers` when connecting.

| Parameter | Description | Example |
| --- | --- | --- |
| timing | Interval between alerts (min 1s) | "5s", "1m", "30s" |
| alerts | Comma-separated alert types | "missiles,earthQuake" |
| cities | Comma-separated target cities | "Tel Aviv, Haifa" |

### Connection Examples

#### 1. Quick Start

Connects to the test namespace with default settings (random alerts every 5 seconds).

javascript
```
1const socket = io('https://redalert.orielhaim.com/test');2
3socket.on('alert', (alerts) => {4    console.log('Received test alerts:', alerts);5});
```

#### 2. Targeted Scenario

Simulate a specific scenario: Missile attacks on Tel Aviv and Haifa, occurring every 10 seconds.

javascript
```
1const socket = io('https://redalert.orielhaim.com/test', {2    query: {3        timing: '10s',4        alerts: 'missiles',5        cities: 'Tel Aviv, Haifa'6    }7});8
9// The server will generate missile alerts targeting Tel Aviv, Haifa, or both.10socket.on('alert', (alerts) => {11    console.log('Simulation update:', alerts);12});
```

#### 3. Multi-Type Simulation

Simulate multiple disaster types (Earthquakes and Tsunamis) with random timing (1-5 minutes).

javascript
```
1const socket = io('https://redalert.orielhaim.com/test', {2    query: {3        timing: '1m-5m',4        alerts: 'earthQuake,tsunami',5        cities: 'Eilat, Tiberias, Haifa'6    }7});
```
