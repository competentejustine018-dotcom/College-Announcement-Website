// -------------------- FIREBASE SETUP --------------------
const firebaseConfig = {
  apiKey: "AIzaSyCcVtZXSdbaalzz5AsBvvYpAS4fYgKcU5s",
  authDomain: "collegeannouncementwebsi-e19bc.firebaseapp.com",
  projectId: "collegeannouncementwebsi-e19bc",
  storageBucket: "collegeannouncementwebsi.appspot.com",
  messagingSenderId: "212741009923",
  appId: "1:212741009923:web:8de5e514f9af0e56da9436"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// -------------------- LOGIN --------------------
function login() {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}


// -------------------- SIGN UP --------------------
function signup() {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      // Create Firestore user document
      return db.collection("users").doc(cred.user.uid).set({
        role: "user"
      });
    })
    .then(() => alert("Account created! You can now log in."))
    .catch(err => alert(err.message));
}


// -------------------- FORGOT PASSWORD --------------------
function forgotPassword() {
  const email = emailInput.value;

  if (!email) {
    alert("Enter your email first.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent!"))
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
    alert("Please fill in all fields.");
    return;
  }

  db.collection("announcements").add({
    title,
    body,
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
    })
    .catch(err => console.error("Load error:", err));
}


// -------------------- AUTH STATE CHECK --------------------
auth.onAuthStateChanged(user => {
  const loginSection = document.getElementById("login-section");
  const announcementSection = document.getElementById("announcement-section");

  if (!user) {
    loginSection.style.display = "block";
    announcementSection.style.display = "none";
    return;
  }

  // 🔥 IMPORTANT: role must be in users/{uid}
  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (!doc.exists) {
        alert("User record not found.");
        auth.signOut();
        return;
      }

      const role = doc.data().role;

      if (role === "admin") {
        loginSection.style.display = "none";
        announcementSection.style.display = "block";
        loadAnnouncements();
      } else {
        alert("Not authorized");
        auth.signOut();
      }
    })
    .catch(err => {
      console.error("Role check error:", err);
      auth.signOut();
    });
});
