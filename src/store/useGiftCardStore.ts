import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

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
  loading: boolean;
  
  // Actions
  fetchGiftCards: () => Promise<void>;
  buyGiftCard: (cardData: Omit<GiftCard, 'code' | 'remainingBalance' | 'createdAt' | 'expiresAt'>) => Promise<string>;
  validateGiftCard: (code: string) => Promise<{ status: 'valida' | 'inexistente' | 'expirada' | 'sin_saldo'; card?: GiftCard }>;
  redeemGiftCard: (code: string, amount: number) => Promise<boolean>;
}

const supabase = createClient();

export const useGiftCardStore = create<GiftCardStore>((set, get) => ({
  giftCards: [],
  loading: false,

  fetchGiftCards: async () => {
    set({ loading: true });
    try {
      const { data: dbCards, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const giftCards: GiftCard[] = (dbCards || []).map((c: any) => ({
        code: c.code,
        originalAmount: c.original_amount,
        remainingBalance: c.remaining_balance,
        senderName: c.sender_name,
        senderEmail: c.sender_email,
        recipientName: c.recipient_name,
        recipientEmail: c.recipient_email,
        theme: c.theme,
        message: c.message || '',
        createdAt: c.created_at,
        expiresAt: c.expires_at
      }));

      set({ giftCards, loading: false });
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      set({ loading: false });
    }
  },

  buyGiftCard: async (cardData) => {
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const amountSuffix = Math.round(cardData.originalAmount / 1000) + 'K';
    const themeLetter = cardData.theme.substring(0, 3).toUpperCase();
    const code = `${themeLetter}-${randomPart}-${amountSuffix}`;

    const now = new Date();
    const expires = new Date();
    expires.setMonth(now.getMonth() + 1); // 1 month validity

    const newCard: GiftCard = {
      ...cardData,
      code,
      remainingBalance: cardData.originalAmount,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };

    try {
      const { error } = await supabase.from('gift_cards').insert({
        code,
        original_amount: cardData.originalAmount,
        remaining_balance: cardData.originalAmount,
        sender_name: cardData.senderName,
        sender_email: cardData.senderEmail,
        recipient_name: cardData.recipientName,
        recipient_email: cardData.recipientEmail,
        theme: cardData.theme,
        message: cardData.message,
        created_at: now.toISOString(),
        expires_at: expires.toISOString()
      });

      if (error) throw error;

      set((state) => ({
        giftCards: [newCard, ...state.giftCards]
      }));

      // Disparar correo de entrega de Gift Card (Destinatario + Comprobante Comprador)
      try {
        fetch('/api/email', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            type: 'giftcard_purchase',
            data: newCard
          })
        }).catch(err => console.error('Error enviando mail de gift card:', err));
      } catch (emailErr) {
        console.error('Error al disparar correo de gift card:', emailErr);
      }
    } catch (err) {
      console.error('Error buying gift card:', err);
    }

    return code;
  },

  validateGiftCard: async (code) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const { data: dbCard, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error) throw error;
      if (!dbCard) {
        return { status: 'inexistente' };
      }

      const card: GiftCard = {
        code: dbCard.code,
        originalAmount: dbCard.original_amount,
        remainingBalance: dbCard.remaining_balance,
        senderName: dbCard.sender_name,
        senderEmail: dbCard.sender_email,
        recipientName: dbCard.recipient_name,
        recipientEmail: dbCard.recipient_email,
        theme: dbCard.theme,
        message: dbCard.message || '',
        createdAt: dbCard.created_at,
        expiresAt: dbCard.expires_at
      };

      const now = new Date();
      const expires = new Date(card.expiresAt);

      if (now > expires) {
        return { status: 'expirada', card };
      }

      if (card.remainingBalance <= 0) {
        return { status: 'sin_saldo', card };
      }

      return { status: 'valida', card };
    } catch (err) {
      console.error('Error validating gift card:', err);
      return { status: 'inexistente' };
    }
  },

  redeemGiftCard: async (code, amount) => {
    const cleanCode = code.trim().toUpperCase();
    const validation = await get().validateGiftCard(cleanCode);

    if (validation.status !== 'valida' || !validation.card) {
      return false;
    }

    const newBalance = Math.max(0, validation.card.remainingBalance - amount);

    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ remaining_balance: newBalance })
        .eq('code', cleanCode);

      if (error) throw error;

      set((state) => ({
        giftCards: state.giftCards.map(c =>
          c.code.toUpperCase() === cleanCode
            ? { ...c, remainingBalance: newBalance }
            : c
        )
      }));

      return true;
    } catch (err) {
      console.error('Error redeeming gift card:', err);
      return false;
    }
  }
}));

export default useGiftCardStore;
