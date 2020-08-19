const {ReadOnlyComponent} = require('./component');

module.exports = class Battery extends ReadOnlyComponent {

  static get TYPE() { return 'batteryLevel'; }

  constructor(json, client) {
    super(Battery.TYPE, json.featureId, client);
    this.json = json;
  }
};
