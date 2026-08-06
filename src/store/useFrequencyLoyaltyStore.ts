import { create } from 'zustand';
import { normalizePhone, Booking } from './useBookingStore';
import { createClient } from '@/utils/supabase/client';

export type LoyaltyCategoryKey = 'barberia' | 'peluqueria' | 'terapias';

export interface CategoryFrequencyConfig {
  enabled: boolean;
  requiredVisits: number; // e.g. 6 completed visits required
  rewardType: 'discount' | 'prize';
  rewardDiscountPercent: number; // e.g. 50% OFF or 100% OFF (Gratis)
  rewardPrizeName: string; // e.g. "Servicio Gratis a elección"
  includeHistorical: boolean;
}

export interface FrequencyLoyaltyConfig {
  categories: Record<LoyaltyCategoryKey, CategoryFrequencyConfig>;
}

interface FrequencyLoyaltyStore {
  config: FrequencyLoyaltyConfig;
  loading: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (newConfig: FrequencyLoyaltyConfig) => Promise<void>;
  updateCategoryConfig: (cat: LoyaltyCategoryKey, fields: Partial<CategoryFrequencyConfig>) => Promise<void>;
}

const supabase = createClient();

export const defaultFrequencyLoyaltyConfig: FrequencyLoyaltyConfig = {
  categories: {
    barberia: {
      enabled: true,
      requiredVisits: 6,
      rewardType: 'discount',
      rewardDiscountPercent: 50,
      rewardPrizeName: 'Corte o Barba Gratis',
      includeHistorical: true
    },
    peluqueria: {
      enabled: false,
      requiredVisits: 6,
      rewardType: 'discount',
      rewardDiscountPercent: 30,
      rewardPrizeName: 'Tratamiento Capilar Gratis',
      includeHistorical: true
    },
    terapias: {
      enabled: false,
      requiredVisits: 5,
      rewardType: 'prize',
      rewardDiscountPercent: 100,
      rewardPrizeName: 'Masaje Express 15 min',
      includeHistorical: true
    }
  }
};

export const useFrequencyLoyaltyStore = create<FrequencyLoyaltyStore>((set, get) => ({
  config: defaultFrequencyLoyaltyConfig,
  loading: false,

  fetchConfig: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('page_content')
        .select('content')
        .eq('key', 'frequency_loyalty_config')
        .maybeSingle();

      if (error) {
        console.warn('page_content table fetch warning for frequency_loyalty_config:', error.message);
      }

      if (data && data.content) {
        set({ config: data.content, loading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('valentes_frequency_loyalty_config', JSON.stringify(data.content));
        }
      } else {
        // Fallback to local storage if available
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('valentes_frequency_loyalty_config');
          if (local) {
            try {
              set({ config: JSON.parse(local), loading: false });
              return;
            } catch (e) {}
          }
        }
        set({ config: defaultFrequencyLoyaltyConfig, loading: false });
      }
    } catch (err) {
      console.warn('Error fetching frequency loyalty config, using default:', err);
      set({ config: defaultFrequencyLoyaltyConfig, loading: false });
    }
  },

  updateConfig: async (newConfig: FrequencyLoyaltyConfig) => {
    set({ config: newConfig });
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ key: 'frequency_loyalty_config', content: newConfig }, { onConflict: 'key' });

      if (error) {
        console.warn('Could not save frequency_loyalty_config in Supabase page_content:', error.message);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('valentes_frequency_loyalty_config', JSON.stringify(newConfig));
      }
    } catch (err) {
      console.error('Error saving frequency loyalty config:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('valentes_frequency_loyalty_config', JSON.stringify(newConfig));
      }
    }
  },

  updateCategoryConfig: async (cat: LoyaltyCategoryKey, fields: Partial<CategoryFrequencyConfig>) => {
    const current = get().config;
    const updated: FrequencyLoyaltyConfig = {
      ...current,
      categories: {
        ...current.categories,
        [cat]: {
          ...(current.categories?.[cat] || defaultFrequencyLoyaltyConfig.categories[cat]),
          ...fields
        }
      }
    };
    await get().updateConfig(updated);
  }
}));

export interface EligibleFrequencyReward {
  isEligible: boolean;
  categoryConfig: CategoryFrequencyConfig | null;
  totalCompletedVisits: number;
  requiredVisits: number;
  currentCycleVisits: number;
  rewardType: 'discount' | 'prize';
  rewardDiscountPercent: number;
  rewardPrizeName: string;
}

export function checkFrequencyEligibility(
  clientPhone: string,
  category: string,
  bookings: Booking[],
  config: FrequencyLoyaltyConfig = defaultFrequencyLoyaltyConfig
): EligibleFrequencyReward {
  const emptyResult: EligibleFrequencyReward = {
    isEligible: false,
    categoryConfig: null,
    totalCompletedVisits: 0,
    requiredVisits: 6,
    currentCycleVisits: 0,
    rewardType: 'discount',
    rewardDiscountPercent: 0,
    rewardPrizeName: ''
  };

  const catKey = category as LoyaltyCategoryKey;
  const catConfig = config.categories?.[catKey];

  if (!catConfig || !catConfig.enabled || !clientPhone) {
    return emptyResult;
  }

  const normPhone = normalizePhone(clientPhone);
  if (!normPhone) return emptyResult;

  // Filter completed bookings for this client in this category
  const completedBookings = bookings.filter(b => {
    const bPhone = normalizePhone(b.clientPhone || '');
    return (
      bPhone === normPhone &&
      b.category === category &&
      b.status === 'completado'
    );
  });

  const totalCompletedVisits = completedBookings.length;
  const N = Math.max(1, catConfig.requiredVisits);
  
  const currentCycleVisits = totalCompletedVisits % N;
  const isEligible = totalCompletedVisits > 0 && currentCycleVisits === 0;

  return {
    isEligible,
    categoryConfig: catConfig,
    totalCompletedVisits,
    requiredVisits: N,
    currentCycleVisits: isEligible ? N : currentCycleVisits,
    rewardType: catConfig.rewardType,
    rewardDiscountPercent: catConfig.rewardDiscountPercent,
    rewardPrizeName: catConfig.rewardPrizeName
  };
}
