// Import Firebase Admin SDK for server-side
// const admin = require("firebase-admin");
const {initializeApp, cert} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
const serviceAccount = require('./creds.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore()

module.exports = {db}


