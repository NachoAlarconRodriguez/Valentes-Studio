'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const panels = [
  {
    id: 1,
    title: 'Barbería Tradicional',
    subtitle: 'Cortes de autor, afeitados con navaja libre y rituales de toallas calientes.',
    path: '/barberia',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    number: '01'
  },
  {
    id: 2,
    title: 'Peluquería de Autor',
    subtitle: 'Coloración botánica orgánica, cortes de diseño y nutrición molecular profunda.',
    path: '/peluqueria',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    number: '02'
  },
  {
    id: 3,
    title: 'Terapias Holísticas',
    subtitle: 'Masajes con piedras calientes volcánicas, reiki y sonoterapia vibracional.',
    path: '/terapias',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    number: '03'
  }
];

export default function HomePage() {
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen lg:h-screen overflow-hidden bg-black relative z-10">
      {panels.map((panel) => {
        const isHovered = hoveredPanel === panel.id;
        const isAnyHovered = hoveredPanel !== null;
        return (
          <Link
            key={panel.id}
            href={panel.path}
            onMouseEnter={() => setHoveredPanel(panel.id)}
            onMouseLeave={() => setHoveredPanel(null)}
            className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out flex flex-col justify-end p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-white/5 ${
              isAnyHovered
                ? isHovered
                  ? 'flex-[1.5] min-h-[300px] lg:min-h-0'
                  : 'flex-[0.75] min-h-[200px] lg:min-h-0'
                : 'flex-1 min-h-[250px] lg:min-h-0'
            }`}
          >
            {/* Background image */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <Image
                src={panel.imageUrl}
                alt={panel.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className={`object-cover transition-all duration-1000 ${
                  isHovered
                    ? 'grayscale-0 scale-105 brightness-75'
                    : 'grayscale opacity-60 brightness-[0.55]'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
            </div>

            {/* Label and titles */}
            <div className="relative z-10 text-left transition-all duration-500">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-1">
                Ritual {panel.number}
              </span>
              <h2 className="font-serif text-3xl lg:text-4xl text-white tracking-wide font-medium group-hover:text-gold transition-colors duration-300">
                {panel.title}
              </h2>
              <p className="text-xs text-text-secondary font-light mt-2 max-w-sm group-hover:text-white/80 transition-colors duration-300 leading-relaxed">
                {panel.subtitle}
              </p>
              
              {/* Discover Link overlay */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                <span>Ingresar al Ritual</span>
                <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
