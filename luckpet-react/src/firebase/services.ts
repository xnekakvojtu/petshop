import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './index';
import { ServiceType } from '../types';

const servicesRef = collection(db, 'services');

export const createService = async (serviceData: Omit<ServiceType, 'id'>) => {
  try {
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return { id: docRef.id, ...serviceData };
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    throw error;
  }
};

export const updateService = async (serviceId: string, updates: Partial<ServiceType>) => {
  try {
    const serviceDoc = doc(db, 'services', serviceId);
    await updateDoc(serviceDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
};

export const deleteService = async (serviceId: string) => {
  try {
    const serviceDoc = doc(db, 'services', serviceId);
    await deleteDoc(serviceDoc);
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
};