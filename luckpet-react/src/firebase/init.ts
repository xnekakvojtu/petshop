// src/firebase/init.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
  
  return { app, auth, db, storage };
};

export const getFirebaseApp = () => {
  if (!app) {
    initializeFirebase();
  }
  return app;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

export const getFirebaseDb = () => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};

export const getFirebaseStorage = () => {
  if (!storage) {
    initializeFirebase();
  }
  return storage;
};