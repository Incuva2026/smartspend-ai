import { useState, useEffect, useRef } from 'react';
import { User, MessageSquare, Lightbulb, BarChart2, X, Send } from 'lucide-react';
import { AssistantMode, ChatMessage, ReceiptItem, Theme } from '../types';
import { chatWithAssistant } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AssistantProps {
  receiptData: ReceiptItem[];
  onOpenReminders: () => void;
  theme: Theme;
}

export const Assistant: React.FC<AssistantProps> = ({ receiptData, onOpenReminders, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>(AssistantMode.MENU);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSpace = theme === 'space';

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, mode]);

  const handleOptionClick = (option: string) => {
    if (option === 'recordatorios') {
        onOpenReminders();
        setIsOpen(false);
    } else if (option === 'chat') {
        setMode(AssistantMode.CHAT);
        setMessages([{ role: 'model', text: isSpace ? '¡Saludos viajero! Estoy listo para navegar tus datos.' : '¡Hola! Aquí estoy para ayudarte a aclarar tus finanzas.' }]);
    } else if (option === 'dashboard_analysis') {
        setMode(AssistantMode.CHAT);
        const prompt = "Explícame mi dashboard actual y dame un resumen ejecutivo.";
        setMessages([
            { role: 'user', text: prompt }, 
            { role: 'model', text: 'Analizando tu dashboard...' }
        ]);
        sendMessageToAI(prompt, true);
    } else if (option === 'advice') {
        setMode(AssistantMode.CHAT);
        const prompt = "Quiero un dashboard que entienda mis hábitos. ¿Qué opinas de mis gastos recientes?";
        setMessages([
            { role: 'user', text: prompt }, 
            { role: 'model', text: 'Revisando tus hábitos...' }
        ]);
        sendMessageToAI(prompt, true);
    }
  };

  const sendMessageToAI = async (text: string, isAutoTrigger = false) => {
    setIsTyping(true);
    
    // Prepare history for API
    const history = messages
        .filter(m => !isAutoTrigger || m.role !== 'model' || m.text !== 'Analizando tu dashboard...')
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

    try {
        const response = await chatWithAssistant(text, receiptData, history);
        
        if (isAutoTrigger) {
             setMessages(prev => {
                const newArr = [...prev];
                newArr.pop(); 
                return [...newArr, { role: 'model', text: response }];
             });
        } else {
             setMessages(prev => [...prev, { role: 'model', text: response }]);
        }
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: 'Ups, tuve un problema conectando con mi cerebro digital.' }]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputValue }]);
    const textToSend = inputValue;
    setInputValue('');
    sendMessageToAI(textToSend);
  };

  const resetAssistant = () => {
      setIsOpen(false);
      setTimeout(() => {
          setMode(AssistantMode.MENU);
          setMessages([]);
      }, 300);
  };

  return (
    <>
      {/* Floating Action Button (The "Muñequito") */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
         
         {/* Interaction Modal */}
         {isOpen && (
             <div className={`mb-4 backdrop-blur-xl border shadow-2xl rounded-2xl w-80 sm:w-96 overflow-hidden flex flex-col transition-all animate-in slide-in-from-bottom-10 duration-300 origin-bottom-right
                ${isSpace ? 'bg-[#1e293b]/90 border-slate-700 shadow-cyan-900/20' : 'bg-white/95 border-sky-100'}`} style={{maxHeight: '600px'}}>
                {/* Header */}
                <div className={`p-4 text-white flex justify-between items-center ${isSpace ? 'bg-gradient-to-r from-indigo-900 to-slate-900' : 'bg-gradient-to-r from-sky-500 to-indigo-600'}`}>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1 rounded-full">
                            <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Asistente Virtual</span>
                    </div>
                    <button onClick={resetAssistant} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px] ${isSpace ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
                    
                    {mode === AssistantMode.MENU && (
                        <div className="grid grid-cols-1 gap-2">
                            <p className={`${isSpace ? 'text-slate-400' : 'text-slate-500'} mb-2 text-sm text-center`}>¿Cómo puedo aportarte claridad hoy?</p>
                            
                            <button 
                                onClick={() => handleOptionClick('chat')}
                                className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm group
                                    ${isSpace 
                                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-cyan-500' 
                                        : 'bg-white border-slate-200 hover:bg-sky-50 hover:border-sky-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${isSpace ? 'bg-slate-700 text-cyan-400' : 'bg-sky-50 text-sky-600'}`}>
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-medium ${isSpace ? 'text-slate-200' : 'text-slate-800'}`}>Escribir / Chat</span>
                                    <span className="text-xs text-slate-500">Conversa conmigo</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleOptionClick('recordatorios')}
                                className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm group
                                    ${isSpace 
                                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-purple-500' 
                                        : 'bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${isSpace ? 'bg-slate-700 text-purple-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-medium ${isSpace ? 'text-slate-200' : 'text-slate-800'}`}>Recordatorios</span>
                                    <span className="text-xs text-slate-500">Gestionar alertas</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleOptionClick('advice')}
                                className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm group
                                    ${isSpace 
                                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-pink-500' 
                                        : 'bg-white border-slate-200 hover:bg-violet-50 hover:border-violet-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${isSpace ? 'bg-slate-700 text-pink-400' : 'bg-violet-50 text-violet-600'}`}>
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-medium ${isSpace ? 'text-slate-200' : 'text-slate-800'}`}>Entender mis hábitos</span>
                                    <span className="text-xs text-slate-500">Análisis profundo</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleOptionClick('dashboard_analysis')}
                                className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm group
                                    ${isSpace 
                                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500' 
                                        : 'bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${isSpace ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-medium ${isSpace ? 'text-slate-200' : 'text-slate-800'}`}>Explicar dashboard</span>
                                    <span className="text-xs text-slate-500">Resumen claro</span>
                                </div>
                            </button>
                        </div>
                    )}

                    {mode === AssistantMode.CHAT && (
                        <div className="flex flex-col gap-3">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] p-3 rounded-2xl text-sm shadow-sm
                                        ${msg.role === 'user' 
                                            ? (isSpace ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-sky-500 text-white rounded-tr-none')
                                            : (isSpace 
                                                ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none prose prose-invert prose-sm' 
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none prose prose-sm')
                                        }
                                    `}>
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className={`border p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 ${isSpace ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area (Only for Chat) */}
                {mode === AssistantMode.CHAT && (
                    <div className={`p-3 border-t flex gap-2 ${isSpace ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <button onClick={() => setMode(AssistantMode.MENU)} className="text-slate-400 hover:text-slate-600 p-2">
                            <span className="text-xs font-bold">MENÚ</span>
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe algo..."
                            className={`flex-1 border-none rounded-lg px-3 text-sm focus:ring-2 outline-none 
                                ${isSpace 
                                    ? 'bg-slate-800 text-white focus:ring-purple-500 placeholder-slate-500' 
                                    : 'bg-slate-50 text-slate-900 focus:ring-sky-500 placeholder-slate-300'
                                }`}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white
                                ${isSpace ? 'bg-purple-600 hover:bg-purple-700' : 'bg-sky-500 hover:bg-sky-600'}
                            `}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}
             </div>
         )}

         {/* The Floating Icons */}
         <div className="flex gap-4 items-center">
            <button 
                onClick={onOpenReminders}
                className={`w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center border group
                    ${isSpace 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                title="Recordatorios"
            >
                <div className="relative">
                    <Lightbulb className={`w-6 h-6 ${isSpace ? 'text-purple-400 group-hover:text-purple-300' : 'text-indigo-400 group-hover:text-indigo-500'}`} />
                </div>
            </button>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center border-4
                    ${isOpen 
                        ? (isSpace ? 'bg-indigo-600 border-slate-800' : 'bg-sky-600 border-sky-100')
                        : (isSpace ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-slate-900' : 'bg-gradient-to-br from-sky-500 to-indigo-600 border-white')
                    }
                `}
            >
                 <User className="w-7 h-7 text-white" />
            </button>
         </div>
      </div>
    </>
  );
};