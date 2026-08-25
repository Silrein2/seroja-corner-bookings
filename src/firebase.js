import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Same Firebase project as the main app — data is isolated by using a
// dedicated collection (see config.js -> COLLECTION). No Auth / Storage are
// used by this prototype: admin signatures are stored inline as data URLs.
const firebaseConfig = {
  apiKey: "AIzaSyD665yCGG-ADZXJJwqH2ZkSMfio04JXUfE",
  authDomain: "homestay-project-ee785.firebaseapp.com",
  projectId: "homestay-project-ee785",
  storageBucket: "homestay-project-ee785.firebasestorage.app",
  messagingSenderId: "1094019310317",
  appId: "1:1094019310317:web:581bbbc83d894b1a6ae2e4",
  measurementId: "G-7MSVW59CXK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
