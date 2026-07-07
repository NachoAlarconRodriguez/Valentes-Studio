import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  description: string;
  duration: string;
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
    color: "#D4AF37",
    accentColor: "#CD7F32",
    services: [],
    specialists: []
  },
  peluqueria: {
    title: "Peluquería de Autor",
    description: "Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.",
    path: "/peluqueria",
    color: "#CD7F32",
    accentColor: "#D4AF37",
    services: [],
    specialists: []
  },
  terapias: {
    title: "Terapias Holísticas",
    description: "Espacio consagrado a la reconexión cuerpo-mente a través de terapias manuales de relajación profunda, masajes geotermales y sanación energética.",
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

      // Fetch specialists metadata (phone/is_active) from page_content table
      let metadata: Record<string, { phone?: string; is_active?: boolean }> = {};
      try {
        const { data: metaRow } = await supabase
          .from('page_content')
          .select('content')
          .eq('key', 'specialists_metadata')
          .maybeSingle();
        if (metaRow && metaRow.content) {
          metadata = metaRow.content as any;
        }
      } catch (err) {
        console.error('Error fetching specialists metadata from DB:', err);
      }

      const specialistsList: Specialist[] = (dbSpecs || []).map((sp: any) => {
        const specMeta = metadata[sp.id] || {};
        let localPhone = specMeta.phone || '';
        let localActive = specMeta.is_active !== undefined ? specMeta.is_active : true;

        if (typeof window !== 'undefined') {
          if (!localPhone) {
            localPhone = localStorage.getItem(`sp_phone_${sp.id}`) || '';
          }
          const localActiveStr = localStorage.getItem(`sp_active_${sp.id}`);
          if (specMeta.is_active === undefined && localActiveStr !== null) {
            localActive = localActiveStr === 'true';
          }
        }
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
          phone: localPhone || sp.phone || '',
          isActive: localActive
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
            // Match category. In seed, id starts with b_ for barberia, or category column is set.
            // Let's rely on the 'category' column from DB.
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
      if (typeof window !== 'undefined') {
        if (specialist.phone) {
          localStorage.setItem(`sp_phone_${id}`, specialist.phone);
        }
        localStorage.setItem(`sp_active_${id}`, specialist.isActive !== false ? 'true' : 'false');
      }

      // Save phone and is_active in page_content metadata table
      try {
        const { data: metaRow } = await supabase
          .from('page_content')
          .select('content')
          .eq('key', 'specialists_metadata')
          .maybeSingle();
        const currentMeta = (metaRow && metaRow.content) ? (metaRow.content as any) : {};
        currentMeta[id] = {
          phone: specialist.phone || '',
          is_active: specialist.isActive !== false
        };
        await supabase
          .from('page_content')
          .upsert({
            key: 'specialists_metadata',
            content: currentMeta
          });
      } catch (err) {
        console.error('Error saving specialist metadata to DB:', err);
      }

      const { error } = await supabase.from('specialists').insert({
        id,
        name: specialist.name,
        role: specialist.role,
        specialty: specialist.specialty,
        bio: specialist.bio,
        avatar: specialist.avatar,
        email: specialist.email,
        profile_type: specialist.profileType,
        assigned_agendas: specialist.assignedAgendas,
        image_url: specialist.imageUrl || ''
      });

      if (error) throw error;

      // Create default work shifts for the new specialist in the database
      const shiftsToInsert = [];
      // Mon-Fri active
      for (let i = 1; i <= 5; i++) {
        shiftsToInsert.push({
          id: `${id}_shift_${i}`,
          specialist_id: id,
          day_of_week: i,
          is_active: true,
          start_time: '09:00',
          end_time: '18:00',
          has_break: true,
          break_start_time: '13:00',
          break_end_time: '14:00'
        });
      }
      // Sat active
      shiftsToInsert.push({
        id: `${id}_shift_6`,
        specialist_id: id,
        day_of_week: 6,
        is_active: true,
        start_time: '09:00',
        end_time: '13:00',
        has_break: false,
        break_start_time: '13:00',
        break_end_time: '14:00'
      });
      // Sun inactive
      shiftsToInsert.push({
        id: `${id}_shift_0`,
        specialist_id: id,
        day_of_week: 0,
        is_active: false,
        start_time: '09:00',
        end_time: '18:00',
        has_break: false,
        break_start_time: '13:00',
        break_end_time: '14:00'
      });

      await supabase.from('work_shifts').insert(shiftsToInsert);

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
    }
  },

  updateSpecialist: async (category, specialistId, updatedFields) => {
    try {
      if (typeof window !== 'undefined') {
        if (updatedFields.phone !== undefined) {
          localStorage.setItem(`sp_phone_${specialistId}`, updatedFields.phone);
        }
        if (updatedFields.isActive !== undefined) {
          localStorage.setItem(`sp_active_${specialistId}`, updatedFields.isActive ? 'true' : 'false');
        }
      }

      // Save phone and is_active in page_content metadata table
      if (updatedFields.phone !== undefined || updatedFields.isActive !== undefined) {
        try {
          const { data: metaRow } = await supabase
            .from('page_content')
            .select('content')
            .eq('key', 'specialists_metadata')
            .maybeSingle();
          const currentMeta = (metaRow && metaRow.content) ? (metaRow.content as any) : {};
          const specMeta = currentMeta[specialistId] || {};
          if (updatedFields.phone !== undefined) {
            specMeta.phone = updatedFields.phone;
          }
          if (updatedFields.isActive !== undefined) {
            specMeta.is_active = updatedFields.isActive;
          }
          currentMeta[specialistId] = specMeta;
          await supabase
            .from('page_content')
            .upsert({
              key: 'specialists_metadata',
              content: currentMeta
            });
        } catch (err) {
          console.error('Error updating specialist metadata in DB:', err);
        }
      }

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

      // Only update the specialists table if there are fields to update there
      if (Object.keys(payload).length > 0) {
        const { error } = await supabase
          .from('specialists')
          .update(payload)
          .eq('id', specialistId);

        if (error) {
          console.error('Error updating specialist in DB:', error);
          // Don't throw — still update local state below
        }
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
    }
  },


  deleteSpecialist: async (category, specialistId) => {
    try {
      // Clean up metadata from page_content table
      try {
        const { data: metaRow } = await supabase
          .from('page_content')
          .select('content')
          .eq('key', 'specialists_metadata')
          .maybeSingle();
        if (metaRow && metaRow.content) {
          const currentMeta = metaRow.content as any;
          delete currentMeta[specialistId];
          await supabase
            .from('page_content')
            .upsert({
              key: 'specialists_metadata',
              content: currentMeta
            });
        }
      } catch (err) {
        console.error('Error deleting specialist metadata from DB:', err);
      }

      const { error } = await supabase
        .from('specialists')
        .delete()
        .eq('id', specialistId);

      if (error) throw error;

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
    }
  }
}));
