/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Authenticated API Fetch Helper
   Automatically attaches the signed-in user's Firebase ID token to Netlify function calls. */

async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  try {
    const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    if (user && typeof user.getIdToken === 'function') {
      const token = await user.getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Could not attach Firebase ID token:', err?.message || err);
  }
  return fetch(url, { ...options, headers });
}

if (typeof window !== 'undefined') {
  window.authFetch = authFetch;
}
