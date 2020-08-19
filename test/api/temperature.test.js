const assert = require('assert');

const Temperature = require('../../api/temperature');

describe('A Temperature component', () => {

  const data = {
    featureId: '5a25aa677+0',
    type: 'temperature',
    writable: false};

  let component = new Temperature(data);

  it('should return json representation.', () => {
    const expected = data;

    assert.strictEqual(component.json, expected);
  });

  it('should return id.', () => {
    let expected = data.featureId;

    assert.strictEqual(component.id, expected);
  });

  it('should return name.', () => {
    let expected = Temperature.TYPE;

    assert.strictEqual(component.name, expected);
  });

  it('should return TYPE.', () => {
    let expected = data.type;

    assert.strictEqual(Temperature.TYPE, expected);
  });
});
