const assert = require('assert');

const DeviceFactory = require('../../api/device');
const TRV = require('../../api/trv');

describe('A DeviceFactory', () => {

  const factory = new DeviceFactory(null);

  it('should throw with no productCode property.', () => {

    assert.throws(() => {
      factory.createDevice({
        featureSets: [{features: []}],
        name: 'name',
        deviceId: 'id',
      });
    }, Error('productCode property required.'));
  });

  it('should throw with no featureSets property.', () => {

    assert.throws(() => {
      factory.createDevice({
        productCode: 'code',
        name: 'name',
        deviceId: 'id',
      });
    }, Error('featureSets property required.'));
  });

  it('should throw with no name property.', () => {

    assert.throws(() => {
      factory.createDevice({
        productCode: 'code',
        featureSets: [{features: []}],
        deviceId: 'id',
      });
    }, Error('name property required.'));
  });

  it('should throw with no deviceId property.', () => {

    assert.throws(() => {
      factory.createDevice({
        productCode: 'code',
        featureSets: [{features: []}],
        name: 'name',
      });
    }, Error('deviceId property required.'));
  });

  it('should create TRV device.', () => {

    let actual = factory.createDevice({
      productCode: TRV.PRODUCT_CODE,
      featureSets: [{features: []}],
      name: 'name',
      deviceId: 'id',
    });

    assert(actual instanceof TRV);
  });

  it('should throw with unknown product code.', () => {

    assert.throws(() => {
      factory.createDevice({
        productCode: 'UNKNOWN',
        featureSets: [{features: []}],
        name: 'name',
        deviceId: 'id',
      });
    }, Error('Unable to create device with product code UNKNOWN.'));
  });
});
