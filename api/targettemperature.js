const {SmartComponent} = require('./component');

module.exports = class TargetTemperature extends SmartComponent {

  static get TYPE() { return 'targetTemperature'; }

  constructor(json, client) {
    super(TargetTemperature.TYPE, json.featureId, client);
    this.json = json;
  }
};
