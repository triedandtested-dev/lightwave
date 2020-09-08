# Client for LightwaveRF API (2.0)

![CI](https://github.com/triedandtested-dev/lightwave/workflows/Node.js%20CI/badge.svg)

```javascript
client = Client(config, cache);
let home = client.getStructureById('room-id');

home.heating[0].target.set(25);
```
