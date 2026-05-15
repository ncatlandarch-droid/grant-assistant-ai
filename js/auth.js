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

let _prevAuthUser = undefined;

_auth.onAuthStateChanged(async user => {
  const justSignedIn = (_prevAuthUser === undefined || _prevAuthUser === null) && !!user;
  _prevAuthUser = user || null;

  st.currentUser = user || null;
  st.isAdmin     = user ? ADMIN_EMAILS.includes(user.email?.toLowerCase()) : false;

  // Render immediately with Google Auth data so the user's Google photo
  // shows right away instead of the default Granted! avatar
  render();

  if (user) {
    // Auto-register and load Firestore profile in background
    await saveUserProfile(user.uid, {
      uid:               user.uid,
      email:             user.email || '',
      googleDisplayName: user.displayName || '',
      googlePhotoURL:    user.photoURL    || '',
      lastSeen:          new Date().toISOString()
    });
    st.firestoreProfile = await loadUserProfile(user.uid);

    // First-time photo prompt: show profile setup if no photo is stored anywhere yet
    if (justSignedIn) {
      const knownProfile  = (typeof USER_PROFILES !== 'undefined')
        ? USER_PROFILES[user.email?.toLowerCase()] : null;
      const hasPhoto = localStorage.getItem('grant-avatar-' + user.uid)
        || st.firestoreProfile?.avatarUrl
        || st.firestoreProfile?.hasCustomAvatar
        || knownProfile?.avatar;
      if (!hasPhoto) {
        st.firstTimeProfile = true;
        st.editingProfile   = true;
      }
    }

    const up = getUserProfile(user);
    st._greeting = `Welcome back, ${up.displayName}! I'm Granted!, your AI Grant Assistant. What are we working on today?`;

    if (justSignedIn) {
      GRANT_TTS.speak(st._greeting);
    }

    // Second render once Firestore profile (custom photo, title, etc.) is loaded
    render();
  } else {
    st.firestoreProfile = null;
    st._greeting = null;
  }
});
