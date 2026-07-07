'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import useContentStore from '@/store/useContentStore';

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogg') ||
    url.includes('video') ||
    url.startsWith('data:video/')
  );
};

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
      label: content.home.panel1Label || 'Ritual 01',
      logoUrl: '/hands-logo-v4.png',
      businessName: 'Valentes Studio',
      businessCategory: 'Barbería',
      logoSize: 'w-24 h-24 sm:w-32 sm:h-32',
      logoSizeMobile: 'w-24 h-24'
    },
    {
      id: 2,
      title: content.home.panel2Title,
      subtitle: content.home.panel2Subtitle,
      path: '/peluqueria',
      imageUrl: content.home.panel2Image,
      label: content.home.panel2Label || 'Ritual 02',
      logoUrl: '/peluqueria-logo-v4.png',
      businessName: 'Alma Bela Studio',
      businessCategory: 'Peluquería',
      logoSize: 'w-24 h-24 sm:w-32 sm:h-32',
      logoSizeMobile: 'w-24 h-24'
    },
    {
      id: 3,
      title: content.home.panel3Title,
      subtitle: content.home.panel3Subtitle,
      path: '/terapias',
      imageUrl: content.home.panel3Image,
      label: content.home.panel3Label || 'Ritual 03',
      logoUrl: '/terapias-logo-v7.png',
      businessName: 'Jefito Lopes Studio',
      businessCategory: 'Terapias Holísticas',
      logoSize: 'w-24 h-24 sm:w-32 sm:h-32',
      logoSizeMobile: 'w-24 h-24'
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
            className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out flex flex-col justify-center items-center lg:justify-end lg:items-start p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-white/5 ${
              isAnyHovered
                ? isHovered
                  ? 'flex-[1.5] min-h-[300px] lg:min-h-0'
                  : 'flex-[0.75] min-h-[200px] lg:min-h-0'
                : 'flex-1 min-h-[250px] lg:min-h-0'
            }`}
          >
            {/* MOBILE LAYOUT (Centered, logo above title, no description) */}
            <div className="lg:hidden flex flex-col items-center justify-center space-y-4 z-10 relative text-center w-full">
              <div className={`relative ${panel.logoSizeMobile} select-none pointer-events-none drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                <Image
                  src={panel.logoUrl}
                  alt={panel.businessName}
                  fill
                  sizes="96px"
                  className={`object-contain filter brightness-100 ${
                    panel.id === 3 ? 'scale-[1.35]' : ''
                  }`}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-[0.3em] font-bold leading-none block text-gold">
                  {panel.businessCategory} {panel.businessName}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-semibold block">
                  {panel.label}
                </span>
                <h2 className="font-serif text-2xl text-white tracking-wide font-medium uppercase mt-1">
                  {panel.title}
                </h2>
              </div>
            </div>

            {/* DESKTOP LAYOUT - Top Brand Logo and Name */}
            <div className="hidden lg:flex absolute top-8 left-1/2 -translate-x-1/2 sm:top-12 z-10 flex flex-col items-center space-y-3 group-hover:scale-105 transition-transform duration-500 select-none w-full px-4 text-center">
              <div className={`relative ${panel.logoSize} transition-all duration-500 ease-out select-none pointer-events-none flex-shrink-0 ${
                isHovered 
                  ? panel.id === 1
                    ? 'scale-125 drop-shadow-[0_0_20px_rgba(212,175,55,0.45)]'
                    : panel.id === 2
                    ? 'scale-125 drop-shadow-[0_0_20px_rgba(205,127,50,0.45)]'
                    : 'scale-125 drop-shadow-[0_0_20px_rgba(226,224,216,0.45)]'
                  : 'scale-100'
              }`}>
                <Image
                  src={panel.logoUrl}
                  alt={panel.businessName}
                  fill
                  sizes="128px"
                  className={`object-contain filter brightness-100 group-hover:brightness-110 transition-all duration-500 ${
                    panel.id === 3 ? 'scale-[1.35]' : ''
                  }`}
                />
              </div>
              <div className={`flex flex-col items-center text-center transition-transform duration-500 ease-out ${
                isHovered ? 'translate-y-3.5' : 'translate-y-0'
              }`}>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold leading-none mb-1 shadow-sm transition-colors duration-500 text-gold">
                  {panel.businessCategory}
                </span>
                <span className={`font-serif text-xs sm:text-sm font-semibold text-white tracking-wider leading-none shadow-sm transition-colors duration-500 uppercase ${
                  panel.id === 1 
                    ? 'group-hover:text-[#D48C37]' 
                    : panel.id === 2 
                    ? 'group-hover:text-[#D4AF37]' 
                    : 'group-hover:text-[#D4AF37]'
                }`}>
                  {panel.businessName}
                </span>
              </div>
            </div>

            {/* Background image or video */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              {isVideoUrl(panel.imageUrl) ? (
                <video
                  src={panel.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`object-cover w-full h-full transition-all duration-1000 ${
                    isHovered
                      ? 'grayscale-0 scale-105 brightness-75'
                      : 'grayscale opacity-60 brightness-[0.55]'
                  }`}
                />
              ) : (
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
              )}
              {/* Warm brand tint overlay (mix-blend-color) */}
              <div 
                className={`absolute inset-0 transition-colors duration-700 pointer-events-none z-1 ${
                  panel.id === 1 
                    ? 'bg-gold/5 group-hover:bg-gold/15' 
                    : panel.id === 2 
                    ? 'bg-bronze/5 group-hover:bg-bronze/15' 
                    : 'bg-platinum/5 group-hover:bg-platinum/12'
                }`}
                style={{ mixBlendMode: 'color' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
            </div>

            {/* DESKTOP LAYOUT - Label and titles */}
            <div className="hidden lg:block relative z-10 text-left transition-all duration-500">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-1">
                {panel.label}
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
