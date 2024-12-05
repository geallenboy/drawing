// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-project-b6ace.firebaseapp.com",
  projectId: "ai-project-b6ace",
  storageBucket: "ai-project-b6ace.firebasestorage.app",
  messagingSenderId: "1029845757320",
  appId: "1:1029845757320:web:161099a9a01d1a10a8de3d",
  measurementId: "G-XWZY8TW7L8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
