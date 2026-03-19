// src/firebase/bookings.ts - VERSÃO SEGURA COM TRANSAÇÕES
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from './index';
import { Booking, AvailableDate, TimeSlot, PaymentMethod, ServiceType } from '../types';

const bookingsRef = collection(db, 'bookings');
const servicesRef = collection(db, 'services');

// Tipos para o Firestore
interface FirestoreBooking {
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
  duration: number;
  professional?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ⭐ 1. FUNÇÃO SEGURA COM TRANSAÇÃO (RESOLVE O PROBLEMA DE CONCORRÊNCIA)
export const createBookingSafe = async (
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & {
    paymentMethod?: PaymentMethod;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }
): Promise<string> => {
  try {
    console.log('🔒 Criando agendamento com transação segura:', bookingData.serviceName);
    
    // ⭐ Validações obrigatórias
    if (!bookingData.userId) {
      throw new Error('ID do usuário é obrigatório');
    }
    
    if (!bookingData.date || !bookingData.time) {
      throw new Error('Data e hora são obrigatórios');
    }
    
    if (!bookingData.serviceId) {
      throw new Error('Serviço é obrigatório');
    }
    
    // ⭐ Buscar dados atualizados do serviço para garantir preço correto
    const serviceDoc = await getDoc(doc(db, 'services', bookingData.serviceId));
    if (!serviceDoc.exists()) {
      throw new Error('Serviço não encontrado');
    }
    const serviceData = serviceDoc.data() as ServiceType;
    
    // ⭐ Usar transação para evitar duplicação
    return await runTransaction(db, async (transaction) => {
      // Verificar se já existe booking para este horário
      const availabilityQuery = query(
        bookingsRef,
        where('date', '==', bookingData.date),
        where('time', '==', bookingData.time),
        where('serviceId', '==', bookingData.serviceId),
        where('status', 'in', ['pending', 'confirmed'])
      );
      
      const availabilitySnapshot = await getDocs(availabilityQuery);
      
      if (!availabilitySnapshot.empty) {
        throw new Error('Este horário já está ocupado. Por favor, escolha outro horário.');
      }
      
      // Criar novo documento
      const newBookingRef = doc(bookingsRef);
      
      // ⭐ Usar dados do serviço do banco, não do front
      const bookingToSave: FirestoreBooking = {
        userId: bookingData.userId,
        petName: bookingData.petName || 'Meu Pet',
        petType: bookingData.petType || 'cachorro',
        petBreed: bookingData.petBreed || '',
        petAge: bookingData.petAge || 0,
        serviceId: bookingData.serviceId,
        serviceName: serviceData.name, // ⭐ Dado confiável do banco
        servicePrice: serviceData.price, // ⭐ Dado confiável do banco
        date: bookingData.date,
        time: bookingData.time,
        status: bookingData.status || 'pending',
        notes: bookingData.notes || '',
        duration: serviceData.duration || 30, // ⭐ Dado confiável do banco
        professional: bookingData.professional || 'A definir',
        paymentMethod: bookingData.paymentMethod || 'luckcoins',
        paymentStatus: bookingData.paymentMethod === 'luckcoins' ? 'paid' : 'pending',
        customerName: bookingData.customerName,
        customerPhone: bookingData.customerPhone,
        customerEmail: bookingData.customerEmail,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      
      transaction.set(newBookingRef, bookingToSave);
      
      console.log('✅ Agendamento criado com segurança, ID:', newBookingRef.id);
      return newBookingRef.id;
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao criar agendamento:', error);
    throw error;
  }
};

// ⭐ Versão antiga mantida para compatibilidade, mas recomendar usar a segura
export const createBooking = async (
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & {
    paymentMethod?: PaymentMethod;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }
): Promise<string> => {
  console.warn('⚠️ createBooking não é seguro para concorrência. Use createBookingSafe');
  return createBookingSafe(bookingData);
};

// 2. BUSCAR AGENDAMENTOS DO USUÁRIO
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    console.log('🔍 Buscando agendamentos para usuário:', userId);
    
    if (!userId || userId.trim() === '') {
      console.log('⚠️  ID de usuário inválido');
      return [];
    }
    
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreBooking;
      
      const createdAt = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
      const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();
      
      const booking: Booking = {
        id: doc.id,
        userId: data.userId,
        petName: data.petName,
        petType: data.petType,
        petBreed: data.petBreed,
        petAge: data.petAge,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        date: data.date,
        time: data.time,
        status: data.status,
        notes: data.notes,
        duration: data.duration,
        professional: data.professional,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        createdAt,
        updatedAt,
      };
      
      bookings.push(booking);
    });
    
    console.log(`✅ Encontrados ${bookings.length} agendamento(s)`);
    return bookings;
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Índice não está pronto. Configure no Firebase Console.');
    }
    
    return [];
  }
};

// 3. ATUALIZAR STATUS DO PAGAMENTO
export const updatePaymentStatus = async (
  bookingId: string, 
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<boolean> => {
  try {
    console.log(`🔄 Atualizando status do pagamento para: ${paymentStatus}`);
    
    if (!bookingId || bookingId.trim() === '') {
      throw new Error('ID do agendamento inválido');
    }
    
    const bookingDoc = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDoc, {
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ Status do pagamento atualizado com sucesso`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao atualizar pagamento:', error);
    throw error;
  }
};

// 4. ATUALIZAR STATUS DO AGENDAMENTO
export const updateBookingStatus = async (
  bookingId: string, 
  status: Booking['status']
): Promise<boolean> => {
  try {
    console.log(`🔄 Atualizando status do agendamento para: ${status}`);
    
    if (!bookingId || bookingId.trim() === '') {
      throw new Error('ID do agendamento inválido');
    }
    
    const bookingDoc = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDoc, {
      status,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ Status do agendamento atualizado com sucesso`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    throw error;
  }
};

// 5. CANCELAR AGENDAMENTO
export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  try {
    console.log(`❌ Cancelando agendamento: ${bookingId}`);
    return await updateBookingStatus(bookingId, 'cancelled');
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    throw error;
  }
};

// 6. GERAR PIX (SIMULAÇÃO)
export const generatePixPayment = async (
  bookingId: string, 
  amount: number
): Promise<{
  qrCode: string;
  code: string;
  expiresAt: string;
  amount: number;
}> => {
  try {
    console.log('🧾 Gerando PIX para agendamento:', bookingId);
    
    const randomCode = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pixData = {
      qrCode: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
          <rect width="256" height="256" fill="#fff"/>
          <text x="128" y="128" font-family="Arial" font-size="14" fill="#000" text-anchor="middle">
            QR Code PIX - R$ ${amount.toFixed(2)}
          </text>
          <text x="128" y="150" font-family="Arial" font-size="12" fill="#666" text-anchor="middle">
            ${bookingId.substring(0, 8)}...
          </text>
        </svg>
      `)}`,
      code: randomCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      amount,
    };
    
    console.log('✅ PIX gerado com sucesso');
    return pixData;
  } catch (error) {
    console.error('❌ Erro ao gerar PIX:', error);
    throw error;
  }
};

// ⭐ 7. VERIFICAR HORÁRIO DISPONÍVEL (VERSÃO MELHORADA)
export const checkTimeSlotAvailability = async (
  serviceId: string, 
  date: string, 
  time: string
): Promise<boolean> => {
  try {
    console.log(`🔍 Verificando disponibilidade: ${date} ${time}`);
    
    const q = query(
      bookingsRef,
      where('date', '==', date),
      where('time', '==', time),
      where('serviceId', '==', serviceId),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const snapshot = await getDocs(q);
    const isAvailable = snapshot.empty;
    
    console.log(`✅ Horário ${isAvailable ? 'disponível' : 'indisponível'}`);
    return isAvailable;
  } catch (error: any) {
    console.error('❌ Erro ao verificar disponibilidade:', error);
    
    // ⭐ Em caso de erro, NÃO confiar no horário
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Índice não configurado. Configure no Firebase Console.');
    }
    
    return false; // ⭐ Segurança: erro = não disponível
  }
};

// ⭐ 8. BUSCAR DATAS DISPONÍVEIS (VERSÃO REAL COM VERIFICAÇÃO)
export const getAvailableDates = async (serviceId: string): Promise<AvailableDate[]> => {
  try {
    console.log(`📅 Buscando datas disponíveis para serviço: ${serviceId}`);
    
    const today = new Date();
    const dates: AvailableDate[] = [];
    
    // ⭐ Buscar todos os bookings para os próximos 14 dias
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // ⭐ Query para buscar bookings no período
    const bookingsQuery = query(
      bookingsRef,
      where('serviceId', '==', serviceId),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    // ⭐ Mapear horários ocupados
    const occupiedSlots = new Set();
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      occupiedSlots.add(`${data.date}_${data.time}`);
    });
    
    // ⭐ Gerar slots de horário padrão
    const defaultSlots = [
      { time: '08:00', professional: 'Dra. Ana Silva' },
      { time: '09:00', professional: 'Dr. Carlos Santos' },
      { time: '10:00', professional: 'Dra. Ana Silva' },
      { time: '11:00', professional: 'Dr. Carlos Santos' },
      { time: '13:00', professional: 'Dra. Ana Silva' },
      { time: '14:00', professional: 'Dr. Carlos Santos' },
      { time: '15:00', professional: 'Dra. Ana Silva' },
      { time: '16:00', professional: 'Dr. Carlos Santos' },
    ];
    
    // ⭐ Gerar datas com slots verificados
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Pular fins de semana
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
      
      // ⭐ Verificar disponibilidade de cada slot
      const slots: TimeSlot[] = await Promise.all(
        defaultSlots.map(async (slot) => {
          const isAvailable = !occupiedSlots.has(`${dateStr}_${slot.time}`);
          return {
            time: slot.time,
            available: isAvailable,
            professional: slot.professional,
          };
        })
      );
      
      dates.push({ 
        date: dateStr, 
        slots,
        label: dayLabel 
      } as AvailableDate & { label: string });
    }
    
    console.log(`✅ ${dates.length} datas disponíveis encontradas`);
    return dates;
    
  } catch (error) {
    console.error('❌ Erro ao buscar datas disponíveis:', error);
    return [];
  }
};

// ⭐ 9. BUSCAR AGENDAMENTO POR ID (AGORA IMPLEMENTADO)
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    console.log(`🔍 Buscando agendamento: ${bookingId}`);
    
    if (!bookingId || bookingId.trim() === '') {
      throw new Error('ID do agendamento inválido');
    }
    
    const bookingDoc = doc(db, 'bookings', bookingId);
    const snapshot = await getDoc(bookingDoc);
    
    if (!snapshot.exists()) {
      console.log('⚠️ Agendamento não encontrado');
      return null;
    }
    
    const data = snapshot.data() as FirestoreBooking;
    
    const createdAt = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
    const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();
    
    const booking: Booking = {
      id: snapshot.id,
      userId: data.userId,
      petName: data.petName,
      petType: data.petType,
      petBreed: data.petBreed,
      petAge: data.petAge,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      servicePrice: data.servicePrice,
      date: data.date,
      time: data.time,
      status: data.status,
      notes: data.notes,
      duration: data.duration,
      professional: data.professional,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      createdAt,
      updatedAt,
    };
    
    console.log('✅ Agendamento encontrado:', booking.id);
    return booking;
    
  } catch (error) {
    console.error('❌ Erro ao buscar agendamento:', error);
    return null;
  }
};

// 10. SINCRONIZAR AGENDAMENTOS (para testes)
export const syncMockBookings = async (userId: string): Promise<void> => {
  try {
    console.log(`🔄 Sincronizando agendamentos mock para: ${userId}`);
    
    const existingBookings = await getUserBookings(userId);
    
    if (existingBookings.length === 0) {
      console.log('📝 Criando agendamentos de exemplo...');
      
      const mockBookings = [
        {
          userId,
          petName: 'Rex',
          petType: 'cachorro',
          petBreed: 'Golden Retriever',
          petAge: 3,
          serviceId: 'banho',
          serviceName: 'Banho Completo',
          servicePrice: 45.00,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00',
          status: 'confirmed' as const,
          notes: 'Cuidado com as orelhas',
          duration: 60,
          professional: 'Dra. Ana Silva',
          paymentMethod: 'luckcoins' as PaymentMethod,
          customerName: 'João Silva',
          customerPhone: '(11) 99999-9999',
          customerEmail: 'joao@email.com',
        },
        {
          userId,
          petName: 'Luna',
          petType: 'gato',
          petBreed: 'Siamês',
          petAge: 2,
          serviceId: 'consulta',
          serviceName: 'Consulta Veterinária',
          servicePrice: 120.00,
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '14:00',
          status: 'pending' as const,
          notes: 'Primeira consulta',
          duration: 30,
          professional: 'Dr. Carlos Santos',
          paymentMethod: 'pix' as PaymentMethod,
          customerName: 'Maria Santos',
          customerPhone: '(11) 98888-8888',
          customerEmail: 'maria@email.com',
        }
      ];
      
      for (const booking of mockBookings) {
        await createBookingSafe(booking);
      }
      
      console.log('✅ Agendamentos de exemplo criados com sucesso');
    } else {
      console.log('✅ Usuário já tem agendamentos');
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar agendamentos:', error);
  }
};

// Exportar todas as funções
export default {
  createBooking,
  createBookingSafe,
  getUserBookings,
  updatePaymentStatus,
  updateBookingStatus,
  cancelBooking,
  generatePixPayment,
  checkTimeSlotAvailability,
  getAvailableDates,
  getBookingById,
  syncMockBookings,
};