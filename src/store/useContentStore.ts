import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export interface GalleryItem {
  id: string;
  title: string;
  technique: string;
  stylist: string;
  duration: string;
  price: string;
  imageUrl: string;
  serviceId?: string;
}

export interface PageContent {
  home: {
    panel1Title: string;
    panel1Subtitle: string;
    panel1Image: string;
    panel2Title: string;
    panel2Subtitle: string;
    panel2Image: string;
    panel3Title: string;
    panel3Subtitle: string;
    panel3Image: string;
  };
  barberia: {
    heroTitle: string;
    heroSubtitle: string;
    discoverBtn: string;
    imageCabello: string;
    imageBarba: string;
    imageCompleto: string;
    pageTitle: string;
    pageDescription: string;
    titleCabello?: string;
    priceCabello?: string;
    titleBarba?: string;
    priceBarba?: string;
    titleCompleto?: string;
    priceCompleto?: string;
  };
  peluqueria: {
    overlayLine1: string;
    overlayLine2: string;
    overlaySubtitle: string;
    pageTitle: string;
    pageDescription: string;
    galleryItems: GalleryItem[];
    galeriaTriggerTitle: string;
    specialistsTriggerTitle: string;
    servicesTriggerTitle: string;
  };
  terapias: {
    pageTitle: string;
    pageDescription: string;
    videoUrl: string;
  };
}

interface ContentStore {
  content: PageContent;
  loading: boolean;
  
  // Actions
  fetchContent: () => Promise<void>;
  updateContent: (section: keyof PageContent, fields: Partial<PageContent[keyof PageContent]>) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const supabase = createClient();

const defaultContent: PageContent = {
  home: {
    panel1Title: 'Barbería Tradicional',
    panel1Subtitle: 'Cortes de autor, afeitados con navaja libre y rituales de toallas calientes.',
    panel1Image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    panel2Title: 'Peluquería de Autor',
    panel2Subtitle: 'Coloración botánica orgánica, cortes de diseño y nutrición molecular profunda.',
    panel2Image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    panel3Title: 'Terapias Holísticas',
    panel3Subtitle: 'Masajes con piedras calientes volcánicas, reiki y sonoterapia vibracional.',
    panel3Image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  },
  barberia: {
    heroTitle: 'VALENTES',
    heroSubtitle: 'Barbería',
    discoverBtn: 'Descubrir Rituales',
    imageCabello: '/images/ritual_cabello.png',
    imageBarba: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    imageCompleto: '/images/ritual_completo.png',
    pageTitle: 'Barbería Tradicional',
    pageDescription: 'Cortes de autor, afeitados con navaja libre y rituales de toallas calientes diseñados para el caballero contemporáneo en un ambiente de calma absoluta.',
    titleCabello: 'Ritual de Cabello',
    priceCabello: 'Desde $12.000',
    titleBarba: 'Ritual de Barba',
    priceBarba: 'Desde $12.000',
    titleCompleto: 'Ritual Completo',
    priceCompleto: 'Desde $20.000'
  },
  peluqueria: {
    overlayLine1: 'ALMA',
    overlayLine2: 'BELA',
    overlaySubtitle: 'STUDIO',
    pageTitle: 'Peluquería de Autor',
    pageDescription: 'Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.',
    galeriaTriggerTitle: 'Galería de Trabajos',
    specialistsTriggerTitle: 'Nuestras Especialistas',
    servicesTriggerTitle: 'Ver Todos los Servicios',
    galleryItems: [
      {
        id: 'g1',
        title: 'Balayage Premium Vainilla',
        technique: 'Balayage tridimensional con difuminado de raíz y matices dorados fríos.',
        stylist: 'Sofia Valente',
        duration: '3.5 hrs',
        price: '$65.000',
        imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g2',
        title: 'Ondas Editorial Surf',
        technique: 'Peinado texturizado con ondas desestructuradas y protector térmico orgánico.',
        stylist: 'Valentina Paz',
        duration: '45 min',
        price: '$30.000',
        imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g3',
        title: 'Corte Shag Moderno',
        technique: 'Corte texturizado en capas desconectadas con flequillo y volumen natural.',
        stylist: 'Andrés Silva',
        duration: '60 min',
        price: '$38.000',
        imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g4',
        title: 'Tratamiento Seda Celular',
        technique: 'Nutrición molecular profunda con ácido hialurónico y cauterización fría.',
        stylist: 'Lucía Rivas',
        duration: '60 min',
        price: '$48.000',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g5',
        title: 'Corte Bob Simétrico',
        technique: 'Corte seco de precisión milimétrica adaptado a la forma del mentón.',
        stylist: 'Andrés Silva',
        duration: '60 min',
        price: '$38.000',
        imageUrl: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g6',
        title: 'Iluminación Babylights Platinada',
        technique: 'Micro-reflejos de alta costura para un efecto aclarado natural ultra fino.',
        stylist: 'Valentina Paz',
        duration: '3 hrs',
        price: '$65.000',
        imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  terapias: {
    pageTitle: 'Terapias Holísticas',
    pageDescription: 'Espacio consagrado a la reconexión cuerpo-mente a través de terapias manuales de relajación profunda, masajes geotermales y sanación energética.',
    videoUrl: '/videos/massage.mp4'
  }
};

export const useContentStore = create<ContentStore>((set, get) => ({
  content: defaultContent,
  loading: false,

  fetchContent: async () => {
    set({ loading: true });
    try {
      const { data: dbContent, error } = await supabase
        .from('page_content')
        .select('*');

      if (error) throw error;

      if (dbContent && dbContent.length > 0) {
        const content: PageContent = { ...defaultContent };
        dbContent.forEach((row: any) => {
          const key = row.key as keyof PageContent;
          if (content[key]) {
            content[key] = { ...content[key], ...row.content };
          }
        });
        set({ content, loading: false });
      } else {
        // No contents in DB yet, load defaults
        set({ content: defaultContent, loading: false });
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      set({ loading: false });
    }
  },

  updateContent: async (section, fields) => {
    const updatedSection = {
      ...get().content[section],
      ...fields
    };

    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          key: section,
          content: updatedSection
        });

      if (error) throw error;

      set((state) => ({
        content: {
          ...state.content,
          [section]: updatedSection
        }
      }));
    } catch (err) {
      console.error('Error updating page content:', err);
    }
  },

  resetToDefault: async () => {
    try {
      for (const section of Object.keys(defaultContent)) {
        await supabase
          .from('page_content')
          .upsert({
            key: section,
            content: defaultContent[section as keyof PageContent]
          });
      }
      set({ content: defaultContent });
    } catch (err) {
      console.error('Error resetting page content:', err);
    }
  }
}));

export default useContentStore;
