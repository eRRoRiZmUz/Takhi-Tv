const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://takhitv-612f9.firebaseio.com",
  storageBucket : "gs://takhitv-612f9.appspot.com"
});

let storage = admin.storage()
let firebase = admin.firestore();

module.exports = {firebase, storage}