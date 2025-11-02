// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYfc4wnr2QkGOCjQjrIUzsjr_OI8SWFz4",
  authDomain: "smarthub-campus-freelancing.firebaseapp.com",
  projectId: "smarthub-campus-freelancing",
  storageBucket: "smarthub-campus-freelancing.firebasestorage.app",
  messagingSenderId: "632424354347",
  appId: "1:632424354347:web:ce92910bb38dde39c6906e",
  measurementId: "G-W0CR3V2DTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);