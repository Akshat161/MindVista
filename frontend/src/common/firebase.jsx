
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAVomewLxqNGkfLWrmqOkiQ-i-Nyc_Nlxk",
  authDomain: "mindvista-16.firebaseapp.com",
  projectId: "mindvista-16",
  storageBucket: "mindvista-16.firebasestorage.app",
  messagingSenderId: "761923337955",
  appId: "1:761923337955:web:4a96f6d2b79df9b593cfd6",
  measurementId: "G-KP9D5QWL09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//google auth

const provider =new GoogleAuthProvider();

const auth=getAuth();

export const authWithGoogle= async()=>{

    let user=null;

    await signInWithPopup(auth,provider)
    .then((result)=>{
        user=result.user
    })
    .catch((err)=>{
        console.log(err)
    })

    return user

}