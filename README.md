# Client for LightwaveRF API (2.0)

```javascript
client = Client(config, cache);
let home = client.getStructureById('room-id');

home.heating[0].target.set(25);
```