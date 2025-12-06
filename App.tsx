import * as React from 'react';
import { useState, useEffect } from 'react';
import { ViewState, ReceiptItem, Theme } from './types';
import { UploadScreen } from './components/UploadScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { RemindersScreen } from './components/RemindersScreen';
import { Assistant } from './components/Assistant';
import { Upload, Trash2, Moon, Sun, Rocket, Download } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.UPLOAD);
  const [receiptData, setReceiptData] = useState<ReceiptItem[]>([]);
  const [theme, setTheme] = useState<Theme>('light');

  // Generate stars for space theme
  const [stars, setStars] = useState<{top: string, left: string, duration: string, size: string, opacity: number}[]>([]);
  const [shootingStars, setShootingStars] = useState<{top: string, left: string, delay: string}[]>([]);

  useEffect(() => {
    // Generate static floating stars
    const newStars = Array.from({ length: 70 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 10 + 10}s`, // Slow drift between 10-20s
      size: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.7 + 0.3
    }));
    setStars(newStars);

    // Generate a few shooting stars
    const newShooters = Array.from({ length: 3 }).map(() => ({
        top: `${Math.random() * 40}%`, // Top half only
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`
    }));
    setShootingStars(newShooters);
  }, []);

  const handleDataLoaded = (data: ReceiptItem[]) => {
    // Acumular la nueva data con la existente
    setReceiptData(prev => [...prev, ...data]);
    setView(ViewState.DASHBOARD);
  };

  const handleOpenReminders = () => {
    setView(ViewState.REMINDERS);
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro que deseas borrar todo el historial de boletas?')) {
      setReceiptData([]);
      setView(ViewState.UPLOAD);
    }
  };

  const handleDownloadCSV = () => {
    if (receiptData.length === 0) return;

    // Headers
    const headers = ['Fecha', 'Comercio', 'Categoría', 'Total', 'Descripción'];
    
    // Rows
    const rows = receiptData.map(item => [
      `"${item.date}"`,
      `"${item.merchant.replace(/"/g, '""')}"`, // Escape quotes
      `"${item.category}"`,
      item.total,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create Blob with BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smartspend_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'space' : 'light');
  };

  const isSpace = theme === 'space';
  
  // Theme-based classes
  // IMPORTANT: For space theme, we make the main bg transparent so the fixed background is visible
  const mainBgClass = isSpace ? 'text-white bg-transparent' : 'bg-slate-50 text-slate-900';
  const navBgClass = isSpace ? 'bg-[#0B0C15]/60 border-slate-700/50 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md';
  const navTextClass = isSpace ? 'text-white' : 'text-slate-800';
  const buttonHoverClass = isSpace ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 relative ${mainBgClass}`}>
      
      {/* Space Background Layers (Fixed Position) */}
      {isSpace && (
        <div className="space-wrapper">
           {/* Deep dark background gradient is handled by CSS .space-wrapper */}
           
           {/* Moving Nebula Clouds */}
           <div className="nebula"></div>
           
           {/* Floating Stars */}
           <div className="stars-container">
             {stars.map((s, i) => (
               <div 
                 key={i} 
                 className="star" 
                 style={{
                   top: s.top, 
                   left: s.left, 
                   width: s.size, 
                   height: s.size,
                   '--duration': s.duration,
                   '--opacity': s.opacity 
                 } as React.CSSProperties}
               ></div>
             ))}
           </div>

           {/* Shooting Stars */}
           {shootingStars.map((s, i) => (
               <div 
                key={`shoot-${i}`}
                className="shooting-star"
                style={{
                    top: s.top,
                    left: s.left,
                    animationDelay: s.delay
                }}
               />
           ))}
        </div>
      )}

      {/* Header / Navbar */}
      <nav className={`border-b sticky top-0 z-40 transition-colors duration-500 ${navBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.UPLOAD)}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-sm ${isSpace ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-gradient-to-br from-sky-400 to-indigo-500 text-white'}`}>
                {isSpace ? <Rocket className="w-4 h-4" /> : 'S'}
              </div>
              <span className={`font-bold text-xl tracking-tight ${navTextClass}`}>SmartSpend AI</span>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all duration-300 ${isSpace ? 'bg-white/10 text-yellow-300 hover:bg-white/20 hover:scale-110' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  title={isSpace ? "Cambiar a modo Claro" : "Cambiar a modo Espacial"}
                >
                  {isSpace ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Botón para subir más siempre visible si no estamos en upload */}
                {view !== ViewState.UPLOAD && (
                    <button 
                        onClick={() => setView(ViewState.UPLOAD)}
                        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${isSpace ? 'text-sky-300 hover:bg-white/10' : 'text-sky-600 hover:bg-sky-50'}`}
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Subir más</span>
                    </button>
                )}

                {view !== ViewState.UPLOAD && (
                  <>
                    <button 
                        onClick={() => setView(ViewState.DASHBOARD)}
                        className={`text-sm font-medium transition-colors ${view === ViewState.DASHBOARD ? (isSpace ? 'text-white font-bold' : 'text-sky-600 font-bold') : buttonHoverClass}`}
                    >
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setView(ViewState.REMINDERS)}
                        className={`text-sm font-medium transition-colors ${view === ViewState.REMINDERS ? (isSpace ? 'text-purple-300 font-bold' : 'text-indigo-500 font-bold') : buttonHoverClass}`}
                    >
                        Recordatorios
                    </button>
                    
                    {receiptData.length > 0 && (
                      <div className="flex items-center border-l pl-4 ml-2 gap-2 border-slate-300/30">
                        <button 
                            onClick={handleDownloadCSV}
                            className={`p-2 rounded-full transition-all ${isSpace ? 'text-emerald-400 hover:bg-white/10 hover:text-emerald-300' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title="Descargar CSV"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={handleClearData}
                            className={`p-2 rounded-full transition-all ${isSpace ? 'text-slate-400 hover:text-red-400 hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            title="Borrar historial"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {view === ViewState.UPLOAD && (
          <UploadScreen onDataLoaded={handleDataLoaded} theme={theme} />
        )}
        
        {view === ViewState.DASHBOARD && (
          <DashboardScreen data={receiptData} theme={theme} />
        )}

        {view === ViewState.REMINDERS && (
          <RemindersScreen onClose={() => setView(ViewState.DASHBOARD)} theme={theme} />
        )}
      </main>

      {/* Floating Assistant (Always visible if data exists) */}
      {receiptData.length > 0 && (
        <Assistant 
            receiptData={receiptData} 
            onOpenReminders={handleOpenReminders}
            theme={theme}
        />
      )}

    </div>
  );
};

export default App;