const assert = require('assert');

const Battery = require('../../api/battery');

describe('A Battery component', () => {

  const data = {
    featureId: '5a25aa67+0',
    type: 'batteryLevel',
    writable: false};

  let component = new Battery(data);

  it('should return json representation.', () => {
    const expected = data;

    assert.strictEqual(component.json, expected);
  });

  it('should return id.', () => {
    let expected = data.featureId;

    assert.strictEqual(component.id, expected);
  });

  it('should return name.', () => {
    let expected = Battery.TYPE;

    assert.strictEqual(component.name, expected);
  });

  it('should return TYPE.', () => {
    let expected = data.type;

    assert.strictEqual(Battery.TYPE, expected);
  });
});
