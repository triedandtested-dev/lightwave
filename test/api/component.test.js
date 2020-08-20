const Promise = require('promise');
const assert = require('assert');
const sinon = require('sinon');

const Client = require('../../api/client');
const ComponentFactory = require('../../api/component');

describe('A ReadOnlyComponent', () => {

  let component;
  let sClient;

  beforeEach(() => {
    // Stub client.
    sClient = sinon.createStubInstance(Client);
    // Create component factory.
    let factory = new ComponentFactory(sClient);
    // Create component.
    component = factory.create({
      featureId: 'component-id',
      type: 'name',
      writable: false,
    });
  });

  it('should return id.', () => {
    const expected = 'component-id';

    let actual = component.id;

    assert.strictEqual(actual, expected);
  });

  it('should return name.', () => {
    const expected = 'name';

    let actual = component.name;

    assert.strictEqual(actual, expected);
  });

  it('should return type.', () => {
    const expected = 'READ_ONLY_COMPONENT';

    let actual = component.type;

    assert.strictEqual(actual, expected);
  });

  it('should get value using client.', async() => {

    const expected = 200;

    sClient.getComponentValue.returns(Promise.resolve(expected));

    let actual = await component.get();

    assert.strictEqual(actual, expected);
    // Verify that method was called correctly.
    assert.strictEqual(sClient
      .getComponentValue
      .withArgs(component.id)
      .callCount, 1);
  });

  it('should throw error when get value fails.', async() => {

    const expected = {
      response: 'error has occurred.',
    };

    sClient.getComponentValue.returns(Promise.reject(expected));

    try {
      await component.get();
    } catch (err) {
      assert.strictEqual(err, expected);
    };

    // Verify that method was called correctly.
    assert.strictEqual(sClient
      .getComponentValue
      .withArgs(component.id)
      .callCount, 1);

  });
});

describe('A SmartComponent', () => {

  let component;
  let sClient;

  beforeEach(() => {
    // Stub client.
    sClient = sinon.createStubInstance(Client);
    // Create component factory.
    let factory = new ComponentFactory(sClient);
    // Create component.
    component = factory.create({
      featureId: 'component-id',
      type: 'name',
      writable: true,
    });
  });

  it('should return id.', () => {
    const expected = 'component-id';

    let actual = component.id;

    assert.strictEqual(actual, expected);
  });

  it('should return name.', () => {
    const expected = 'name';

    let actual = component.name;

    assert.strictEqual(actual, expected);
  });

  it('should return type.', () => {
    const expected = 'SMART_COMPONENT';

    let actual = component.type;

    assert.strictEqual(actual, expected);
  });

  it('should set a value using client.', async() => {

    sClient.setComponentValue.returns(Promise.resolve());

    const name = 'name';
    const expected = 200;

    let actual = await component.set(expected);

    assert.strictEqual(actual, `${name} set successfully.`);
    // Verify that method was called correctly.
    assert.strictEqual(sClient
      .setComponentValue
      .withArgs(component.id, expected)
      .callCount, 1);

  });

  it('should log error when set fails.', async() => {

    const expected = {
      response: 'error has occurred.',
    };

    sClient.setComponentValue.returns(Promise.reject(expected));

    const value = 200;

    try {
      await component.set(value);
    } catch (error) {
      assert.strictEqual(error, expected);
    }

    // Verify that method was called correctly.
    assert.strictEqual(sClient
      .setComponentValue
      .withArgs(component.id, value)
      .callCount, 1);
  });
});

describe('A ComponentFactory', () => {
  it('should return a SmartComponent when writable.', () => {

    const factory = new ComponentFactory(null);

    let data = {
      type: 'componentType',
      featureId: '465465-gr',
      writable: true,
    };

    let actual = factory.create(data).type;

    assert.strictEqual(actual, 'SMART_COMPONENT');

  });

  it('should return a ReadOnlyComponent when not writable.', () => {

    const factory = new ComponentFactory(null);

    let data = {
      type: 'componentType',
      featureId: '465465-gr',
      writable: false,
    };

    let actual = factory.create(data).type;

    assert.strictEqual(actual, 'READ_ONLY_COMPONENT');

  });

  it('should throw error when missing writable.', () => {

    const factory = new ComponentFactory(null);

    let data = {
      type: 'componentType',
      featureId: '465465-gr',
    };

    assert.throws(() => {
      factory.create(data);
    }, {name: 'Error', message: `Missing 'writable' property. ${data}.`});

  });
});
