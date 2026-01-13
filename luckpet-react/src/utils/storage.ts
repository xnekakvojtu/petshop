// src/utils/storage.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'alimento' | 'vestimenta';
  image: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  credits: number;
  isGuest?: boolean;
}

// Gerenciamento de Carrinho
export const getCart = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '{}');
  } catch {
    return {};
  }
};

export const saveCart = (cart: Record<string, number>) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToCart = (productId: string): Record<string, number> => {
  const cart = getCart();
  const newCart = {
    ...cart,
    [productId]: (cart[productId] || 0) + 1
  };
  saveCart(newCart);
  return newCart;
};

export const removeFromCart = (productId: string): Record<string, number> => {
  const cart = getCart();
  const newCart = { ...cart };
  delete newCart[productId];
  saveCart(newCart);
  return newCart;
};

export const updateCartQuantity = (productId: string, quantity: number): Record<string, number> => {
  const cart = getCart();
  const newCart = { ...cart };
  
  if (quantity <= 0) {
    delete newCart[productId];
  } else {
    newCart[productId] = quantity;
  }
  
  saveCart(newCart);
  return newCart;
};

// Gerenciamento de Favoritos
export const getWishlist = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  } catch {
    return [];
  }
};

export const saveWishlist = (wishlist: string[]) => {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

export const toggleWishlist = (productId: string): string[] => {
  const wishlist = getWishlist();
  const newWishlist = wishlist.includes(productId)
    ? wishlist.filter(id => id !== productId)
    : [...wishlist, productId];
  
  saveWishlist(newWishlist);
  return newWishlist;
};

// Gerenciamento de Usuário
export const getUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const saveUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isGuest');
};

export const getCredits = (): number => {
  return parseInt(localStorage.getItem('userCredits') || '0');
};

export const updateCredits = (credits: number) => {
  localStorage.setItem('userCredits', credits.toString());
};

// Contadores
export const getCartCount = (): number => {
  const cart = getCart();
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
};

export const getWishlistCount = (): number => {
  return getWishlist().length;
};