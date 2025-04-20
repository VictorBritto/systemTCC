// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCaS-KZWFraifRrLIAJVf6_RaonjsRO4Xg",
    authDomain: "TCC-CPD.firebaseapp.com",
    projectId: "tcc-cpd-20678",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
