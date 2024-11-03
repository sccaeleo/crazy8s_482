// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// var admin = require("firebase-admin");

var serviceAccount = require('creds.json');

initializeApp({
  credential: cert(serviceAccount)
})

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBE0flNoSmM-tgnzk2lKYSS2H5xziWXflo",
  authDomain: "gofishtest-59fbf.firebaseapp.com",
  projectId: "gofishtest-59fbf",
  storageBucket: "gofishtest-59fbf.firebasestorage.app",
  messagingSenderId: "472988457314",
  appId: "1:472988457314:web:f6bdd07f672e0398c1f43b",
  measurementId: "G-L6STC0NP85"
};

const db = getFirestore()

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

