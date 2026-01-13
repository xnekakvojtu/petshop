// src/firebase/index.ts - CORRIGIDO
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços em ordem
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar serviços
export { 
  app, 
  auth, 
  db, 
  storage 
};