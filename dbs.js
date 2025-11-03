// dbs.js
const firebaseConfig = {
    apiKey: "AIzaSyAk-0bfLE8m00HMHGR4HFctW58KRWi_Psw",
    authDomain: "xbibz-tools.firebaseapp.com",
    databaseURL: "https://xbibz-tools-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "xbibz-tools",
    storageBucket: "xbibz-tools.firebasestorage.app",
    messagingSenderId: "728866559765",
    appId: "1:728866559765:web:c44d19112638a86a377b1c",
    measurementId: "G-LFGHF7JXBN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();