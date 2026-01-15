// src/hooks/useAdmin.ts - CORRIGIDO
import { useState, useEffect, useCallback } from 'react';
import { 
  getAllBookings,
  updateBookingStatus,
  getAllServices,
  createService,
  updateService as updateServiceFirebase,
  getAdminStats,
  getAllUsers
} from '../firebase/admin';
import { Booking, ServiceType, AdminStats, User } from '../types';

export const useAdmin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState({
    bookings: false,
    services: false,
    stats: false,
    users: false,
  });

  // 🔧 CORREÇÃO: useCallback para evitar re-criação da função
  const fetchAllBookings = useCallback(async (filters?: {
    date?: string;
    status?: string;
    serviceId?: string;
  }) => {
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const data = await getAllBookings(filters);
      setBookings(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  }, []);

  const handleUpdateBookingStatus = async (
    bookingId: string, 
    status: Booking['status'],
    reason?: string
  ) => {
    try {
      await updateBookingStatus(bookingId, status, reason);
      
      // Atualizar lista local
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status, cancellationReason: reason }
            : booking
        )
      );
      
      // Atualizar estatísticas
      fetchStats();
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  };

  const fetchAllServices = useCallback(async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const data = await getAllServices();
      setServices(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, []);

  const handleCreateService = async (serviceData: Omit<ServiceType, 'id'>) => {
    try {
      const newService = await createService(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  };

  const updateService = async (
    serviceId: string,
    updates: Partial<ServiceType>
  ): Promise<boolean> => {
    try {
      await updateServiceFirebase(serviceId, updates);
      
      // Atualizar lista local
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, ...updates }
            : service
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  };

  // 🔧 CORREÇÃO: useCallback para fetchStats
  const fetchStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const data = await getAdminStats();
      setStats(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const data = await getAllUsers();
      setUsers(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  // 🔧 CORREÇÃO: useEffect com dependências corretas
  useEffect(() => {
    fetchAllBookings();
    fetchAllServices();
    fetchStats();
    fetchAllUsers();
  }, [fetchAllBookings, fetchAllServices, fetchStats, fetchAllUsers]);

  return {
    bookings,
    services,
    users,
    stats,
    loading,
    fetchAllBookings,
    handleUpdateBookingStatus,
    fetchAllServices,
    handleCreateService,
    updateService,
    fetchStats,
    fetchAllUsers,
  };
};