const Promise = require('promise');
const assert = require('assert');
const sinon = require('sinon');

const LightwaveRFClient = require('../../api/client');
const TRV = require('../../api/trv');

describe('TRV', () => {

  const expectedJson = {
    deviceId: '5a25aa67731bc3074196f431-44-3157329724+0',
    name: 'Master Heating',
    productCode: 'LW922',
    featureSets: [{
      featureSetId: '5a25aa67731bc3074196f431-5db88f7368e9d5071fde454f',
      name: 'Heating',
      features: [
        {
          featureId: '5a25aa67731bc3074196f431-171-3157329724+0',
          type: 'temperature',
          writable: false,
        },
        {
          featureId: '5a25aa67731bc3074196f431-172-3157329724+0',
          type: 'targetTemperature',
          writable: true,
        },
        {
          featureId: '5a25aa67731bc3074196f431-173-3157329724+0',
          type: 'valveLevel',
          writable: true,
        },
      ],
    }],
    product: 'LW922',
    device: 'valve',
    desc: 'TRV',
    type: 'lwrfTwoWay_v1',
    cat: 'Heating',
    gen: 1};

  let trv = new TRV(expectedJson);

  it('should throw error with more than one featureSet', () => {
    // Currently a TRV only supports one feature set.
    let invalid = {
      deviceId: '5a25aa67731bc3074196f431-44-3157329724+0',
      name: 'Master Heating',
      productCode: 'LW922',
      featureSets: [{}, {}]};

    assert.throws(() => {
      // eslint-disable-next-line no-new
      new TRV(invalid, null);
    }, Error('TRV can only have one feature set.'));
  });

  it('should return name.', () => {
    assert.strictEqual(trv.name, 'Master Heating');
  });

  it('should return id.', () => {
    assert.strictEqual(trv.id, '5a25aa67731bc3074196f431-44-3157329724+0');
  });

  it('should return product code.', () => {
    assert.strictEqual(TRV.PRODUCT_CODE, 'LW922');
  });

  it('should return json.', () => {
    assert.strictEqual(trv.json, expectedJson);
  });

  it('should return component.', () => {

    let expected = {
      featureId: '5a25aa67731bc3074196f431-171-3157329724+0',
      type: 'temperature',
      writable: false};

    assert.strictEqual(trv.components.temperature.id, expected.featureId);
    assert.strictEqual(trv.components.temperature.type, 'READ_ONLY_COMPONENT');
    assert.strictEqual(trv.components.temperature.name, expected.type);
  });

  it('should get status when components are retrieved.', async() => {

    let client = sinon.createStubInstance(LightwaveRFClient);
    client.getComponentValues.returns(Promise.resolve({
      '5a25aa67731bc3074196f431-172-3157329724+0': 'target-value',
      '5a25aa67731bc3074196f431-171-3157329724+0': 'temperature-value',
      '5a25aa67731bc3074196f431-173-3157329724+0': 'valve-value'},
    ));

    let trv = new TRV(expectedJson, client);
    let expected = {
      target: 'target-value',
      temperature: 'temperature-value',
      valveLevel: 'valve-value'};

    let status = await trv.status();

    assert.strictEqual(status.targetTemperature, expected.target);
    assert.strictEqual(status.temperature, expected.temperature);
    assert.strictEqual(status.valveLevel, expected.valveLevel);
  });

  it('should log error when status fails.', async() => {

    let client = sinon.createStubInstance(LightwaveRFClient);
    client.getComponentValues.returns(Promise.reject('An error has occurred.'));

    let trv = new TRV(expectedJson, client);

    try {
      await trv.status();
    } catch (error) {
      assert.strictEqual(error, 'An error has occurred.');
    }

  });
});
