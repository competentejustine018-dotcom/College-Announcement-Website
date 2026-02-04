// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcVtZXSdbaalzz5AsBvvYpAS4fYgKcU5s",
  authDomain: "collegeannouncementwebsi-e19bc.firebaseapp.com",
  projectId: "collegeannouncementwebsi-e19bc",
  storageBucket: "collegeannouncementwebsi.appspot.com",
  messagingSenderId: "212741009923",
  appId: "1:212741009923:web:8de5e514f9af0e56da9436"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// -------------------- LOGIN --------------------
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}


// -------------------- SIGN UP --------------------
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      // Create user document (non-admin by default)
      return db.collection("users").doc(cred.user.uid).set({
        role: "user"
      });
    })
    .then(() => alert("Account created! Please login."))
    .catch(err => alert(err.message));
}


// -------------------- FORGOT PASSWORD --------------------
function forgotPassword() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Please enter your email to reset password.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent! Check your inbox."))
    .catch(err => alert(err.message));
}


// -------------------- LOGOUT --------------------
function logout() {
  auth.signOut();
}


// -------------------- ADD ANNOUNCEMENT --------------------
function addAnnouncement() {
  const title = document.getElementById("announcement-title").value.trim();
  const body = document.getElementById("announcement-body").value.trim();

  if (!title || !body) {
    alert("Please enter both title and announcement details.");
    return;
  }

  db.collection("announcements").add({
    title: title,
    body: body,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("announcement-title").value = "";
    document.getElementById("announcement-body").value = "";
    loadAnnouncements();
  })
  .catch(err => alert("Error posting announcement: " + err.message));
}


// -------------------- LOAD ANNOUNCEMENTS --------------------
function loadAnnouncements() {
  const list = document.getElementById("announcement-list");
  list.innerHTML = "";

  db.collection("announcements")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `<strong>${data.title}</strong><p>${data.body}</p>`;
        list.appendChild(li);
      });
    });
}


// -------------------- AUTH STATE CHANGE --------------------
auth.onAuthStateChanged(user => {
  if (!user) {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("announcement-section").style.display = "none";
    return;
  }

  // Check role from Firestore
  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (doc.exists && doc.data().role === "admin") {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("announcement-section").style.display = "block";
        loadAnnouncements();
      } else {
        alert("Not authorized");
        auth.signOut();
      }
    })
    .catch(err => {
      console.error(err);
      auth.signOut();
    });
});
