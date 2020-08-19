const Promise = require('promise');
const assert = require('assert');
const sinon = require('sinon');

const Client = require('../../api/client');
const {
  BaseComponent,
  ReadOnlyComponent,
  SmartComponent} = require('../../api/component');


describe('A BaseComponent', () => {
  it('should return id.', () => {
    const expected = 'component-id';
    const component = new BaseComponent('name', expected);

    let actual = component.id;

    assert.strictEqual(actual, expected);
  });

  it('should return name.', () => {
    const expected = 'name';
    const component = new BaseComponent(expected, 'component-id');

    let actual = component.name;

    assert.strictEqual(actual, expected);
  });
});

describe('A ReadOnlyComponent', () => {
  it('should get value using client.', async() => {

    const expected = 200;

    let client = sinon.createStubInstance(Client);
    client.getComponentValue.returns(Promise.resolve(expected));

    let component = new ReadOnlyComponent('name', 'component-id', client);

    let actual = await component.get();

    assert.strictEqual(actual, expected);
    // Verify that method was called correctly.
    assert.strictEqual(client
      .getComponentValue
      .withArgs(component.id)
      .callCount, 1);
  });

  it('should throw error when get value fails.', async() => {

    const expected = {
      response: 'error has occurred.',
    };

    let client = sinon.createStubInstance(Client);
    client.getComponentValue.returns(Promise.reject(expected));

    let component = new ReadOnlyComponent('name', 'component-id', client);

    try {
      await component.get();
    } catch (err) {
      assert.strictEqual(err, expected);
    };

    // Verify that method was called correctly.
    assert.strictEqual(client
      .getComponentValue
      .withArgs(component.id)
      .callCount, 1);

  });
});

describe('A SmartComponent', () => {

  it('should set a value using client.', async() => {

    let client = sinon.createStubInstance(Client);
    client.setComponentValue.returns(Promise.resolve());

    const name = 'name';
    const expected = 200;

    let component = new SmartComponent(name, 'component-id', client);

    let actual = await component.set(expected);

    assert.strictEqual(actual, `${name} set successfully.`);
    // Verify that method was called correctly.
    assert.strictEqual(client
      .setComponentValue
      .withArgs(component.id, expected)
      .callCount, 1);

  });

  it('should log error when set fails.', async() => {

    const expected = {
      response: 'error has occurred.',
    };

    let client = sinon.createStubInstance(Client);
    client.setComponentValue.returns(Promise.reject(expected));

    const value = 200;

    let component = new SmartComponent('name', 'component-id', client);

    try {
      await component.set(value);
    } catch (error) {
      assert.strictEqual(error, expected);
    }

    // Verify that method was called correctly.
    assert.strictEqual(client
      .setComponentValue
      .withArgs(component.id, value)
      .callCount, 1);
  });
});
