import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCIdiRQxXwb1jhPyQvodsdcMl3j63_9wto",
    authDomain: "shoppe-cam.firebaseapp.com",
    databaseURL: "https://shoppe-cam-default-rtdb.firebaseio.com",
    projectId: "shoppe-cam",
    storageBucket: "shoppe-cam.firebasestorage.app",
    messagingSenderId: "392962112847",
    appId: "1:392962112847:web:62ef368bee61d2b62f993a",
    measurementId: "G-7NRJS7EYST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);