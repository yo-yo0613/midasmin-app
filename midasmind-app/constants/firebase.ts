// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUppP2-8AMYOkQpVmdDwXNdQfbxw9QwDI",
  authDomain: "midasmin-app.firebaseapp.com",
  projectId: "midasmin-app",
  storageBucket: "midasmin-app.firebasestorage.app",
  messagingSenderId: "480792482229",
  appId: "1:480792482229:web:12df2338b8b5b1f4cb49fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);