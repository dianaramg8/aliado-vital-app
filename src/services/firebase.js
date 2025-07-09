// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAi2X0iNCRcxfwzctacx0sT2QhejjFiRrg',
  authDomain: 'registro-de-signos-vitales.firebaseapp.com',
  projectId: 'registro-de-signos-vitales',
  storageBucket: 'registro-de-signos-vitales.appspot.com',
  messagingSenderId: '818133237569',
  appId: '1:818133237569:web:b275a7a0294497d21e2bc0'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
