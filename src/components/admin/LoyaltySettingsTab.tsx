import React, { useState, useEffect } from 'react';
import { useLoyaltyStore, LoyaltyConfig, LoyaltyRule } from '@/store/useLoyaltyStore';
import { Award, Clock, Percent, Save, CheckCircle, RefreshCw, AlertCircle, ShieldCheck, Minus, Plus, Sparkles } from 'lucide-react';

export default function LoyaltySettingsTab() {
  const { config, updateConfig, fetchConfig, loading } = useLoyaltyStore();
  const [localConfig, setLocalConfig] = useState<LoyaltyConfig>(config);
  const [activeSubTab, setActiveSubTab] = useState<'retorno_barberia' | 'nuevo_programa'>('retorno_barberia');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleToggleEnabled = () => {
    setLocalConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleRuleChange = (index: number, field: keyof LoyaltyRule, value: any) => {
    const updatedRules = [...localConfig.rules];
    const numVal = parseInt(value, 10) || 0;
    
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: numVal
    };

    setLocalConfig((prev) => ({
      ...prev,
      rules: updatedRules
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateConfig(localConfig);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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
          onClick={() => setActiveSubTab('nuevo_programa')}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'nuevo_programa'
              ? 'bg-[#D7AF68]/10 border border-[#D7AF68]/30 text-[#D7AF68] shadow-sm shadow-[#D7AF68]/5'
              : 'bg-white/5 border border-white/5 text-text-secondary hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles size={14} />
          <span>Nuevo Programa de Fidelización</span>
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
                  {localConfig.enabled ? 'Programa Activo' : 'Programa Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localConfig.enabled ? 'bg-[#D7AF68]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      localConfig.enabled ? 'translate-x-6' : 'translate-x-1'
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
              {localConfig.rules.map((rule, idx) => (
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

                  {/* Max Days Control (Option 1 Flanked [-] [+] ) */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                      Días Máximos de Retorno
                    </label>
                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-1.5 focus-within:border-[#D7AF68]/60 transition-all">
                      <button
                        type="button"
                        onClick={() => handleRuleChange(idx, 'maxDays', Math.max(1, rule.maxDays - 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D7AF68]/20 hover:text-[#D7AF68] text-white/70 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-[#D7AF68]/30 active:scale-95"
                        title="Disminuir días"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="flex items-center space-x-1 font-mono font-bold text-sm text-white">
                        <span>{rule.maxDays}</span>
                        <span className="text-xs text-text-secondary font-normal">días</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRuleChange(idx, 'maxDays', rule.maxDays + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D7AF68]/20 hover:text-[#D7AF68] text-white/70 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-[#D7AF68]/30 active:scale-95"
                        title="Aumentar días"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Discount Percentage Control (Option 1 Flanked [-] [+] ) */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                      Porcentaje de Descuento
                    </label>
                    <div className="flex items-center justify-between bg-[#D7AF68]/5 border border-[#D7AF68]/20 rounded-xl p-1.5 focus-within:border-[#D7AF68] transition-all">
                      <button
                        type="button"
                        onClick={() => handleRuleChange(idx, 'discountPercent', Math.max(0, rule.discountPercent - 1))}
                        className="w-8 h-8 rounded-lg bg-[#D7AF68]/10 hover:bg-[#D7AF68]/30 text-[#D7AF68] flex items-center justify-center transition-all cursor-pointer border border-[#D7AF68]/20 active:scale-95"
                        title="Disminuir descuento"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="flex items-center space-x-0.5 font-mono font-bold text-base text-[#D7AF68]">
                        <span>{rule.discountPercent}</span>
                        <span className="text-xs">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRuleChange(idx, 'discountPercent', Math.min(100, rule.discountPercent + 1))}
                        className="w-8 h-8 rounded-lg bg-[#D7AF68]/10 hover:bg-[#D7AF68]/30 text-[#D7AF68] flex items-center justify-center transition-all cursor-pointer border border-[#D7AF68]/20 active:scale-95"
                        title="Aumentar descuento"
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

            {/* Information Callout */}
            <div className="bg-[#140e07] border border-[#D7AF68]/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-text-secondary font-light">
              <ShieldCheck className="text-[#D7AF68] shrink-0 mt-0.5" size={16} />
              <div>
                <strong className="text-white font-medium block mb-0.5">Control de Aplicación en Agenda y Cobro:</strong>
                El sistema detectará automáticamente la elegibilidad del cliente y mostrará una alerta clara. El barbero o administrador siempre podrá **Aceptar** o **Declinar** el descuento antes de finalizar la atención.
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs">
                {savedSuccess && (
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-medium animate-pulse">
                    <CheckCircle size={14} />
                    <span>Configuración de promociones guardada con éxito.</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 rounded-full bg-[#D7AF68] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all duration-300 flex items-center space-x-2 cursor-pointer shadow-lg shadow-[#D7AF68]/20 disabled:opacity-50"
              >
                {isSaving ? (
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

      {/* SUB-TAB 2: NUEVO PROGRAMA DE FIDELIZACIÓN (PESTAÑA VACÍA) */}
      {activeSubTab === 'nuevo_programa' && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#D7AF68]/10 border border-[#D7AF68]/20 flex items-center justify-center mx-auto text-[#D7AF68]">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl text-white font-bold tracking-wide">
              Nuevo Programa de Fidelización
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto font-light leading-relaxed">
              Espacio reservado para configurar un segundo programa de fidelización o recompensas personalizadas (Puntos, Servicios de Regalo o Membresías).
            </p>
          </div>
          <div className="pt-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-mono tracking-widest text-text-secondary">
              Pestaña Vacía / Próximamente
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

