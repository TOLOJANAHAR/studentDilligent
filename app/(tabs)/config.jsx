// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjbpY5GwklU5rCbwoYPHOi6tBPHCeExlI",
  authDomain: "student-dilligent.firebaseapp.com",
  projectId: "student-dilligent",
  storageBucket: "student-dilligent.appspot.com",
  messagingSenderId: "317940424171",
  appId: "1:317940424171:web:34c2ad03e8a06218f60dae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//initialise firestore
export const db = getFirestore(app);