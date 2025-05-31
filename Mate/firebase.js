// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAl-9T7q82z46QqO-8pdMf1creruriYEAQ",
  authDomain: "mateia-2474f.firebaseapp.com",
  projectId: "mateia-2474f",
  storageBucket: "mateia-2474f.firebasestorage.app",
  messagingSenderId: "786705859314",
  appId: "1:786705859314:web:050832f9f9459bf781c66b",
  measurementId: "G-MX35PJCNWB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
