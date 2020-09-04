const Promise = require('promise');

class BaseComponent {
  constructor(properties) {
    this._id = properties.featureId;
    this._name = properties.type;
  }

  get name() {
    return this._name;
  }

  get id() {
    return this._id;
  }

  get type() {
    throw new Error('Abstract method. Must be defined in child class.');
  }
}

class ReadOnlyComponent extends BaseComponent {
  constructor(properties, client) {
    super(properties);
    this._client = client;
  }

  get type() {
    return 'READ_ONLY_COMPONENT';
  }

  get() {
    return new Promise((resolve, reject) => {
      this._client.getComponentValue(this.id)
        .then((value) => {
          resolve(value);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

class SmartComponent extends ReadOnlyComponent {
  constructor(properties, client) {
    super(properties, client);
  }

  get type() {
    return 'SMART_COMPONENT';
  }

  set(value) {
    return new Promise((resolve, reject) => {
      this._client.setComponentValue(this.id, value)
        .then(() => {
          resolve(`${this.name} set successfully.`);
        })
        .catch((err) => {
          console.log(err.response);
          reject(err);
        });
    });
  }
}

class ComponentFactory {
  constructor(client) {
    this.client = client;
  }

  create(json) {
    // If we don't have writable property.
    if (json.writable === undefined) {
      throw new Error(`Missing 'writable' property. ${json}.`);
    }

    if (json.writable) {
      return new SmartComponent(json, this.client);
    }
    return new ReadOnlyComponent(json, this.client);
  }
}

module.exports = ComponentFactory;
