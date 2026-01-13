import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type ScheduleItem = Database['public']['Tables']['agenda']['Row'];

const Agenda: React.FC = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [plannedAulas, setPlannedAulas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const dayOfWeek = selectedDate.getDay();

      const { data, error } = await supabase
        .from('agenda')
        .select('*, turmas!inner(*)') // !inner garante que só traga itens com turma existente
        .eq('day_of_week', dayOfWeek)
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching agenda:', error);
      } else {
        setSchedule(data || []);
      }

      // Buscar registros (planejados ou realizados) para esta data
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data: regData } = await supabase
        .from('registros_aula')
        .select('*')
        .gte('data', `${dateStr}T00:00:00`)
        .lte('data', `${dateStr}T23:59:59`);

      if (regData) {
        const mapped: Record<string, any> = {};
        regData.forEach(r => {
          mapped[`${r.turma_id}-${r.horario}`] = r;
        });
        setPlannedAulas(mapped);
      }

      setLoading(false);
    };

    fetchSchedule();
  }, [selectedDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      setSelectedDate(newDate);
    }
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary font-variation-fill">event</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Minha Agenda</h1>
          </div>

          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider active:scale-95 transition-all"
          >
            Hoje
          </button>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
            Selecionar Data
          </p>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 transition-all focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5">
            <span className="material-symbols-outlined text-primary text-xl mr-3">calendar_month</span>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDatePickerChange}
              className="flex-1 bg-transparent border-none text-base font-bold text-slate-900 focus:ring-0 p-0 uppercase"
            />
            <span className="material-symbols-outlined text-slate-400">expand_more</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-8">
        <div className="mb-8 flex items-end justify-between border-l-4 border-primary pl-4">
          <div>
            <h3 className="text-slate-900 text-2xl font-black tracking-tight leading-none">
              {isToday(selectedDate) ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-2">
              {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ de /gi, ' de ')}
            </p>
          </div>
          {schedule.length > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total</span>
              <span className="text-lg font-black text-primary">{schedule.length} {schedule.length === 1 ? 'AULA' : 'AULAS'}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <span className="animate-spin material-symbols-outlined text-3xl">sync</span>
            </div>
          ) : schedule.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
              <div className="size-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-slate-200 text-4xl font-variation-light">event_busy</span>
              </div>
              <p className="text-base font-bold text-slate-400">Nenhuma aula agendada<br /><span className="text-xs font-normal">para este dia da semana.</span></p>
            </div>
          ) : (
            schedule.map((item) => {
              const planned = plannedAulas[`${item.turma_id}-${item.time}`];
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/registro/${item.turma_id}?time=${encodeURIComponent(item.time)}&date=${selectedDate.toISOString().split('T')[0]}`)}
                  className={`bg-white rounded-[28px] p-6 border shadow-sm transition-all hover:shadow-md hover:border-primary/10 active:scale-[0.98] cursor-pointer ${planned ? 'border-primary/10 bg-primary/5 shadow-primary/5' : 'border-slate-100'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${planned ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                      {item.time}
                    </span>
                    <div className="flex gap-2">
                      {planned && <span className="material-symbols-outlined text-primary size-6 flex items-center justify-center bg-white rounded-full text-sm">event_available</span>}
                      <span className="material-symbols-outlined text-slate-200">chevron_right</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h4>

                  {planned ? (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Conteúdo Planejado:</p>
                      <p className="text-sm text-slate-600 font-medium line-clamp-2 italic">"{planned.conteudo}"</p>
                    </div>
                  ) : item.location && (
                    <div className="flex items-center gap-2 mt-3 text-slate-400">
                      <span className="material-symbols-outlined text-sm font-variation-fill">location_on</span>
                      <span className="text-[11px] font-bold uppercase tracking-wide">{item.location}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Agenda;
