# Documentation

[Home](/)[Dashboard](/dashboard)
## Quick Start

1
### Get Your API Key

Request your free API key from the [main page](/). You'll receive it within minutes via email.

2
### Install Socket.IO Client

RedAlert uses Socket.IO for real-time communication. Install the client for your language:

####  JavaScript/Node.js

bash
```
1npm install socket.io-client
```

####  Python

bash
```
1pip install python-socketio
```

For other languages, visit the official [Socket.IO documentation ](https://socket.io/docs/v4/)

3
### Connect and Listen

Connect to the RedAlert server and start receiving alerts:

javascript
```
1const io = require('socket.io-client');2
3const socket = io('https://redalert.orielhaim.com', {4    auth: {5        apiKey: 'your-api-key-here'6    }7});8
9// Listen to all alerts (returns array of alerts)10socket.on('alert', (alerts) => {11    alerts.forEach(alert => {12        console.log(`New ${alert.type} alert:`, alert);13        // Handle each alert14    });15});16
17// Or listen to specific alert types (returns single alert object)18socket.on('missiles', (alert) => {19    console.log('Missile alert:', alert);20});21
22socket.on('endAlert', (alert) => {23    console.log('End event:', alert);24});
```

#### Test Server Available

Start building immediately without an API key. Our simulation environment lets you test your integration against various scenarios, timing configurations, and location targets.

javascript
```
1const io = require('socket.io-client');2
3// Connect to test server - no API key required!4const socket = io('https://redalert.orielhaim.com/test');5
6socket.on('alert', (alerts) => {7    alerts.forEach(alert => {8        console.log('Test alert:', alert);9        // This will trigger every 5 seconds with demo data10    });11});
```

The test server is perfect for development and testing your integration before using the production API.
