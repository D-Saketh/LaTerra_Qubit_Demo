// Firebase bootstrap (ES module, loaded from the CDN - no build step required).
// Exposes window.QubitFirebase and window.QubitFirebaseReady for the classic
// script modules (forms.js, auth.js, content.js, dashboard.js).
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

(function () {
  "use strict";

  const config = window.QUBIT_FIREBASE_CONFIG || {};
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  const isConfigured = required.every(function (key) {
    const value = config[key];
    return typeof value === "string" && value.length > 0 && !/^YOUR_/.test(value);
  });

  function announce(api) {
    window.QubitFirebase = api;
    window.QubitFirebaseReady = Promise.resolve(api);
    window.dispatchEvent(new CustomEvent("qubit:firebase-ready", { detail: api }));
  }

  if (!isConfigured) {
    console.warn(
      "[Qubit] Firebase is not configured. Fill in js/firebase-config.js to enable the database, auth, and dashboard."
    );
    announce(null);
    return;
  }

  try {
    const app = initializeApp(config);
    const db = getFirestore(app);
    const auth = getAuth(app);

    announce({
      app: app,
      db: db,
      auth: auth,
      fns: {
        collection: collection,
        doc: doc,
        getDoc: getDoc,
        addDoc: addDoc,
        setDoc: setDoc,
        updateDoc: updateDoc,
        deleteDoc: deleteDoc,
        onSnapshot: onSnapshot,
        query: query,
        orderBy: orderBy,
        serverTimestamp: serverTimestamp,
        writeBatch: writeBatch,
        signInWithEmailAndPassword: signInWithEmailAndPassword,
        signOut: signOut,
        onAuthStateChanged: onAuthStateChanged,
        setPersistence: setPersistence,
        browserLocalPersistence: browserLocalPersistence,
        browserSessionPersistence: browserSessionPersistence
      }
    });
  } catch (error) {
    console.error("[Qubit] Firebase failed to initialize:", error);
    announce(null);
  }
})();
