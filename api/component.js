const Promise = require('promise');

class BaseComponent {
  constructor(name, id) {
    this._id = id;
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get id() {
    return this._id;
  }
}

class ReadOnlyComponent extends BaseComponent {
  constructor(name, id, client) {
    super(name, id);
    this._client = client;
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
  constructor(name, id, client) {
    super(name, id, client);
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

module.exports = {
  BaseComponent: BaseComponent,
  ReadOnlyComponent: ReadOnlyComponent,
  SmartComponent: SmartComponent,
};
