import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./index";
import { User } from "../types";

// ⭐ TIPOS MELHORADOS
export type AdditionalUserData = {
  name?: string;
  avatar?: 'cachorro' | 'gato' | 'passaro' | 'peixe'; // ⭐ Especificando os avatares possíveis
  role?: 'user' | 'admin';
  credits?: number;
};

export type CartData = Record<string, number>; // ⭐ Exemplo: { "productId": quantity }
export type WishlistData = string[]; // ⭐ Array de IDs de produtos

// ⭐ FUNÇÃO DE NORMALIZAÇÃO DO FIRESTORE PARA APP USER
const mapFirestoreUserToAppUser = (
  data: Record<string, any>,
  firebaseUser: FirebaseUser
): User => {
  // ⭐ Tratar createdAt que pode vir como Timestamp, string ou Date
  let createdAt: string;
  if (!data.createdAt) {
    createdAt = new Date().toISOString();
  } else if (data.createdAt instanceof Timestamp) {
    createdAt = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    createdAt = data.createdAt;
  } else if (data.createdAt instanceof Date) {
    createdAt = data.createdAt.toISOString();
  } else {
    createdAt = new Date().toISOString();
  }

  return {
    id: data.id ?? firebaseUser.uid,
    name: data.name ?? firebaseUser.displayName ?? 'Usuário',
    email: data.email ?? firebaseUser.email ?? '',
    credits: typeof data.credits === 'number' ? data.credits : 50,
    isGuest: false,
    avatar: data.avatar ?? 'cachorro',
    photoURL: data.photoURL ?? firebaseUser.photoURL ?? '',
    createdAt,
    emailVerified: Boolean(data.emailVerified ?? firebaseUser.emailVerified),
    role: data.role ?? 'user', // ⭐ Garantir role padrão
  };
};

// ⭐ GARANTIR DOCUMENTO DO USUÁRIO (VERSÃO MELHORADA)
const ensureUserDocument = async (
  user: FirebaseUser,
  additionalData?: AdditionalUserData
) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = Timestamp.now(); // ⭐ Usar Timestamp do Firestore
    
    try {
      // ⭐ Montar objeto de forma controlada, sem spread de additionalData
      const userData = {
        id: user.uid,
        name: displayName || additionalData?.name || 'Usuário',
        email: email || '',
        avatar: additionalData?.avatar || 'cachorro',
        photoURL: photoURL || '',
        credits: additionalData?.credits ?? 50, // ⭐ Usar ?? para permitir 0
        isGuest: false,
        createdAt,
        emailVerified: user.emailVerified,
        role: additionalData?.role || 'user', // ⭐ Role com padrão 'user'
      };
      
      await setDoc(userRef, userData);
      console.log('✅ Documento do usuário criado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar usuário no Firestore:', error);
      throw error;
    }
  }

  return userRef;
};

// ⭐ BUSCAR USUÁRIO COMPLETO DO APP (FUNÇÃO NOVA)
export const getAppUserFromFirebaseUser = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    let userSnapshot = await getDoc(userRef);

    // Se não existir, criar
    if (!userSnapshot.exists()) {
      await ensureUserDocument(firebaseUser);
      userSnapshot = await getDoc(userRef);
    }

    if (userSnapshot.exists()) {
      return mapFirestoreUserToAppUser(userSnapshot.data(), firebaseUser);
    }

    // Fallback (improvável de acontecer)
    return mapFirestoreUserToAppUser({}, firebaseUser);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário do app:', error);
    return mapFirestoreUserToAppUser({}, firebaseUser);
  }
};

// LOGIN COM EMAIL
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await getAppUserFromFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
};

// REGISTRO COM EMAIL - CORRIGIDO: avatar opcional
export const registerWithEmail = async (
  email: string, 
  password: string, 
  name: string,
  avatar?: string
): Promise<User> => {
  try {
    // ⭐ Garantir que o avatar seja um dos valores permitidos
    const safeAvatar = (avatar as 'cachorro' | 'gato' | 'passaro' | 'peixe') ?? 'cachorro';
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, { displayName: name });
    await sendEmailVerification(userCredential.user);
    
    // ⭐ Passar dados adicionais de forma tipada
    const additionalData: AdditionalUserData = { 
      name, 
      avatar: safeAvatar,
      role: 'user' // ⭐ Explicitamente user
    };
    
    await ensureUserDocument(userCredential.user, additionalData);
    return await getAppUserFromFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error('❌ Erro no registro:', error);
    throw error;
  }
};

// LOGIN COM GOOGLE
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);
    return await getAppUserFromFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Erro no login com Google:', error);
    throw error;
  }
};

// LOGOUT
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ Logout do Firebase realizado');
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    throw error;
  }
};

// USUÁRIO ATUAL
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// MONITORAR AUTENTICAÇÃO
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ATUALIZAR CRÉDITOS
export const updateUserCredits = async (userId: string, newCredits: number): Promise<void> => {
  try {
    const safeCredits = Number.isFinite(newCredits) ? newCredits : 0;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { credits: safeCredits });
    console.log(`✅ Créditos atualizados: ${safeCredits}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar créditos:', error);
    throw error;
  }
};

// SINCRONIZAR CARRINHO
export const syncCartToFirebase = async (userId: string, cartData: CartData): Promise<void> => {
  try {
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, { 
      items: cartData, 
      updatedAt: Timestamp.now() 
    }, { merge: true });
    console.log('✅ Carrinho sincronizado');
  } catch (error) {
    console.error('❌ Erro ao sincronizar carrinho:', error);
  }
};

// SINCRONIZAR FAVORITOS
export const syncWishlistToFirebase = async (userId: string, wishlistData: WishlistData): Promise<void> => {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    await setDoc(wishlistRef, { 
      items: wishlistData, 
      updatedAt: Timestamp.now() 
    }, { merge: true });
    console.log('✅ Favoritos sincronizados');
  } catch (error) {
    console.error('❌ Erro ao sincronizar favoritos:', error);
  }
};

// ⭐ FUNÇÃO AUXILIAR: BUSCAR CARRINHO DO FIREBASE
export const getCartFromFirebase = async (userId: string): Promise<CartData | null> => {
  try {
    const cartRef = doc(db, 'carts', userId);
    const snapshot = await getDoc(cartRef);
    if (snapshot.exists()) {
      return snapshot.data().items || {};
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar carrinho:', error);
    return null;
  }
};

// ⭐ FUNÇÃO AUXILIAR: BUSCAR FAVORITOS DO FIREBASE
export const getWishlistFromFirebase = async (userId: string): Promise<WishlistData | null> => {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    const snapshot = await getDoc(wishlistRef);
    if (snapshot.exists()) {
      return snapshot.data().items || [];
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    return null;
  }
};