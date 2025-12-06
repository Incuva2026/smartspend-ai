import { useState } from 'react';
import { Reminder, Theme } from '../types';
import { Plus, Check, Trash2, Clock, Calendar } from 'lucide-react';

interface RemindersScreenProps {
  onClose: () => void;
  theme: Theme;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({ onClose, theme }) => {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Pagar tarjeta de crédito', date: '2023-11-05', completed: false, priority: 'high' },
    { id: '2', title: 'Revisar suscripción Netflix', date: '2023-11-10', completed: true, priority: 'low' },
  ]);
  const [newReminderTitle, setNewReminderTitle] = useState('');

  const isSpace = theme === 'space';

  const addReminder = () => {
    if (!newReminderTitle.trim()) return;
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newReminderTitle,
      date: new Date().toISOString().split('T')[0],
      completed: false,
      priority: 'medium',
    };
    setReminders([...reminders, newReminder]);
    setNewReminderTitle('');
  };

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const CardClass = isSpace 
    ? 'bg-[#1e293b]/70 border-slate-700' 
    : 'bg-white border-slate-100';

  const TextMainClass = isSpace ? 'text-white' : 'text-slate-800';
  const TextSubClass = isSpace ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="flex justify-between items-center mb-8">
           <div>
            <h2 className={`text-3xl font-bold flex items-center gap-2 ${TextMainClass}`}>
                <Clock className={`w-8 h-8 ${isSpace ? 'text-purple-400' : 'text-indigo-500'}`} />
                Recordatorios
            </h2>
            <p className={`${TextSubClass} font-light`}>Gestiona tus pagos y alertas financieras</p>
           </div>
           <button onClick={onClose} className={`text-sm hover:underline ${isSpace ? 'text-cyan-400' : 'text-sky-600'}`}>
               Volver al Dashboard
           </button>
       </div>

       <div className={`rounded-2xl shadow-sm border p-6 mb-8 ${CardClass}`}>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                    placeholder="Agregar nuevo recordatorio..."
                    className={`flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
                        ${isSpace 
                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-purple-500' 
                            : 'border-slate-200 text-slate-900 placeholder-slate-300 focus:ring-sky-200'
                        }`}
                />
                <button 
                    onClick={addReminder}
                    className={`px-6 rounded-xl font-medium transition-colors text-white ${isSpace ? 'bg-purple-600 hover:bg-purple-700' : 'bg-sky-500 hover:bg-sky-600'}`}
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
       </div>

       <div className="space-y-3">
            {reminders.map((reminder) => (
                <div key={reminder.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all 
                    ${reminder.completed 
                        ? (isSpace ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50') 
                        : (isSpace ? 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50' : 'bg-white border-slate-200 hover:border-sky-200 shadow-sm')
                    }
                `}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => toggleComplete(reminder.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors 
                                ${reminder.completed 
                                    ? (isSpace ? 'bg-purple-500 border-purple-500 text-white' : 'bg-sky-500 border-sky-500 text-white')
                                    : (isSpace ? 'border-slate-600 hover:border-purple-400' : 'border-slate-300 hover:border-sky-400')
                                }`}
                        >
                            {reminder.completed && <Check className="w-3 h-3" />}
                        </button>
                        <div className={reminder.completed ? 'opacity-50 line-through' : ''}>
                            <p className={`font-medium ${TextMainClass}`}>{reminder.title}</p>
                            <p className={`text-xs flex items-center gap-1 mt-0.5 ${TextSubClass}`}>
                                <Calendar className="w-3 h-3" />
                                {reminder.date}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-2"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            
            {reminders.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <div className={`inline-block p-4 rounded-full mb-3 ${isSpace ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <Clock className={`w-8 h-8 ${isSpace ? 'text-slate-600' : 'text-slate-300'}`} />
                    </div>
                    <p>No tienes recordatorios pendientes.</p>
                </div>
            )}
       </div>
    </div>
  );
};