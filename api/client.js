const axios = require('axios');
const Promise = require('promise');

const Structure = require('./structure');

const sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

class LwRFClient {

  static get AUTH_ENDPOINT() { return 'https://auth.lightwaverf.com'; }
  static get API_ENDPOINT() { return 'https://publicapi.lightwaverf.com/v1'; }

  constructor(config, storage) {
    this.clientId = config.clientId;
    this.refreshToken = config.refreshToken;
    this.bearerToken = config.bearerToken;

    this.isAuthenticated = config.bearerToken !== undefined;

    this.isPersistant = storage !== undefined;
    this.storage = storage;

    this.validate();
  }

  validate() {
    if (this.clientId == null) {
      throw new Error('config requires clientId property.');
    }

    if (this.refreshToken == null) {
      throw new Error('config requires refreshToken property.');
    }
  }

  getBearerToken() {
    return axios({
      method: 'post',
      url: `${LwRFClient.AUTH_ENDPOINT}/token`,
      responseType: 'json',
      headers: {
        authorization: `basic ${this.clientId}`,
        'User-Agent': 'SmartThings Integration',
      },
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      },
    });
  }

  async authenticate() {
    try {
      console.log('Attempting to authenticate.');

      let response = await this.getBearerToken();

      this.bearerToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.isAuthenticated = true;

      if (this.isPersistant) {
        await this.storage.save({
          bearerToken: this.bearerToken,
          refreshToken: this.refreshToken,
          clientId: this.clientId,
        });
      }

      return {
        bearerToken: this.bearerToken,
        refreshToken: this.refreshToken,
        clientId: this.clientId,
      };

    } catch (err) {
      console.error(err);
    }
  }

  async api_call(method, url, payload, retries) {

    // Set default retries.
    retries = retries || 1;

    // Build request literal.
    let request = {
      method: method,
      url: url,
      responseType: 'json',
      headers: {
        authorization: `bearer ${this.bearerToken}`,
        'User-Agent': 'SmartThings Integration',
      },
    };
    // Append payload if specified.
    if (payload !== undefined) {
      request.data = payload;
    }

    try {
      if (!this.isAuthenticated) {
        console.debug('not authenticated, trying to authenticate.');
        await this.authenticate();
      }

      let response = await axios(request);
      // console.debug("response of request.", response);
      return response;

    } catch (error) {
      console.debug('error occurred', error);
      // Has max retries been reached.
      if (retries > 3) {
        let msg = `Max number of retries reached. (${retries} of 3 retries)`;
        console.error(msg);
        throw error;
      }
      // handle 401
      if (error.response.status === 401 &&
          error.response.data.message === 'Unauthorized') {

        console.debug('trying to reauthenticate');
        await this.authenticate();
        return await this.api_call(method, url, payload, retries++);
      }
      // log error and retry.
      console.error(error.response);
      console.log(`Retrying in 1 second. (${retries} of 3 retries)`);
      // sleep before retrying.
      await sleep(1000);
      return await this.api_call(method, url, payload, retries++);
    }
  }

  // TODO
  // async getStructureList() {

  //   if (this.bearerToken == null) {
  //     let config = await this.authenticate();
  //     return this._structures(config.bearerToken);
  //   }

  //   return this._structures(this.bearerToken);
  // }

  getStructureById(id) {
    return new Promise((resolve, reject) => {

      let url = `${LwRFClient.API_ENDPOINT}/structure/${id}`;

      this.api_call('get', url)
        .then(response => {
          let structure = new Structure(response.data, this);
          resolve(structure);
        })
        .catch(err => {
          reject(err.response);
        });
    });
  }

  setComponentValue(id, value) {
    return new Promise((resolve, reject) => {

      let url = `${LwRFClient.API_ENDPOINT}/feature/${id}`;
      let payload = {
        value: value,
      };

      this.api_call('post', url, payload)
        .then(response => {
          resolve('done');
        })
        .catch(err => {
          reject(err.response);
        });
    });
  }

  getComponentValue(id) {
    return new Promise((resolve, reject) => {

      let url = `${LwRFClient.API_ENDPOINT}/feature/${id}`;

      this.api_call('get', url)
        .then(response => {
          resolve(response.data.value);
        })
        .catch(err => {
          reject(err.response);
        });
    });
  }

  /*
    features = [
        {
          "featureId": "5a05bcdc52da8d5663eb4ffb-14-3157329463+0"
        }
    ]
     */
  getComponentValues(features) {
    return new Promise((resolve, reject) => {

      let url = `${LwRFClient.API_ENDPOINT}/features/read`;
      let payload = {
        features: features,
      };

      this.api_call('post', url, payload)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err.response);
        });
    });
  }

  /*
    features = [
        {
          "featureId": "5a05bcdc52da8d5663eb4ffb-14-3157329463+0"
          "value": 120
        }
    ]
     */
  setComponentValues(features) {
    return new Promise((resolve, reject) => {

      let url = `${LwRFClient.API_ENDPOINT}/features/write`;
      let payload = {
        features: features,
      };

      this.api_call('post', url, payload)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err.response);
        });
    });
  }
};

module.exports = LwRFClient;
