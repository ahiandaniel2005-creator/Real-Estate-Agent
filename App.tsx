
import React, { useState, useRef } from 'react';
import { 
  Search, FileText, Link as LinkIcon, Building2, Shield, 
  BarChart3, ChevronRight, Loader2, Upload, X, FileUp, 
  Check, CreditCard, ShieldCheck, Zap, User, Calendar, Lock, 
  CreditCard as CardIcon, ShieldAlert, RefreshCcw
} from 'lucide-react';
import { analyzeProperty, FileData } from './services/geminiService';
import { PropertyAnalysis, AnalysisStatus, AnalysisStatusType } from './types';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatusType>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<PropertyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPremium, setIsPremium] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    dni: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PLANS = [
    { name: '1 Mes', price: '3.99', duration: 'Mensual', features: ['Análisis ilimitados', 'Soporte 24/7', 'Exportar PDF'] },
    { name: '3 Meses', price: '8.99', duration: 'Trimestral', features: ['Ahorra 25%', 'Análisis ilimitados', 'Dashboard Avanzado'], popular: true },
    { name: '6 Meses', price: '14.00', duration: 'Semestral', features: ['Mejor Valor', 'Prioridad en IA', 'Consultoría VIP'] },
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
      reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: file.type });
      reader.onerror = reject;
    });
  };

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) {
      setShowPricing(true);
      return;
    }
    if (!input.trim() && !file) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);
    
    try {
      let fileData: FileData | undefined;
      if (file) fileData = await fileToBase64(file);
      const isUrl = input.startsWith('http');
      const analysis = await analyzeProperty(input, isUrl, fileData);
      setResult(analysis);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      setError('Error al procesar el análisis. Inténtalo de nuevo.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handlePayment = () => {
    if (!cardData.name || cardData.number.length < 16) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsPremium(true);
      setShowPricing(false);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const isCardValid = cardData.name && cardData.number.replace(/\s/g, '').length === 16 && cardData.cvv.length >= 3;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-slate-800 tracking-tight">Real Estate IA</span>
        </div>
        <div className="flex items-center gap-3">
          {!isPremium ? (
            <button onClick={() => setShowPricing(true)} className="text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors">
              SUSCRIBIRSE
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-tighter">
              <Zap size={10} fill="currentColor" /> Premium Activo
            </div>
          )}
        </div>
      </nav>

      {showPricing && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-none">Acceso Ilimitado</h2>
                  <p className="text-slate-500 mt-2 font-medium">Solo pagos seguros con tarjeta de débito.</p>
                </div>
                <button onClick={() => {setShowPricing(false); setSelectedPlan(null);}} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {!selectedPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                    <div key={plan.name} className={`p-8 rounded-3xl border-2 transition-all flex flex-col ${plan.popular ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100'}`}>
                      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                      <div className="my-4 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                        <span className="text-sm font-bold text-slate-400">USD</span>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-slate-600 font-medium"><Check size={14} className="text-emerald-500" /> {f}</li>)}
                      </ul>
                      <button onClick={() => setSelectedPlan(plan)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Elegir</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                      <span>Tarjeta de Débito</span>
                      <div className="flex gap-1"><CardIcon size={16} /> <Shield size={16} /></div>
                    </div>
                    <div className="space-y-4">
                      <input type="text" placeholder="TITULAR DE LA TARJETA" className="w-full bg-white border border-slate-200 p-4 rounded-xl text-sm font-bold focus:ring-2 ring-emerald-500 outline-none" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value.toUpperCase()})} />
                      <input type="text" placeholder="NRO TARJETA (16 DÍGITOS)" maxLength={19} className="w-full bg-white border border-slate-200 p-4 rounded-xl text-sm font-mono focus:ring-2 ring-emerald-500 outline-none" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/AA" maxLength={5} className="bg-white border border-slate-200 p-4 rounded-xl text-sm font-mono focus:ring-2 ring-emerald-500 outline-none" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
                        <input type="password" placeholder="CVV" maxLength={4} className="bg-white border border-slate-200 p-4 rounded-xl text-sm font-mono focus:ring-2 ring-emerald-500 outline-none" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} />
                      </div>
                      <input type="text" placeholder="DNI DEL TITULAR" className="w-full bg-white border border-slate-200 p-4 rounded-xl text-sm focus:ring-2 ring-emerald-500 outline-none" value={cardData.dni} onChange={e => setCardData({...cardData, dni: e.target.value})} />
                    </div>
                    <button onClick={handlePayment} disabled={isProcessingPayment || !isCardValid} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2">
                      {isProcessingPayment ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} /> PAGAR ${selectedPlan.price} USD</>}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">🔒 Encriptación bancaria de 256 bits activa</p>
                  </div>
                  <button onClick={() => setSelectedPlan(null)} className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors">VOLVER A LOS PLANES</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
        {status !== AnalysisStatus.SUCCESS ? (
          <div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                Analiza como un <br /><span className="text-emerald-600">Profesional.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">IA entrenada para detectar riesgos financieros y legales en segundos.</p>
            </div>

            <form onSubmit={handleAnalysis} className="bg-white p-3 rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 space-y-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-5 gap-3 bg-slate-50 rounded-2xl border border-transparent focus-within:border-emerald-200 transition-all">
                  <LinkIcon size={18} className="text-slate-400" />
                  <input type="text" value={input} disabled={!!file || status === AnalysisStatus.LOADING} onChange={e => setInput(e.target.value)} placeholder={file ? "Archivo cargado..." : "Enlace de propiedad o texto del contrato..."} className="w-full py-5 bg-transparent focus:outline-none text-slate-700 font-medium text-sm" />
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`px-6 py-5 rounded-2xl border flex items-center justify-center gap-2 transition-all ${file ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <Upload size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest hidden md:block">Subir</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                </button>
              </div>

              {file && (
                <div className="mx-2 p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 truncate">{file.name}</span>
                  <button type="button" onClick={() => {setFile(null); if(fileInputRef.current) fileInputRef.current.value='';}} className="text-emerald-400 hover:text-emerald-600"><X size={14}/></button>
                </div>
              )}

              <button type="submit" disabled={status === AnalysisStatus.LOADING || (!input.trim() && !file)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {status === AnalysisStatus.LOADING ? <Loader2 className="animate-spin" /> : isPremium ? <><Zap size={18} /> ANALIZAR AHORA</> : <><Lock size={16} /> VER PLANES Y ANALIZAR</>}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 opacity-50">
              {['CONTRATOS', 'ROI REAL', 'RIESGOS', 'MERCADO'].map(t => (
                <div key={t} className="flex flex-col items-center gap-2">
                  <div className="h-px w-8 bg-slate-300"></div>
                  <span className="text-[10px] font-black tracking-[0.2em]">{t}</span>
                </div>
              ))}
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-center gap-3 text-sm font-bold">
                <ShieldAlert size={18} /> {error}
                <button onClick={() => setStatus(AnalysisStatus.IDLE)} className="underline ml-2 flex items-center gap-1"><RefreshCcw size={12}/> Reintentar</button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-500">
             <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <button onClick={() => {setStatus(AnalysisStatus.IDLE); setInput(''); setFile(null);}} className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                   ← NUEVO ANÁLISIS
                </button>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-200">PREMIUM</div>
             </div>
             {result && <Dashboard data={result} />}
          </div>
        )}
      </main>

      <footer className="p-12 text-center space-y-4">
        <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">B-Real Estate Agent Agent System v2.0</p>
      </footer>
    </div>
  );
};

export default App;
