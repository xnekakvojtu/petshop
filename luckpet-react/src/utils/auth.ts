// src/utils/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  credits: number;
  isGuest?: boolean;
}

export class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;

  private constructor() {
    this.loadUser();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulação - substituir por API real
    const mockUser: User = {
      id: '1',
      email,
      name: 'Usuário Teste',
      avatar: 'cachorro',
      credits: 50
    };

    this.user = mockUser;
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('userCredits', '50');
    
    return { success: true, user: mockUser };
  }

  async signup(email: string, password: string, name: string, avatar: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      avatar,
      credits: 50
    };

    this.user = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('userCredits', '50');
    localStorage.setItem('isNewUser', 'true');

    return { success: true, user: newUser };
  }

  async guestLogin(): Promise<{ success: boolean; user?: User; error?: string }> {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      email: 'convidado@luckpet.com',
      name: 'Convidado',
      avatar: 'cachorro',
      credits: 25,
      isGuest: true
    };

    this.user = guestUser;
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('userCredits', '25');
    localStorage.setItem('isNewUser', 'true');

    return { success: true, user: guestUser };
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
    // Manter créditos e carrinho para convidados
    if (!localStorage.getItem('isGuest')) {
      localStorage.removeItem('carrinho');
      localStorage.removeItem('favoritos');
    }
  }

  getUser(): User | null {
    return this.user;
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  isGuest(): boolean {
    return !!this.user?.isGuest;
  }

  getCredits(): number {
    const credits = localStorage.getItem('userCredits');
    return credits ? parseInt(credits) : 0;
  }

  addCredits(amount: number): void {
    const current = this.getCredits();
    localStorage.setItem('userCredits', (current + amount).toString());
  }

  deductCredits(amount: number): boolean {
    const current = this.getCredits();
    if (current >= amount) {
      localStorage.setItem('userCredits', (current - amount).toString());
      return true;
    }
    return false;
  }
}

export const auth = AuthManager.getInstance();