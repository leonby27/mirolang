import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCORwxneo2ony1iwHkq6n1q7mDj8gdzy9k",
  authDomain: "mirolang-fab62.firebaseapp.com",
  projectId: "mirolang-fab62",
  databaseURL:
    "https://mirolang-fab62-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "mirolang-fab62.appspot.com",
  messagingSenderId: "59797860773",
  appId: "1:59797860773:web:0b7e6f611ad7960fc9784c",
  measurementId: "G-16SY59YVXJ",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export default database;
