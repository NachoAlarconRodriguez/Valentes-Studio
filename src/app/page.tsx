'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import useContentStore from '@/store/useContentStore';

export default function HomePage() {
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);
  const { content } = useContentStore();

  const panels = [
    {
      id: 1,
      title: content.home.panel1Title,
      subtitle: content.home.panel1Subtitle,
      path: '/barberia',
      imageUrl: content.home.panel1Image,
      number: '01',
      logoUrl: '/hands-logo-v3.png',
      businessName: 'Valentes Studio'
    },
    {
      id: 2,
      title: content.home.panel2Title,
      subtitle: content.home.panel2Subtitle,
      path: '/peluqueria',
      imageUrl: content.home.panel2Image,
      number: '02',
      logoUrl: '/peluqueria-logo-v3.png',
      businessName: 'Alma Bela Studio'
    },
    {
      id: 3,
      title: content.home.panel3Title,
      subtitle: content.home.panel3Subtitle,
      path: '/terapias',
      imageUrl: content.home.panel3Image,
      number: '03',
      logoUrl: '/terapias-logo.png',
      businessName: 'Essencia Pura Studio'
    }
  ];

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
            {/* Top Brand Logo and Name */}
            <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-10 flex items-center space-x-3 group-hover:scale-105 transition-transform duration-500 select-none">
              <div className="relative w-10 h-10 overflow-hidden select-none pointer-events-none flex-shrink-0">
                <Image
                  src={panel.logoUrl}
                  alt={panel.businessName}
                  fill
                  sizes="40px"
                  className="object-contain filter brightness-100 group-hover:brightness-110 transition-all duration-500"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold leading-none mb-1 shadow-sm">
                  Santuario
                </span>
                <span className="font-serif text-xs font-semibold text-white tracking-wider leading-none shadow-sm group-hover:text-gold transition-colors duration-500">
                  {panel.businessName}
                </span>
              </div>
            </div>

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
