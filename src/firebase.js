import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQUVGkSuZTubNdZbnnqvupaQVP8G9r6ao",
  authDomain: "stsebastian-church.firebaseapp.com",
  projectId: "stsebastian-church",
  storageBucket: "stsebastian-church.firebasestorage.app",
  messagingSenderId: "634888465310",
  appId: "1:634888465310:web:1f0cd693d9b7ce9903048f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);