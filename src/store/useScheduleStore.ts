import { create } from 'zustand';

export interface DailyShift {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isActive: boolean;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  hasBreak: boolean;
  breakStartTime: string; // "HH:MM"
  breakEndTime: string;   // "HH:MM"
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
  workShifts: Record<string, DailyShift[]>; // specialistId -> array of 7 DailyShifts
  timeBlocks: TimeBlock[];
  
  // Actions
  updateWorkShift: (specialistId: string, dayOfWeek: number, updatedShift: Partial<DailyShift>) => void;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  deleteTimeBlock: (id: string) => void;
  
  // Helpers
  isSpecialistAvailable: (specialistId: string, date: string, time: string, serviceDurationMinutes?: number) => {
    available: boolean;
    reason?: string;
  };
}

// Helper to convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Initial shifts for all specialists: Monday-Friday 09:00-18:00 (lunch 13:00-14:00), Sat 09:00-13:00 (no lunch), Sun off.
const generateDefaultShifts = (): DailyShift[] => {
  const shifts: DailyShift[] = [];
  for (let i = 0; i < 7; i++) {
    if (i === 0) {
      // Sunday
      shifts.push({
        dayOfWeek: i,
        isActive: false,
        startTime: '09:00',
        endTime: '18:00',
        hasBreak: false,
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      });
    } else if (i === 6) {
      // Saturday
      shifts.push({
        dayOfWeek: i,
        isActive: true,
        startTime: '09:00',
        endTime: '13:00',
        hasBreak: false,
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      });
    } else {
      // Mon-Fri
      shifts.push({
        dayOfWeek: i,
        isActive: true,
        startTime: '09:00',
        endTime: '18:00',
        hasBreak: true,
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      });
    }
  }
  return shifts;
};

// Initial mock specialists ids from useServicesStore (sb1: Carlos, sp2: Lucia, etc.)
const defaultSpecialistsIds = [
  'sp1', 'sp2', 'sp3', 'sp4',
  'sb1', 'sb2', 'sb3', 'sb4',
  'st1', 'st2', 'st3', 'st4'
];

const getInitialWorkShifts = (): Record<string, DailyShift[]> => {
  const record: Record<string, DailyShift[]> = {};
  defaultSpecialistsIds.forEach((id) => {
    record[id] = generateDefaultShifts();
  });
  return record;
};

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  workShifts: getInitialWorkShifts(),
  timeBlocks: [
    {
      id: 'tb_1',
      specialistId: 'sb1', // Carlos Mendoza
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      startTime: '10:00',
      endTime: '12:00',
      reason: 'Permiso Médico'
    },
    {
      id: 'tb_2',
      specialistId: 'sp2', // Lucía Rivas
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Day after tomorrow
      startTime: '15:00',
      endTime: '17:00',
      reason: 'Capacitación'
    },
    {
      id: 'tb_3',
      specialistId: 'st2', // Elena Rostova
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      startTime: '14:00',
      endTime: '16:00',
      reason: 'Asunto Personal'
    }
  ],

  updateWorkShift: (specialistId, dayOfWeek, updatedShift) => set((state) => {
    const specialistShifts = state.workShifts[specialistId] || generateDefaultShifts();
    const updated = specialistShifts.map((shift) =>
      shift.dayOfWeek === dayOfWeek ? { ...shift, ...updatedShift } : shift
    );
    return {
      workShifts: {
        ...state.workShifts,
        [specialistId]: updated
      }
    };
  }),

  addTimeBlock: (block) => set((state) => {
    const newBlock: TimeBlock = {
      ...block,
      id: `tb_${Date.now()}`
    };
    return {
      timeBlocks: [...state.timeBlocks, newBlock]
    };
  }),

  deleteTimeBlock: (id) => set((state) => ({
    timeBlocks: state.timeBlocks.filter((tb) => tb.id !== id)
  })),

  isSpecialistAvailable: (specialistId, date, time, serviceDurationMinutes = 60) => {
    const state = get();
    
    // 1. Get Day of Week (0-6)
    // Avoid timezone offsets by parsing YYYY-MM-DD locally
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    
    // 2. Fetch Shift for that day
    const specialistShifts = state.workShifts[specialistId];
    if (!specialistShifts) return { available: true }; // Fallback if not configured
    
    const dayShift = specialistShifts.find((s) => s.dayOfWeek === dayOfWeek);
    if (!dayShift || !dayShift.isActive) {
      return { available: false, reason: 'Día no laboral para este especialista' };
    }
    
    // Convert current slot to minutes
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
      
      // Check if slot overlaps with break
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
    
    return { available: true };
  }
}));
