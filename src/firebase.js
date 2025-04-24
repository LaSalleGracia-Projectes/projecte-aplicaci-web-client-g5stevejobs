// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_mhTz7j8N7vrJDX_o2l44h-5PCBOVmzk",
  authDomain: "theabyssproject-bdc47.firebaseapp.com",
  projectId: "theabyssproject-bdc47",
  storageBucket: "theabyssproject-bdc47.appspot.com",
  messagingSenderId: "584808583240",
  appId: "1:584808583240:web:88705427106a7979b2487d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;