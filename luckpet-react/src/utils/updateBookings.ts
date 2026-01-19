// src/utils/updateBookings.ts
import { 
  collection, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/index';

export const updateAllOldBookings = async (): Promise<number> => {
  try {
    console.log('🔄 Atualizando TODOS os agendamentos antigos...');
    
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    
    let updatedCount = 0;
    const updates: Promise<void>[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Se não tem customerPhone, adiciona campos
      if (!data.customerPhone) {
        const updatePromise = updateDoc(doc.ref, {
          customerPhone: data.phone || data.userPhone || '(11) 99999-9999',
          customerName: data.clientName || data.userName || 'Cliente',
          customerEmail: data.email || data.userEmail || 'cliente@email.com',
          updatedAt: serverTimestamp()
        }).then(() => {
          console.log(`✅ Atualizado: ${doc.id}`);
          updatedCount++;
        }).catch((error) => {
          console.error(`❌ Erro em ${doc.id}:`, error);
        });
        
        updates.push(updatePromise);
      }
    });
    
    await Promise.all(updates);
    console.log(`🎉 ${updatedCount} agendamentos atualizados com sucesso!`);
    return updatedCount;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamentos:', error);
    throw error;
  }
};