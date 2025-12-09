import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
// import { analyzeReceipts } from '../services/geminiService';
import { ReceiptItem, Theme } from '../types';

interface UploadScreenProps {
  onDataLoaded: (data: ReceiptItem[]) => void;
  theme: Theme;
}

export const UploadScreen = ({ onDataLoaded, theme }: UploadScreenProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSpace = theme === 'space';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // const handleAnalyze = async () => {
  //   if (files.length === 0) {
  //     setError("Por favor sube al menos una imagen.");
  //     return;
  //   }

  //   setIsAnalyzing(true);
  //   setError(null);

  //   try {
  //     const data = await analyzeReceipts(files);
  //     onDataLoaded(data);
  //     setFiles([]); // Limpiar archivos tras éxito para permitir subir más
  //   } catch (err) {
  //     console.error(err);
  //     setError("Hubo un error analizando las boletas. Intenta nuevamente.");
  //   } finally {
  //     setIsAnalyzing(false);
  //   }
  // };

  const handleAnalyze = async () => {
  if (files.length === 0) {
    setError("Por favor sube al menos una imagen.");
    return;
  }

  setIsAnalyzing(true);
  setError(null);

  try {
    // Convertir archivos a base64
    const base64Files = await Promise.all(
      files.map(file => new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
          data: (reader.result as string).split(',')[1], // solo base64
          mimeType: file.type
        });
        reader.onerror = reject;
      }))
    );

    // Llamar al endpoint serverless
    const response = await fetch('/api/analyzeReceipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: base64Files }),
    });

    if (!response.ok) throw new Error("Error al comunicarse con el servidor.");

    const data: ReceiptItem[] = await response.json();
    onDataLoaded(data);
    setFiles([]); // limpiar archivos tras éxito
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Hubo un error analizando las boletas.");
  } finally {
    setIsAnalyzing(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isSpace ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'text-slate-800'}`}>
          Claridad en tus Gastos
        </h1>
        <p className={`text-lg font-light ${isSpace ? 'text-slate-300' : 'text-slate-500'}`}>
          Sube tus boletas y deja que la IA organice tu información financiera {isSpace ? 'a la velocidad de la luz' : 'para tu tranquilidad mental'}.
        </p>
      </div>

      <div 
        className={`w-full border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group shadow-sm
          ${isSpace 
            ? 'border-indigo-500/50 bg-[#1e293b]/50 hover:bg-[#1e293b]/80 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
            : 'border-sky-200 bg-white hover:bg-sky-50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
          accept="image/*"
        />
        <div className={`p-4 rounded-full transition-colors ${isSpace ? 'bg-indigo-900/50 group-hover:bg-indigo-800' : 'bg-sky-100 group-hover:bg-sky-200'}`}>
          <Upload className={`w-10 h-10 ${isSpace ? 'text-cyan-400' : 'text-sky-600'}`} />
        </div>
        <div className="text-center">
          <span className={`font-semibold ${isSpace ? 'text-cyan-400' : 'text-sky-600'}`}>Haz clic para subir</span> o arrastra tus imágenes aquí
        </div>
        <p className={`text-sm ${isSpace ? 'text-slate-400' : 'text-slate-400'}`}>Soporta JPG, PNG</p>
      </div>

      {files.length > 0 && (
        <div className="w-full mt-8">
          <h3 className={`font-semibold mb-3 ${isSpace ? 'text-slate-200' : 'text-slate-700'}`}>Archivos seleccionados ({files.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, idx) => (
              <div key={idx} className={`relative group p-2 rounded-lg shadow-sm border transition-colors ${isSpace ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`h-24 w-full rounded-md flex items-center justify-center overflow-hidden mb-2 ${isSpace ? 'bg-slate-700' : 'bg-slate-100'}`}>
                   <ImageIcon className={isSpace ? 'text-slate-500' : 'text-slate-300'} />
                </div>
                <p className={`text-xs truncate ${isSpace ? 'text-slate-300' : 'text-slate-600'}`}>{file.name}</p>
                <button 
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm w-full text-center border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || files.length === 0}
        className={`mt-8 w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2
          ${isAnalyzing || files.length === 0 
            ? 'bg-slate-300 cursor-not-allowed' 
            : isSpace 
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 hover:scale-105 shadow-sky-100'
          }
        `}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isSpace ? 'Procesando en órbita...' : 'Procesando con calma...'}
          </>
        ) : (
          "Analizar y Ver Dashboard"
        )}
      </button>
    </div>
  );
};