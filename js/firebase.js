/* ============================================
   Firebase — Firestore Init (compat CDN mode)
   No build step required — works with plain JS.
   ============================================ */

const firebaseConfig = {
  apiKey:            "AIzaSyAN8nsSqyDz8hqsXmEqMHP7SvGbAV8c8DI",
  authDomain:        "grant-assistant-ai.firebaseapp.com",
  projectId:         "grant-assistant-ai",
  storageBucket:     "grant-assistant-ai.firebasestorage.app",
  messagingSenderId: "318925419656",
  appId:             "1:318925419656:web:6525cbaee0d3ef5f101b3d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
