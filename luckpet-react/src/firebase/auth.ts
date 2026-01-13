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
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./index";
import { User } from "../types";

const googleProvider = new GoogleAuthProvider();

const firebaseUserToAppUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Usuário',
    email: firebaseUser.email || '',
    credits: 50,
    isGuest: false,
    avatar: 'cachorro',
    photoURL: firebaseUser.photoURL || '',
    createdAt: new Date().toISOString(),
    emailVerified: firebaseUser.emailVerified
  };
};

const createUserDocument = async (user: FirebaseUser, additionalData?: any) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();
    
    try {
      await setDoc(userRef, {
        id: user.uid,
        name: displayName || additionalData?.name || 'Usuário',
        email,
        avatar: additionalData?.avatar || 'cachorro',
        photoURL: photoURL || '',
        credits: 50,
        isGuest: false,
        createdAt,
        emailVerified: user.emailVerified,
        ...additionalData
      });
    } catch (error) {
      console.error('Erro ao criar usuário no Firestore:', error);
    }
  }

  return userRef;
};

// LOGIN COM EMAIL
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await createUserDocument(userCredential.user);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }
    
    return firebaseUserToAppUser(userCredential.user);
  } catch (error: any) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// REGISTRO COM EMAIL
export const registerWithEmail = async (
  email: string, 
  password: string, 
  name: string,
  avatar: string = 'cachorro'
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, { displayName: name });
    await sendEmailVerification(userCredential.user);
    
    const userDoc = await createUserDocument(userCredential.user, { 
      name, 
      avatar,
      emailVerified: false 
    });
    
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }
    
    return firebaseUserToAppUser(userCredential.user);
  } catch (error: any) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

// LOGIN COM GOOGLE
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await createUserDocument(result.user);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }
    
    return firebaseUserToAppUser(result.user);
  } catch (error: any) {
    console.error('Erro no login com Google:', error);
    throw error;
  }
};

// LOGOUT
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Erro no logout:', error);
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
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { credits: newCredits });
  } catch (error) {
    console.error('Erro ao atualizar créditos:', error);
    throw error;
  }
};

// SINCRONIZAR CARRINHO
export const syncCartToFirebase = async (userId: string, cartData: any): Promise<void> => {
  try {
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, { items: cartData, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error('Erro ao sincronizar carrinho:', error);
  }
};

// SINCRONIZAR FAVORITOS
export const syncWishlistToFirebase = async (userId: string, wishlistData: any): Promise<void> => {
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    await setDoc(wishlistRef, { items: wishlistData, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error('Erro ao sincronizar favoritos:', error);
  }
};