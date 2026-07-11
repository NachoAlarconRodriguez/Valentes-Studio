'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight, Menu, X } from 'lucide-react';
import useContentStore from '@/store/useContentStore';
import useUIStore from '@/store/useUIStore';

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
  const { content } = useContentStore();
  const { openBooking } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fallbacks in case content store isn't populated
  const barberiaBg = content.home?.panel1Image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80';
  const peluqueriaBg = content.home?.panel2Image || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80';
  const terapiasBg = content.home?.panel3Image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80';

  const barberiaDesc = "Cortes de autor, afeitados com navaja libre e rituais de toalhas quentes.";
  const peluqueriaDesc = "Especialistas en realzar la belleza y cuidar la salud de tu cabello, ofreciendo un servicio totalmente personalizado.";
  const terapiasDesc = "Acompañamiento en procesos de equilibrio, bienestar y desarrollo personal a través de terapias energéticas y espirituales.";

  return (
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden bg-black text-white relative z-10 flex flex-col font-sans selection:bg-gold/30 selection:text-white justify-between">
      {/* 1. CUSTOM TOP NAVBAR */}
      <header className="absolute top-0 left-0 w-full z-50 pt-5 pb-24 px-6 md:px-12 flex items-center justify-between bg-gradient-to-b from-black via-black/80 via-black/45 to-transparent">
        {/* Brand Logo & Subtitle */}
        <Link href="/" className="group flex flex-col text-left">
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.25em] text-[#C5A059] transition-all duration-300 group-hover:brightness-110">
            JEFÏTO LOPÊS
          </span>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.45em] text-[#C5A059]/80 mt-1 font-semibold block transition-colors">
            ━ TERAPIA HOLÍSTICA ━
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
          <Link href="/barberia" className="text-xs tracking-[0.25em] uppercase font-bold text-white/70 hover:text-[#C5A059] transition-colors pb-1">
            BARBERIA
          </Link>
          <Link href="/peluqueria" className="text-xs tracking-[0.25em] uppercase font-bold text-white/70 hover:text-[#C5A059] transition-colors pb-1">
            PELUQUERÍA
          </Link>
          <Link href="/terapias" className="text-xs tracking-[0.25em] uppercase font-bold text-white/70 hover:text-[#C5A059] transition-colors pb-1">
            TERAPIAS HOLÍSTICAS
          </Link>
        </nav>

        {/* Action Group: WhatsApp & Agendar (Golden Button) */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* WhatsApp Icon */}
          <a
            href="https://wa.me/56971465202"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C5A059] hover:text-white transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center p-2"
            aria-label="WhatsApp"
          >
            <svg className="w-7 h-7 fill-current filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.455h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
            </svg>
          </a>

          {/* Agendar Button */}
          <button 
            onClick={() => openBooking()} 
            className="text-xs tracking-[0.2em] uppercase font-bold bg-[#C5A059] text-black px-6 py-2.5 rounded-full hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-[#C5A059]/20 hover:scale-[1.03] active:scale-95 cursor-pointer focus:outline-none"
          >
            AGENDAR
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-white hover:text-[#C5A059] transition-colors focus:outline-none"
        >
          <Menu size={28} />
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center px-8 relative">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:text-[#C5A059] transition-colors focus:outline-none"
          >
            <X size={28} />
          </button>
          <nav className="flex flex-col space-y-6 text-center">
            <Link
              href="/barberia"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-serif tracking-[0.2em] text-white hover:text-[#C5A059] transition-colors"
            >
              BARBERIA
            </Link>
            <Link
              href="/peluqueria"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-serif tracking-[0.2em] text-white hover:text-[#C5A059] transition-colors"
            >
              PELUQUERÍA
            </Link>
            <Link
              href="/terapias"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-serif tracking-[0.2em] text-white hover:text-[#C5A059] transition-colors"
            >
              TERAPIAS HOLÍSTICAS
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBooking();
              }}
              className="text-2xl font-serif tracking-[0.2em] text-black bg-[#C5A059] px-8 py-3 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer text-center w-full max-w-xs mx-auto focus:outline-none font-bold"
            >
              AGENDAR
            </button>
            <div className="pt-6 flex justify-center">
              <a
                href="https://wa.me/56971465202"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#C5A059] hover:text-white transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center p-2"
                aria-label="WhatsApp"
              >
                <svg className="w-10 h-10 fill-current filter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.455h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                </svg>
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* 2. THREE COLUMNS PANELS SECTION */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-3 w-full relative pt-24 lg:pt-14">
        {/* PANEL 1: BARBERIA */}
        <div className="group relative min-h-[380px] lg:min-h-0 flex flex-col justify-center items-center px-6 md:px-10 py-6 lg:py-3 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden text-center">
          {/* Background image / video */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none transition-all duration-1000 scale-100 group-hover:scale-105">
            {isVideoUrl(barberiaBg) ? (
              <video
                src={barberiaBg}
                autoPlay
                loop
                muted
                playsInline
                className="object-cover w-full h-full grayscale opacity-40 brightness-[0.4] group-hover:grayscale-0 group-hover:opacity-60 group-hover:brightness-[0.55] transition-all duration-1000"
              />
            ) : (
              <Image
                src={barberiaBg}
                alt="Barbería background"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover grayscale opacity-40 brightness-[0.4] group-hover:grayscale-0 group-hover:opacity-60 group-hover:brightness-[0.55] transition-all duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-1" />
            <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors duration-700 mix-blend-color z-1" />
          </div>

          {/* Column Content */}
          <div className="relative z-10 flex flex-col items-center max-w-xs mt-2">
            {/* Logo */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-36 lg:h-36 mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none">
              <Image
                src="/hands-logo-v4.png"
                alt="Valentes Barber Studio Logo"
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>

            {/* Subtitle */}
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#C5A059] font-bold block mb-1">
              BARBEARIA
            </span>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-3xl xl:text-4xl text-white/85 tracking-wider font-normal uppercase leading-none">
              VALENTES
              <span className="block text-[10px] sm:text-xs tracking-[0.45em] text-[#C5A059]/90 mt-1.5 font-sans font-bold">STUDIO</span>
            </h2>

            {/* Divider */}
            <div className="flex items-center justify-center space-x-2 my-3 lg:my-2 w-full">
              <div className="w-8 h-[1px] bg-[#C5A059]/40" />
              <span className="text-[9px] text-[#C5A059]">❖</span>
              <div className="w-8 h-[1px] bg-[#C5A059]/40" />
            </div>

            {/* Description */}
            <p className="text-xs text-white/70 leading-relaxed font-light mb-4 lg:mb-3.5 max-w-[250px]">
              {barberiaDesc}
            </p>

            {/* CTA Button */}
            <Link
              href="/barberia"
              className="border border-[#C5A059]/50 text-[#C5A059] text-[10px] sm:text-xs uppercase tracking-widest font-bold px-6 py-2 rounded-full hover:bg-[#C5A059] hover:text-black transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-black/40 cursor-pointer"
            >
              <span>RESERVAR HORA</span>
              <Calendar size={12} />
            </Link>
          </div>
        </div>

        {/* PANEL 2: PELUQUERIA */}
        <div className="group relative min-h-[380px] lg:min-h-0 flex flex-col justify-center items-center px-6 md:px-10 py-6 lg:py-3 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden text-center">
          {/* Background image / video */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none transition-all duration-1000 scale-100 group-hover:scale-105">
            {isVideoUrl(peluqueriaBg) ? (
              <video
                src={peluqueriaBg}
                autoPlay
                loop
                muted
                playsInline
                className="object-cover w-full h-full grayscale opacity-40 brightness-[0.4] group-hover:grayscale-0 group-hover:opacity-60 group-hover:brightness-[0.55] transition-all duration-1000"
              />
            ) : (
              <Image
                src={peluqueriaBg}
                alt="Peluquería background"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover grayscale opacity-40 brightness-[0.4] group-hover:grayscale-0 group-hover:opacity-60 group-hover:brightness-[0.55] transition-all duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-1" />
            <div className="absolute inset-0 bg-bronze/5 group-hover:bg-bronze/10 transition-colors duration-700 mix-blend-color z-1" />
          </div>

          {/* Column Content */}
          <div className="relative z-10 flex flex-col items-center max-w-xs mt-2">
            {/* Logo */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-36 lg:h-36 mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none">
              <Image
                src="/peluqueria-logo-v4.png"
                alt="Alma Bela Studio Logo"
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>

            {/* Subtitle */}
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#C5A059] font-bold block mb-1">
              PELUQUERÍA
            </span>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-3xl xl:text-4xl text-white/85 tracking-wider font-normal uppercase leading-none">
              ALMA BELA
              <span className="block text-[10px] sm:text-xs tracking-[0.45em] text-[#3fcbe0] mt-1.5 font-sans font-bold">STUDIO</span>
            </h2>

            {/* Divider */}
            <div className="flex items-center justify-center space-x-2 my-3 lg:my-2 w-full">
              <div className="w-8 h-[1px] bg-[#C5A059]/40" />
              <span className="text-[9px] text-[#C5A059]">❖</span>
              <div className="w-8 h-[1px] bg-[#C5A059]/40" />
            </div>

            {/* Description */}
            <p className="text-xs text-white/70 leading-relaxed font-light mb-4 lg:mb-3.5 max-w-[250px]">
              {peluqueriaDesc}
            </p>

            {/* CTA Button */}
            <Link
              href="/peluqueria"
              className="border border-[#C5A059]/50 text-[#C5A059] text-[10px] sm:text-xs uppercase tracking-widest font-bold px-6 py-2 rounded-full hover:bg-[#C5A059] hover:text-black transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-black/40 cursor-pointer"
            >
              <span>VER SERVICIOS</span>
              <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* PANEL 3: JEFITO LOPES (TERAPIAS) */}
        <div className="group relative min-h-[380px] lg:min-h-0 flex flex-col justify-center items-center px-6 md:px-10 py-6 lg:py-3 border-b lg:border-b-0 overflow-hidden text-center">
          {/* Background image / video */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none transition-all duration-1000 scale-100 group-hover:scale-105">
            {isVideoUrl(terapiasBg) ? (
              <video
                src={terapiasBg}
                autoPlay
                loop
                muted
                playsInline
                className="object-cover w-full h-full grayscale opacity-40 brightness-[0.4] group-hover:grayscale-0 group-hover:opacity-60 group-hover:brightness-[0.55] transition-all duration-1000"
              />
            ) : (
              <Image
                src={terapiasBg}
                alt="Terapias background"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover grayscale opacity-40 brightness-[0.4] group-hover:grayscale-0 group-hover:opacity-60 group-hover:brightness-[0.55] transition-all duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-1" />
            <div className="absolute inset-0 bg-platinum/5 group-hover:bg-platinum/10 transition-colors duration-700 mix-blend-color z-1" />
          </div>

          {/* Column Content */}
          <div className="relative z-10 flex flex-col items-center max-w-xs mt-2">
            {/* Logo */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-36 lg:h-36 mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.7)] group-hover:scale-[1.52] transition-transform duration-500 select-none pointer-events-none scale-[1.45]">
              <Image
                src="/terapias-logo-v9.png"
                alt="Jefito Lopes Studio Logo"
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>

            {/* Subtitle */}
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#C5A059] font-bold block mb-1">
              TERAPIAS HOLÍSTICAS
            </span>

            {/* Title (Only JEFITO LOPES, no STUDIO) */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-3xl xl:text-4xl text-white/85 tracking-wider font-normal uppercase leading-none">
              JEFÏTO LOPÊS
            </h2>

            {/* Divider */}
            <div className="flex items-center justify-center space-x-2 my-3 lg:my-2 w-full">
              <div className="w-8 h-[1px] bg-[#C5A059]/40" />
              <span className="text-[9px] text-[#C5A059]">❖</span>
              <div className="w-8 h-[1px] bg-[#C5A059]/40" />
            </div>

            {/* Description */}
            <p className="text-xs text-white/70 leading-relaxed font-light mb-4 lg:mb-3.5 max-w-[250px]">
              {terapiasDesc}
            </p>

            {/* CTA Button */}
            <Link
              href="/terapias"
              className="border border-[#C5A059]/50 text-[#C5A059] text-[10px] sm:text-xs uppercase tracking-widest font-bold px-6 py-2 rounded-full hover:bg-[#C5A059] hover:text-black transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-black/40 cursor-pointer"
            >
              <span>AGENDAR TERAPIA</span>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21a9 9 0 0 1-5.5-2c2.5 0 4.5-1 5.5-3 1 2 3 3 5.5 3-1.5 2-3.5 2-5.5 2zm0-18c-1.5 2.5-4 4-6.5 4 2.5 1.5 4 4 4 6.5 0-2.5 1.5-4 4-4s4 1.5 4 4c0-2.5 1.5-4 4-6.5-2.5 0-5-1.5-6.5-4z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BOTTOM FOOTER VALUES SECTION */}
      <footer className="bg-[#070707] border-t border-white/5 py-2 lg:py-1.5 relative flex-shrink-0">
        {/* Decorative backdrop glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[450px] h-[100px] bg-[#C5A059]/8 rounded-full blur-[60px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-1.5 items-center text-center">
          {/* Value 1: EQUILIBRIO */}
          <div className="flex flex-col items-center space-y-1 p-1">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b8860b" />
                    <stop offset="50%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" stroke="url(#gold1)" strokeWidth="0.8" strokeDasharray="2 2" className="opacity-60" />
                <circle cx="50" cy="50" r="38" stroke="url(#gold1)" strokeWidth="1.5" />
                <circle cx="50" cy="32" r="3.5" fill="url(#gold1)" />
                <path d="M50 38.5v16" stroke="url(#gold1)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M41 44c3 1.5 6 .5 9-2.5s6-4 9-2.5" stroke="url(#gold1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M35 58c5-3.5 10-5 15-5s10 1.5 15 5" stroke="url(#gold1)" strokeWidth="2" strokeLinecap="round" />
                <path d="M39 54c3.5-1.5 7.5-2 11-2s7.5.5 11 2" stroke="url(#gold1)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                EQUILÍBRIO
              </span>
              <p className="text-[9px] md:text-[10px] text-white/50 font-light max-w-[170px] leading-snug">
                Cuerpo, mente y espíritu en armonía.
              </p>
            </div>
          </div>

          {/* Value 2: BIENESTAR */}
          <div className="flex flex-col items-center space-y-1 p-1">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="gold2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b8860b" />
                    <stop offset="50%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" stroke="url(#gold2)" strokeWidth="0.8" strokeDasharray="2 2" className="opacity-60" />
                <circle cx="50" cy="50" r="38" stroke="url(#gold2)" strokeWidth="1.5" />
                <path d="M50 65c7.5-4.5 10-12 10-18s-6.5-7.5-10-6.5c-6.5 1.5-10 8-10 18s5.5 11 10 6.5z" stroke="url(#gold2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M45 58.5c4-3 7-7.5 8.5-12" stroke="url(#gold2)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                BIENESTAR
              </span>
              <p className="text-[9px] md:text-[10px] text-white/50 font-light max-w-[170px] leading-snug">
                Mejoramos tu energía y calidad de vida.
              </p>
            </div>
          </div>

          {/* Center piece: Great Lotus Logo from Loading Screen */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex justify-center py-1 lg:py-0">
            <Link 
              href="/admin"
              className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 transition-all duration-500 hover:scale-110 cursor-pointer z-20 -translate-y-3 sm:-translate-y-4 lg:-translate-y-5"
              aria-label="Panel de Administración"
            >
              {/* Glowing aura */}
              <div className="absolute inset-0 bg-[#C5A059]/20 rounded-full blur-xl animate-pulse" />
              {/* Lotus Image */}
              <div className="relative w-full h-full select-none">
                <Image
                  src="/meditando-loto.png"
                  alt="Lotus Meditando Templo Santuario"
                  fill
                  sizes="(max-width: 768px) 110px, 128px"
                  className="object-contain filter brightness-110 contrast-105 drop-shadow-[0_0_15px_rgba(212,175,55,0.85)]"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Value 3: TRANSFORMACION */}
          <div className="flex flex-col items-center space-y-1 p-1">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="gold4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b8860b" />
                    <stop offset="50%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" stroke="url(#gold4)" strokeWidth="0.8" strokeDasharray="2 2" className="opacity-60" />
                <circle cx="50" cy="50" r="38" stroke="url(#gold4)" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="14" stroke="url(#gold4)" strokeWidth="1.2" />
                <circle cx="50" cy="36" r="14" stroke="url(#gold4)" strokeWidth="0.8" className="opacity-45" />
                <circle cx="50" cy="64" r="14" stroke="url(#gold4)" strokeWidth="0.8" className="opacity-45" />
                <circle cx="36" cy="50" r="14" stroke="url(#gold4)" strokeWidth="0.8" className="opacity-45" />
                <circle cx="64" cy="50" r="14" stroke="url(#gold4)" strokeWidth="0.8" className="opacity-45" />
                <path d="M50 22v56M22 50h56" stroke="url(#gold4)" strokeWidth="0.8" className="opacity-55" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                TRANSFORMACIÓN
              </span>
              <p className="text-[9px] md:text-[10px] text-white/50 font-light max-w-[170px] leading-snug">
                Crecimiento personal y espiritual.
              </p>
            </div>
          </div>

          {/* Value 4: PROPOSITO */}
          <div className="flex flex-col items-center space-y-1 p-1">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="gold5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b8860b" />
                    <stop offset="50%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" stroke="url(#gold5)" strokeWidth="0.8" strokeDasharray="2 2" className="opacity-60" />
                <circle cx="50" cy="50" r="38" stroke="url(#gold5)" strokeWidth="1.5" />
                <path d="M50 63.5l-2.4-2.1c-7.2-6.6-12-10.8-12-15.9 0-4.2 3.3-7.5 7.5-7.5 2.4 0 4.8 1.2 6.9 3 2.1-1.8 4.5-3 6.9-3 4.2 0 7.5 3.3 7.5 7.5 0 5.1-4.8 9.3-12 15.9l-2.4 2.1z" fill="url(#gold5)" />
                <path d="M50 25v5M50 70v5M25 50h5M70 50h5" stroke="url(#gold5)" strokeWidth="1" className="opacity-50" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                PROPÓSITO
              </span>
              <p className="text-[9px] md:text-[10px] text-white/50 font-light max-w-[170px] leading-snug">
                Conecta con tu esencia y vive en plenitud.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
