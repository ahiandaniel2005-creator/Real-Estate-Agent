
import React, { useState, useRef } from 'react';
import { 
  Search, FileText, Link as LinkIcon, Building2, Shield, 
  BarChart3, ChevronRight, Loader2, Upload, X, FileUp, 
  Check, CreditCard, ShieldCheck, Zap, User, Calendar, Lock, 
  CreditCard as CardIcon, ShieldAlert
} from 'lucide-react';
import { analyzeProperty, FileData } from './services/geminiService';
import { PropertyAnalysis, AnalysisStatus, AnalysisStatusType } from './types';
import Dashboard from './components/Dashboard';

type PaymentStatus = 'none' | 'verified';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatusType>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<PropertyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de Pago y Suscripción
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('none');
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Formulario de tarjeta
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    dni: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PLANS = [
    { name: '1 Mes', price: '3.99', duration: 'Mensual', features: ['Análisis ilimitados', 'Soporte prioritario', 'Reportes descargables'] },
    { name: '3 Meses', price: '8.99', duration: 'Trimestral', features: ['Ahorra 25%', 'Análisis ilimitados', 'Consultoría IA básica'], popular: true },
    { name: '6 Meses', price: '14.00', duration: 'Semestral', features: ['Mejor Valor', 'Ahorra 40%', 'Consultoría IA VIP'] },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setInput('');
    }
  };

  const fileToBase64 = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ base64: base64String, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentStatus !== 'verified') {
      setShowPricing(true);
      return;
    }
    if (!input.trim() && !file) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);
    
    try {
      let fileData: FileData | undefined;
      if (file) {
        fileData = await fileToBase64(file);
      }

      const isUrl = input.startsWith('http');
      const analysis = await analyzeProperty(input, isUrl, fileData);
      setResult(analysis);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error("Error en el análisis:", err);
      setError('El análisis falló. Por favor verifica que el archivo sea un PDF o imagen válida.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCardPayment = () => {
    // Validación mínima antes de simular
    if (!cardData.name || cardData.number.length < 16 || !cardData.expiry || !cardData.cvv || !cardData.dni) {
      alert("Por favor, completa todos los campos de la tarjeta correctamente.");
      return;
    }

    setIsProcessingPayment(true);
    // Simulación de procesamiento bancario seguro
    setTimeout(() => {
      setPaymentStatus('verified');
      setShowPricing(false);
      setSelectedPlan(null);
      setIsProcessingPayment(false);
      alert("¡Suscripción activada! Ya puedes realizar análisis ilimitados.");
    }, 2000);
  };

  const isFormValid = cardData.name && cardData.number.length >= 16 && cardData.expiry.length >= 5 && cardData.cvv.length >= 3 && cardData.dni.length >= 7;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 flex flex-col">
      {/* Navegación */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">
              B
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Real Estate Agent</span>
          </div>
          <div className="flex items-center gap-4">
            {paymentStatus !== 'verified' ? (
              <button 
                onClick={() => setShowPricing(true)}
                className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2"
              >
                Suscribirse
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Zap size={12} fill="currentColor" /> PREMIUM
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de Precios / Suscripción (Solo Débito) */}
      {showPricing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Activar Acceso Premium</h2>
                  <p className="text-slate-500 mt-2">Acceso inmediato a análisis de ROI, riesgos y contratos inmobiliarios.</p>
                </div>
                <button onClick={() => {setShowPricing(false); setSelectedPlan(null);}} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {!selectedPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                    <div key={plan.name} className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col ${plan.popular ? 'border-emerald-500 shadow-xl shadow-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:border-slate-200'}`}>
                      {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">Recomendado</span>}
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                        <span className="text-sm text-slate-400">USD</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{plan.duration}</p>
                      <ul className="mt-6 space-y-3 flex-1">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                            <Check size={16} className="text-emerald-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={() => setSelectedPlan({name: plan.name, price: plan.price})}
                        className={`w-full mt-8 py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800">Pago con Tarjeta de Débito</h3>
                        <p className="text-xs text-slate-500">Plan: {selectedPlan.name} (${selectedPlan.price} USD)</p>
                      </div>
                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 grayscale" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 grayscale" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre Completo del Titular</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="TAL CUAL APARECE EN LA TARJETA"
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                            value={cardData.name}
                            onChange={e => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número de Tarjeta</label>
                        <div className="relative">
                          <CardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono"
                            value={cardData.number}
                            onChange={e => setCardData({...cardData, number: e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vencimiento</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              type="text" 
                              placeholder="MM/AA"
                              maxLength={5}
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono"
                              value={cardData.expiry}
                              onChange={e => setCardData({...cardData, expiry: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CVV</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              type="password" 
                              placeholder="***"
                              maxLength={4}
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono"
                              value={cardData.cvv}
                              onChange={e => setCardData({...cardData, cvv: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento (DNI/NIE)</label>
                        <input 
                          type="text" 
                          placeholder="Número de identidad"
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                          value={cardData.dni}
                          onChange={e => setCardData({...cardData, dni: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button 
                        onClick={handleCardPayment}
                        disabled={isProcessingPayment || !isFormValid}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
                      >
                        {isProcessingPayment ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> Pagar ${selectedPlan.price} USD</>}
                      </button>
                      <button 
                        onClick={() => setSelectedPlan(null)}
                        className="w-full text-slate-400 text-xs font-medium py-2 hover:text-slate-600"
                      >
                        Elegir otro plan
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2">
                       <Shield size={12} />
                       <span>Encriptación de 256 bits SSL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-20 px-4 flex-1">
        {status !== AnalysisStatus.SUCCESS ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6 pt-12 animate-in fade-in slide-in-from-top-4 duration-1000">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Análisis Inmobiliario <br />
                <span className="text-emerald-600">Profesional con IA.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Obtén ROI, riesgo y detección de cláusulas abusivas subiendo un PDF, foto o pegando un enlace.
              </p>
              {paymentStatus !== 'verified' && (
                <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold border border-slate-700 shadow-xl">
                  <ShieldAlert size={14} className="text-emerald-400" /> Requiere Suscripción Premium
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              <form onSubmit={handleAnalysis} className={`bg-white p-2 rounded-2xl shadow-2xl border transition-all ${paymentStatus === 'verified' ? 'border-emerald-200' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row flex-1 gap-2">
                  <div className="flex-1 flex items-center px-4 gap-3 border border-transparent focus-within:border-emerald-200 rounded-xl transition-all">
                    <LinkIcon size={20} className="text-slate-400" />
                    <input 
                      type="text" 
                      value={input}
                      disabled={!!file || status === AnalysisStatus.LOADING}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={file ? "Archivo seleccionado..." : "Pega URL de propiedad o texto del contrato..."}
                      className="w-full py-4 focus:outline-none text-slate-700 placeholder:text-slate-400 bg-transparent disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 px-2">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf,image/*"
                      disabled={status === AnalysisStatus.LOADING}
                    />
                    <button 
                      type="button"
                      disabled={status === AnalysisStatus.LOADING}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-4 rounded-xl border flex items-center gap-2 transition-all ${file ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Upload size={20} />
                      <span className="text-sm font-medium hidden sm:inline">Subir Archivo</span>
                    </button>
                  </div>
                </div>

                {file && (
                  <div className="px-4 py-2 flex items-center justify-between bg-slate-50 rounded-lg mx-2 mb-2 border border-slate-200 animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileUp size={16} />
                      <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <button type="button" onClick={removeFile} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={status === AnalysisStatus.LOADING || (!input.trim() && !file)}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mx-2 mb-2 ${paymentStatus === 'verified' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {status === AnalysisStatus.LOADING ? (
                    <Loader2 className="animate-spin" />
                  ) : paymentStatus === 'verified' ? (
                    <>Realizar Análisis Experto <ChevronRight size={18} /></>
                  ) : (
                    <>Ver Planes y Analizar <Lock size={16} className="ml-1 opacity-50" /></>
                  )}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><BarChart3 size={28} /></div>
                <h3 className="font-bold text-xl mb-3">Multimodal</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Analiza fotos, planos o contratos complejos con visión artificial avanzada.</p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6"><Shield size={28} /></div>
                <h3 className="font-bold text-xl mb-3">Riesgo IA</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Identifica cláusulas abusivas y trampas legales ocultas en segundos.</p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><FileText size={28} /></div>
                <h3 className="font-bold text-xl mb-3">Proyecciones</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Recibe desgloses de ROI y costos de mantenimiento basados en datos reales.</p>
              </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium animate-bounce">{error}</div>}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
             <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    setStatus(AnalysisStatus.IDLE);
                    setFile(null);
                    setInput('');
                  }} 
                  className="text-emerald-600 font-bold hover:underline flex items-center gap-2 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Iniciar Nuevo Análisis
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Análisis basado en: {file ? 'Documento Adjunto' : 'Fuente Externa'}</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-200 tracking-widest">PREMIUM</span>
                </div>
             </div>
            {result && <Dashboard data={result} />}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-12 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">B</div>
              <span className="font-black text-slate-800 tracking-tight">B-Real Estate Agent</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">Soluciones de análisis de riesgo inmobiliario impulsadas por IA. La seguridad de tu inversión es nuestra prioridad.</p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest justify-center">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">API</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
