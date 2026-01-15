// src/firebase/index.ts - VERSÃO SIMPLIFICADA
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar serviços
export { app, auth, db, storage };

// ⭐ IMPORTANTE: Não exportar admin aqui ainda para evitar dependência circular
// As funções serão importadas diretamente de './admin'