# Client for LightwaveRF API (2.0)
[![npm version](https://badge.fury.io/js/%40tandt%2Flightwave.svg)](https://badge.fury.io/js/%40tandt%2Flightwave)
[![codecov](https://codecov.io/gh/triedandtested-dev/lightwave/branch/master/graph/badge.svg)](https://codecov.io/gh/triedandtested-dev/lightwave)
![CI](https://github.com/triedandtested-dev/lightwave/workflows/CI/badge.svg)

```javascript
client = Client(config, cache);
let home = client.getStructureById('room-id');

home.heating[0].target.set(25);
```
