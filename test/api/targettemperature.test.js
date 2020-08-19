const assert = require('assert');

const TargetTemperature = require('../../api/targettemperature');

describe('A TargetTemperature component', () => {

  const data = {
    featureId: '5a25aa6+0',
    type: 'targetTemperature',
    writable: true};

  let component = new TargetTemperature(data);

  it('should return json representation.', () => {
    const expected = data;

    assert.strictEqual(component.json, expected);
  });

  it('should return id.', () => {
    const expected = data.featureId;

    assert.strictEqual(component.id, expected);
  });

  it('should return name.', () => {
    const expected = TargetTemperature.TYPE;

    assert.strictEqual(component.name, expected);
  });

  it('should return TYPE.', () => {
    const expected = data.type;

    assert.strictEqual(TargetTemperature.TYPE, expected);
  });

});
