
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBLBJhnnq9Q-u2IDjJR48oeGwi-6qI7Gws",
    authDomain: "mindvistablogs.firebaseapp.com",
    projectId: "mindvistablogs",
    storageBucket: "mindvistablogs.firebasestorage.app",
    messagingSenderId: "785066330329",
    appId: "1:785066330329:web:a71bb2d5c75e43499656c8",
    measurementId: "G-2R7S2RD23T"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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