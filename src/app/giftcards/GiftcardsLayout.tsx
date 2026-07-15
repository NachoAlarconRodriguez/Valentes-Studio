'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, Copy, Check, CreditCard, ArrowLeft, Info, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useGiftCardStore from '@/store/useGiftCardStore';

export default function GiftcardsLayout() {
  const { buyGiftCard } = useGiftCardStore();

  // Customizer states
  const [amount, setAmount] = useState<number>(30000);
  const [theme, setTheme] = useState<'barberia' | 'peluqueria' | 'terapias' | 'santuario'>('santuario');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Flow states
  const [step, setStep] = useState<'customize' | 'checkout' | 'success'>('customize');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Expiration calculation: exactly 1 month from now
  const expirationDateStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !recipientName || !recipientEmail) return;
    setStep('checkout');
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) return;

    setIsSubmitting(true);
    try {
      // Create card in store
      const code = await buyGiftCard({
        originalAmount: amount,
        senderName,
        senderEmail,
        recipientName,
        recipientEmail,
        theme,
        message: message || '¡Un regalo especial para ti!'
      });

      setGeneratedCode(code);
      setStep('success');
    } catch (err) {
      console.error('Error purchasing gift card:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Color schemes based on card theme selection
  const themeStyles = {
    santuario: {
      cardBg: 'bg-gradient-to-br from-[#1c1a16] via-[#101010] to-[#252119]',
      border: 'border-gold/30',
      glow: 'shadow-gold/5',
      logo: '/meditando-loto.png',
      textColor: 'text-gold',
      buttonBg: 'bg-gold hover:bg-gold/90 text-black',
      gradientClip: 'text-gold-gradient',
      title: 'SANTUARIO'
    },
    barberia: {
      cardBg: 'bg-gradient-to-br from-[#1c160a] via-[#080808] to-[#2b210a]',
      border: 'border-gold/40',
      glow: 'shadow-gold/10',
      logo: '/hands-logo-v4.png',
      textColor: 'text-gold',
      buttonBg: 'bg-gold hover:bg-gold/90 text-black',
      gradientClip: 'text-gold-gradient',
      title: 'VALENTES'
    },
    peluqueria: {
      cardBg: 'bg-gradient-to-br from-[#24130a] via-[#090503] to-[#361c0f]',
      border: 'border-[#CD7F32]/40',
      glow: 'shadow-[#CD7F32]/10',
      logo: '/peluqueria-logo-v4.png',
      textColor: 'text-[#CD7F32]',
      buttonBg: 'bg-[#CD7F32] hover:bg-[#CD7F32]/90 text-black',
      gradientClip: 'text-bronze-gradient',
      title: 'ALMA BELA'
    },
    terapias: {
      cardBg: 'bg-gradient-to-br from-[#1f1e1c] via-[#0c0c0c] to-[#2e2d2b]',
      border: 'border-[#E2E0D8]/30',
      glow: 'shadow-[#E2E0D8]/5',
      logo: '/terapias-logo-v9.png',
      textColor: 'text-[#E2E0D8]',
      buttonBg: 'bg-[#E2E0D8] hover:bg-[#E2E0D8]/90 text-black',
      gradientClip: 'bg-gradient-to-r from-white via-platinum to-text-secondary bg-clip-text text-transparent',
      title: 'JEFÏTO LOPÊS'
    }
  };

  const activeTheme = themeStyles[theme];

  return (
    <div className="bg-[#070707] text-white min-h-screen relative font-sans overflow-x-hidden pt-24 pb-32">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bronze/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/10 text-[9px] text-gold uppercase tracking-[0.2em] font-semibold">
            <Gift size={11} className="text-gold" />
            <span>Regala Experiencias</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-white tracking-wide">Gift Cards Santuario</h1>
          <p className="text-xs text-text-secondary font-light leading-relaxed">
            Regala un momento de calma absoluta, autoría y bienestar. Personaliza tu tarjeta de regalo virtual válida para cualquiera de nuestras tres unidades.
          </p>
        </div>

        {/* STEP 1 & 2: CUSTOMIZE & CHECKOUT CONTENT GRID */}
        {step !== 'success' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT PANEL: REAL-TIME DYNAMIC CARD PREVIEW */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <span className="block text-[9px] uppercase tracking-widest text-text-secondary font-semibold border-b border-white/5 pb-2">Vista Previa de Tarjeta</span>
              
              {/* The Gift Card visual representation */}
              <div 
                className={`w-full aspect-[1.6/1] rounded-[24px] border ${activeTheme.border} ${activeTheme.cardBg} p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-700`}
                style={{ boxShadow: `0 20px 40px -10px rgba(0,0,0,0.85)` }}
              >
                {/* Visual accents (watermark background) */}
                <div className="absolute -right-12 -bottom-12 w-48 h-48 opacity-5 pointer-events-none">
                  <Image src={activeTheme.logo} alt="" fill className="object-contain" />
                </div>
                
                {/* Card Top: Studio Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2.5">
                    <div className="relative w-8 h-8">
                      <Image 
                        src={activeTheme.logo} 
                        alt="Logo" 
                        fill 
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`font-serif text-xs font-bold tracking-[0.2em] ${activeTheme.textColor}`}>
                        {activeTheme.title}
                      </span>
                      <span className="text-[6px] tracking-wider text-white/50 uppercase">STUDIO GROUP</span>
                    </div>
                  </div>
                  <span className="text-[7px] uppercase tracking-widest bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-white/70 font-semibold">
                    Digital Gift Card
                  </span>
                </div>

                {/* Card Mid: Message preview */}
                <div className="my-2 text-left relative z-10">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider leading-none">Mensaje Especial</p>
                  <p className="text-[10px] text-white/80 italic font-light line-clamp-2 mt-1 leading-snug">
                    {message ? `“${message}”` : '“Un momento de relajación y cuidado exclusivo diseñado especialmente para ti.”'}
                  </p>
                </div>

                {/* Card Bottom: Recipient, Expiry & Amount */}
                <div className="flex justify-between items-end border-t border-white/5 pt-4 relative z-10">
                  <div className="text-left">
                    <span className="text-[7px] text-white/40 uppercase tracking-wider block leading-none">Para</span>
                    <span className="text-[10px] font-semibold text-white tracking-wide block mt-1 uppercase truncate max-w-[150px]">
                      {recipientName || 'Beneficiario'}
                    </span>
                    <span className="text-[6px] text-white/30 block mt-0.5 font-light">
                      Expira: {expirationDateStr}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[7px] text-white/40 uppercase tracking-wider block leading-none">Monto</span>
                    <span className="font-serif text-xl font-bold text-white block leading-none mt-1">
                      ${amount.toLocaleString('es-CL')} <span className="text-[9px] font-sans font-normal text-text-secondary">CLP</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Flipping Policy/Info Card */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-[155px] cursor-pointer group select-none"
                style={{ perspective: '1000px' }}
              >
                <div 
                  className="relative w-full h-full"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* FRONT SIDE */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-[#121212]/75 backdrop-blur-md border border-gold/15 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 group-hover:border-gold/30 group-hover:bg-[#151515]/85 transition-all duration-300 shadow-lg"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gold/5 border border-gold/15 flex items-center justify-center text-gold group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-300">
                      <Info size={18} />
                    </div>
                    <div className="text-center space-y-0.5">
                      <p className="font-serif text-sm tracking-widest text-white group-hover:text-gold transition-colors font-medium">TÉRMINOS Y CONDICIONES</p>
                      <span className="text-[9px] uppercase tracking-wider text-text-secondary group-hover:text-white/60 transition-colors block">
                        Haz clic para ver el detalle
                      </span>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-[#121212]/90 backdrop-blur-md border border-gold/25 rounded-2xl p-5 flex flex-col justify-center text-left"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="flex items-start space-x-3 text-[11px] font-light text-text-secondary leading-relaxed">
                      <Info size={14} className="text-gold flex-shrink-0 mt-0.5" />
                      <div className="space-y-1.5">
                        <p className="text-white font-medium text-xs font-serif tracking-wider uppercase mb-1">CONDICIONES DE USO</p>
                        <p>• Válida para agendar cualquier servicio de Barbería, Peluquería o Terapias en el sitio.</p>
                        <p>• Saldo reajustable (el saldo sobrante se mantiene en el código para futuras reservas).</p>
                        <p>• Vence exactamente en 1 mes tras la compra.</p>
                      </div>
                    </div>
                    <span className="text-[7.5px] uppercase tracking-[0.15em] text-white/30 text-center block mt-3">
                      Haz clic para volver
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: STEP ACTION FORMS */}
            <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              
              {/* Tab/Step indicator */}
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <span className="text-xs uppercase tracking-widest text-gold font-bold">
                  {step === 'customize' ? '01. Personalizar Regalo' : '02. Checkout & Pago'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                  Paso {step === 'customize' ? '1' : '2'} de 2
                </span>
              </div>

              <AnimatePresence mode="wait">
                {step === 'customize' ? (
                  /* STEP 1: CUSTOMIZE CARD FORM */
                  <motion.form 
                    key="customize-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleNextStep} 
                    className="space-y-6 text-left"
                  >
                    {/* Amount Selector */}
                    <div className="space-y-2.5">
                      <label className="block text-[10px] uppercase tracking-wider text-gold font-bold">Seleccionar Monto (CLP)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[30000, 45000, 60000, 80000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-3.5 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-300 focus:outline-none ${
                              amount === val
                                ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.15)] font-bold'
                                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                            }`}
                          >
                            ${val.toLocaleString('es-CL')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme selector */}
                    <div className="space-y-2.5">
                      <label className="block text-[10px] uppercase tracking-wider text-gold font-bold">Temática de Diseño</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'santuario', label: 'Santuario', desc: 'Neutral' },
                          { id: 'barberia', label: 'Barbería', desc: 'Valentes' },
                          { id: 'peluqueria', label: 'Peluquería', desc: 'Alma Bela' },
                          { id: 'terapias', label: 'Terapias', desc: 'Essencia' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTheme(t.id as any)}
                            className={`p-3 rounded-xl border text-[10px] font-semibold tracking-wider text-center flex flex-col justify-center items-center transition-all duration-300 focus:outline-none ${
                              theme === t.id
                                ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.15)] font-bold'
                                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                            }`}
                          >
                            <span>{t.label}</span>
                            <span className="text-[7px] text-text-secondary mt-0.5 font-light normal-case">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sender & Recipient fields */}
                    <div className="space-y-4 pt-2">
                      <span className="block text-[10px] uppercase tracking-[0.25em] text-gold/80 font-bold border-b border-white/5 pb-1">Información del Destinatario (Quién Recibe)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary">Nombre *</label>
                          <input 
                            type="text" 
                            placeholder="Nombre del beneficiario"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2 px-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary">Correo Electrónico *</label>
                          <input 
                            type="email" 
                            placeholder="correo@destinatario.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2 px-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="block text-[10px] uppercase tracking-[0.25em] text-gold/80 font-bold border-b border-white/5 pb-1">Información del Remitente (Quién Compra)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary">Tu Nombre *</label>
                          <input 
                            type="text" 
                            placeholder="Escribe tu nombre"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2 px-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary">Tu Correo Electrónico *</label>
                          <input 
                            type="email" 
                            placeholder="tu@correo.com"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2 px-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dedication message */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-wider text-gold font-bold">Dedicatoria / Mensaje (Opcional)</label>
                      <textarea
                        placeholder="Escribe un mensaje de dedicatoria..."
                        maxLength={120}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold/40 focus:outline-none transition-colors resize-none h-20"
                      />
                      <span className="block text-[8px] text-right text-white/30">{message.length}/120 caract.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-semibold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2 cursor-pointer shimmer-button mt-4"
                    >
                      <span>Continuar al Pago</span>
                      <Sparkles size={13} />
                    </button>
                  </motion.form>
                ) : (
                  /* STEP 2: SIMULATED PAYMENT FORMS */
                  <motion.form 
                    key="checkout-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handlePurchase} 
                    className="space-y-6 text-left"
                  >
                    {/* Pay back navigation button */}
                    <button
                      type="button"
                      onClick={() => setStep('customize')}
                      className="inline-flex items-center space-x-1.5 text-xs text-white/60 hover:text-gold transition-colors focus:outline-none"
                    >
                      <ArrowLeft size={13} />
                      <span>Volver a personalizar</span>
                    </button>

                    {/* Purchase breakdown summary */}
                    <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-xs uppercase tracking-wider text-text-secondary">Detalle de Regalo</span>
                        <span className="text-xs font-semibold text-white">Gift Card {theme.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-xs uppercase tracking-wider text-text-secondary">Para</span>
                        <span className="text-xs font-semibold text-white">{recipientName}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-xs uppercase tracking-wider text-text-secondary">Vencimiento</span>
                        <span className="text-xs font-semibold text-gold flex items-center gap-1">
                          <Calendar size={12} />
                          {expirationDateStr}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Total a Pagar</span>
                        <span className="text-lg font-serif font-bold text-white">${amount.toLocaleString('es-CL')} CLP</span>
                      </div>
                    </div>

                    {/* Credit Card inputs */}
                    <div className="space-y-4 pt-2">
                      <span className="block text-[10px] uppercase tracking-[0.25em] text-gold/80 font-bold border-b border-white/5 pb-1">Datos de Tarjeta</span>
                      
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase tracking-wider text-text-secondary">Número de Tarjeta *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="4500 1234 5678 9012"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2.5 pl-8 pr-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                          <CreditCard size={14} className="absolute left-1.5 top-3.5 text-white/40" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary">Expiración (MM/AA) *</label>
                          <input 
                            type="text" 
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2.5 px-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary">CVV *</label>
                          <input 
                            type="password" 
                            placeholder="***"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            required
                            className="w-full bg-transparent border-b border-white/10 text-white py-2.5 px-1 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-semibold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard size={14} />
                          <span>Pagar ${amount.toLocaleString('es-CL')} CLP</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>
        ) : (
          /* STEP 3: SUCCESS PANEL (RECEIPT / CODE REDEEM SCREEN) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto bg-[#0c0c0c] border border-gold/25 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-8 relative overflow-hidden"
          >
            {/* Soft decorative light leak inside card */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-6 animate-pulse">
                <Gift size={32} className="stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-gold tracking-wide">¡Gift Card Generada!</h2>
              <p className="text-xs text-text-secondary font-light max-w-sm mt-2 leading-relaxed">
                Tu pago simulado fue procesado con éxito. Se ha emitido un código de tarjeta de regalo digital único para {recipientName}.
              </p>
            </div>

            {/* Generated Code Panel */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
              <span className="block text-[8px] uppercase tracking-widest text-text-secondary">Código único de canje</span>
              <div className="flex items-center justify-center space-x-3 bg-black/60 border border-white/10 rounded-xl p-4">
                <span className="font-mono text-lg font-bold tracking-widest text-white">{generatedCode}</span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-text-secondary hover:text-gold transition-colors focus:outline-none cursor-pointer"
                  title="Copiar Código"
                >
                  {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-left pt-2 text-xs border-t border-white/5">
                <div>
                  <span className="text-[7px] text-white/40 uppercase block">Saldo Inicial</span>
                  <span className="font-semibold text-white">${amount.toLocaleString('es-CL')} CLP</span>
                </div>
                <div>
                  <span className="text-[7px] text-white/40 uppercase block">Fecha de Vencimiento</span>
                  <span className="font-semibold text-gold">{expirationDateStr}</span>
                </div>
              </div>
            </div>

            {/* Instructions box */}
            <div className="text-left space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
              <span className="block text-[9px] uppercase tracking-widest text-gold font-bold">¿Cómo canjear la Gift Card?</span>
              <div className="text-xs font-light text-text-secondary space-y-1.5 leading-relaxed">
                <p>1. Ingresa a la sección de **Barbería**, **Peluquería** o **Terapias**.</p>
                <p>2. Elige tu ritual y haz clic en **Reservar**.</p>
                <p>3. En el modal de reserva, introduce el código <span className="font-mono text-white font-medium bg-white/5 px-1 py-0.5 rounded">{generatedCode}</span> y haz clic en aplicar.</p>
                <p>4. El saldo se descontará del valor del servicio en el acto.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => {
                  setAmount(30000);
                  setTheme('santuario');
                  setSenderName('');
                  setSenderEmail('');
                  setRecipientName('');
                  setRecipientEmail('');
                  setMessage('');
                  setCardNumber('');
                  setCardExpiry('');
                  setCardCvv('');
                  setStep('customize');
                }}
                className="flex-1 py-3.5 rounded-full border border-white/10 text-white text-xs uppercase tracking-widest hover:bg-white/5 transition-all duration-300 font-semibold cursor-pointer"
              >
                Comprar Otra
              </button>
              <Link
                href="/"
                className="flex-1 py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Volver al Inicio</span>
              </Link>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
