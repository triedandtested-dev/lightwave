const assert = require('assert');
const fs = require('fs');

const Structure = require('../../api/structure');

describe('Structure unit tests', () => {

  let data = {};

  before(() => {
    let raw = fs.readFileSync('test/resources/structure.json');
    data = JSON.parse(raw);
  });

  it('should return name', () => {
    let expected = data.name;

    const structure = new Structure(data);

    assert.strictEqual(structure.name, expected);
  });

  it('should return id', () => {
    let expected = data.groupId;

    const structure = new Structure(data);

    assert.strictEqual(structure.id, expected);
  });

  it('should return heating devices', () => {

    const structure = new Structure(data);

    assert.strictEqual(structure.devices.heating.length, 3);

  });
});
