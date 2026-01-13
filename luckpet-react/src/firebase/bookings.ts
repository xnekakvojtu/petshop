// src/firebase/bookings.ts - VERSÃO LIMPA E FUNCIONAL
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './index';
import { Booking, AvailableDate, TimeSlot, PaymentMethod } from '../types';

const bookingsRef = collection(db, 'bookings');

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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 1. CRIAR AGENDAMENTO
export const createBooking = async (
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & {
    paymentMethod?: PaymentMethod;
  }
): Promise<string> => {
  try {
    console.log('📝 Criando agendamento:', bookingData.serviceName);
    
    const bookingToSave: FirestoreBooking = {
      userId: bookingData.userId || '',
      petName: bookingData.petName || 'Meu Pet',
      petType: bookingData.petType || 'cachorro',
      petBreed: bookingData.petBreed || '',
      petAge: bookingData.petAge || 0,
      serviceId: bookingData.serviceId || '',
      serviceName: bookingData.serviceName || 'Serviço',
      servicePrice: bookingData.servicePrice || 0,
      date: bookingData.date || new Date().toISOString().split('T')[0],
      time: bookingData.time || '10:00',
      status: bookingData.status || 'pending',
      notes: bookingData.notes || '',
      duration: bookingData.duration || 30,
      professional: bookingData.professional || 'A definir',
      paymentMethod: bookingData.paymentMethod || 'luckcoins',
      paymentStatus: bookingData.paymentMethod === 'luckcoins' ? 'paid' : 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(bookingsRef, bookingToSave);
    console.log('✅ Agendamento criado com ID:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erro ao criar agendamento:', error);
    throw error;
  }
};

// 2. BUSCAR AGENDAMENTOS DO USUÁRIO
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    console.log('🔍 Buscando agendamentos para usuário:', userId);
    
    if (!userId || userId.trim() === '') {
      console.log('⚠️  ID de usuário inválido');
      return [];
    }
    
    // Tenta com query simples primeiro
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreBooking;
      
      // Converter Timestamp para string ISO
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
        createdAt,
        updatedAt,
      };
      
      bookings.push(booking);
    });
    
    // Ordenar por data (mais recente primeiro)
    bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`✅ Encontrados ${bookings.length} agendamento(s)`);
    return bookings;
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    
    // Se for erro de índice, retorna array vazio
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Índice não está pronto. Retornando array vazio.');
      return [];
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
    
    // Gerar código PIX simulado
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
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      amount,
    };
    
    console.log('✅ PIX gerado com sucesso');
    return pixData;
  } catch (error) {
    console.error('❌ Erro ao gerar PIX:', error);
    throw error;
  }
};

// 7. VERIFICAR HORÁRIO DISPONÍVEL
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
    
    // Se for erro de índice, assume que está disponível
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Usando fallback: assumindo horário disponível');
      return true;
    }
    
    return false;
  }
};

// 8. BUSCAR DATAS DISPONÍVEIS
export const getAvailableDates = async (serviceId: string): Promise<AvailableDate[]> => {
  try {
    console.log(`📅 Buscando datas disponíveis para: ${serviceId}`);
    
    const today = new Date();
    const dates: AvailableDate[] = [];
    
    // Gerar 14 dias a partir de amanhã
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Ignorar fins de semana
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
      
      // Horários padrão
      const slots: TimeSlot[] = [
        { time: '08:00', available: true, professional: 'Dra. Ana Silva' },
        { time: '09:00', available: true, professional: 'Dr. Carlos Santos' },
        { time: '10:00', available: true, professional: 'Dra. Ana Silva' },
        { time: '11:00', available: true, professional: 'Dr. Carlos Santos' },
        { time: '13:00', available: true, professional: 'Dra. Ana Silva' },
        { time: '14:00', available: true, professional: 'Dr. Carlos Santos' },
        { time: '15:00', available: true, professional: 'Dra. Ana Silva' },
        { time: '16:00', available: true, professional: 'Dr. Carlos Santos' },
      ];
      
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

// 9. BUSCAR AGENDAMENTO POR ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    console.log(`🔍 Buscando agendamento: ${bookingId}`);
    
    // Esta função seria implementada com getDoc
    // Por enquanto retornamos null (simulação)
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar agendamento:', error);
    return null;
  }
};

// 10. SINCRONIZAR AGENDAMENTOS (para testes)
export const syncMockBookings = async (userId: string): Promise<void> => {
  try {
    console.log(`🔄 Sincronizando agendamentos mock para: ${userId}`);
    
    // Verificar se o usuário já tem agendamentos
    const existingBookings = await getUserBookings(userId);
    
    if (existingBookings.length === 0) {
      console.log('📝 Criando agendamentos de exemplo...');
      
      // Criar alguns agendamentos de exemplo
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
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias
          time: '10:00',
          status: 'confirmed' as const,
          notes: 'Cuidado com as orelhas',
          duration: 60,
          professional: 'Dra. Ana Silva',
          paymentMethod: 'luckcoins' as PaymentMethod,
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
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias
          time: '14:00',
          status: 'pending' as const,
          notes: 'Primeira consulta',
          duration: 30,
          professional: 'Dr. Carlos Santos',
          paymentMethod: 'pix' as PaymentMethod,
        }
      ];
      
      for (const booking of mockBookings) {
        await createBooking(booking);
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