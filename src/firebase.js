// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCv4VT0x4-HrDJjIf5kmdwXzhOQ3QV4aGc",
  authDomain: "mybillingsystem-d6fb7.firebaseapp.com",
  projectId: "mybillingsystem-d6fb7",
  storageBucket: "mybillingsystem-d6fb7.appspot.com",
  messagingSenderId: "132989347065",
  appId: "1:132989347065:web:a7ffadbe74861cf8a06e28",
  measurementId: "G-XW4SYZL20H"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
