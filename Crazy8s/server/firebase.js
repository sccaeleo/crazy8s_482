// Import Firebase Admin SDK for server-side
// const admin = require("firebase-admin");
const {initializeApp, cert} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
const serviceAccount = require('./creds.json');

initializeApp({
  credential: cert(serviceAccount)
});

// Import Firebase Client SDK for frontend usage (if applicable)
// const { initializeApp } = require("firebase/app");
// const { getAnalytics } = require("firebase/analytics");
// const { getFirestore } = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE0flNoSmM-tgnzk2lKYSS2H5xziWXflo",
  authDomain: "gofishtest-59fbf.firebaseapp.com",
  projectId: "gofishtest-59fbf",
  storageBucket: "gofishtest-59fbf.firebasestorage.app",
  messagingSenderId: "472988457314",
  appId: "1:472988457314:web:f6bdd07f672e0398c1f43b",
  measurementId: "G-L6STC0NP85"
};

// Initialize Firebase Client SDK for Firestore and Analytics
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const db = getFirestore(app);


