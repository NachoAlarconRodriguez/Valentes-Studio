import React, { useState, useEffect } from 'react';
import { useLoyaltyStore, LoyaltyConfig, LoyaltyRule } from '@/store/useLoyaltyStore';
import { useFrequencyLoyaltyStore, FrequencyLoyaltyConfig, LoyaltyCategoryKey, CategoryFrequencyConfig } from '@/store/useFrequencyLoyaltyStore';
import { Award, Clock, Percent, Save, CheckCircle, RefreshCw, ShieldCheck, Minus, Plus, Sparkles, Gift, Scissors, HeartPulse, ToggleLeft, ToggleRight } from 'lucide-react';

export default function LoyaltySettingsTab() {
  // Retorno Barberia Store
  const { config: retornoConfig, updateConfig: updateRetornoConfig, fetchConfig: fetchRetornoConfig } = useLoyaltyStore();
  const [localRetornoConfig, setLocalRetornoConfig] = useState<LoyaltyConfig>(retornoConfig);

  // Frequency Loyalty Store
  const { config: freqConfig, updateConfig: updateFreqConfig, fetchConfig: fetchFreqConfig } = useFrequencyLoyaltyStore();
  const [localFreqConfig, setLocalFreqConfig] = useState<FrequencyLoyaltyConfig>(freqConfig);

  const [activeSubTab, setActiveSubTab] = useState<'retorno_barberia' | 'frecuencia_recompensas'>('retorno_barberia');
  const [savedSuccessRetorno, setSavedSuccessRetorno] = useState(false);
  const [savedSuccessFreq, setSavedSuccessFreq] = useState(false);
  const [isSavingRetorno, setIsSavingRetorno] = useState(false);
  const [isSavingFreq, setIsSavingFreq] = useState(false);

  useEffect(() => {
    fetchRetornoConfig();
    fetchFreqConfig();
  }, [fetchRetornoConfig, fetchFreqConfig]);

  useEffect(() => {
    setLocalRetornoConfig(retornoConfig);
  }, [retornoConfig]);

  useEffect(() => {
    setLocalFreqConfig(freqConfig);
  }, [freqConfig]);

  // Handlers for Retorno Barberia
  const handleToggleRetornoEnabled = () => {
    setLocalRetornoConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleRetornoRuleChange = (index: number, field: keyof LoyaltyRule, value: any) => {
    const updatedRules = [...localRetornoConfig.rules];
    const numVal = parseInt(value, 10) || 0;
    
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: numVal
    };

    setLocalRetornoConfig((prev) => ({
      ...prev,
      rules: updatedRules
    }));
  };

  const handleSaveRetorno = async () => {
    setIsSavingRetorno(true);
    await updateRetornoConfig(localRetornoConfig);
    setIsSavingRetorno(false);
    setSavedSuccessRetorno(true);
    setTimeout(() => setSavedSuccessRetorno(false), 3000);
  };

  // Handlers for Frequency Loyalty
  const handleToggleCategoryEnabled = (catKey: LoyaltyCategoryKey) => {
    setLocalFreqConfig((prev) => {
      const currentCat = prev.categories[catKey];
      return {
        ...prev,
        categories: {
          ...prev.categories,
          [catKey]: {
            ...currentCat,
            enabled: !currentCat.enabled
          }
        }
      };
    });
  };

  const handleFreqCategoryChange = (catKey: LoyaltyCategoryKey, fields: Partial<CategoryFrequencyConfig>) => {
    setLocalFreqConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catKey]: {
          ...prev.categories[catKey],
          ...fields
        }
      }
    }));
  };

  const handleSaveFreq = async () => {
    setIsSavingFreq(true);
    await updateFreqConfig(localFreqConfig);
    setIsSavingFreq(false);
    setSavedSuccessFreq(true);
    setTimeout(() => setSavedSuccessFreq(false), 3000);
  };

  const businessCategories: { key: LoyaltyCategoryKey; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      key: 'barberia',
      title: 'Barbería',
      subtitle: 'Programa de Tarjeta Frecuente para Servicios de Barbería',
      icon: <Scissors size={18} />,
      color: '#D7AF68'
    },
    {
      key: 'peluqueria',
      title: 'Peluquería',
      subtitle: 'Programa de Tarjeta Frecuente para Peluquería y Estilismo',
      icon: <Sparkles size={18} />,
      color: '#ec4899'
    },
    {
      key: 'terapias',
      title: 'Terapias Holísticas',
      subtitle: 'Programa de Tarjeta Frecuente para Masajes y Terapias',
      icon: <HeartPulse size={18} />,
      color: '#10b981'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-left">
      {/* Sub-Tabs Navigation Bar */}
      <div className="flex items-center space-x-3 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('retorno_barberia')}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'retorno_barberia'
              ? 'bg-[#D7AF68]/10 border border-[#D7AF68]/30 text-[#D7AF68] shadow-sm shadow-[#D7AF68]/5'
              : 'bg-white/5 border border-white/5 text-text-secondary hover:text-white hover:bg-white/10'
          }`}
        >
          <Award size={14} />
          <span>Promociones de Retorno (Barbería)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('frecuencia_recompensas')}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'frecuencia_recompensas'
              ? 'bg-[#D7AF68]/10 border border-[#D7AF68]/30 text-[#D7AF68] shadow-sm shadow-[#D7AF68]/5'
              : 'bg-white/5 border border-white/5 text-text-secondary hover:text-white hover:bg-white/10'
          }`}
        >
          <Gift size={14} />
          <span>Programa de Frecuencia y Recompensas</span>
        </button>
      </div>

      {/* SUB-TAB 1: PROMOCIONES DE RETORNO (BARBERÍA) */}
      {activeSubTab === 'retorno_barberia' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#181108] via-[#1c140a] to-[#0d0905] border border-[#D7AF68]/25 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D7AF68]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D7AF68]/10 border border-[#D7AF68]/30 text-[#D7AF68] text-xs uppercase tracking-widest font-bold">
                  <Award size={14} />
                  <span>Programa de Fidelización Exclusivo</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-wide">
                  Promociones de Retorno (Barbería)
                </h2>
                <p className="text-text-secondary text-xs sm:text-sm max-w-xl font-light leading-relaxed">
                  Premia la frecuencia de tus clientes de Barbería otorgando descuentos automáticos según los días transcurridos desde su última atención completada.
                </p>
              </div>

              {/* Master Enable Toggle */}
              <div className="flex items-center space-x-3 bg-black/40 border border-white/10 px-5 py-3 rounded-2xl">
                <span className="text-xs uppercase tracking-wider font-semibold text-white">
                  {localRetornoConfig.enabled ? 'Programa Activo' : 'Programa Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={handleToggleRetornoEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localRetornoConfig.enabled ? 'bg-[#D7AF68]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      localRetornoConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Rules Config Section */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-white font-bold tracking-wider flex items-center gap-2">
                  <Clock className="text-[#D7AF68]" size={18} />
                  <span>Reglas de Descuento por Días de Retorno</span>
                </h3>
                <p className="text-xs text-text-secondary font-light">
                  Configura los límites máximos de días y el % de descuento correspondiente.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D7AF68]/80 bg-[#D7AF68]/10 border border-[#D7AF68]/20 px-3 py-1 rounded-full">
                Solo Barbería
              </span>
            </div>

            {/* Dynamic Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {localRetornoConfig.rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-5 hover:border-[#D7AF68]/40 transition-all group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#D7AF68] bg-[#D7AF68]/10 px-2.5 py-1 rounded-lg border border-[#D7AF68]/20">
                      Tramo {idx + 1}
                    </span>
                    <Percent size={16} className="text-text-secondary group-hover:text-[#D7AF68] transition-colors" />
                  </div>

                  {/* Max Days Control */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                      Días Máximos de Retorno
                    </label>
                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-1.5 focus-within:border-[#D7AF68]/60 transition-all">
                      <button
                        type="button"
                        onClick={() => handleRetornoRuleChange(idx, 'maxDays', Math.max(1, rule.maxDays - 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D7AF68]/20 hover:text-[#D7AF68] text-white/70 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-[#D7AF68]/30 active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="flex items-center space-x-1 font-mono font-bold text-sm text-white">
                        <span>{rule.maxDays}</span>
                        <span className="text-xs text-text-secondary font-normal">días</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRetornoRuleChange(idx, 'maxDays', rule.maxDays + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D7AF68]/20 hover:text-[#D7AF68] text-white/70 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-[#D7AF68]/30 active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Discount Percentage Control */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                      Porcentaje de Descuento
                    </label>
                    <div className="flex items-center justify-between bg-[#D7AF68]/5 border border-[#D7AF68]/20 rounded-xl p-1.5 focus-within:border-[#D7AF68] transition-all">
                      <button
                        type="button"
                        onClick={() => handleRetornoRuleChange(idx, 'discountPercent', Math.max(0, rule.discountPercent - 1))}
                        className="w-8 h-8 rounded-lg bg-[#D7AF68]/10 hover:bg-[#D7AF68]/30 text-[#D7AF68] flex items-center justify-center transition-all cursor-pointer border border-[#D7AF68]/20 active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="flex items-center space-x-0.5 font-mono font-bold text-base text-[#D7AF68]">
                        <span>{rule.discountPercent}</span>
                        <span className="text-xs">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRetornoRuleChange(idx, 'discountPercent', Math.min(100, rule.discountPercent + 1))}
                        className="w-8 h-8 rounded-lg bg-[#D7AF68]/10 hover:bg-[#D7AF68]/30 text-[#D7AF68] flex items-center justify-center transition-all cursor-pointer border border-[#D7AF68]/20 active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Summary Description */}
                  <div className="pt-2.5 border-t border-white/5 text-[11px] text-text-secondary font-light">
                    Si vuelve dentro de <strong className="text-white font-mono">{rule.maxDays} días</strong> ➔ obtendrá <strong className="text-[#D7AF68] font-mono">{rule.discountPercent}% OFF</strong>.
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs">
                {savedSuccessRetorno && (
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-medium animate-pulse">
                    <CheckCircle size={14} />
                    <span>Configuración de promociones guardada con éxito.</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveRetorno}
                disabled={isSavingRetorno}
                className="px-8 py-3 rounded-full bg-[#D7AF68] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all duration-300 flex items-center space-x-2 cursor-pointer shadow-lg shadow-[#D7AF68]/20 disabled:opacity-50"
              >
                {isSavingRetorno ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Guardar Configuración</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PROGRAMA DE FRECUENCIA Y RECOMPENSAS POR VISITAS */}
      {activeSubTab === 'frecuencia_recompensas' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#111914] via-[#0d1611] to-[#080d09] border border-emerald-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-widest font-bold">
                <Gift size={14} />
                <span>Programa de Frecuencia y Tarjeta de Fidelidad</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-wide">
                Recompensas por Cantidad de Visitas
              </h2>
              <p className="text-text-secondary text-xs sm:text-sm max-w-2xl font-light leading-relaxed">
                Premia a tus clientes constantes al completar una cantidad determinada de servicios (ej. al completar 6 visitas, la 7ª atención obtiene un descuento especial o premio elegible). Puedes activar o desactivar independientemente cada unidad de negocio.
              </p>
            </div>
          </div>

          {/* Business Categories Cards Grid */}
          <div className="space-y-6">
            {businessCategories.map(({ key, title, subtitle, icon, color }) => {
              const catConfig = localFreqConfig.categories[key] || {
                enabled: false,
                requiredVisits: 6,
                rewardType: 'discount',
                rewardDiscountPercent: 50,
                rewardPrizeName: '',
                includeHistorical: true
              };

              return (
                <div
                  key={key}
                  className={`bg-[#0a0a0a] border rounded-3xl p-6 md:p-8 space-y-6 transition-all shadow-xl ${
                    catConfig.enabled ? 'border-white/15' : 'border-white/5 opacity-70'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
                        style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color: color }}
                      >
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-serif text-lg text-white font-bold tracking-wide">{title}</h3>
                          <span
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest font-bold border backdrop-blur-md transition-all shadow-sm ${
                              catConfig.enabled
                                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 shadow-emerald-950/40'
                                : 'bg-white/[0.03] border-white/10 text-white/40'
                            }`}
                          >
                            <span className="relative flex h-2 w-2">
                              {catConfig.enabled ? (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </>
                              ) : (
                                <span className="inline-block h-2 w-2 rounded-full bg-zinc-600 border border-zinc-500/50" />
                              )}
                            </span>
                            <span>{catConfig.enabled ? 'Programa Activo' : 'Inactivo'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary font-light">{subtitle}</p>
                      </div>
                    </div>

                    {/* Enable Toggle Switch */}
                    <div className="flex items-center space-x-3 bg-black/40 border border-white/10 px-4 py-2 rounded-2xl shrink-0 self-start sm:self-auto">
                      <span className="text-xs uppercase tracking-wider font-semibold text-white">
                        {catConfig.enabled ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryEnabled(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          catConfig.enabled ? 'bg-emerald-500' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                            catConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Config Controls Body */}
                  {catConfig.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Left: Visits Threshold */}
                      <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider font-bold text-white block">
                            Meta de Visitas Previas Requeridas
                          </label>
                          <p className="text-[11px] text-text-secondary font-light">
                            Número de visitas que el cliente debe completar para desbloquear el premio en su siguiente cita.
                          </p>
                        </div>

                        <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleFreqCategoryChange(key, {
                                requiredVisits: Math.max(1, catConfig.requiredVisits - 1)
                              })
                            }
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/70 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-emerald-500/30 active:scale-95"
                          >
                            <Minus size={16} />
                          </button>
                          <div className="text-center font-mono">
                            <span className="text-xl font-bold text-white block">{catConfig.requiredVisits}</span>
                            <span className="text-[10px] text-text-secondary uppercase tracking-widest block">visitas completadas</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleFreqCategoryChange(key, {
                                requiredVisits: catConfig.requiredVisits + 1
                              })
                            }
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/70 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-emerald-500/30 active:scale-95"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-[11px] text-text-secondary font-light pt-1 border-t border-white/5">
                          El beneficio se aplicará en la cita <strong className="text-emerald-400 font-mono">#{catConfig.requiredVisits + 1}</strong>.
                        </div>
                      </div>

                      {/* Right: Reward Config */}
                      <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider font-bold text-white block">
                            Tipo de Recompensa
                          </label>
                          <p className="text-[11px] text-text-secondary font-light">
                            Selecciona entre aplicar un descuento porcentual o entregar un regalo/premio físico.
                          </p>
                        </div>

                        {/* Reward Type Radio Switches */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleFreqCategoryChange(key, { rewardType: 'discount' })}
                            className={`p-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                              catConfig.rewardType === 'discount'
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm'
                                : 'bg-white/5 border-white/5 text-text-secondary hover:text-white'
                            }`}
                          >
                            <Percent size={14} />
                            <span>Descuento %</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFreqCategoryChange(key, { rewardType: 'prize' })}
                            className={`p-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                              catConfig.rewardType === 'prize'
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm'
                                : 'bg-white/5 border-white/5 text-text-secondary hover:text-white'
                            }`}
                          >
                            <Gift size={14} />
                            <span>Premio / Regalo</span>
                          </button>
                        </div>

                        {/* Sub-inputs depending on rewardType */}
                        {catConfig.rewardType === 'discount' ? (
                          <div className="space-y-1.5">
                            <label className="block text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                              Porcentaje de Descuento
                            </label>
                            <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleFreqCategoryChange(key, {
                                    rewardDiscountPercent: Math.max(5, catConfig.rewardDiscountPercent - 5)
                                  })
                                }
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all cursor-pointer border border-emerald-500/20 active:scale-95"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="flex items-center space-x-1 font-mono font-bold text-base text-emerald-400">
                                <span>{catConfig.rewardDiscountPercent}</span>
                                <span className="text-xs">% OFF</span>
                                {catConfig.rewardDiscountPercent === 100 && (
                                  <span className="text-[9px] bg-emerald-400 text-black font-bold px-1.5 py-0.5 rounded ml-1">
                                    ¡GRATIS!
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleFreqCategoryChange(key, {
                                    rewardDiscountPercent: Math.min(100, catConfig.rewardDiscountPercent + 5)
                                  })
                                }
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all cursor-pointer border border-emerald-500/20 active:scale-95"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <label className="block text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                              Descripción del Premio o Regalo
                            </label>
                            <input
                              type="text"
                              value={catConfig.rewardPrizeName}
                              onChange={(e) => handleFreqCategoryChange(key, { rewardPrizeName: e.target.value })}
                              placeholder="Ej: Servicio Gratis a elección / Gift Box"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-secondary/50 focus:border-emerald-500/60 focus:outline-none transition-all"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions Footer for Frequency Loyalty */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-2 text-xs">
              {savedSuccessFreq && (
                <span className="flex items-center space-x-1.5 text-emerald-400 font-medium animate-pulse">
                  <CheckCircle size={14} />
                  <span>Configuración de recompensas por frecuencia guardada con éxito.</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveFreq}
              disabled={isSavingFreq}
              className="px-8 py-3 rounded-full bg-emerald-500 text-black font-semibold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all duration-300 flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-950/20 disabled:opacity-50"
            >
              {isSavingFreq ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Guardar Configuración de Frecuencia</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
