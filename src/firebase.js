import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0810mX1S-O2xZhDWP6kaTI0xZYuGuX1c",
  authDomain: "reset-geral.firebaseapp.com",
  databaseURL: "https://reset-geral-default-rtdb.firebaseio.com",
  projectId: "reset-geral",
  storageBucket: "reset-geral.firebasestorage.app",
  messagingSenderId: "106791943959",
  appId: "1:106791943959:web:452c2cdb55b4de1b8c8152"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 