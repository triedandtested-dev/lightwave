const LwRFClient = require('./api/client');
const FirestoreStorage = require('./api/storage');

exports.printMsg = function() {
  console.log('This is a message from the demo package');
};
exports.FirestoreStorage = FirestoreStorage;
exports.LwRFClient = LwRFClient;
