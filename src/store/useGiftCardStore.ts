import { create } from 'zustand';

export interface GiftCard {
  code: string;
  originalAmount: number;
  remainingBalance: number;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  theme: 'barberia' | 'peluqueria' | 'terapias' | 'santuario';
  message: string;
  createdAt: string;
  expiresAt: string;
}

interface GiftCardStore {
  giftCards: GiftCard[];
  buyGiftCard: (cardData: Omit<GiftCard, 'code' | 'remainingBalance' | 'createdAt' | 'expiresAt'>) => string;
  validateGiftCard: (code: string) => { status: 'valida' | 'inexistente' | 'expirada' | 'sin_saldo'; card?: GiftCard };
  redeemGiftCard: (code: string, amount: number) => boolean;
}

// Generate pre-loaded mock cards for testing and administration views
const getFormattedDateWithOffset = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

const initialGiftCards: GiftCard[] = [
  {
    code: 'SAN-GIFT-30K',
    originalAmount: 30000,
    remainingBalance: 30000,
    senderName: 'Tomas Perez',
    senderEmail: 'tomas.perez@gmail.com',
    recipientName: 'Camila Silva',
    recipientEmail: 'cami.silva@uai.cl',
    theme: 'santuario',
    message: '¡Feliz cumpleaños! Disfruta de un momento de relajo.',
    createdAt: getFormattedDateWithOffset(-5),
    expiresAt: getFormattedDateWithOffset(25) // Active, expires in 25 days
  },
  {
    code: 'VAL-GIFT-50K',
    originalAmount: 50000,
    remainingBalance: 15000, // Partially used
    senderName: 'Felipe Castro',
    senderEmail: 'felipe.castro@outlook.com',
    recipientName: 'Andres Vicuña',
    recipientEmail: 'andres.vic@live.cl',
    theme: 'barberia',
    message: 'Para que te consientas con el mejor afeitado tradicional.',
    createdAt: getFormattedDateWithOffset(-10),
    expiresAt: getFormattedDateWithOffset(20) // Active, expires in 20 days
  },
  {
    code: 'ALM-GIFT-80K',
    originalAmount: 80000,
    remainingBalance: 80000,
    senderName: 'Maria Jose Plaza',
    senderEmail: 'mj.plaza@gmail.com',
    recipientName: 'Lucia Rivas',
    recipientEmail: 'lucia.rivas@valentes.cl',
    theme: 'peluqueria',
    message: 'Cambio de look de regalo, ¡te lo mereces!',
    createdAt: getFormattedDateWithOffset(-40),
    expiresAt: getFormattedDateWithOffset(-10) // Expired 10 days ago
  },
  {
    code: 'ESS-GIFT-45K',
    originalAmount: 45000,
    remainingBalance: 0, // Fully redeemed
    senderName: 'Javiera Montes',
    senderEmail: 'javiera.montes@gmail.com',
    recipientName: 'Mateo Silva',
    recipientEmail: 'mateo@santuario.cl',
    theme: 'terapias',
    message: 'Un respiro para tu bienestar corporal.',
    createdAt: getFormattedDateWithOffset(-15),
    expiresAt: getFormattedDateWithOffset(15) // Active but no balance left
  }
];

export const useGiftCardStore = create<GiftCardStore>((set, get) => ({
  giftCards: initialGiftCards,

  buyGiftCard: (cardData) => {
    // Generate code structure like: SAN-[theme_letter][random_3_letters]-[amount]
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const amountSuffix = Math.round(cardData.originalAmount / 1000) + 'K';
    const themeLetter = cardData.theme.substring(0, 3).toUpperCase();
    const code = `${themeLetter}-${randomPart}-${amountSuffix}`;

    const now = new Date();
    const expires = new Date();
    expires.setMonth(now.getMonth() + 1); // Exact 1-month validity

    const newCard: GiftCard = {
      ...cardData,
      code,
      remainingBalance: cardData.originalAmount,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };

    set((state) => ({
      giftCards: [newCard, ...state.giftCards]
    }));

    return code;
  },

  validateGiftCard: (code) => {
    const cleanCode = code.trim().toUpperCase();
    const card = get().giftCards.find(c => c.code.toUpperCase() === cleanCode);

    if (!card) {
      return { status: 'inexistente' };
    }

    const now = new Date();
    const expires = new Date(card.expiresAt);

    if (now > expires) {
      return { status: 'expirada', card };
    }

    if (card.remainingBalance <= 0) {
      return { status: 'sin_saldo', card };
    }

    return { status: 'valida', card };
  },

  redeemGiftCard: (code, amount) => {
    const cleanCode = code.trim().toUpperCase();
    const validation = get().validateGiftCard(cleanCode);

    if (validation.status !== 'valida' || !validation.card) {
      return false;
    }

    set((state) => ({
      giftCards: state.giftCards.map(c => 
        c.code.toUpperCase() === cleanCode
          ? { ...c, remainingBalance: Math.max(0, c.remainingBalance - amount) }
          : c
      )
    }));

    return true;
  }
}));

export default useGiftCardStore;
