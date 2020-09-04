
const DeviceFactory = require('./device');
const TRV = require('./trv');


const initializeDevices = function(json, client) {

  const devices = {
    heating: [],
  };

  const factory = new DeviceFactory(client);
  for (const device of json.devices) {

    if (device.productCode === TRV.PRODUCT_CODE) {
      devices.heating.push(factory.createDevice(device));
      continue;
    }

  }

  return devices;
};

class Structure {

  constructor(json, client) {
    this.json = json;
    this._client = client;
    this.devices = initializeDevices(json, client);
  }

  get id() {
    return this.json.groupId;
  }

  get name() {
    return this.json.name;
  }

};

module.exports = Structure;
