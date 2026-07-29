import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { 
  addSpecialistAction, 
  updateSpecialistAction, 
  deleteSpecialistAction 
} from '@/app/admin/actions';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
  specialistIds?: string[];
  isActive?: boolean;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  avatar: string;
  email: string;
  profileType: 'barber' | 'estilista' | 'terapeuta' | 'mixto' | 'admin';
  assignedAgendas: ('barberia' | 'peluqueria' | 'terapias')[];
  imageUrl?: string;
  phone?: string;
  isActive?: boolean;
}

export interface ServiceSection {
  title: string;
  description: string;
  path: string;
  color: string;
  accentColor: string;
  services: ServiceItem[];
  specialists: Specialist[];
}

interface ServicesStore {
  servicesData: Record<string, Omit<ServiceSection, 'specialists'> & { specialists: Specialist[] }>;
  specialistsList: Specialist[];
  loading: boolean;
  
  // Actions
  fetchServicesAndSpecialists: () => Promise<void>;
  addService: (category: string, service: Omit<ServiceItem, 'id'> & { id?: string }) => Promise<void>;
  updateService: (category: string, serviceId: string, updatedFields: Partial<ServiceItem> & { id?: string }) => Promise<void>;
  deleteService: (category: string, serviceId: string) => Promise<void>;
  toggleServiceActive: (category: string, serviceId: string) => Promise<void>;
  
  // Specialists Actions
  addSpecialist: (category: string, specialist: Omit<Specialist, 'id'>) => Promise<void>;
  updateSpecialist: (category: string, specialistId: string, updatedFields: Partial<Specialist>) => Promise<void>;
  deleteSpecialist: (category: string, specialistId: string) => Promise<void>;
}

const supabase = createClient();

const defaultServicesData: Record<string, Omit<ServiceSection, 'specialists'> & { specialists: Specialist[] }> = {
  barberia: {
    title: "Barbería Tradicional",
    description: "Cortes de autor, afeitados con navaja libre y rituales de toallas calientes diseñados para el caballero contemporáneo en un ambiente de calma absoluta.",
    path: "/barberia",
    color: "#C5A059",
    accentColor: "#CD7F32",
    services: [],
    specialists: []
  },
  peluqueria: {
    title: "Peluquería de Autor",
    description: "Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.",
    path: "/peluqueria",
    color: "#CD7F32",
    accentColor: "#C5A059",
    services: [],
    specialists: []
  },
  terapias: {
    title: "Terapias Holísticas",
    description: `Bienvenido al Templo de las Terapias Holísticas\n\nUn espacio dedicado a la expansión de la conciencia, la armonización energética y la transformación interior. A través de Reiki, ThetaHealing, Barras de Access, armonización de chakras, canalización, apometría, mesas energéticas, radiestesia con péndulo, cristales y baños de hierbas, acompaño cada proceso desde una mirada integral, promoviendo equilibrio, claridad y bienestar para cuerpo, mente, emociones y espíritu.`,
    path: "/terapias",
    color: "#E2E0D8",
    accentColor: "#9CA3AF",
    services: [],
    specialists: []
  }
};

export const useServicesStore = create<ServicesStore>((set, get) => ({
  servicesData: defaultServicesData,
  specialistsList: [],
  loading: false,

  fetchServicesAndSpecialists: async () => {
    const currentSpecs = get().specialistsList;
    const hasData = currentSpecs && currentSpecs.length > 0;

    if (!hasData) {
      set({ loading: true });
    }
    try {
      // 1. Fetch Specialists
      const { data: dbSpecs, error: specsErr } = await supabase
        .from('specialists')
        .select('*');

      if (specsErr) throw specsErr;

      const specialistsList: Specialist[] = (dbSpecs || []).map((sp: any) => {
        return {
          id: sp.id,
          name: sp.name,
          role: sp.role,
          specialty: sp.specialty,
          bio: sp.bio,
          avatar: sp.avatar,
          email: sp.email,
          profileType: sp.profile_type,
          assignedAgendas: sp.assigned_agendas,
          imageUrl: sp.image_url,
          phone: sp.phone || '',
          isActive: sp.is_active !== false
        };
      });

      // 2. Fetch Services
      const { data: dbServices, error: servErr } = await supabase
        .from('services')
        .select('*');

      if (servErr) throw servErr;

      const servicesList: ServiceItem[] = (dbServices || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        description: s.description,
        specialistIds: s.specialist_ids,
        isActive: s.is_active
      }));

      // 3. Construct servicesData record
      const servicesData: any = {};
      Object.keys(defaultServicesData).forEach((category) => {
        const section = defaultServicesData[category];
        servicesData[category] = {
          ...section,
          services: servicesList.filter((s: any) => {
            const sDb = dbServices?.find((dbS: any) => dbS.id === s.id);
            return sDb?.category === category;
          }),
          specialists: specialistsList.filter((sp) => sp.assignedAgendas.includes(category as any))
        };
      });

      set({ specialistsList, servicesData, loading: false });
    } catch (error: any) {
      console.error('Error fetching services/specialists:', error);
      set({ loading: false });
    }
  },

  addService: async (category, service) => {
    const id = service.id || `${category.substring(0, 2)}_${Date.now()}`;
    const { id: passedId, ...serviceFields } = service;
    const newService: ServiceItem = {
      ...serviceFields,
      id,
      isActive: true
    };

    try {
      const { error } = await supabase.from('services').insert({
        id,
        category,
        name: serviceFields.name,
        price: serviceFields.price,
        duration: serviceFields.duration,
        description: serviceFields.description,
        specialist_ids: serviceFields.specialistIds || [],
        is_active: true
      });

      if (error) throw error;

      // Update state locally
      set((state) => {
        const section = state.servicesData[category];
        if (!section) return state;
        return {
          servicesData: {
            ...state.servicesData,
            [category]: {
              ...section,
              services: [...section.services, newService]
            }
          }
        };
      });
    } catch (err: any) {
      console.error('Error adding service:', err);
    }
  },

  updateService: async (category, serviceId, updatedFields) => {
    try {
      const { id: newId, ...fieldsToUpdate } = updatedFields;
      const payload: any = {};
      if (fieldsToUpdate.name !== undefined) payload.name = fieldsToUpdate.name;
      if (fieldsToUpdate.price !== undefined) payload.price = fieldsToUpdate.price;
      if (fieldsToUpdate.duration !== undefined) payload.duration = fieldsToUpdate.duration;
      if (fieldsToUpdate.description !== undefined) payload.description = fieldsToUpdate.description;
      if (fieldsToUpdate.specialistIds !== undefined) payload.specialist_ids = fieldsToUpdate.specialistIds;
      if (fieldsToUpdate.isActive !== undefined) payload.is_active = fieldsToUpdate.isActive;

      if (newId !== undefined && newId !== serviceId) {
        // Fetch full current service row from Supabase
        const { data: currentRow } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();
          
        if (currentRow) {
          const newRow = {
            ...currentRow,
            ...payload,
            id: newId
          };
          
          // Insert new row
          const { error: insertErr } = await supabase.from('services').insert(newRow);
          if (insertErr) throw insertErr;
          
          // Delete old row
          const { error: deleteErr } = await supabase.from('services').delete().eq('id', serviceId);
          if (deleteErr) throw deleteErr;
        }
      } else {
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', serviceId);

        if (error) throw error;
      }

      set((state) => {
        const section = state.servicesData[category];
        if (!section) return state;
        return {
          servicesData: {
            ...state.servicesData,
            [category]: {
              ...section,
              services: section.services.map((s) =>
                s.id === serviceId ? { ...s, ...updatedFields } : s
              )
            }
          }
        };
      });
    } catch (err: any) {
      console.error('Error updating service:', err);
    }
  },

  deleteService: async (category, serviceId) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      set((state) => {
        const section = state.servicesData[category];
        if (!section) return state;
        return {
          servicesData: {
            ...state.servicesData,
            [category]: {
              ...section,
              services: section.services.filter((s) => s.id !== serviceId)
            }
          }
        };
      });
    } catch (err: any) {
      console.error('Error deleting service:', err);
    }
  },

  toggleServiceActive: async (category, serviceId) => {
    const section = get().servicesData[category];
    if (!section) return;
    const service = section.services.find(s => s.id === serviceId);
    if (!service) return;
    
    const newActiveState = !service.isActive;

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: newActiveState })
        .eq('id', serviceId);

      if (error) throw error;

      set((state) => {
        const currentSection = state.servicesData[category];
        return {
          servicesData: {
            ...state.servicesData,
            [category]: {
              ...currentSection,
              services: currentSection.services.map((s) =>
                s.id === serviceId ? { ...s, isActive: newActiveState } : s
              )
            }
          }
        };
      });
    } catch (err: any) {
      console.error('Error toggling service active:', err);
    }
  },

  addSpecialist: async (category, specialist) => {
    const prefix = category.substring(0, 2);
    const id = `${prefix}_sp_${Date.now()}`;
    const newSpecialist: Specialist = {
      ...specialist,
      id
    };

    try {
      await addSpecialistAction(category, id, specialist);

      set((state) => {
        const updatedSpecialists = [...state.specialistsList, newSpecialist];
        const newServicesData: any = {};
        Object.keys(state.servicesData).forEach((cat) => {
          const sec = state.servicesData[cat];
          newServicesData[cat] = {
            ...sec,
            specialists: updatedSpecialists.filter((sp) => sp.assignedAgendas.includes(cat as any))
          };
        });

        return {
          specialistsList: updatedSpecialists,
          servicesData: newServicesData
        };
      });
    } catch (err: any) {
      console.error('Error adding specialist:', err);
      throw err;
    }
  },

  updateSpecialist: async (category, specialistId, updatedFields) => {
    try {
      const payload: any = {};
      if (updatedFields.name !== undefined) payload.name = updatedFields.name;
      if (updatedFields.role !== undefined) payload.role = updatedFields.role;
      if (updatedFields.specialty !== undefined) payload.specialty = updatedFields.specialty;
      if (updatedFields.bio !== undefined) payload.bio = updatedFields.bio;
      if (updatedFields.avatar !== undefined) payload.avatar = updatedFields.avatar;
      if (updatedFields.email !== undefined) payload.email = updatedFields.email;
      if (updatedFields.profileType !== undefined) payload.profile_type = updatedFields.profileType;
      if (updatedFields.assignedAgendas !== undefined) payload.assigned_agendas = updatedFields.assignedAgendas;
      if (updatedFields.imageUrl !== undefined) payload.image_url = updatedFields.imageUrl;
      if (updatedFields.phone !== undefined) payload.phone = updatedFields.phone;
      if (updatedFields.isActive !== undefined) payload.is_active = updatedFields.isActive;

      // Only update the specialists table if there are fields to update there
      if (Object.keys(payload).length > 0) {
        await updateSpecialistAction(specialistId, payload);
      }

      // Always update local state to reflect the save
      set((state) => {
        const updatedSpecialists = state.specialistsList.map((sp) =>
          sp.id === specialistId ? { ...sp, ...updatedFields } : sp
        );

        const newServicesData: any = {};
        Object.keys(state.servicesData).forEach((cat) => {
          const sec = state.servicesData[cat];
          newServicesData[cat] = {
            ...sec,
            specialists: updatedSpecialists.filter((sp) => sp.assignedAgendas.includes(cat as any))
          };
        });

        return {
          specialistsList: updatedSpecialists,
          servicesData: newServicesData
        };
      });
    } catch (err: any) {
      console.error('Error updating specialist:', err);
      throw err;
    }
  },


  deleteSpecialist: async (category, specialistId) => {
    try {
      await deleteSpecialistAction(specialistId);

      set((state) => {
        const updatedSpecialists = state.specialistsList.filter((sp) => sp.id !== specialistId);
        
        const newServicesData: any = {};
        Object.keys(state.servicesData).forEach((cat) => {
          const sec = state.servicesData[cat];
          newServicesData[cat] = {
            ...sec,
            specialists: updatedSpecialists.filter((sp) => sp.assignedAgendas.includes(cat as any))
          };
        });

        return {
          specialistsList: updatedSpecialists,
          servicesData: newServicesData
        };
      });
    } catch (err: any) {
      console.error('Error deleting specialist:', err);
      throw err;
    }
  }
}));
