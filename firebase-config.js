/* ════════════════════════════════════════════════════════
   CARO MOBILITY — Firebase Config (caro-mobility-prod)
   Auth + Firestore (실시간 동기화)
   ────────────────────────────────────────────────────────
   ★ 관리자 페이지(admin.html)는 로그인 세션을 따로 쓰도록 분리.
     → 고객 앱 로그인과 서로 로그아웃되지 않음.
   ★ 관리자 페이지는 보안상 '세션 지속성' 사용
     → 브라우저/앱을 완전히 닫으면 로그아웃 (자동 로그인 방지).
   ──────────────────────────────────────────────────────── */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
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

/* 초기화
   ─ admin.html(주소에 'admin' 포함)은 'caroAdmin'이라는 별도 앱으로 시작
     → 로그인 저장 자리가 고객 앱과 분리됨 (서로 로그아웃 안 됨).
   ─ 고객 앱(index.html)은 기존과 100% 동일하게 기본 앱 사용. */
const __isAdminPage = (typeof location !== 'undefined') &&
  location.pathname.indexOf('admin') !== -1;

const app = __isAdminPage
  ? initializeApp(firebaseConfig, 'caroAdmin')
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

/* ★ 보안: 관리자 페이지는 '세션 지속성(SESSION)' 사용
   ─ 작업 중 새로고침은 로그인 유지
   ─ 브라우저/앱을 완전히 닫으면 로그아웃 → 다시 켜면 로그인 필요(자동 로그인 방지)
   ─ 고객 앱(index.html)은 손대지 않음 = 기존처럼 로그인 유지 */
if (__isAdminPage) {
  setPersistence(auth, browserSessionPersistence)
    .then(function () {
      console.log('🔒 관리자 세션 지속성: SESSION — 닫으면 로그아웃(자동 로그인 방지)');
    })
    .catch(function (e) {
      console.warn('관리자 세션 지속성 설정 실패:', e);
    });
}

/* 전역 등록 (script.js / admin.html 에서 사용) */
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
  setPersistence: setPersistence,
  browserSessionPersistence: browserSessionPersistence,
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
console.log('🔥 Firebase 초기화 완료 (caro-mobility-prod)' +
  (__isAdminPage ? ' — 관리자 세션(caroAdmin) 분리 적용' : ''));
