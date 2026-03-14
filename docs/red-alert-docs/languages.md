# Documentation

[Home](/)[Dashboard](/dashboard)
## Language Examples

### Choose your programming language:

### Installation - JavaScript/Node.js/Bun

bash
```
1# Install Socket.IO client2npm install socket.io-client3
4# For TypeScript support (optional)5npm install @types/socket.io-client
```

[📖 Official Socket.IO JavaScript Documentation](https://socket.io/docs/v4/client-api/)

### Code Example

javascript
```
1const io = require('socket.io-client');2
3// Connect to RedAlert4const socket = io('https://redalert.orielhaim.com', {5    auth: {6        apiKey: 'your-api-key-here'7    }8});9
10// Connection events11socket.on('connect', () => {12    console.log('Connected to RedAlert');13});14
15socket.on('disconnect', () => {16    console.log('Disconnected from RedAlert');17});18
19// Listen to all alerts (array of alerts)20socket.on('alert', (alerts) => {21    alerts.forEach(alert => {22        console.log(`🚨 ${alert.type?.toUpperCase()} Alert!`);23        console.log(`Title: ${alert.title}`);24        console.log(`Cities: ${alert.cities.join(', ')}`);25        console.log(`Instructions: ${alert.instructions}`);26        27        handleEmergencyAlert(alert);28    });29});30
31// Listen to specific alert types (single alert object)32socket.on('missiles', (alert) => {33    console.log(`🚨 MISSILE Alert!`);34    console.log(`Title: ${alert.title}`);35    console.log(`Cities: ${alert.cities.join(', ')}`);36    console.log(`Instructions: ${alert.instructions}`);37    showMissileAlert(alert.cities, alert.instructions);38});39
40socket.on('endAlert', (alert) => {41    console.log(`🚨 END EVENT`);42    console.log(`Title: ${alert.title}`);43    console.log(`Cities: ${alert.cities.join(', ')}`);44    console.log(`Instructions: ${alert.instructions}`);45    showEndAlert(alert.cities, alert.instructions);46});47
48function handleEmergencyAlert(alert) {49    // Your emergency response logic here50    switch(alert.type) {51        case 'missiles':52            showMissileAlert(alert.cities, alert.instructions);53            break;54        case 'earthQuake':55            showEarthquakeAlert(alert.cities, alert.instructions);56            break;57        // ... other alert types58    }59}
```
