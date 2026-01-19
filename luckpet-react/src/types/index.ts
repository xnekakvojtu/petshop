// src/types/index.ts - COMPLETO
export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'alimento' | 'vestimenta';
  image: string;
  description?: string;
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  features: string[];
  duration: number;
  price: number;
  description: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
  category?: string;
}

export interface Plan {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  isGuest: boolean;
  avatar: string;
  photoURL?: string;
  createdAt?: string;
  emailVerified?: boolean;
  phone?: string;
  role?: 'user' | 'admin';
}

export type UserRole = 'user' | 'admin';

// ⭐⭐ ATUALIZADO COM TELEFONE ⭐⭐
export interface Booking {
  id: string;
  userId: string;
  petName: string;
  petType: string;
  petBreed?: string;
  petAge?: number;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  professional?: string;
  duration: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  cancellationReason?: string;
  customerName?: string;
  customerPhone?: string; // ⭐⭐ TELEFONE ADICIONADO ⭐⭐
  customerEmail?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  professional?: string;
}

export interface AvailableDate {
  date: string;
  slots: TimeSlot[];
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  availableSlots: string[];
}

export type PaymentMethod = 'luckcoins' | 'pix' | 'credit_card' | 'debit_card' | 'money';

export interface PixPayment {
  qrCode: string;
  code: string;
  expiresAt: string;
  amount: number;
}

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  todayBookings: number;
  monthlyRevenue: number;
  popularServices: Array<{
    serviceName: string;
    count: number;
  }>;
}

export interface ScheduleConfig {
  openingTime: string;
  closingTime: string;
  slotDuration: number;
  maxSlotsPerTime: number;
  blockedDates: string[];
  workingDays: number[];
}