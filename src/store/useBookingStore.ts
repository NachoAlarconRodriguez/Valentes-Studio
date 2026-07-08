import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { useServicesStore } from './useServicesStore';

const parseDurationToMinutes = (durationStr: string): number => {
  if (!durationStr) return 60;
  const clean = durationStr.toLowerCase().trim();
  let totalMinutes = 0;
  const hourMatch = clean.match(/(\d+)\s*(?:hrs|hr|hora|horas)/);
  if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
  const minMatch = clean.match(/(\d+)\s*(?:min|mins|minutos)/);
  if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
  if (totalMinutes === 0) {
    const fallbackMatch = clean.match(/(\d+)/);
    if (fallbackMatch) {
      totalMinutes = parseInt(fallbackMatch[1], 10);
      if (totalMinutes < 5) totalMinutes *= 60;
    }
  }
  return totalMinutes > 0 ? totalMinutes : 60;
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

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
  fetchPublicBookings: () => Promise<void>;
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
    const hasData = get().bookings.length > 0;
    if (!hasData) {
      set({ loading: true });
    }
    try {
      const { data: dbBookings, error: bErr } = await supabase
        .from('admin_bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (bErr) throw bErr;

      const { data: dbClients, error: cErr } = await supabase
        .from('clients')
        .select('phone, name, email, businesses, total_spent, last_visit, notes, not_so_good_client');

      if (cErr) throw cErr;

      const bookings: Booking[] = (dbBookings || []).map((b: any) => ({
        id: b.id,
        clientName: b.client_name,
        clientPhone: b.client_phone,
        clientEmail: b.client_email || '',
        category: b.category,
        serviceName: b.service_name,
        price: typeof b.price === 'number' ? `$${b.price.toLocaleString('es-CL')}` : b.price,
        specialistName: b.specialist_name,
        date: b.date,
        time: b.time,
        channel: b.channel,
        status: b.status,
        createdAt: b.created_at,
        giftCardUsed: b.gift_card_used
      }));

      const clients: ClientProfile[] = (dbClients || []).map((c: any) => ({
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
  
  fetchPublicBookings: async () => {
    const hasData = get().bookings.length > 0;
    if (!hasData) {
      set({ loading: true });
    }
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 30);
      const maxDateStr = maxDate.toISOString().split('T')[0];

      const { data: dbBookings, error: bErr } = await supabase
        .from('public_bookings')
        .select('id, specialist_name, date, time, service_name, status')
        .gte('date', todayStr)
        .lte('date', maxDateStr);

      if (bErr) throw bErr;

      const bookings: Booking[] = (dbBookings || []).map((b: any) => ({
        id: b.id,
        clientName: 'Reservado',
        clientPhone: '',
        clientEmail: '',
        category: 'barberia', // dummy
        serviceName: b.service_name,
        price: '',
        specialistName: b.specialist_name,
        date: b.date,
        time: b.time,
        channel: 'Web',
        status: b.status,
        createdAt: '',
        giftCardUsed: ''
      }));

      set({ bookings, clients: [], loading: false });
    } catch (error) {
      console.error('Error fetching public bookings:', error);
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

    const bookingPrice = typeof bookingData.price === 'number'
      ? bookingData.price
      : parseInt(bookingData.price.replace(/[^0-9]/g, ''), 10) || 0;

    try {
      // 0. Verificar traslapes de último segundo (Prevención de Doble Reserva / Race Condition)
      const { data: conflictingBookings, error: checkErr } = await supabase
        .from('bookings')
        .select('id, time, service_name')
        .eq('date', bookingData.date)
        .eq('specialist_name', bookingData.specialistName)
        .neq('status', 'bloqueado');

      if (checkErr) throw checkErr;

      if (conflictingBookings && conflictingBookings.length > 0) {
        let allServices = Object.keys(useServicesStore.getState().servicesData).flatMap(
          cat => useServicesStore.getState().servicesData[cat].services
        );

        if (allServices.length === 0) {
          const { data: dbServices } = await supabase.from('services').select('*');
          if (dbServices) {
            allServices = dbServices.map((s: any) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              duration: s.duration,
              category: s.category
            }));
          }
        }

        const newService = allServices.find(s => s.name.trim().toLowerCase() === bookingData.serviceName.trim().toLowerCase());
        const newServiceDuration = newService 
          ? (typeof newService.duration === 'number' ? newService.duration : parseDurationToMinutes(newService.duration)) 
          : 60;
        const slotStart = timeToMinutes(bookingData.time);
        const slotEnd = slotStart + newServiceDuration;

        for (const existing of conflictingBookings) {
          const existingStart = timeToMinutes(existing.time);
          const existingService = allServices.find(s => s.name.trim().toLowerCase() === existing.service_name.trim().toLowerCase());
          const existingDuration = existingService 
            ? (typeof existingService.duration === 'number' ? existingService.duration : parseDurationToMinutes(existingService.duration)) 
            : 60;
          const existingEnd = existingStart + existingDuration;

          if (slotStart < existingEnd && slotEnd > existingStart) {
            throw new Error(`El horario de las ${bookingData.time} hrs para ${bookingData.specialistName} acaba de ser reservado. Por favor, selecciona otro bloque.`);
          }
        }
      }

      // 1. Insert Booking in Supabase (Omit client_name and client_email, prices are INTEGER)
      const { error: bErr } = await supabase.from('bookings').insert({
        id: randomCode,
        client_phone: bookingData.clientPhone,
        category: bookingData.category,
        service_name: bookingData.serviceName,
        price: bookingPrice,
        specialist_name: bookingData.specialistName,
        date: bookingData.date,
        time: bookingData.time,
        channel,
        status,
        created_at: createdAt,
        gift_card_used: bookingData.giftCardUsed || null
      });

      if (bErr) throw bErr;

      // 2. Fetch or update CRM Client details in Supabase (Non-blocking to ensure emails are sent)
      try {
        const { data: existingClient, error: cFetchErr } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', bookingData.clientPhone)
          .maybeSingle();

        if (cFetchErr) throw cFetchErr;

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

          if (cInsertErr) {
            // Handle RLS invisible client duplicate key error (code 23505)
            if (cInsertErr.code === '23505') {
              console.log('Client already exists in database (hidden by RLS), ignoring insert duplicate error.');
            } else {
              throw cInsertErr;
            }
          }
        }
      } catch (clientErr) {
        console.error('Non-blocking CRM Client sync error:', clientErr);
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

      // Disparar correo de confirmación de reserva (Cliente + Staff/Admin)
      try {
        const allSpecs = useServicesStore.getState().specialistsList || [];
        const spec = allSpecs.find(s => s.name.trim().toLowerCase() === bookingData.specialistName.trim().toLowerCase());
        const specialistEmail = spec ? spec.email : '';

        fetch('/api/email', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            type: 'booking_confirmation',
            data: {
              ...newBooking,
              specialistEmail
            }
          })
        }).catch(err => console.error('Error enviando mail de confirmacion:', err));
      } catch (emailErr) {
        console.error('Error al resolver mail del especialista o disparar email:', emailErr);
      }

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
      // Obtener detalles de la reserva antes de eliminarla para enviar correo de cancelación
      const { data: bookingToCancel } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.filter(b => b.id !== id)
      }));

      // Disparar correo de cancelación si la reserva existía
      if (bookingToCancel) {
        try {
          const allSpecs = useServicesStore.getState().specialistsList || [];
          const spec = allSpecs.find(s => s.name.trim().toLowerCase() === bookingToCancel.specialist_name.trim().toLowerCase());
          const specialistEmail = spec ? spec.email : '';

          fetch('/api/email', {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              type: 'booking_cancelled',
              data: {
                id,
                clientName: bookingToCancel.client_name,
                clientEmail: bookingToCancel.client_email,
                clientPhone: bookingToCancel.client_phone,
                category: bookingToCancel.category,
                serviceName: bookingToCancel.service_name,
                date: bookingToCancel.date,
                time: bookingToCancel.time,
                specialistName: bookingToCancel.specialist_name,
                specialistEmail
              }
            })
          }).catch(err => console.error('Error enviando mail de cancelacion:', err));
        } catch (emailErr) {
          console.error('Error al disparar correo de cancelacion:', emailErr);
        }
      }
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
