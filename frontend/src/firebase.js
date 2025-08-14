// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA64Y1RdsTbL-R0iQ30Snj18WyNg6rbcjI",
  authDomain: "wz-fda-horizon-scan.firebaseapp.com",
  projectId: "wz-fda-horizon-scan",
  storageBucket: "wz-fda-horizon-scan.firebasestorage.app",
  messagingSenderId: "421447259117",
  appId: "1:421447259117:web:85652e6fce3051b3d74de4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;