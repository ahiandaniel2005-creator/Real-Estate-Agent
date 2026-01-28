
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { PropertyAnalysis } from '../types';
import { AlertTriangle, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  data: PropertyAnalysis;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data || !data.financial_breakdown) {
    return <div className="p-8 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">Datos de análisis incompletos.</div>;
  }

  const financialData = [
    { name: 'Potencial Alquiler', value: data.financial_breakdown.rent_potential },
    { name: 'Impuestos', value: data.financial_breakdown.taxes },
    { name: 'Mantenimiento', value: data.financial_breakdown.maintenance },
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Precio Mercado</span>
          </div>
          <p className="text-2xl font-bold">${data.precio_estimado.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">ROI Anual</span>
          </div>
          <p className="text-2xl font-bold">{data.roi_anual}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Puntaje Riesgo</span>
          </div>
          <div className="flex items-end gap-2">
             <p className="text-2xl font-bold">{data.risk_score}/100</p>
             <span className={`text-xs font-semibold mb-1 ${data.risk_score > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                {data.risk_score > 60 ? 'Riesgo Alto' : 'Saludable'}
             </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Problemas</span>
          </div>
          <p className="text-2xl font-bold">{data.puntos_criticos.length} Detectados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Desglose Financiero (Est. Mensual)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Comparativa Riesgo vs ROI</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Análisis', roi: data.roi_anual, riesgo: data.risk_score / 10 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roi" fill="#10b981" name="ROI %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="riesgo" fill="#ef4444" name="Índice Riesgo" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" /> Hallazgos Críticos y Alertas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.puntos_criticos.map((point, idx) => (
            <div key={idx} className="flex gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm">
              <span className="font-bold flex-shrink-0">#{idx + 1}</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-lg font-semibold mb-2 opacity-80">Recomendación del Experto</h3>
        <p className="text-xl leading-relaxed">{data.recomendacion_final}</p>
        <div className="mt-6 flex items-center gap-4">
           <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold transition-all">
              Ver Reporte Completo
           </button>
           <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all border border-slate-700">
              Compartir Análisis
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
