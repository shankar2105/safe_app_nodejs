const readline = require('readline');
const crypto = require('crypto');
const safeApp  = require('../src/');
const lib = require('../src/native/lib'); // FIXME: url opening should be exposed differently!


const appInfo = {
  'id': 'net.maidsafe.examples.createPublicName',
  'name': 'NodeJS example App - create public name',
  'vendor': 'MaidSafe.net Ltd.'
};

const containers = {
  _public: [
    'Read',
    'Insert',
    'Update',
    'Delete',
    'ManagePermissions'
  ],
  _publicNames: [
    'Read',
    'Insert',
    'Update',
    'Delete',
    'ManagePermissions'
  ]
};

let appObj = null;

const tagType = 1500;
const publicName = 'Shankar2121212';

let serializedData = null;

// create safe app
safeApp.initializeApp(appInfo)
  .then(app => app.auth.genAuthUri(containers))
  .then(res => {
    console.log('Trying to open request no ' + res.req_id + ' as ' + res.uri);
    return lib.openUri(res.uri)
  })
  .then(() => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('\nEnter Authenticator response => ', (answer) => {
        resolve(answer);
        rl.close();
      });
    });
  })
  .then((uri) => {
    // validate response uri
    return safeApp.fromAuthURI(appInfo, uri);
  })
  .then((app) => (appObj = app))
  .then(() => appObj.mutableData.newPublic(crypto.createHash('sha256').update(publicName).digest(), tagType))
  .then(mdata => {
    let permissionSet = null;
    let permissions = null;
    let entries = null;
    let signKey = null;
    console.log(`\nCreating new public mutable data with name :: ${publicName}`);
    return new Promise((resolve, reject) => {
      appObj.mutableData.newPermissionSet()
        .then((perm) => (permissionSet = perm))
        .then(() => permissionSet.setAllow('ManagePermissions'))
        .then(() => appObj.auth.getPubSignKey())
        .then((key) => (signKey = key))
        .then(() => appObj.mutableData.newPermissions())
        .then((perm) => (permissions = perm))
        .then(() => permissions.insertPermissionSet(signKey.ref, permissionSet.ref))
        .then(() => appObj.mutableData.newEntries())
        .then((entry) => (entries = entry))
        .then(() => mdata.put(permissions, entries))
        .then(() => mdata.serialise())
        .then((res) => {
          console.log('\nSerialised Mutable data ::', res);
          return resolve(res);
        })
        .catch(reject)
    });
  })
  .then((data) => (serializedData = data))
  .then(() => appObj.auth.getAccessContainerInfo('_publicNames'))
  .then((mut) => mut.getEntries()) 
  .then((entry) => {
    return entry.insert(publicName, serializedData)
      .then(() => entry)
  }) 
  .then((entry) => entry.get(publicName))
  .then((res) => {
    console.log(`\nInserted into _publicNames Container. Inserted entry =>`, res);
    return Promise.resolve(true);
  })
  .catch((err) => {
    console.log('Error :: ', err);
    return Promise.reject(err)
  });