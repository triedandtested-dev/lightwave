const Firestore = require('@google-cloud/firestore');

class Storage {

  save(config) {
    throw Error('method must be implemented');
  }

  load() {
    throw Error('method must be implemented');
  }
}

class FirestoreStorage extends Storage {
  constructor() {
    super();
    let firestore = new Firestore();
    // Get document reference object.
    this.documentRef = firestore
      .collection('auth')
      .doc('config');
  }

  async save(config) {
    await this.documentRef.set({
      bearerToken: config.bearerToken,
      refreshToken: config.refreshToken,
      clientId: config.clientId,
    });
  }

  async load() {
    const doc = await this.documentRef.get();

    console.log('loading document.' + doc.exists);

    if (doc.exists) {
      console.log(doc.data());
      return doc.data();
    }

    return null;
  }
}

module.exports = {
  Storage: Storage,
  FirestoreStorage: FirestoreStorage,
};
