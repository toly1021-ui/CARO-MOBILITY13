/* ════════════════════════════════════════════════════════
   CARO MOBILITY — Firebase Config (caro-mobility-prod)
   Auth + Firestore (실시간 동기화)
   ──────────────────────────────────────────────────────── */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

/* Firebase 프로젝트 설정 — caro-mobility-prod */
const firebaseConfig = {
  apiKey: "AIzaSyBSFjVMeA0-7Y5OvITqIRtLpho-wH_YqTk",
  authDomain: "caro-mobility-prod.firebaseapp.com",
  projectId: "caro-mobility-prod",
  storageBucket: "caro-mobility-prod.firebasestorage.app",
  messagingSenderId: "888783040851",
  appId: "1:888783040851:web:4afb58611a38867f85f1a6",
  measurementId: "G-W4WTTHK7L3"
};

/* 초기화 */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 전역 등록 (script.js에서 사용) */
window.FB_AUTH = auth;
window.FB_DB = db;
window.FB_FN = {
  /* === Auth === */
  signInWithEmailAndPassword: signInWithEmailAndPassword,
  createUserWithEmailAndPassword: createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail: fetchSignInMethodsForEmail,
  sendPasswordResetEmail: sendPasswordResetEmail,
  updateProfile: updateProfile,
  signOut: signOut,
  onAuthStateChanged: onAuthStateChanged,
  /* === Firestore === */
  doc: doc,
  setDoc: setDoc,
  getDoc: getDoc,
  collection: collection,
  onSnapshot: onSnapshot,
  deleteDoc: deleteDoc,
  getDocs: getDocs,
  query: query,
  where: where,
  orderBy: orderBy,
  limit: limit,
  serverTimestamp: serverTimestamp
};

window.FB_READY = true;
console.log('🔥 Firebase 초기화 완료 (caro-mobility-prod)');