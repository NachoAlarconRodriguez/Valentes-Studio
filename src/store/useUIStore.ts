import { create } from 'zustand';

export type SectionTheme = 'home' | 'barberia' | 'peluqueria' | 'terapias';
export type EmotionType = 'revitalizado' | 'relajado' | 'impecable';

interface UIState {
  currentTheme: SectionTheme;
  isMenuOpen: boolean;
  selectedEmotion: EmotionType | null;
  hoveredCard: 'barberia' | 'peluqueria' | 'terapias' | null;
  isBookingOpen: boolean;
  selectedServiceForBooking: {
    id: string;
    name: string;
    price: string;
  } | null;
  bookingCategory: 'barberia' | 'peluqueria' | 'terapias' | null;
  
  // Actions
  setCurrentTheme: (theme: SectionTheme) => void;
  toggleMenu: () => void;
  setMenuOpen: (isOpen: boolean) => void;
  setSelectedEmotion: (emotion: EmotionType | null) => void;
  setHoveredCard: (card: 'barberia' | 'peluqueria' | 'terapias' | null) => void;
  openBooking: (service?: { id: string; name: string; price: string }, category?: 'barberia' | 'peluqueria' | 'terapias') => void;
  closeBooking: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentTheme: 'home',
  isMenuOpen: false,
  selectedEmotion: null,
  hoveredCard: null,
  isBookingOpen: false,
  selectedServiceForBooking: null,
  bookingCategory: null,

  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),
  setHoveredCard: (card) => set({ hoveredCard: card }),
  openBooking: (service, category) => set({ 
    isBookingOpen: true, 
    selectedServiceForBooking: service || null,
    bookingCategory: category || null
  }),
  closeBooking: () => set({ 
    isBookingOpen: false, 
    selectedServiceForBooking: null,
    bookingCategory: null
  }),
}));
export default useUIStore;
