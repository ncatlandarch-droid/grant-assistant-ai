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

let _prevAuthUser = undefined; // tracks sign-in transitions for greeting

// Fires immediately on load (null if not signed in), then on every auth change
_auth.onAuthStateChanged(async user => {
  const justSignedIn = (_prevAuthUser === undefined || _prevAuthUser === null) && !!user;
  _prevAuthUser = user || null;

  st.currentUser = user || null;
  st.isAdmin     = user ? ADMIN_EMAILS.includes(user.email?.toLowerCase()) : false;

  if (user) {
    // Auto-register in users collection so admin directory stays current
    await saveUserProfile(user.uid, {
      uid:               user.uid,
      email:             user.email || '',
      googleDisplayName: user.displayName || '',
      googlePhotoURL:    user.photoURL    || '',
      lastSeen:          new Date().toISOString()
    });
    // Load any custom profile edits (name, title, department, photo URL)
    st.firestoreProfile = await loadUserProfile(user.uid);

    // Build personalized greeting and store for avatar click
    const up = getUserProfile(user);
    st._greeting = `Welcome back, ${up.displayName}! I'm Granted!, your AI Grant Assistant. What are we working on today?`;

    // Speak greeting on sign-in or page reload while signed in
    if (justSignedIn) {
      GRANT_TTS.speak(st._greeting);
    }
  } else {
    st.firestoreProfile = null;
    st._greeting = null;
  }

  render();
});
