import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { useBookingStore } from './useBookingStore';
import { useServicesStore } from './useServicesStore';

// Helper to parse duration string (e.g. "45 min", "1 hrs", "1 hrs 20 min") to minutes
export const parseDurationToMinutes = (durationStr: string): number => {
  if (!durationStr) return 60; // fallback default
  const clean = durationStr.toLowerCase().trim();
  
  let totalMinutes = 0;
  
  // Parse hours if present (e.g., "1 hrs", "2 hrs", "1 hr")
  const hourMatch = clean.match(/(\d+)\s*(?:hrs|hr|hora|horas)/);
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  
  // Parse minutes if present (e.g., "20 min", "45 min")
  const minMatch = clean.match(/(\d+)\s*(?:min|mins|minutos)/);
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10);
  }
  
  // Fallback if no match but numbers exist
  if (totalMinutes === 0) {
    const fallbackMatch = clean.match(/(\d+)/);
    if (fallbackMatch) {
      totalMinutes = parseInt(fallbackMatch[1], 10);
      if (totalMinutes < 5) {
        totalMinutes *= 60;
      }
    }
  }
  
  return totalMinutes > 0 ? totalMinutes : 60;
};


export interface DailyShift {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isActive: boolean;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  hasBreak: boolean;
  breakStartTime: string; // "HH:MM"
  breakEndTime: string;   // "HH:MM"
  business: string;       // 'todos' | 'peluqueria' | 'terapias' | 'barberia'
}

export interface TimeBlock {
  id: string;
  specialistId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  reason: 'Almuerzo' | 'Permiso Médico' | 'Capacitación' | 'Vacaciones' | 'Asunto Personal';
  isRecurring?: boolean;
}

interface ScheduleStore {
  workShifts: Record<string, DailyShift[]>; // specialistId -> array of DailyShifts
  timeBlocks: TimeBlock[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  
  // Actions
  fetchSchedules: () => Promise<void>;
  updateWorkShift: (specialistId: string, dayOfWeek: number, updatedShift: Partial<DailyShift>, business?: string) => Promise<void>;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => Promise<void>;
  deleteTimeBlock: (id: string) => Promise<void>;
  
  // Helpers
  isSpecialistAvailable: (specialistId: string, date: string, time: string, serviceDurationMinutes?: number, category?: string) => {
    available: boolean;
    reason?: string;
  };
}

const supabase = createClient();

// Helper to convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const generateDefaultShifts = (): DailyShift[] => {
  const shifts: DailyShift[] = [];
  for (let i = 0; i < 7; i++) {
    if (i === 0) {
      shifts.push({
        dayOfWeek: i,
        isActive: false,
        startTime: '09:00',
        endTime: '18:00',
        hasBreak: false,
        breakStartTime: '13:00',
        breakEndTime: '14:00',
        business: 'todos',
      });
    } else if (i === 6) {
      shifts.push({
        dayOfWeek: i,
        isActive: true,
        startTime: '09:00',
        endTime: '13:00',
        hasBreak: false,
        breakStartTime: '13:00',
        breakEndTime: '14:00',
        business: 'todos',
      });
    } else {
      shifts.push({
        dayOfWeek: i,
        isActive: true,
        startTime: '09:00',
        endTime: '18:00',
        hasBreak: true,
        breakStartTime: '13:00',
        breakEndTime: '14:00',
        business: 'todos',
      });
    }
  }
  return shifts;
};

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  workShifts: {},
  timeBlocks: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchSchedules: async () => {
    set({ loading: true });
    try {
      // 1. Fetch work shifts
      const { data: dbShifts, error: sErr } = await supabase
        .from('work_shifts')
        .select('*');

      if (sErr) throw sErr;

      // Group shifts by specialist_id
      const workShifts: Record<string, DailyShift[]> = {};
      (dbShifts || []).forEach((row: any) => {
        const specId = row.specialist_id;
        if (!workShifts[specId]) {
          workShifts[specId] = [];
        }
        workShifts[specId].push({
          dayOfWeek: row.day_of_week,
          isActive: row.is_active,
          startTime: row.start_time,
          endTime: row.end_time,
          hasBreak: row.has_break,
          breakStartTime: row.break_start_time || '13:00',
          breakEndTime: row.break_end_time || '14:00',
          business: row.business || 'todos'
        });
      });

      // Sort days of week for each specialist (0 to 6)
      Object.keys(workShifts).forEach((specId) => {
        workShifts[specId].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      });

      // 2. Fetch time blocks
      const { data: dbBlocks, error: bErr } = await supabase
        .from('time_blocks')
        .select('*');

      if (bErr) throw bErr;

      const timeBlocks: TimeBlock[] = (dbBlocks || []).map((b: any) => ({
        id: b.id,
        specialistId: b.specialist_id,
        date: b.date,
        startTime: b.start_time,
        endTime: b.end_time,
        reason: b.reason,
        isRecurring: b.is_recurring
      }));

      set({ workShifts, timeBlocks, loading: false });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      set({ loading: false });
    }
  },

  updateWorkShift: async (specialistId, dayOfWeek, updatedShift, business = 'todos') => {
    try {
      const payload: any = {
        id: `${specialistId}_shift_${dayOfWeek}_${business}`,
        specialist_id: specialistId,
        day_of_week: dayOfWeek,
        business: business
      };
      if (updatedShift.isActive !== undefined) payload.is_active = updatedShift.isActive;
      if (updatedShift.startTime !== undefined) payload.start_time = updatedShift.startTime;
      if (updatedShift.endTime !== undefined) payload.end_time = updatedShift.endTime;
      if (updatedShift.hasBreak !== undefined) payload.has_break = updatedShift.hasBreak;
      if (updatedShift.breakStartTime !== undefined) payload.break_start_time = updatedShift.breakStartTime;
      if (updatedShift.breakEndTime !== undefined) payload.break_end_time = updatedShift.breakEndTime;

      const { error } = await supabase
        .from('work_shifts')
        .upsert(payload, { onConflict: 'specialist_id,day_of_week,business' });

      if (error) throw error;

      set((state) => {
        const specialistShifts = state.workShifts[specialistId] || [];
        const hasShift = specialistShifts.some(
          (s) => s.dayOfWeek === dayOfWeek && s.business === business
        );
        let updated;
        if (hasShift) {
          updated = specialistShifts.map((shift) =>
            shift.dayOfWeek === dayOfWeek && shift.business === business
              ? { ...shift, ...updatedShift }
              : shift
          );
        } else {
          updated = [
            ...specialistShifts,
            {
              dayOfWeek,
              isActive: true,
              startTime: '09:00',
              endTime: '18:00',
              hasBreak: true,
              breakStartTime: '13:00',
              breakEndTime: '14:00',
              business,
              ...updatedShift
            }
          ];
        }
        return {
          workShifts: {
            ...state.workShifts,
            [specialistId]: updated
          }
        };
      });
    } catch (err: any) {
      console.error('Error updating work shift:', err?.message || err?.details || err);
      set({ error: err?.message || 'Error al guardar cambios. Asegúrate de haber ejecutado la migración SQL en Supabase.' });
    }
  },

  addTimeBlock: async (block) => {
    const id = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newBlock: TimeBlock = {
      ...block,
      id
    };

    try {
      const { error } = await supabase.from('time_blocks').insert({
        id,
        specialist_id: block.specialistId,
        date: block.date,
        start_time: block.startTime,
        end_time: block.endTime,
        reason: block.reason,
        is_recurring: block.isRecurring || false
      });

      if (error) throw error;

      set((state) => ({
        timeBlocks: [...state.timeBlocks, newBlock]
      }));
    } catch (err) {
      console.error('Error adding time block:', err);
    }
  },

  deleteTimeBlock: async (id) => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        timeBlocks: state.timeBlocks.filter((tb) => tb.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting time block:', err);
    }
  },

  isSpecialistAvailable: (specialistId, date, time, serviceDurationMinutes = 60, category) => {
    const state = get();
    
    // 1. Get Day of Week (0-6)
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    
    const specialistShifts = state.workShifts[specialistId] || generateDefaultShifts();
    
    // Check if the specialist has ANY shifts for this specific category (meaning they customized it)
    const hasCategoryShifts = category
      ? specialistShifts.some((s) => s.business === category)
      : false;

    // Find shift for this category, or fallback to general 'todos' / 'general' ONLY if they have no shifts configured for this category at all
    let dayShift = category
      ? specialistShifts.find((s) => s.dayOfWeek === dayOfWeek && s.business === category)
      : null;

    if (!dayShift && !hasCategoryShifts) {
      dayShift = specialistShifts.find((s) => s.dayOfWeek === dayOfWeek && (s.business === 'todos' || s.business === 'general'));
    }

    if (!dayShift || !dayShift.isActive) {
      return { available: false, reason: 'Día no laboral para este especialista' };
    }
    
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + serviceDurationMinutes;
    
    // Check shift boundary
    const shiftStart = timeToMinutes(dayShift.startTime);
    const shiftEnd = timeToMinutes(dayShift.endTime);
    
    if (slotStart < shiftStart || slotEnd > shiftEnd) {
      return { available: false, reason: `Fuera del horario de jornada (${dayShift.startTime} - ${dayShift.endTime})` };
    }
    
    // 3. Check Lunch Break
    if (dayShift.hasBreak) {
      const breakStart = timeToMinutes(dayShift.breakStartTime);
      const breakEnd = timeToMinutes(dayShift.breakEndTime);
      
      if (slotStart < breakEnd && slotEnd > breakStart) {
        return { available: false, reason: `Horario de colación (${dayShift.breakStartTime} - ${dayShift.breakEndTime})` };
      }
    }
    
    // 4. Check active blocks for this specialist and date
    const blocksForDate = state.timeBlocks.filter(
      (b) => b.specialistId === specialistId && b.date === date
    );
    
    for (const block of blocksForDate) {
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);
      
      if (slotStart < blockEnd && slotEnd > blockStart) {
        return { 
          available: false, 
          reason: `Horario bloqueado: ${block.reason} (${block.startTime} - ${block.endTime})` 
        };
      }
    }

    // 5. Check active bookings for this specialist and date
    const allSpecialists = useServicesStore.getState().specialistsList || [];
    const specialist = allSpecialists.find(s => s.id === specialistId);
    if (specialist) {
      const allServices = Object.keys(useServicesStore.getState().servicesData).flatMap(
        cat => useServicesStore.getState().servicesData[cat].services
      );
      
      const specialistBookings = useBookingStore.getState().bookings.filter(
        b => b.date === date && 
             b.status !== 'bloqueado' && 
             b.status !== 'cancelado' && 
             b.status !== 'no_llego' && 
             b.specialistName.trim().toLowerCase() === specialist.name.trim().toLowerCase()
      );
      
      for (const booking of specialistBookings) {
        const bookingStart = timeToMinutes(booking.time);
        
        // Find booking service duration
        const bookedService = allServices.find(s => s.name.trim().toLowerCase() === booking.serviceName.trim().toLowerCase());
        const bookingDuration = bookedService 
          ? (typeof bookedService.duration === 'number' ? bookedService.duration : parseDurationToMinutes(bookedService.duration)) 
          : 60;
        const bookingEnd = bookingStart + bookingDuration;
        
        // Check for overlap
        if (slotStart < bookingEnd && slotEnd > bookingStart) {
          return {
            available: false,
            reason: `Traslape con cita de ${booking.clientName} (${booking.time} - ${booking.serviceName})`
          };
        }
      }
    }
    
    return { available: true };
  }
}));
