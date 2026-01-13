import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type ClassItem = Database['public']['Tables']['turmas']['Row'];

const Turmas: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [allSchedules, setAllSchedules] = useState<Record<string, any[]>>({});
  const [todayTurmaIds, setTodayTurmaIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const navigate = useNavigate();

  const diasSemanaRel = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: classData, error: classError } = await supabase
      .from('turmas')
      .select('*')
      .order('name', { ascending: true });

    if (classError) {
      console.error('Error fetching classes:', classError);
    } else {
      setClasses(classData || []);
    }

    const { data: agendaData } = await supabase
      .from('agenda')
      .select('*')
      .eq('type', 'CLASS')
      .order('day_of_week', { ascending: true })
      .order('time', { ascending: true });

    if (agendaData) {
      const grouped: Record<string, any[]> = {};
      const todayIds: string[] = [];
      const today = new Date().getDay();

      agendaData.forEach(item => {
        if (item.turma_id) {
          if (!grouped[item.turma_id]) grouped[item.turma_id] = [];
          grouped[item.turma_id].push(item);

          if (item.day_of_week === today) {
            todayIds.push(item.turma_id);
          }
        }
      });

      setAllSchedules(grouped);
      setTodayTurmaIds([...new Set(todayIds)]);
    }

    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    const id = showDeleteModal;

    setLoading(true);
    try {
      // Deletar registros de aula (histórico)
      await supabase.from('registros_aula').delete().eq('turma_id', id);
      // Deletar agenda
      await supabase.from('agenda').delete().eq('turma_id', id);
      // Deletar a turma
      const { error } = await supabase.from('turmas').delete().eq('id', id);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== id));
      setShowDeleteModal(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir turma e seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'Hoje') {
      return matchesSearch && todayTurmaIds.includes(cls.id);
    }

    return matchesSearch;
  });

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl px-4 pt-8 pb-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Minhas Turmas</h1>
          <div className="flex gap-1">
            <button className="size-10 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-xl">tune</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 h-14 shadow-sm px-4 gap-3 focus-within:bg-white focus-within:border-primary/50 transition-all">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-base outline-none"
              placeholder="Buscar turmas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {['Todas', 'Hoje'].map((label) => (
              <button
                key={label}
                onClick={() => setActiveFilter(label)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeFilter === label
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white text-slate-500 border border-slate-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {loading && classes.length === 0 ? (
          <div className="p-12 text-center">
            <span className="animate-spin material-symbols-outlined text-primary text-4xl">sync</span>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30 grayscale">
            <span className="material-symbols-outlined text-7xl">school</span>
            <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Nenhuma turma encontrada</p>
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] ${cls.status === 'ATIVA' ? 'bg-green-50 text-green-600' :
                    cls.status === 'AVALIAÇÃO PENDENTE' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                    {cls.status}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">{cls.name}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{cls.subject}</p>
                </div>
                <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 shrink-0">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-sm font-variation-fill">schedule</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horários na Semana</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSchedules[cls.id]?.map((sched, sIdx) => (
                    <span key={sIdx} className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-primary uppercase shadow-sm">
                      {diasSemanaRel[sched.day_of_week]} • {sched.time}
                    </span>
                  )) || <p className="text-[10px] font-bold text-slate-300 italic">Sem horários</p>}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/editar-turma/${cls.id}`)}
                  className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-slate-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  EDITAR
                </button>
                <button
                  onClick={() => setShowDeleteModal(cls.id)}
                  className="flex-1 h-14 rounded-2xl bg-red-50 text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  EXCLUIR
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      <button
        onClick={() => navigate('/nova-turma')}
        className="fixed bottom-24 right-6 flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl font-variation-fill">add</span>
      </button>

      {/* Modal de Exclusão Customizado */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2 uppercase">Excluir Turma?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              Atenção, Átila! Ao confirmar, **todos os dados** desta turma (horários, registros e histórico) serão apagados permanentemente.
            </p>
            <div className="space-y-3">
              <button
                onClick={confirmDelete}
                className="w-full h-16 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all text-[12px] uppercase tracking-widest"
              >
                Confirmar Exclusão
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="w-full h-16 bg-white text-slate-400 font-black rounded-2xl active:bg-slate-50 transition-all text-[12px] uppercase tracking-widest border border-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Turmas;
