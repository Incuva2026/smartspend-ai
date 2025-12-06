import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { ReceiptItem, Theme, ChartType } from '../types';
import { generateInsights } from '../services/geminiService';
import { Sparkles, TrendingUp, DollarSign, Calendar, Plus, X, Layout, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DashboardScreenProps {
  data: ReceiptItem[];
  theme: Theme;
}

// Palette for Light Theme
const COLORS_LIGHT = [
  '#0ea5e9', // sky-500
  '#6366f1', // indigo-500
  '#38bdf8', // sky-400
  '#818cf8', // indigo-400
  '#0284c7', // sky-600
  '#4f46e5'  // indigo-600
];

// Palette for Space Theme (Neons)
const COLORS_SPACE = [
  '#22d3ee', // cyan-400
  '#a78bfa', // violet-400
  '#34d399', // emerald-400
  '#f472b6', // pink-400
  '#fbbf24', // amber-400
  '#60a5fa'  // blue-400
];

interface ChartConfig {
  id: ChartType;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ data, theme }) => {
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [activeCharts, setActiveCharts] = useState<ChartType[]>(['category_pie', 'merchant_bar']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSpace = theme === 'space';
  const COLORS = isSpace ? COLORS_SPACE : COLORS_LIGHT;

  // --- DATA PROCESSING ---

  // 1. Total Spent
  const totalSpent = data.reduce((acc, item) => acc + item.total, 0);
  
  // 2. Spending by Category (Pie)
  const categoryData: { name: string, value: number }[] = (Object.values(data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { name: item.category, value: 0 };
    }
    acc[item.category].value += item.total;
    return acc;
  }, {} as Record<string, { name: string, value: number }>)) as { name: string, value: number }[]);

  // 3. Top Merchants (Bar)
  const merchantData: { name: string, amount: number }[] = (Object.values(data.reduce((acc, item) => {
     if (!acc[item.merchant]) {
        acc[item.merchant] = { name: item.merchant, amount: 0 };
     }
     acc[item.merchant].amount += item.total;
     return acc;
  }, {} as Record<string, { name: string, amount: number }>)) as { name: string, amount: number }[])
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5); 

  // 4. Daily Trend (Line) - NEW
  const dailyData: { date: string, amount: number }[] = (Object.values(data.reduce((acc, item) => {
    if (!acc[item.date]) {
        acc[item.date] = { date: item.date, amount: 0 };
    }
    acc[item.date].amount += item.total;
    return acc;
  }, {} as Record<string, { date: string, amount: number }>)) as { date: string, amount: number }[])
  .sort((a, b) => a.date.localeCompare(b.date));

  // 5. Category Count (Frequency Bar) - NEW
  const categoryCountData: { name: string, count: number }[] = (Object.values(data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { name: item.category, count: 0 };
    }
    acc[item.category].count += 1;
    return acc;
  }, {} as Record<string, { name: string, count: number }>)) as { name: string, count: number }[])
  .sort((a, b) => b.count - a.count);


  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const text = await generateInsights(data);
        setInsights(text);
      } catch (e) {
        setInsights("No se pudieron cargar los insights en este momento.");
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [data]);

  const toggleChart = (id: ChartType) => {
    if (activeCharts.includes(id)) {
        setActiveCharts(prev => prev.filter(c => c !== id));
    } else {
        setActiveCharts(prev => [...prev, id]);
    }
  };

  const availableCharts: ChartConfig[] = [
      { id: 'category_pie', title: 'Gastos por Categoría', icon: <PieChartIcon className="w-5 h-5"/>, description: 'Distribución porcentual de tu dinero.' },
      { id: 'merchant_bar', title: 'Top Comercios', icon: <BarChart3 className="w-5 h-5"/>, description: '¿Dónde estás gastando más?' },
      { id: 'daily_trend', title: 'Tendencia Diaria', icon: <Activity className="w-5 h-5"/>, description: 'Historial de gastos día a día.' },
      { id: 'category_count', title: 'Frecuencia de Compra', icon: <Layout className="w-5 h-5"/>, description: '¿Qué categorías compras más seguido?' },
  ];

  // Styles
  const CardClass = isSpace 
    ? 'bg-[#1e293b]/70 backdrop-blur-md border border-slate-700/50 shadow-[0_0_15px_rgba(0,0,0,0.3)]' 
    : 'bg-white border border-slate-100 shadow-sm hover:shadow-md';

  const TextMainClass = isSpace ? 'text-white' : 'text-slate-800';
  const TextSubClass = isSpace ? 'text-slate-400' : 'text-slate-500';
  const ModalBg = isSpace ? 'bg-[#0f172a]/95 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className="pb-24 max-w-6xl mx-auto relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight ${TextMainClass}`}>Resumen Financiero</h2>
            <p className={`${TextSubClass} font-light`}>
            {isSpace ? 'Navegando por tu universo financiero' : 'Una vista clara de tus finanzas'}
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg
                ${isSpace 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/20' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
          >
            <Plus className="w-4 h-4" />
            Personalizar Dashboard
          </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-2xl flex items-center gap-4 transition-all ${CardClass}`}>
          <div className={`p-3 rounded-full ${isSpace ? 'bg-cyan-900/50 text-cyan-400' : 'bg-sky-50 text-sky-600'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-sm font-medium ${TextSubClass}`}>Gasto Total</p>
            <h3 className={`text-2xl font-bold ${TextMainClass}`}>${totalSpent.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl flex items-center gap-4 transition-all ${CardClass}`}>
          <div className={`p-3 rounded-full ${isSpace ? 'bg-purple-900/50 text-purple-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-sm font-medium ${TextSubClass}`}>Mayor Categoría</p>
            <h3 className={`text-xl font-bold ${TextMainClass}`}>
              {[...categoryData].sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}
            </h3>
          </div>
        </div>

        <div className={`p-6 rounded-2xl flex items-center gap-4 transition-all ${CardClass}`}>
          <div className={`p-3 rounded-full ${isSpace ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-sm font-medium ${TextSubClass}`}>Boletas Procesadas</p>
            <h3 className={`text-2xl font-bold ${TextMainClass}`}>{data.length}</h3>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className={`p-6 rounded-2xl border mb-8 relative overflow-hidden transition-colors ${isSpace ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border-indigo-500/30' : 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-100'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className={`w-32 h-32 ${isSpace ? 'text-cyan-400' : 'text-indigo-600'}`} />
        </div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
            <Sparkles className={`w-5 h-5 ${isSpace ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <h3 className={`font-bold text-lg ${isSpace ? 'text-cyan-100' : 'text-indigo-900'}`}>Insights de Inteligencia Artificial</h3>
        </div>
        <div className={`prose max-w-none p-5 rounded-xl backdrop-blur-sm relative z-10 shadow-sm border ${isSpace ? 'bg-slate-900/50 text-slate-200 border-slate-700/50 prose-invert' : 'bg-white/60 text-slate-700 border-white/50 prose-indigo'}`}>
            {loadingInsights ? (
                <div className="animate-pulse space-y-2">
                    <div className={`h-4 rounded w-3/4 ${isSpace ? 'bg-slate-700' : 'bg-sky-100'}`}></div>
                    <div className={`h-4 rounded w-1/2 ${isSpace ? 'bg-slate-700' : 'bg-sky-100'}`}></div>
                    <div className={`h-4 rounded w-5/6 ${isSpace ? 'bg-slate-700' : 'bg-sky-100'}`}></div>
                </div>
            ) : (
                <ReactMarkdown>{insights}</ReactMarkdown>
            )}
        </div>
      </div>

      {/* Dynamic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Chart 1: Category Pie */}
        {activeCharts.includes('category_pie') && (
            <div className={`p-6 rounded-2xl ${CardClass}`}>
            <h3 className={`font-bold mb-6 flex items-center gap-2 ${TextMainClass}`}>
                <span className={`w-2 h-6 rounded-full ${isSpace ? 'bg-cyan-400' : 'bg-sky-500'}`}></span>
                Gastos por Categoría
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke={isSpace ? '#0f172a' : '#fff'}
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <RechartsTooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`} 
                        contentStyle={{ 
                            backgroundColor: isSpace ? '#1e293b' : '#fff', 
                            borderColor: isSpace ? '#334155' : '#e2e8f0',
                            color: isSpace ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.75rem'
                        }}
                        itemStyle={{ color: isSpace ? '#f8fafc' : '#0f172a' }}
                    />
                    <Legend iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Chart 2: Merchant Bar */}
        {activeCharts.includes('merchant_bar') && (
            <div className={`p-6 rounded-2xl ${CardClass}`}>
            <h3 className={`font-bold mb-6 flex items-center gap-2 ${TextMainClass}`}>
                <span className={`w-2 h-6 rounded-full ${isSpace ? 'bg-purple-400' : 'bg-indigo-500'}`}></span>
                Top Comercios ($)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={merchantData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isSpace ? "#334155" : "#f1f5f9"} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: isSpace ? '#94a3b8' : '#64748b'}} />
                    <RechartsTooltip 
                        cursor={{fill: isSpace ? 'rgba(255,255,255,0.05)' : '#f0f9ff'}}
                        formatter={(value: number) => `$${value.toLocaleString()}`} 
                        contentStyle={{ 
                            backgroundColor: isSpace ? '#1e293b' : '#fff', 
                            borderColor: isSpace ? '#334155' : '#e2e8f0',
                            color: isSpace ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.75rem'
                        }}
                        itemStyle={{ color: isSpace ? '#f8fafc' : '#0f172a' }}
                    />
                    <Bar dataKey="amount" fill={isSpace ? "#22d3ee" : "#0ea5e9"} radius={[0, 4, 4, 0]} barSize={20}>
                        {merchantData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % 2]} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Chart 3: Daily Trend Line */}
        {activeCharts.includes('daily_trend') && (
            <div className={`p-6 rounded-2xl ${CardClass}`}>
            <h3 className={`font-bold mb-6 flex items-center gap-2 ${TextMainClass}`}>
                <span className={`w-2 h-6 rounded-full ${isSpace ? 'bg-green-400' : 'bg-emerald-500'}`}></span>
                Tendencia Diaria
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isSpace ? "#334155" : "#f1f5f9"} />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: isSpace ? '#94a3b8' : '#64748b'}} />
                    <YAxis hide />
                    <RechartsTooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`} 
                        contentStyle={{ 
                            backgroundColor: isSpace ? '#1e293b' : '#fff', 
                            borderColor: isSpace ? '#334155' : '#e2e8f0',
                            color: isSpace ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.75rem'
                        }}
                        itemStyle={{ color: isSpace ? '#f8fafc' : '#0f172a' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke={isSpace ? '#34d399' : '#10b981'} 
                        strokeWidth={3}
                        dot={{ r: 4, fill: isSpace ? '#34d399' : '#10b981', strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {/* Chart 4: Category Frequency Bar */}
        {activeCharts.includes('category_count') && (
            <div className={`p-6 rounded-2xl ${CardClass}`}>
            <h3 className={`font-bold mb-6 flex items-center gap-2 ${TextMainClass}`}>
                <span className={`w-2 h-6 rounded-full ${isSpace ? 'bg-pink-400' : 'bg-rose-500'}`}></span>
                Frecuencia de Compra
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryCountData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isSpace ? "#334155" : "#f1f5f9"} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: isSpace ? '#94a3b8' : '#64748b'}} interval={0} />
                    <YAxis hide />
                    <RechartsTooltip 
                        cursor={{fill: isSpace ? 'rgba(255,255,255,0.05)' : '#f0f9ff'}}
                        formatter={(value: number) => `${value} compras`} 
                        contentStyle={{ 
                            backgroundColor: isSpace ? '#1e293b' : '#fff', 
                            borderColor: isSpace ? '#334155' : '#e2e8f0',
                            color: isSpace ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.75rem'
                        }}
                        itemStyle={{ color: isSpace ? '#f8fafc' : '#0f172a' }}
                    />
                    <Bar dataKey="count" fill={isSpace ? "#f472b6" : "#fb7185"} radius={[4, 4, 0, 0]}>
                         {categoryCountData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

      </div>

      {/* Recent Transactions List */}
      <div className={`rounded-2xl overflow-hidden ${CardClass}`}>
        <div className={`p-6 border-b ${isSpace ? 'border-slate-700' : 'border-slate-50'}`}>
            <h3 className={`font-bold ${TextMainClass}`}>Detalle de Boletas</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className={`${isSpace ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'} font-medium`}>
                    <tr>
                        <th className="px-6 py-3 font-medium">Fecha</th>
                        <th className="px-6 py-3 font-medium">Comercio</th>
                        <th className="px-6 py-3 font-medium">Categoría</th>
                        <th className="px-6 py-3 text-right font-medium">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx} className={`border-b transition-colors ${isSpace ? 'border-slate-700 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                            <td className={`px-6 py-4 ${TextSubClass}`}>{item.date}</td>
                            <td className={`px-6 py-4 font-medium ${TextMainClass}`}>{item.merchant}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${isSpace ? 'bg-cyan-900/30 text-cyan-300 border-cyan-800' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                                    {item.category}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-medium ${TextMainClass}`}>
                                ${item.total.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Customization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border ${ModalBg}`}>
                <div className={`p-5 flex justify-between items-center border-b ${isSpace ? 'border-slate-700' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-lg ${TextMainClass}`}>Personalizar Dashboard</h3>
                    <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full hover:bg-black/10 transition-colors ${TextSubClass}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className={`mb-4 text-sm ${TextSubClass}`}>Selecciona los gráficos que deseas visualizar:</p>
                    <div className="space-y-3">
                        {availableCharts.map((chart) => {
                            const isActive = activeCharts.includes(chart.id);
                            return (
                                <div 
                                    key={chart.id}
                                    onClick={() => toggleChart(chart.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all
                                        ${isActive 
                                            ? (isSpace ? 'bg-indigo-900/40 border-indigo-500' : 'bg-sky-50 border-sky-300') 
                                            : (isSpace ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50')
                                        }
                                    `}
                                >
                                    <div className={`p-3 rounded-lg ${isActive ? (isSpace ? 'bg-indigo-500 text-white' : 'bg-sky-500 text-white') : (isSpace ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
                                        {chart.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${isActive ? (isSpace ? 'text-white' : 'text-sky-900') : TextMainClass}`}>{chart.title}</h4>
                                        <p className="text-xs opacity-70 mt-1 text-slate-500">{chart.description}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${isActive 
                                            ? (isSpace ? 'bg-indigo-500 border-indigo-500' : 'bg-sky-500 border-sky-500') 
                                            : (isSpace ? 'border-slate-600' : 'border-slate-300')
                                        }
                                    `}>
                                        {isActive && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={`p-4 border-t flex justify-end ${isSpace ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className={`px-6 py-2 rounded-lg font-medium text-white shadow-lg transition-transform active:scale-95
                            ${isSpace ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-sky-600 hover:bg-sky-500'}
                        `}
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};