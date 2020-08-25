const Promise = require('promise');
const assert = require('assert');
const sinon = require('sinon');

const { DocumentReference } = require('@google-cloud/firestore');
const { Storage, FirestoreStorage } = require('../../api/storage');

describe('A Storage class', () => {
  it('should throw when trying to save.', () => {
    const storage = new Storage();

    assert.throws(() => {
      storage.save();
    }, Error('method must be implemented'));

  });

  it('should throw when trying to load.', () => {
    const storage = new Storage();

    assert.throws(() => {
      storage.load();
    }, Error('method must be implemented'));

  });
});

describe('A FirestoreStorage class', () => {

  it('should save a document correctly.', async() => {
    const storage = new FirestoreStorage();

    const expected = {
      bearerToken: 'bearerToken',
      refreshToken: 'refreshToken',
      clientId: 'clientId',
    };

    let docRef = sinon.createStubInstance(DocumentReference);
    docRef.set.returns(Promise.resolve());
    // Inject stub into object to test behaviour.
    sinon.stub(storage, 'documentRef').value(docRef);

    await storage.save(expected);

    sinon.assert.calledWith(docRef.set, expected);

  });

  it('should load a document data if exists.', async() => {
    const storage = new FirestoreStorage();

    // Generate a fake snapshot for test.
    // If a document exists we need to provide its data.
    const snaphot = {
      exists: true,
      data: function() {
        return 'expected';
      },
    };


    let docRef = sinon.createStubInstance(DocumentReference);
    docRef.get.returns(Promise.resolve(snaphot));
    // Inject stub into object to test behaviour.
    sinon.stub(storage, 'documentRef').value(docRef);

    let doc = await storage.load();

    assert.strictEqual(doc, 'expected');
    sinon.assert.calledOnce(docRef.get);

  });

  it('should return null if no document exists.', async() => {
    const storage = new FirestoreStorage();

    // Generate a fake snapshot for test.
    // If a document exists we need to provide its data.
    const snaphot = {exists: false};


    let docRef = sinon.createStubInstance(DocumentReference);
    docRef.get.returns(Promise.resolve(snaphot));
    // Inject stub into object to test behaviour.
    sinon.stub(storage, 'documentRef').value(docRef);

    let doc = await storage.load();

    assert.strictEqual(doc, null);
    sinon.assert.calledOnce(docRef.get);

  });
});
