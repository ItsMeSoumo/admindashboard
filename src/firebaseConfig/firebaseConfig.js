// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoML1VMH7mDi0RgSbP2Z1oiXBlTZPi_r0",
  authDomain: "admindashboard-bf56c.firebaseapp.com",
  projectId: "admindashboard-bf56c",
  storageBucket: "admindashboard-bf56c.firebasestorage.app",
  messagingSenderId: "845333525703",
  appId: "1:845333525703:web:2640f723b3643a2a0dfae2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();