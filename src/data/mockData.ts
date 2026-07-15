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
  avatar: string; // We can use stylized initials or SVG generation
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

export interface PackageData {
  emotion: 'revitalizado' | 'relajado' | 'impecable';
  title: string;
  subtitle: string;
  description: string;
  services: string[];
  price: string;
  duration: string;
  ctaText: string;
}

export const servicesData: Record<string, ServiceSection> = {
  barberia: {
    title: "Barbería Tradicional",
    description: "Cortes de autor, afeitados con navaja libre y rituales de toallas calientes diseñados para el caballero contemporáneo en un ambiente de calma absoluta.",
    path: "/barberia",
    color: "#C5A059", // Dorado
    accentColor: "#CD7F32", // Bronce
    services: [
      {
        id: "b_cejas",
        name: "Cejas",
        price: "$3.500",
        duration: "15 min",
        description: "Perfilado de cejas y/o líneas.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_corte_3era",
        name: "Corte 3era Edad",
        price: "$12.000",
        duration: "45 min",
        description: "Corte de cabello para adulto mayor de 65 años (VÁLIDO SOLO CON PAGO EN EFECTIVO O TRANSFERENCIA).",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_corte_general",
        name: "Corte de Cabello",
        price: "$15.000",
        duration: "45 min",
        description: "INCLUYE: Pomada a elección y asesoría personalizada por nuestro equipo.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_corte_nino",
        name: "Corte Niño ( 10años)",
        price: "$13.000",
        duration: "45 min",
        description: "Corte de cabello para niños menores de 10 años (VÁLIDO SOLO CON PAGO EN EFECTIVO O TRANSFERENCIA).",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_barba_perfilado_navaja",
        name: "Perfilado navaja",
        price: "$15.000",
        duration: "45 min",
        description: "Perfilado de barba con toalla caliente y navaja.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_barba_perfilado_retoque",
        name: "Perfilado + Retoque",
        price: "$17.000",
        duration: "45 min",
        description: "Perfilado de barba con toalla caliente, navaja y limpieza de contornos del cabello.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_barba_retoque",
        name: "Retoque Barba",
        price: "$12.000",
        duration: "30 min",
        description: "Retocamos barba solo con máquina (marcar y rebajar) y shaver a elección del cliente.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_barba_rasurado_ras",
        name: "Rasurado al ras",
        price: "$15.000",
        duration: "45 min",
        description: "Rasuramos por completo la barba con toalla caliente y navaja.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_combo_corte_rasurado",
        name: "Corte de cabello+ Rasurado",
        price: "$25.000",
        duration: "1 hrs",
        description: "Corte de cabello + Rasurado de barba con toalla caliente y navaja.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_combo_corte_retoque",
        name: "Corte de cabello + retoque de barba",
        price: "$20.000",
        duration: "1 hrs",
        description: "Corte de cabello y retocamos barba solo con máquina (marcar y rebajar) y shaver a elección del cliente.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_combo_corte_perfilado",
        name: "Corte de cabello + Perfilado de barba",
        price: "$25.000",
        duration: "1 hrs",
        description: "Corte de cabello y perfilado de barba con toalla caliente y navaja.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      },
      {
        id: "b_combo_corte_barba",
        name: "servicio corte y barba",
        price: "$23.000",
        duration: "1 hrs 20 min",
        description: "Servicio premium completo que incluye corte de cabello y ritual de barba completo con toalla caliente.",
        specialistIds: ["sb1", "sb2", "sb3", "sb4"]
      }
    ],
    specialists: [
      {
        id: "sb1",
        name: "Carlos Mendoza",
        role: "Maestro Barbero",
        specialty: "Afeitado tradicional & Estructura capilar",
        bio: "Con más de 12 años de trayectoria en el arte clásico del afeitado a navaja, Carlos combina precisión geométrica con técnicas de relajación tradicionales.",
        avatar: "CM"
      },
      {
        id: "sb2",
        name: "Enrique Soto",
        role: "Diseñador de Barba",
        specialty: "Esculpido moderno & Cuidado de la piel",
        bio: "Especialista en visajismo. Adapta cada línea de la barba a la estructura ósea del rostro usando productos botánicos orgánicos de alta gama.",
        avatar: "ES"
      },
      {
        id: "sb3",
        name: "Marcos Delgado",
        role: "Estilista & Barbero",
        specialty: "Cortes modernos & Cuidado capilar",
        bio: "Especialista en degradados de alta precisión y estilismo capilar masculino contemporáneo. Integra terapias de masaje capilar con aceites esenciales en cada servicio.",
        avatar: "MD"
      },
      {
        id: "sb4",
        name: "Javier Ortega",
        role: "Fisioterapeuta Capilar & Barbero",
        specialty: "Tratamientos de cuero cabelludo & Afeitado spa",
        bio: "Experto en salud capilar y afeitado terapéutico. Utiliza fitoterapia y toallas calientes con infusión de eucalipto para relajar y regenerar la piel.",
        avatar: "JO"
      }
    ]
  },
  peluqueria: {
    title: "Peluquería de Autor",
    description: "Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.",
    path: "/peluqueria",
    color: "#CD7F32", // Bronce
    accentColor: "#C5A059", // Dorado
    services: [
      {
        id: "p1",
        name: "Corte de Diseño & Movimiento",
        price: "$38.000",
        duration: "60 min",
        description: "Asesoría de imagen profunda y técnica personalizada. Un corte adaptado a la caída y textura de tu cabello, diseñado no solo para lucir impecable, sino para proyectar tu identidad, expresión y confianza natural.",
        specialistIds: ["sp1", "sp3"]
      },
      {
        id: "p2",
        name: "Coloración Orgánica Integral",
        price: "$65.000",
        duration: "90 min",
        description: "Balayage, reflejos o cobertura total utilizando coloraciones botánicas libres de amoníaco y tratamientos de marcas de élite (L'Oréal, Kérastase) que cuidan tu fibra capilar, reflejando tu luz y seguridad interior.",
        specialistIds: ["sp1", "sp4"]
      },
      {
        id: "p3",
        name: "Tratamiento Seda Capilar y Brillo",
        price: "$48.000",
        duration: "60 min",
        description: "Cura nutritiva celular intensiva a base de queratina vegetal y ácido hialurónico. Revive la elasticidad y la vitalidad del cabello dañado para que te sientas segura de ti misma en todo momento.",
        specialistIds: ["sp2", "sp3"]
      },
      {
        id: "p4",
        name: "Peinado Editorial & Ondas",
        price: "$30.000",
        duration: "45 min",
        description: "Lavado y peinado profesional con ondas sedosas de alta duración con productos Sebastian y Chloé, ideales para eventos especiales o para regalarte un momento de mimo que eleve tu autoestima.",
        specialistIds: ["sp2", "sp4"]
      }
    ],
    specialists: [
      {
        id: "sp1",
        name: "Sofia Valente",
        role: "Directora de Estilo",
        specialty: "Coloración de alta costura & Balayage",
        bio: "Con 15 años de trayectoria profesional formada en São Paulo y Las Vegas (Redken, L'Oréal, Kérastase), Sofia fundó Alma Bela Studio bajo la convicción de que el salón no es solo un lugar de trabajo, sino un espacio donde al tocar el cabello se toca y sana la autoestima.",
        avatar: "SV"
      },
      {
        id: "sp2",
        name: "Lucía Rivas",
        role: "Especialista en Salud Capilar",
        specialty: "Tratamientos moleculares & Texturas",
        bio: "Apasionada por la química del cabello y el cuidado capilar empático. Se especializa en revivir cabellos dañados mediante protocolos de nutrición celular activa, asegurando una atención cálida enfocada en tu confianza personal.",
        avatar: "LR"
      },
      {
        id: "sp3",
        name: "Andrés Silva",
        role: "Estilista Senior",
        specialty: "Corte seco & Texturas naturales",
        bio: "Especialista en corte en seco con técnicas perfeccionadas en academias internacionales. Su filosofía de diseño sostiene que la belleza es identidad, expresión y confianza, adaptando cada trazo a tu estilo de vida.",
        avatar: "AS"
      },
      {
        id: "sp4",
        name: "Valentina Paz",
        role: "Colorista Experta",
        specialty: "Iluminaciones tridimensionales & Babylights",
        bio: "Experta en técnicas de iluminación francesas y graduada en workshops de Sebastian y Chloé. Crea tonos personalizados con un enfoque empático, priorizando siempre la salud de la fibra capilar.",
        avatar: "VP"
      }
    ]
  },
  terapias: {
    title: "Terapias Holísticas",
    description: "Espacio consagrado a la reconexión cuerpo-mente a través de terapias manuales de relajación profunda, masajes geotermales y sanación energética.",
    path: "/terapias",
    color: "#E2E0D8", // Plata/Platino
    accentColor: "#9CA3AF", // Slate Silver
    services: [
      {
        id: "t1",
        name: "Masaje de Piedras Calientes (Obsidiana)",
        price: "$55.000",
        duration: "75 min",
        description: "Termoterapia que utiliza piedras volcánicas calientes para aliviar la tensión muscular profunda y armonizar el sistema nervioso.",
        specialistIds: ["st1", "st3"]
      },
      {
        id: "t2",
        name: "Alineación de Chakras & Reiki",
        price: "$45.000",
        duration: "60 min",
        description: "Canalización de energía vital para equilibrar los centros energéticos del cuerpo, combinada con aromaterapia clínica y cristales.",
        specialistIds: ["st2", "st3"]
      },
      {
        id: "t3",
        name: "Sonoterapia Vibracional & Cuencos",
        price: "$48.000",
        duration: "60 min",
        description: "Inmersión en ondas acústicas con cuencos de cuarzo y tibetanos que inducen a un estado de meditación profunda y relajación celular.",
        specialistIds: ["st2", "st4"]
      },
      {
        id: "t4",
        name: "Ritual Desintoxicante Corporal",
        price: "$70.000",
        duration: "90 min",
        description: "Exfoliación con sales del Himalaya, envoltura nutritiva de arcilla botánica y masaje de drenaje linfático con aceites esenciales.",
        specialistIds: ["st1", "st4"]
      }
    ],
    specialists: [
      {
        id: "st1",
        name: "Mateo Silva",
        role: "Terapeuta Geotermal",
        specialty: "Masaje de tejido profundo & Liberación miofascial",
        bio: "Mateo entiende el cuerpo como un mapa emocional. Integra kinesiología y técnicas corporales orientales para liberar tensiones físicas y emocionales.",
        avatar: "MS"
      },
      {
        id: "st2",
        name: "Elena Rostova",
        role: "Maestra de Reiki & Sonoterapeuta",
        specialty: "Sanación vibracional & Aromaterapia",
        bio: "Especialista en terapias integrativas. Utiliza el sonido, los aromas y la energía sutil para guiar a las personas hacia la paz y balance interior.",
        avatar: "ER"
      },
      {
        id: "st3",
        name: "Camila Fuentes",
        role: "Terapeuta Ayurveda",
        specialty: "Masaje Abhyanga & Fitoterapia",
        bio: "Formada en India, Camila integra el conocimiento ancestral del Ayurveda con técnicas de aromaterapia clínica para restablecer la armonía corporal.",
        avatar: "CF"
      },
      {
        id: "st4",
        name: "Nicolás Prat",
        role: "Quiropráctico & Masoterapeuta",
        specialty: "Descompresión vertebral & Drenaje",
        bio: "Especialista en alineación postural y alivio de dolores crónicos. Su enfoque combina la terapia manual con ejercicios de respiración consciente.",
        avatar: "NP"
      }
    ]
  }
};

export const packagesData: PackageData[] = [
  {
    emotion: "revitalizado",
    title: "Ritual Vitalidad Suprema",
    subtitle: "Reenergiza tu mente y cuerpo",
    description: "Una sinergia intensiva de cuidado capilar botánico y masajes estimulantes para combatir el cansancio mental y físico.",
    services: [
      "Lavado Capilar Detox con Mentol y Eucalipto",
      "Tratamiento de Seda Capilar Hidratante",
      "Masaje Craneal Estimulante de 30 minutos",
      "Bebida tonificante de Jengibre y Limón de cortesía"
    ],
    price: "$75.000",
    duration: "90 min",
    ctaText: "Reservar Ritual Vitalidad"
  },
  {
    emotion: "relajado",
    title: "Ritual de la Calma Absoluta",
    subtitle: "Desconecta del ruido exterior",
    description: "Nuestra experiencia holística de autor. Fusiona el cuidado personal estético con la sanación energética y térmica profunda.",
    services: [
      "Corte de Cabello de Autor o Ritual de Barba completo",
      "Masaje Relajante con Piedras de Obsidiana Caliente",
      "Terapia Corta de Cuencos Tibetanos durante el lavado",
      "Té orgánico de lavanda y manzanilla"
    ],
    price: "$90.000",
    duration: "120 min",
    ctaText: "Reservar Ritual de Calma"
  },
  {
    emotion: "impecable",
    title: "Ritual del Ocaso Dorado",
    subtitle: "Sutileza, pulcritud y elegancia",
    description: "Un ritual centrado en los detalles estéticos y el cuidado impecable del rostro, cabello y manos en un solo bloque de relajación.",
    services: [
      "Corte Clásico / De Diseño adaptado a tu estilo",
      "Afeitado tradicional a navaja o Ritual de nutrición capilar",
      "Manicura express con masaje de manos",
      "Café espresso o copa de espumante premium"
    ],
    price: "$60.000",
    duration: "75 min",
    ctaText: "Reservar Ritual Impecable"
  }
];

export const crossSellingMap: Record<string, { title: string; subtitle: string; path: string; recommendation: string }> = {
  barberia: {
    title: "Completa tu Experiencia",
    subtitle: "Añade Sanación a tu Estilo",
    path: "https://www.jeffersonlopes.cl/terapias",
    recommendation: "Te sugerimos complementar tu corte o afeitado con nuestro Masaje Craneal & Aromaterapia de 30 minutos, ideal para aliviar la tensión acumulada."
  },
  peluqueria: {
    title: "Completa tu Experiencia",
    subtitle: "Consiente tus Sentidos",
    path: "https://www.jeffersonlopes.cl/terapias",
    recommendation: "Para elevar el cuidado de tu cabello, te sugerimos nuestro ritual de Alineación de Chakras & Reiki, ideal para balancear tu bienestar interior."
  },
  terapias: {
    title: "Completa tu Experiencia",
    subtitle: "Renueva tu Imagen",
    path: "/peluqueria",
    recommendation: "Tras relajar tu cuerpo y mente, te sugerimos un Peinado Editorial & Ondas o un Corte de Autor para reflejar externamente tu paz interior."
  }
};
