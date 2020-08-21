const Promise = require('promise');

const ComponentFactory = require('./component');

class TRV {

  static get PRODUCT_CODE() { return 'LW922'; }

  constructor(json, client) {
    this._json = json;
    this._client = client;
    // initialize component map.
    this.components = {};

    if (json.featureSets.length > 1) {
      throw new Error('TRV can only have one feature set.');
    }

    const factory = new ComponentFactory(client);
    for (const feature of json.featureSets[0].features) {
      this.components[feature.type] = factory.create(feature);
    }
  }

  get id() {
    return this._json.deviceId;
  }

  get name() {
    return this._json.name;
  }

  get json() {
    return this._json;
  }

  status() {
    return new Promise((resolve, reject) => {

      // Create a list of all component ids.
      let componentIds = [];
      for (const component of Object.values(this.components)) {
        componentIds.push({featureId: component.id});
      }

      this._client.getComponentValues(componentIds)
        .then((status) => {

          let result = {};
          for (const [key, component] of Object.entries(this.components)) {
            result[key] = status[component.id];
          };

          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

module.exports = TRV;
