const TRV = require('./trv');

const validateDevice = function(json) {

  if (json.productCode === undefined) {
    throw new Error('productCode property required.');
  }

  if (json.featureSets === undefined) {
    throw new Error('featureSets property required.');
  }

  if (json.name === undefined) {
    throw new Error('name property required.');
  }

  if (json.deviceId === undefined) {
    throw new Error('deviceId property required.');
  }
};

class DeviceFactory {
  constructor(client) {
    this._client = client;
  }

  createDevice(json) {

    validateDevice(json);

    const code = json.productCode;

    if (code === TRV.PRODUCT_CODE) {
      return new TRV(json, this._client);
    }

    throw new Error(`Unable to create device with product code ${code}.`);
  }
}

module.exports = DeviceFactory;
