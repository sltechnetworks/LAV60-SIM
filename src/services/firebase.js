import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAl5ZbgWviD4vf-3BjOZB9uQGhxPQT7Dy0",
    databaseURL: "https://lav60-sim-default-rtdb.firebaseio.com",
    projectId: "lav60-sim"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); 