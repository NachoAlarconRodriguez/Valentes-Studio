import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  category: 'barberia' | 'peluqueria' | 'terapias';
  serviceName: string;
  price: string;
  specialistName: string;
  date: string;
  time: string;
  channel: 'Web' | 'WhatsApp' | 'Presencial';
  status: 'confirmado' | 'pendiente' | 'en_proceso' | 'completado' | 'bloqueado';
  createdAt: string;
  giftCardUsed?: string;
}

export interface ClientProfile {
  name: string;
  phone: string;
  email: string;
  businesses: ('barberia' | 'peluqueria' | 'terapias')[];
  totalSpent: number;
  lastVisit: string;
  notes: string;
  notSoGoodClient?: boolean;
}

interface BookingStore {
  bookings: Booking[];
  clients: ClientProfile[];
  loading: boolean;
  
  // Actions
  fetchBookingsAndClients: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'channel' | 'status'> & Partial<Pick<Booking, 'channel' | 'status'>>) => Promise<string>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateClientNotes: (phone: string, notes: string) => Promise<void>;
  markAsNotGoodClient: (phone: string) => Promise<void>;
  deleteClient: (phone: string) => Promise<void>;
  updateClient: (oldPhone: string, updatedFields: { name: string; phone: string; email: string }) => Promise<void>;
}

const supabase = createClient();

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  clients: [],
  loading: false,

  fetchBookingsAndClients: async () => {
    set({ loading: true });
    try {
      const { data: dbBookings, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (bErr) throw bErr;

      const { data: dbClients, error: cErr } = await supabase
        .from('clients')
        .select('*');

      if (cErr) throw cErr;

      const bookings: Booking[] = (dbBookings || []).map((b) => ({
        id: b.id,
        clientName: b.client_name,
        clientPhone: b.client_phone,
        clientEmail: b.client_email || '',
        category: b.category,
        serviceName: b.service_name,
        price: b.price,
        specialistName: b.specialist_name,
        date: b.date,
        time: b.time,
        channel: b.channel,
        status: b.status,
        createdAt: b.created_at,
        giftCardUsed: b.gift_card_used
      }));

      const clients: ClientProfile[] = (dbClients || []).map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        businesses: c.businesses || [],
        totalSpent: c.total_spent || 0,
        lastVisit: c.last_visit || '',
        notes: c.notes || '',
        notSoGoodClient: c.not_so_good_client || false
      }));

      set({ bookings, clients, loading: false });
    } catch (error) {
      console.error('Error fetching bookings/clients:', error);
      set({ loading: false });
    }
  },

  addBooking: async (bookingData) => {
    const prefix = 
      bookingData.category === 'barberia' ? 'BAR' :
      bookingData.category === 'peluqueria' ? 'PEL' :
      bookingData.category === 'terapias' ? 'TER' : 'VAL';
    const randomCode = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const channel = bookingData.channel || (Math.random() > 0.4 ? 'Web' : 'WhatsApp');
    const status = bookingData.status || 'confirmado';
    const createdAt = new Date().toISOString();

    try {
      // 1. Insert Booking in Supabase
      const { error: bErr } = await supabase.from('bookings').insert({
        id: randomCode,
        client_name: bookingData.clientName,
        client_phone: bookingData.clientPhone,
        client_email: bookingData.clientEmail || '',
        category: bookingData.category,
        service_name: bookingData.serviceName,
        price: bookingData.price,
        specialist_name: bookingData.specialistName,
        date: bookingData.date,
        time: bookingData.time,
        channel,
        status,
        created_at: createdAt,
        gift_card_used: bookingData.giftCardUsed || null
      });

      if (bErr) throw bErr;

      // 2. Fetch or update CRM Client details in Supabase
      const { data: existingClient, error: cFetchErr } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', bookingData.clientPhone)
        .maybeSingle();

      if (cFetchErr) throw cFetchErr;

      const bookingPrice = parseInt(bookingData.price.replace(/[^0-9]/g, ''), 10) || 0;

      if (existingClient) {
        // Merge businesses array
        const businessesSet = new Set(existingClient.businesses || []);
        businessesSet.add(bookingData.category);
        const updatedBusinesses = Array.from(businessesSet);

        const { error: cUpdateErr } = await supabase
          .from('clients')
          .update({
            name: bookingData.clientName,
            email: bookingData.clientEmail || existingClient.email || '',
            businesses: updatedBusinesses,
            total_spent: (existingClient.total_spent || 0) + bookingPrice,
            last_visit: bookingData.date
          })
          .eq('phone', bookingData.clientPhone);

        if (cUpdateErr) throw cUpdateErr;
      } else {
        const { error: cInsertErr } = await supabase.from('clients').insert({
          phone: bookingData.clientPhone,
          name: bookingData.clientName,
          email: bookingData.clientEmail || '',
          businesses: [bookingData.category],
          total_spent: bookingPrice,
          last_visit: bookingData.date,
          notes: '',
          not_so_good_client: false
        });

        if (cInsertErr) throw cInsertErr;
      }

      // 3. Update local state
      const newBooking: Booking = {
        ...bookingData,
        id: randomCode,
        clientEmail: bookingData.clientEmail || '',
        channel,
        status,
        createdAt
      };

      set((state) => {
        const updatedBookings = [newBooking, ...state.bookings];
        const existingIdx = state.clients.findIndex(c => c.phone === bookingData.clientPhone);
        let updatedClients = [...state.clients];

        if (existingIdx !== -1) {
          const client = updatedClients[existingIdx];
          const newBusinesses = Array.from(new Set([...client.businesses, bookingData.category]));
          updatedClients[existingIdx] = {
            ...client,
            name: bookingData.clientName,
            email: bookingData.clientEmail || client.email,
            businesses: newBusinesses,
            totalSpent: client.totalSpent + bookingPrice,
            lastVisit: bookingData.date
          };
        } else {
          updatedClients.push({
            name: bookingData.clientName,
            phone: bookingData.clientPhone,
            email: bookingData.clientEmail || '',
            businesses: [bookingData.category],
            totalSpent: bookingPrice,
            lastVisit: bookingData.date,
            notes: ''
          });
        }

        return {
          bookings: updatedBookings,
          clients: updatedClients
        };
      });

    } catch (err) {
      console.error('Error adding booking:', err);
    }

    return randomCode;
  },

  updateBookingStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b)
      }));
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  },

  deleteBooking: async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.filter(b => b.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  },

  updateClientNotes: async (phone, notes) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ notes })
        .eq('phone', phone);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map(c => c.phone === phone ? { ...c, notes } : c)
      }));
    } catch (err) {
      console.error('Error updating client notes:', err);
    }
  },

  markAsNotGoodClient: async (phone) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ not_so_good_client: true })
        .eq('phone', phone);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map(c => c.phone === phone ? { ...c, notSoGoodClient: true } : c)
      }));
    } catch (err) {
      console.error('Error marking client as not good:', err);
    }
  },

  deleteClient: async (phone) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('phone', phone);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.filter(c => c.phone !== phone)
      }));
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  },

  updateClient: async (oldPhone, updatedFields) => {
    try {
      const { error: cErr } = await supabase
        .from('clients')
        .update({
          name: updatedFields.name,
          phone: updatedFields.phone,
          email: updatedFields.email
        })
        .eq('phone', oldPhone);

      if (cErr) throw cErr;

      const { error: bErr } = await supabase
        .from('bookings')
        .update({
          client_phone: updatedFields.phone,
          client_name: updatedFields.name,
          client_email: updatedFields.email
        })
        .eq('client_phone', oldPhone);

      if (bErr) throw bErr;

      set((state) => ({
        clients: state.clients.map(c => c.phone === oldPhone ? { ...c, ...updatedFields } : c),
        bookings: state.bookings.map(b => b.clientPhone === oldPhone ? { 
          ...b, 
          clientPhone: updatedFields.phone,
          clientName: updatedFields.name,
          clientEmail: updatedFields.email 
        } : b)
      }));
    } catch (err) {
      console.error('Error updating client:', err);
    }
  }
}));
