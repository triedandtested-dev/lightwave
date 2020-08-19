const {ReadOnlyComponent} = require('./component');

module.exports = class Temperature extends ReadOnlyComponent {

  static get TYPE() { return 'temperature'; }

  constructor(json, client) {
    super(Temperature.TYPE, json.featureId, client);
    this.json = json;
  }
};
