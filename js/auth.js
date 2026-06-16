// ============================================================
// auth.js — Firebase Authentication (compat / plain script build)
// ============================================================

firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

window._auth = auth;

function watchAuth(onLogin, onLogout) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      let username = user.displayName || user.email.split('@')[0];
      try {
        const snap = await db.collection('users').doc(user.uid).get();
        if (snap.exists) username = snap.data().username;
      } catch (_) {}
      onLogin(user, username);
    } else {
      onLogout();
    }
  });
}

async function signUp(username, email, password) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName: username });
  await db.collection('users').doc(cred.user.uid).set({
    username,
    email,
    createdAt: new Date().toISOString(),
  });
  return cred.user;
}

async function logIn(emailOrUsername, password) {
  let email = emailOrUsername;
  if (!emailOrUsername.includes('@')) {
    const snap = await db.collection('users').where('username', '==', emailOrUsername).get();
    if (snap.empty) throw new Error('No account found with that username.');
    email = snap.docs[0].data().email;
  }
  return auth.signInWithEmailAndPassword(email, password);
}

async function logOut() {
  await auth.signOut();
}
