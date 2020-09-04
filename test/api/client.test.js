const Promise = require('promise');
const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const Client = require('../../api/client');
const { Storage } = require('../../api/storage');

describe('A LwRFClient', () => {

  const config = {
    clientId: 'client-id-7878686',
    refreshToken: 'token-45454',
  };

  it('should throw error when config missing clientId.', () => {

    const config = {
      refreshToken: 'token-45454',
    };

    assert.throws(() => {
      // eslint-disable-next-line no-new
      new Client(config);
    }, Error('config requires clientId property.'));

  });

  it('should throw error when config missing refreshToken.', () => {

    const config = {
      clientId: 'id',
    };

    assert.throws(() => {
      // eslint-disable-next-line no-new
      new Client(config);
    }, Error('config requires refreshToken property.'));

  });

  it('should should not be persistant by default.', () => {

    const client = new Client(config);

    assert(client.isPersistant === false, 'should not be persistant.');

  });

  it('should should not be authenticated by default.', () => {

    const client = new Client(config);

    assert(client.isAuthenticated === false, 'should not be authenticated.');

  });

  it('should call bearer token correctly.', async() => {
    var mAxios = new MockAdapter(axios);
    const data = { response: true };
    mAxios.onPost(`${Client.AUTH_ENDPOINT}/token`).reply(200, data);

    const client = new Client(config);

    let response = await client.getBearerToken();

    const actual = response.config;

    assert.strictEqual(actual.url, `${Client.AUTH_ENDPOINT}/token`);
    // eslint-disable-next-line max-len
    assert.strictEqual(actual.data, `{"grant_type":"refresh_token","refresh_token":"${config.refreshToken}"}`);
    assert.strictEqual(actual.responseType, 'json');
    // eslint-disable-next-line max-len
    assert.strictEqual(actual.headers.authorization, `basic ${config.clientId}`);
    assert.strictEqual(actual.headers['User-Agent'], 'SmartThings Integration');

    assert.strictEqual(response.status, 200);
  });

  it('should authenticate correctly.', async() => {

    const client = new Client(config);
    // Stub getBearerToken method.
    const getBearerToken = sinon.stub(client, 'getBearerToken');
    getBearerToken.returns(Promise.resolve({
      data: {
        access_token: '<token>',
        refresh_token: '<refresh>',
      },
    }));

    const actual = await client.authenticate();

    sinon.assert.calledOnce(getBearerToken);

    // Is our client now authenticated?
    assert.strictEqual(client.isAuthenticated, true);
    // Verify returned properties.
    assert.strictEqual(actual.bearerToken, '<token>');
    assert.strictEqual(actual.refreshToken, '<refresh>');
    assert.strictEqual(actual.clientId, client.clientId);

  });

  it('should not fail if authenticate fails.', async() => {

    const client = new Client(config);
    // Stub getBearerToken method.
    const getBearerToken = sinon.stub(client, 'getBearerToken');
    getBearerToken.returns(Promise.reject());

    await client.authenticate();

    sinon.assert.calledOnce(getBearerToken);
  });

  it('should save after authentication if storage is provided.', async() => {

    // Create a Storage stub.
    const storage = sinon.createStubInstance(Storage);
    storage.save.returns = Promise.resolve('done');

    const client = new Client(config, storage);
    // Stub getBearerToken method.
    const getBearerToken = sinon.stub(client, 'getBearerToken');
    getBearerToken.returns(Promise.resolve({
      data: {
        access_token: '<token>',
        refresh_token: '<refresh>',
      },
    }));

    const expected = {
      bearerToken: '<token>',
      refreshToken: '<refresh>',
      clientId: client.clientId,
    };

    await client.authenticate();

    sinon.assert.calledWith(storage.save, expected);
  });

  it('should build api call request correctly.', async() => {
    var mAxios = new MockAdapter(axios);
    const data = { response: true };
    mAxios.onPost(`${Client.AUTH_ENDPOINT}/token`).reply(200, data);
    mAxios.onPost('test-url').reply(200, data);

    const client = new Client(config);

    var response = await client.api_call('post', 'test-url', {payload: 'test'});

    assert.strictEqual(response.config.url, 'test-url');
  });

  it('should get structure by id.', async() => {

    let raw = fs.readFileSync('test/resources/structure.json');
    const data = JSON.parse(raw);

    const id = 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0';
    const method = 'get';
    const url = `${Client.API_ENDPOINT}/structure/${id}`;

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.resolve({data: data}));

    await client.getStructureById(id);

    sinon.assert.calledWith(api_call, method, url);
  });

  it('should log error if get structure by id fails.', async() => {
    const id = 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0';
    const method = 'get';
    const url = `${Client.API_ENDPOINT}/structure/${id}`;

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.reject({response: 'error'}));

    try {
      await client.getStructureById(id);
    } catch (error) {
      assert.strictEqual(error, 'error');
    }
    sinon.assert.calledWith(api_call, method, url);

  });

  it('should set value correctly.', async() => {
    const id = 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0';
    const method = 'post';
    const url = `${Client.API_ENDPOINT}/feature/${id}`;
    const payload = {value: 10};

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.resolve({data: {value: 'test'}}));

    const actual = await client.setComponentValue(id, 10);

    sinon.assert.calledWith(api_call, method, url, payload);
    assert.strictEqual(actual, 'done');

  });

  it('should log error if set value fails.', async() => {
    const id = 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0';
    const method = 'post';
    const url = `${Client.API_ENDPOINT}/feature/${id}`;
    const payload = {value: 10};

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.reject({response: 'error'}));

    try {
      await client.setComponentValue(id, 10);
    } catch (error) {
      assert.strictEqual(error, 'error');
    }
    sinon.assert.calledWith(api_call, method, url, payload);

  });

  it('should get value correctly.', async() => {
    const id = 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0';
    const method = 'get';
    const url = `${Client.API_ENDPOINT}/feature/${id}`;

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.resolve({data: {value: 'test'}}));

    const actual = await client.getComponentValue(id);

    sinon.assert.calledWith(api_call, method, url);
    assert.strictEqual(actual, 'test');

  });

  it('should log error if get value fails.', async() => {
    const id = 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0';
    const method = 'get';
    const url = `${Client.API_ENDPOINT}/feature/${id}`;

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.reject({response: 'error'}));

    try {
      await client.getComponentValue(id);
    } catch (error) {
      assert.strictEqual(error, 'error');
    }
    sinon.assert.calledWith(api_call, method, url);

  });

  it('should get multiple values correctly.', async() => {
    const features = [
      { featureId: 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0'},
      { featureId: 'xxxxxxxxxxxxxxxx-15-xxxxxxxxx+0'},
    ];

    const method = 'post';
    const url = `${Client.API_ENDPOINT}/features/read`;
    const payload = {features: features};

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.resolve({data: 'test'}));

    const actual = await client.getComponentValues(features);

    sinon.assert.calledWith(api_call, method, url, payload);
    assert.strictEqual(actual, 'test');

  });

  it('should log error if get values fails.', async() => {
    const features = [
      { featureId: 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0'},
      { featureId: 'xxxxxxxxxxxxxxxx-15-xxxxxxxxx+0'},
    ];

    const method = 'post';
    const url = `${Client.API_ENDPOINT}/features/read`;
    const payload = {features: features};

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.reject({response: 'error'}));

    try {
      await client.getComponentValues(features);
    } catch (error) {
      assert.strictEqual(error, 'error');
    }
    sinon.assert.calledWith(api_call, method, url, payload);

  });

  it('should sets multiple values correctly.', async() => {
    const features = [
      { featureId: 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0', value: 120},
      { featureId: 'xxxxxxxxxxxxxxxx-15-xxxxxxxxx+0', value: 45},
    ];

    const method = 'post';
    const url = `${Client.API_ENDPOINT}/features/write`;
    const payload = {features: features};

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.resolve({data: 'test'}));

    const actual = await client.setComponentValues(features);

    sinon.assert.calledWith(api_call, method, url, payload);
    assert.strictEqual(actual, 'test');

  });

  it('should log error if sets values fails.', async() => {
    const features = [
      { featureId: 'xxxxxxxxxxxxxxxx-14-xxxxxxxxx+0', value: 120},
      { featureId: 'xxxxxxxxxxxxxxxx-15-xxxxxxxxx+0', value: 45},
    ];

    const method = 'post';
    const url = `${Client.API_ENDPOINT}/features/write`;
    const payload = {features: features};

    const client = new Client(config);
    // Stub api_call method.
    const api_call = sinon.stub(client, 'api_call');
    api_call.returns(Promise.reject({response: 'error'}));

    try {
      await client.setComponentValues(features);
    } catch (error) {
      assert.strictEqual(error, 'error');
    }
    sinon.assert.calledWith(api_call, method, url, payload);

  });

});
