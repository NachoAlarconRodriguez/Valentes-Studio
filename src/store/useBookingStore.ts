import { create } from 'zustand';

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
  channel: 'Web' | 'WhatsApp' | 'Walk-in';
  status: 'confirmado' | 'pendiente' | 'completado' | 'bloqueado';
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
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'channel' | 'status'> & Partial<Pick<Booking, 'channel' | 'status'>>) => string;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  deleteBooking: (id: string) => void;
  updateClientNotes: (phone: string, notes: string) => void;
  markAsNotGoodClient: (phone: string) => void;
}

// Initial mockup data
const initialBookings: Booking[] = [
  {
    id: 'RIT-394812',
    clientName: 'Tomás Pérez',
    clientPhone: '+56 9 8831 2234',
    clientEmail: 'tomas.perez@gmail.com',
    category: 'barberia',
    serviceName: 'Corte de Cabello',
    price: '$15.000',
    specialistName: 'Carlos Mendoza',
    date: new Date().toISOString().split('T')[0], // hoy
    time: '09:00',
    channel: 'Web',
    status: 'confirmado',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RIT-901248',
    clientName: 'Felipe Castro',
    clientPhone: '+56 9 7721 9934',
    clientEmail: 'felipe.castro@outlook.com',
    category: 'barberia',
    serviceName: 'Perfilado navaja',
    price: '$15.000',
    specialistName: 'Enrique Soto',
    date: new Date().toISOString().split('T')[0], // hoy
    time: '12:00',
    channel: 'WhatsApp',
    status: 'confirmado',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RIT-773124',
    clientName: 'Andrés Vicuña',
    clientPhone: '+56 9 6611 8844',
    clientEmail: 'andres.vic@live.cl',
    category: 'barberia',
    serviceName: 'Corte de cabello + Perfilado de barba',
    price: '$25.000',
    specialistName: 'Marcos Delgado',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // mañana
    time: '15:00',
    channel: 'Walk-in',
    status: 'confirmado',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RIT-482103',
    clientName: 'María José Plaza',
    clientPhone: '+56 9 9988 7766',
    clientEmail: 'mj.plaza@gmail.com',
    category: 'peluqueria',
    serviceName: 'Coloración Orgánica Integral',
    price: '$65.000',
    specialistName: 'Sofia Valente',
    date: new Date().toISOString().split('T')[0], // hoy
    time: '10:30',
    channel: 'Web',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RIT-591243',
    clientName: 'Camila Silva',
    clientPhone: '+56 9 8877 6655',
    clientEmail: 'cami.silva@uai.cl',
    category: 'peluqueria',
    serviceName: 'Peinado Editorial & Ondas',
    price: '$30.000',
    specialistName: 'Valentina Paz',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // mañana
    time: '13:30',
    channel: 'WhatsApp',
    status: 'confirmado',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RIT-103948',
    clientName: 'Tomás Pérez',
    clientPhone: '+56 9 8831 2234',
    clientEmail: 'tomas.perez@gmail.com',
    category: 'terapias',
    serviceName: 'Masaje de Piedras Calientes (Obsidiana)',
    price: '$55.000',
    specialistName: 'Mateo Silva',
    date: new Date().toISOString().split('T')[0], // hoy
    time: '15:00',
    channel: 'Web',
    status: 'confirmado',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RIT-229481',
    clientName: 'Javiera Montes',
    clientPhone: '+56 9 5544 3322',
    clientEmail: 'javiera.montes@gmail.com',
    category: 'terapias',
    serviceName: 'Alineación de Chakras & Reiki',
    price: '$45.000',
    specialistName: 'Elena Rostova',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // mañana
    time: '16:30',
    channel: 'WhatsApp',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  },
  // Historical bookings - Last 30 days
  {
    id: 'RIT-112233',
    clientName: 'Felipe Castro',
    clientPhone: '+56 9 7721 9934',
    clientEmail: 'felipe.castro@outlook.com',
    category: 'barberia',
    serviceName: 'Corte de Cabello',
    price: '$15.000',
    specialistName: 'Carlos Mendoza',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // ayer
    time: '10:00',
    channel: 'Web',
    status: 'completado',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'RIT-445566',
    clientName: 'María José Plaza',
    clientPhone: '+56 9 9988 7766',
    clientEmail: 'mj.plaza@gmail.com',
    category: 'peluqueria',
    serviceName: 'Corte de Diseño & Movimiento',
    price: '$38.000',
    specialistName: 'Sofia Valente',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // hace 2 días
    time: '14:30',
    channel: 'Walk-in',
    status: 'completado',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'RIT-778899',
    clientName: 'Camila Silva',
    clientPhone: '+56 9 8877 6655',
    clientEmail: 'cami.silva@uai.cl',
    category: 'peluqueria',
    serviceName: 'Coloración Orgánica Integral',
    price: '$65.000',
    specialistName: 'Valentina Paz',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // hace 3 días
    time: '11:00',
    channel: 'WhatsApp',
    status: 'completado',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'RIT-101112',
    clientName: 'Javiera Montes',
    clientPhone: '+56 9 5544 3322',
    clientEmail: 'javiera.montes@gmail.com',
    category: 'terapias',
    serviceName: 'Masaje de Piedras Calientes (Obsidiana)',
    price: '$55.000',
    specialistName: 'Mateo Silva',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // hace 3 días
    time: '16:00',
    channel: 'Web',
    status: 'completado',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'RIT-131415',
    clientName: 'Tomás Pérez',
    clientPhone: '+56 9 8831 2234',
    clientEmail: 'tomas.perez@gmail.com',
    category: 'barberia',
    serviceName: 'Perfilado navaja',
    price: '$15.000',
    specialistName: 'Enrique Soto',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // hace 4 días
    time: '17:30',
    channel: 'Walk-in',
    status: 'completado',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'RIT-161718',
    clientName: 'Andrés Vicuña',
    clientPhone: '+56 9 6611 8844',
    clientEmail: 'andres.vic@live.cl',
    category: 'barberia',
    serviceName: 'Corte de Cabello',
    price: '$15.000',
    specialistName: 'Marcos Delgado',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // hace 5 días
    time: '10:00',
    channel: 'Web',
    status: 'completado',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'RIT-192021',
    clientName: 'Camila Silva',
    clientPhone: '+56 9 8877 6655',
    clientEmail: 'cami.silva@uai.cl',
    category: 'terapias',
    serviceName: 'Alineación de Chakras & Reiki',
    price: '$45.000',
    specialistName: 'Elena Rostova',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], // hace 6 días
    time: '14:00',
    channel: 'WhatsApp',
    status: 'completado',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'RIT-222324',
    clientName: 'María José Plaza',
    clientPhone: '+56 9 9988 7766',
    clientEmail: 'mj.plaza@gmail.com',
    category: 'peluqueria',
    serviceName: 'Tratamiento Seda Capilar y Brillo',
    price: '$48.000',
    specialistName: 'Lucía Rivas',
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0], // hace 8 días
    time: '15:30',
    channel: 'Web',
    status: 'completado',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'RIT-252627',
    clientName: 'Tomás Pérez',
    clientPhone: '+56 9 8831 2234',
    clientEmail: 'tomas.perez@gmail.com',
    category: 'barberia',
    serviceName: 'servicio corte y barba',
    price: '$23.000',
    specialistName: 'Carlos Mendoza',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], // hace 10 días
    time: '11:00',
    channel: 'WhatsApp',
    status: 'completado',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'RIT-282930',
    clientName: 'Felipe Castro',
    clientPhone: '+56 9 7721 9934',
    clientEmail: 'felipe.castro@outlook.com',
    category: 'barberia',
    serviceName: 'Corte de Cabello',
    price: '$15.000',
    specialistName: 'Enrique Soto',
    date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0], // hace 12 días
    time: '12:00',
    channel: 'Web',
    status: 'completado',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'RIT-313233',
    clientName: 'Javiera Montes',
    clientPhone: '+56 9 5544 3322',
    clientEmail: 'javiera.montes@gmail.com',
    category: 'terapias',
    serviceName: 'Sonoterapia Vibracional & Cuencos',
    price: '$48.000',
    specialistName: 'Elena Rostova',
    date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0], // hace 15 días
    time: '16:00',
    channel: 'Walk-in',
    status: 'completado',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'RIT-343536',
    clientName: 'Andrés Vicuña',
    clientPhone: '+56 9 6611 8844',
    clientEmail: 'andres.vic@live.cl',
    category: 'barberia',
    serviceName: 'Corte de cabello + Perfilado de barba',
    price: '$25.000',
    specialistName: 'Marcos Delgado',
    date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0], // hace 18 días
    time: '15:00',
    channel: 'WhatsApp',
    status: 'completado',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 'RIT-373839',
    clientName: 'Camila Silva',
    clientPhone: '+56 9 8877 6655',
    clientEmail: 'cami.silva@uai.cl',
    category: 'peluqueria',
    serviceName: 'Peinado Editorial & Ondas',
    price: '$30.000',
    specialistName: 'Valentina Paz',
    date: new Date(Date.now() - 22 * 86400000).toISOString().split('T')[0], // hace 22 días
    time: '13:00',
    channel: 'Web',
    status: 'completado',
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString()
  },
  {
    id: 'RIT-404142',
    clientName: 'María José Plaza',
    clientPhone: '+56 9 9988 7766',
    clientEmail: 'mj.plaza@gmail.com',
    category: 'terapias',
    serviceName: 'Ritual Desintoxicante Corporal',
    price: '$70.000',
    specialistName: 'Mateo Silva',
    date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0], // hace 25 días
    time: '17:00',
    channel: 'Walk-in',
    status: 'completado',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'RIT-434445',
    clientName: 'Tomás Pérez',
    clientPhone: '+56 9 8831 2234',
    clientEmail: 'tomas.perez@gmail.com',
    category: 'peluqueria',
    serviceName: 'Corte de Diseño & Movimiento',
    price: '$38.000',
    specialistName: 'Andrés Silva',
    date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0], // hace 28 días
    time: '10:30',
    channel: 'WhatsApp',
    status: 'completado',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
  }
];

const initialClients: ClientProfile[] = [
  {
    name: 'Tomás Pérez',
    phone: '+56 9 8831 2234',
    email: 'tomas.perez@gmail.com',
    businesses: ['barberia', 'terapias'],
    totalSpent: 70000,
    lastVisit: new Date().toISOString().split('T')[0],
    notes: 'Le gusta tomar té verde durante el masaje capilar. Prefiere cortes clásicos.'
  },
  {
    name: 'Felipe Castro',
    phone: '+56 9 7721 9934',
    email: 'felipe.castro@outlook.com',
    businesses: ['barberia'],
    totalSpent: 15000,
    lastVisit: new Date().toISOString().split('T')[0],
    notes: 'Piel sensible, usar aceites hidratantes pre-afeitado.'
  },
  {
    name: 'Andrés Vicuña',
    phone: '+56 9 6611 8844',
    email: 'andres.vic@live.cl',
    businesses: ['barberia'],
    totalSpent: 25000,
    lastVisit: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Frecuente. Siempre agenda combo de cabello y barba.'
  },
  {
    name: 'María José Plaza',
    phone: '+56 9 9988 7766',
    email: 'mj.plaza@gmail.com',
    businesses: ['peluqueria'],
    totalSpent: 65000,
    lastVisit: new Date().toISOString().split('T')[0],
    notes: 'Coloración botánica libre de amoníaco. Prefiere tonos cálidos.'
  },
  {
    name: 'Camila Silva',
    phone: '+56 9 8877 6655',
    email: 'cami.silva@uai.cl',
    businesses: ['peluqueria'],
    totalSpent: 30000,
    lastVisit: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Le gusta el peinado con ondas sueltas.'
  },
  {
    name: 'Javiera Montes',
    phone: '+56 9 5544 3322',
    email: 'javiera.montes@gmail.com',
    businesses: ['terapias'],
    totalSpent: 45000,
    lastVisit: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Sufre de dolor lumbar, ideal sugerir piedras calientes volcánicas.'
  }
];

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: initialBookings,
  clients: initialClients,

  addBooking: (bookingData) => {
    const randomCode = 'RIT-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      ...bookingData,
      id: randomCode,
      channel: bookingData.channel || (Math.random() > 0.4 ? 'Web' : 'WhatsApp'),
      status: bookingData.status || 'confirmado',
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const updatedBookings = [newBooking, ...state.bookings];
      
      // Update or add Client
      const existingClientIdx = state.clients.findIndex(c => c.phone === bookingData.clientPhone);
      const bookingPrice = parseInt(bookingData.price.replace(/[^0-9]/g, ''), 10) || 0;
      
      let updatedClients = [...state.clients];

      if (existingClientIdx !== -1) {
        const client = updatedClients[existingClientIdx];
        const newBusinesses = Array.from(new Set([...client.businesses, bookingData.category]));
        updatedClients[existingClientIdx] = {
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
          email: bookingData.clientEmail,
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

    return randomCode;
  },

  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b)
    }));
  },

  deleteBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.filter(b => b.id !== id)
    }));
  },

  updateClientNotes: (phone, notes) => {
    set((state) => ({
      clients: state.clients.map(c => c.phone === phone ? { ...c, notes } : c)
    }));
  },

  markAsNotGoodClient: (phone) => {
    set((state) => ({
      clients: state.clients.map(c => c.phone === phone ? { ...c, notSoGoodClient: true } : c)
    }));
  }
}));
