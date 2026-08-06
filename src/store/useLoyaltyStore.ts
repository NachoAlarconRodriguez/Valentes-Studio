import { create } from 'zustand';
import { normalizePhone, Booking } from './useBookingStore';
import { createClient } from '@/utils/supabase/client';

export interface LoyaltyRule {
  id: string;
  maxDays: number;
  discountPercent: number;
  label: string;
}

export interface LoyaltyConfig {
  enabled: boolean;
  category: 'barberia';
  rules: LoyaltyRule[];
}

interface LoyaltyStore {
  config: LoyaltyConfig;
  loading: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (newConfig: LoyaltyConfig) => Promise<void>;
}

const supabase = createClient();

export const defaultLoyaltyConfig: LoyaltyConfig = {
  enabled: true,
  category: 'barberia',
  rules: [
    { id: 'rule-15', maxDays: 15, discountPercent: 30, label: 'Retorno en 15 días' },
    { id: 'rule-20', maxDays: 20, discountPercent: 15, label: 'Retorno en 20 días' },
    { id: 'rule-25', maxDays: 25, discountPercent: 5, label: 'Retorno en 25 días' },
  ]
};

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  config: defaultLoyaltyConfig,
  loading: false,

  fetchConfig: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('page_content')
        .select('content')
        .eq('key', 'loyalty_config')
        .maybeSingle();

      if (error) {
        console.warn('page_content table fetch warning for loyalty_config:', error.message);
      }

      if (data && data.content) {
        set({ config: data.content, loading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('valentes_loyalty_config', JSON.stringify(data.content));
        }
      } else {
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('valentes_loyalty_config');
          if (local) {
            try {
              set({ config: JSON.parse(local), loading: false });
              return;
            } catch (e) {}
          }
        }
        set({ config: defaultLoyaltyConfig, loading: false });
      }
    } catch (err) {
      console.warn('Error fetching loyalty config, using default:', err);
      set({ config: defaultLoyaltyConfig, loading: false });
    }
  },

  updateConfig: async (newConfig: LoyaltyConfig) => {
    set({ config: newConfig });
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ key: 'loyalty_config', content: newConfig }, { onConflict: 'key' });

      if (error) {
        console.warn('Could not save loyalty_config in Supabase page_content:', error.message);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('valentes_loyalty_config', JSON.stringify(newConfig));
      }
    } catch (err) {
      console.error('Error saving loyalty config:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('valentes_loyalty_config', JSON.stringify(newConfig));
      }
    }
  }
}));

export interface EligibleLoyaltyDiscount {
  rule: LoyaltyRule | null;
  daysSinceLastVisit: number | null;
  lastVisitDate: string | null;
  discountPercent: number;
}

export function checkLoyaltyEligibility(
  clientPhone: string,
  targetDate: string, // YYYY-MM-DD
  bookings: Booking[],
  config: LoyaltyConfig = defaultLoyaltyConfig
): EligibleLoyaltyDiscount {
  const emptyResult: EligibleLoyaltyDiscount = {
    rule: null,
    daysSinceLastVisit: null,
    lastVisitDate: null,
    discountPercent: 0
  };

  if (!config.enabled || !clientPhone || !targetDate) {
    return emptyResult;
  }

  const normPhone = normalizePhone(clientPhone);
  if (!normPhone) return emptyResult;

  // Filter completed barberia bookings prior to targetDate
  const completedBarberiaBookings = bookings.filter(b => {
    const bPhone = normalizePhone(b.clientPhone);
    return (
      bPhone === normPhone &&
      b.category === 'barberia' &&
      b.status === 'completado' &&
      b.date < targetDate
    );
  });

  if (completedBarberiaBookings.length === 0) {
    return emptyResult;
  }

  // Sort by date descending to get the most recent completed visit
  completedBarberiaBookings.sort((a, b) => b.date.localeCompare(a.date));
  const lastVisitDate = completedBarberiaBookings[0].date;

  const targetTime = new Date(targetDate + 'T00:00:00').getTime();
  const lastVisitTime = new Date(lastVisitDate + 'T00:00:00').getTime();
  const diffDays = Math.floor((targetTime - lastVisitTime) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return emptyResult;
  }

  // Sort rules ascending by maxDays (e.g., 15, 20, 25)
  const sortedRules = [...config.rules].sort((a, b) => a.maxDays - b.maxDays);

  for (const rule of sortedRules) {
    if (diffDays <= rule.maxDays) {
      return {
        rule,
        daysSinceLastVisit: diffDays,
        lastVisitDate,
        discountPercent: rule.discountPercent
      };
    }
  }

  return emptyResult;
}
