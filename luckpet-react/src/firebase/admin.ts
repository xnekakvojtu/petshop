// src/firebase/admin.ts - VERSÃO COMPLETA ATUALIZADA
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  addDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  limit,
  setDoc
} from 'firebase/firestore';
import { db } from './index';
import { Booking, ServiceType, AdminStats, User } from '../types';

const bookingsRef = collection(db, 'bookings');
const servicesRef = collection(db, 'services');
const usersRef = collection(db, 'users');

export const getAllBookings = async (filters?: {
  date?: string;
  status?: string;
  serviceId?: string;
}): Promise<Booking[]> => {
  try {
    console.log('🔍 Buscando todos os agendamentos...');
    
    let q = query(bookingsRef, orderBy('createdAt', 'desc'));
    
    if (filters?.date) {
      q = query(q, where('date', '==', filters.date));
    }
    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.serviceId && filters.serviceId !== 'all') {
      q = query(q, where('serviceId', '==', filters.serviceId));
    }
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      bookings.push({
        id: doc.id,
        userId: data.userId || '',
        petName: data.petName || 'Não informado',
        petType: data.petType || 'cachorro',
        petBreed: data.petBreed || '',
        petAge: data.petAge || 0,
        serviceId: data.serviceId || '',
        serviceName: data.serviceName || 'Serviço não informado',
        servicePrice: data.servicePrice || 0,
        date: data.date || '',
        time: data.time || '',
        status: data.status || 'pending',
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        professional: data.professional || 'A definir',
        duration: data.duration || 30,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'pending',
        cancellationReason: data.cancellationReason || '',
        customerName: data.customerName || data.clientName || '',
        customerPhone: data.customerPhone || data.phone || data.clientPhone || data.userPhone || '',
        customerEmail: data.customerEmail || data.email || '',
      });
    });
    
    console.log(`✅ ${bookings.length} agendamentos encontrados`);
    
    // DEBUG: Mostrar dados do primeiro agendamento
    if (bookings.length > 0) {
      console.log('📱 DEBUG - Primeiro agendamento:', {
        id: bookings[0].id,
        nome: bookings[0].customerName,
        telefone: bookings[0].customerPhone,
        email: bookings[0].customerEmail,
        campos: Object.keys(bookings[0])
      });
    }
    
    return bookings;
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Índice não configurado. Configure no Firestore Console.');
    }
    
    return [];
  }
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: Booking['status'],
  reason?: string
): Promise<boolean> => {
  try {
    console.log(`🔄 Atualizando agendamento ${bookingId} para ${status}`);
    
    const bookingDoc = doc(db, 'bookings', bookingId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    
    if (status === 'cancelled' && reason) {
      updateData.cancellationReason = reason;
    }
    
    await updateDoc(bookingDoc, updateData);
    console.log('✅ Status atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    throw error;
  }
};

export const getAllServices = async (): Promise<ServiceType[]> => {
  try {
    console.log('🔍 Buscando todos os serviços...');
    
    const q = query(servicesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const services: ServiceType[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      services.push({
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        duration: data.duration || 30,
        active: data.active !== false,
        category: data.category || 'geral',
      });
    });
    
    console.log(`✅ ${services.length} serviços encontrados`);
    return services;
    
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error);
    return [];
  }
};

export const createService = async (
  serviceData: Omit<ServiceType, 'id'>
): Promise<ServiceType> => {
  try {
    console.log('📝 Criando novo serviço...');
    
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const newService: ServiceType = {
      id: docRef.id,
      ...serviceData,
    };
    
    console.log('✅ Serviço criado com ID:', docRef.id);
    return newService;
  } catch (error) {
    console.error('❌ Erro ao criar serviço:', error);
    throw error;
  }
};

export const updateService = async (
  serviceId: string,
  updates: Partial<ServiceType>
): Promise<boolean> => {
  try {
    console.log(`🔄 Atualizando serviço ${serviceId}...`);
    
    const serviceDoc = doc(db, 'services', serviceId);
    await updateDoc(serviceDoc, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Serviço atualizado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error);
    throw error;
  }
};

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    console.log('📊 Calculando estatísticas...');
    
    const allBookings = await getAllBookings();
    const today = new Date().toISOString().split('T')[0];
    
    // DEBUG: Verificar formato das datas
    console.log('📅 HOJE (formato ISO):', today);
    console.log('📊 Primeiros 3 agendamentos:');
    allBookings.slice(0, 3).forEach((b, i) => {
      console.log(`  ${i+1}. ID: ${b.id}, Data: ${b.date}, Status: ${b.status}`);
    });
    
    // Filtro melhorado para "agendamentos hoje"
    const todayBookings = allBookings.filter(booking => {
      if (!booking.date) return false;
      
      try {
        // Tentar normalizar a data
        const bookingDate = booking.date.split('T')[0]; // Remove hora se existir
        return bookingDate === today;
      } catch (error) {
        console.log('⚠️ Erro ao processar data:', booking.date, error);
        return false;
      }
    }).length;
    
    console.log(`📈 Agendamentos hoje: ${todayBookings}`);
    
    const totalBookings = allBookings.length;
    const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().split('T')[0];
    
    const monthlyBookings = allBookings.filter(
      b => b.status === 'completed' && b.date >= firstDayOfMonth
    );
    
    const monthlyRevenue = monthlyBookings.reduce(
      (sum, booking) => sum + (booking.servicePrice || 0), 
      0
    );
    
    const serviceCounts: Record<string, number> = {};
    allBookings.forEach(booking => {
      if (booking.serviceName) {
        serviceCounts[booking.serviceName] = (serviceCounts[booking.serviceName] || 0) + 1;
      }
    });
    
    const popularServices = Object.entries(serviceCounts)
      .map(([serviceName, count]) => ({ serviceName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const stats: AdminStats = {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      todayBookings,
      monthlyRevenue,
      popularServices,
    };
    
    console.log('✅ Estatísticas calculadas');
    console.log('📊 Resumo:', {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      todayBookings,
      monthlyRevenue,
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    
    return {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      todayBookings: 0,
      monthlyRevenue: 0,
      popularServices: [],
    };
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('🔍 Buscando todos os usuários...');
    
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      users.push({
        id: doc.id,
        name: data.name || 'Usuário',
        email: data.email || '',
        credits: data.credits || 0,
        isGuest: data.isGuest || false,
        avatar: data.avatar || 'cachorro',
        photoURL: data.photoURL || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        emailVerified: data.emailVerified || false,
        phone: data.phone || '',
        role: data.role || 'user',
      });
    });
    
    console.log(`✅ ${users.length} usuários encontrados`);
    return users;
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    return [];
  }
};

export const updateUserRole = async (
  userId: string, 
  role: 'user' | 'admin'
): Promise<boolean> => {
  try {
    console.log(`👑 Atualizando role do usuário ${userId} para ${role}`);
    
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { role });
    
    console.log('✅ Role atualizada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
    throw error;
  }
};

export const getScheduleConfig = async () => {
  try {
    const configDoc = doc(db, 'config', 'schedule');
    const snapshot = await getDoc(configDoc);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    
    const defaultConfig = {
      openingTime: '08:00',
      closingTime: '18:00',
      slotDuration: 30,
      maxSlotsPerTime: 2,
      blockedDates: [],
      workingDays: [1, 2, 3, 4, 5],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(configDoc, defaultConfig);
    return defaultConfig;
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    throw error;
  }
};

export default {
  getAllBookings,
  updateBookingStatus,
  getAllServices,
  createService,
  updateService,
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getScheduleConfig,
};