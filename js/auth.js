/* ============================================
   Auth — Google Sign-In + Admin Detection
   Admin emails are checked against ADMIN_EMAILS.
   ============================================ */

const ADMIN_EMAILS = [
  'ncatlandarch@gmail.com'
];

const _auth = firebase.auth();

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  _auth.signInWithPopup(provider).catch(err => {
    console.error('Sign-in error:', err);
    alert('Sign-in failed: ' + err.message);
  });
}

function signOutAdmin() {
  _auth.signOut();
}

// Fires immediately on load (null if not signed in), then on every auth change
_auth.onAuthStateChanged(async user => {
  st.currentUser = user || null;
  st.isAdmin     = user ? ADMIN_EMAILS.includes(user.email?.toLowerCase()) : false;

  if (user) {
    // Load any Firestore profile edits (name, title, department, photo URL)
    st.firestoreProfile = await loadUserProfile(user.uid);
  } else {
    st.firestoreProfile = null;
  }

  render();
});
