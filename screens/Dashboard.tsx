
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type ScheduleItem = Database['public']['Tables']['agenda']['Row'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('pt-BR', options).replace(/ de /gi, ' de ');
  // Capitalize first letter
  const finalDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const dayOfWeek = new Date().getDay();

      const { data, error } = await supabase
        .from('agenda')
        .select('*, turmas!inner(*)') // Usar !inner para filtrar apenas se a turma existir
        .eq('day_of_week', dayOfWeek)
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching schedule:', error);
      } else {
        setDailySchedule(data || []);
      }
      setLoading(false);
    };

    fetchSchedule();
  }, []);

  return (
    <div className="pb-24">
      <main className="max-w-md mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Olá, Átila!</h1>
            <p className="text-slate-500 text-base mt-1">{finalDate}</p>
          </div>
          <div className="size-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex-shrink-0">
            <img
              src="/avatar.jpg"
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Atila';
              }}
            />
          </div>
        </div>

        <section className="mt-6">
          {loading ? (
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
          ) : dailySchedule.length > 0 ? (
            <div className="relative overflow-hidden flex flex-col items-stretch justify-start rounded-2xl shadow-xl bg-primary text-white p-6">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">Próxima Aula</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">meeting_room</span>
                    <span className="text-xs font-medium">{dailySchedule[0].location || 'N/A'}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold leading-tight">{dailySchedule[0].title}</h3>

                <div className="mt-6 flex items-end justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 opacity-90">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <p className="text-sm font-medium">{dailySchedule[0].time}</p>
                    </div>
                    <p className="text-sm opacity-75">Período: {dailySchedule[0].period || 'Geral'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/registro/${dailySchedule[0].turma_id}?time=${encodeURIComponent(dailySchedule[0].time)}`)}
                    className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-white text-primary text-sm font-bold shadow-md active:scale-95 transition-transform"
                  >
                    Iniciar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              Sem aulas programadas para hoje.
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold tracking-tight">Agenda de Hoje</h3>
            <button className="text-primary text-sm font-semibold" onClick={() => navigate('/agenda')}>Ver Calendário</button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Carregando agenda...</div>
            ) : dailySchedule.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Nenhum compromisso para hoje.</div>
            ) : (
              dailySchedule.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.type === 'CLASS' && navigate(`/registro/${item.turma_id}?time=${encodeURIComponent(item.time)}`)}
                  className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer ${item.type === 'BREAK' ? 'bg-slate-50 border-dashed border-slate-200 opacity-80' : 'bg-white border-slate-100'}`}
                >
                  <div className={`flex flex-col items-center justify-center min-w-[60px] ${item.type !== 'BREAK' ? 'border-r border-slate-100 pr-4' : 'pr-4'}`}>
                    <span className="text-sm font-bold text-slate-900">{item.time}</span>
                    {item.period && <span className="text-[10px] text-slate-400 font-medium uppercase">{item.period}</span>}
                  </div>
                  <div className="flex flex-col flex-1">
                    <h4 className={`text-base font-bold ${item.type === 'BREAK' ? 'text-slate-500 font-medium' : 'text-slate-900'}`}>{item.title}</h4>
                    {item.location && <p className="text-xs text-slate-500">{item.location}</p>}
                  </div>
                  {item.type !== 'BREAK' && <span className="material-symbols-outlined text-slate-300">chevron_right</span>}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <button
        onClick={() => navigate('/nova-turma')}
        className="fixed bottom-24 right-6 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default Dashboard;
