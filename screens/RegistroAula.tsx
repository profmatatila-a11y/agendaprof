import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RegistroAula: React.FC = () => {
  const navigate = useNavigate();
  const { turmaId } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const selectedTime = params.get('time');
  const selectedDate = params.get('date'); // Pegar data da URL

  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [success, setSuccess] = useState(false);

  const [classInfo, setClassInfo] = useState({ name: '', subject: '' });
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);
  const [lastRecord, setLastRecord] = useState<any>(null);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);

  const [horario, setHorario] = useState(selectedTime || '');
  const [conteudo, setConteudo] = useState('');
  const [exercicios, setExercicios] = useState('');
  const [proximosPassos, setProximosPassos] = useState('');

  const displayDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();
  const isFuture = displayDate > new Date() && displayDate.toDateString() !== new Date().toDateString();

  useEffect(() => {
    if (turmaId) {
      fetchClassAndSchedules();
    }
  }, [turmaId, selectedDate, horario]);

  const fetchClassAndSchedules = async () => {
    setLoadingInitial(true);

    // Buscar info da turma
    const { data: turmaData } = await supabase
      .from('turmas')
      .select('name, subject')
      .eq('id', turmaId)
      .single();

    if (turmaData) {
      setClassInfo(turmaData);
    }

    // Buscar horários da turma na agenda
    const { data: agendaData } = await supabase
      .from('agenda')
      .select('id, time, day_of_week')
      .eq('turma_id', turmaId)
      .eq('type', 'CLASS')
      .order('day_of_week', { ascending: true })
      .order('time', { ascending: true });

    if (agendaData) {
      setAvailableSchedules(agendaData);
      if (agendaData.length > 0 && !horario) {
        setHorario(agendaData[0].time);
      }
    }

    // Verificar se já existe um registro para ESTA data e horário específico
    if (selectedDate && horario) {
      const { data: existing } = await supabase
        .from('registros_aula')
        .select('*')
        .eq('turma_id', turmaId)
        .eq('horario', horario)
        .gte('data', `${selectedDate}T00:00:00`)
        .lte('data', `${selectedDate}T23:59:59`)
        .maybeSingle();

      if (existing) {
        setExistingRecordId(existing.id);
        setConteudo(existing.conteudo || '');
        setExercicios(existing.exercicios || '');
        setProximosPassos(existing.proximos_passos || '');
      } else {
        // Se não existir, limpar campos (caso tenha mudado de horário no dropdown)
        setExistingRecordId(null);
        setConteudo('');
        setExercicios('');
        setProximosPassos('');
      }
    }

    // Buscar ÚLTIMO registro desta turma para referência (apenas se não estivermos editando um registro existente)
    if (!existingRecordId) {
      const { data: historyData } = await supabase
        .from('registros_aula')
        .select('*')
        .eq('turma_id', turmaId)
        .order('data', { ascending: false })
        .limit(1);

      if (historyData && historyData.length > 0) {
        setLastRecord(historyData[0]);
      }
    }

    setLoadingInitial(false);
  };

  const handleSave = async () => {
    setLoading(true);

    const recordData = {
      turma_id: turmaId,
      horario,
      conteudo,
      exercicios,
      proximos_passos: proximosPassos,
      data: selectedDate ? `${selectedDate}T12:00:00Z` : new Date().toISOString()
    };

    let result;
    if (existingRecordId) {
      result = await supabase
        .from('registros_aula')
        .update(recordData)
        .eq('id', existingRecordId);
    } else {
      result = await supabase
        .from('registros_aula')
        .insert(recordData);
    }

    setLoading(false);
    if (result.error) {
      console.error('Error saving record:', result.error);
      alert('Erro ao salvar registro.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate(-1); // Voltar para onde estava
      }, 2000);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="animate-spin material-symbols-outlined text-primary text-4xl">sync</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{isFuture ? 'Planejamento Salvo!' : 'Registro Salvo!'}</h2>
        <p className="text-slate-500 mt-2">As informações foram sincronizadas com sucesso.</p>
        <p className="text-xs text-slate-400 mt-8 animate-pulse">Retornando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-primary flex size-10 items-center justify-center rounded-full active:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div className="flex-1 px-2 text-center">
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">{classInfo.name} - {classInfo.subject}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isFuture ? 'text-primary' : 'text-slate-500'}`}>
              {isFuture ? '📝 Planejamento' : '✅ Registro'} • {displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}
            </p>
          </div>
          <div className="w-10 flex justify-end">
            <span className={`material-symbols-outlined ${isFuture ? 'text-primary' : 'text-amber-500'}`}>
              {isFuture ? 'assignment' : 'history_edu'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-8">
        {/* Card do Último Registro (Referência) - Apenas se não estiver editando e for passado */}
        {!existingRecordId && lastRecord && (
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-lg">history</span>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última Aula Realizada</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Conteúdo:</p>
                <p className="text-sm text-slate-600 line-clamp-2">{lastRecord.conteudo}</p>
              </div>
              {lastRecord.proximos_passos && (
                <div className="pt-2 border-t border-slate-200/50">
                  <p className="text-[10px] text-amber-500 font-bold uppercase">Planejado para hoje:</p>
                  <p className="text-sm text-slate-600 italic font-medium">"{lastRecord.proximos_passos}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        <FormSection icon="calendar_today" title="Horário">
          <div className="relative">
            <select
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="flex w-full appearance-none bg-none rounded-2xl text-slate-900 border-slate-200 bg-slate-50 h-14 pl-5 pr-12 text-base font-medium transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white outline-none"
            >
              {availableSchedules.length > 0 ? (
                availableSchedules.map((s, idx) => (
                  <option key={s.id} value={s.time}>
                    {idx + 1}º Horário ({s.time})
                  </option>
                ))
              ) : (
                <option value="">Nenhum horário definido</option>
              )}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
          </div>
        </FormSection>

        <FormSection icon="menu_book" title={isFuture ? "O que planeja ensinar?" : "Conteúdo da Aula"}>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="flex w-full resize-none rounded-2xl text-slate-900 border-slate-200 bg-slate-50 min-h-[160px] placeholder:text-slate-400 p-5 text-base font-normal leading-relaxed transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white outline-none"
            placeholder={isFuture ? "Escreva os tópicos que pretende abordar nesta data..." : "Descreva o que foi ensinado hoje..."}
          />
        </FormSection>

        <FormSection icon="edit_note" title={isFuture ? "Tarefas para levar" : "Exercícios Passados"}>
          <textarea
            value={exercicios}
            onChange={(e) => setExercicios(e.target.value)}
            className="flex w-full resize-none rounded-2xl text-slate-900 border-slate-200 bg-slate-50 min-h-[120px] placeholder:text-slate-400 p-5 text-base font-normal leading-relaxed transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white outline-none"
            placeholder="Alguma atividade ou material específico para este dia?"
          />
        </FormSection>

        <FormSection icon="event_repeat" title="Observações Extras">
          <textarea
            value={proximosPassos}
            onChange={(e) => setProximosPassos(e.target.value)}
            className="flex w-full resize-none rounded-2xl text-slate-900 border-slate-200 bg-slate-50 min-h-[120px] placeholder:text-slate-400 p-5 text-base font-normal leading-relaxed transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white outline-none"
            placeholder="Observações importantes para este planejamento..."
          />
        </FormSection>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto">
          <button
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-primary text-white font-bold h-16 rounded-2xl shadow-lg shadow-primary/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <span className="animate-spin material-symbols-outlined">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined">{existingRecordId ? 'sync' : 'save'}</span>
                <span>{existingRecordId ? 'Atualizar Planejamento' : (isFuture ? 'Salvar Planejamento' : 'Salvar Registro')}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

const FormSection: React.FC<{ icon: string, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <section>
    <div className="flex items-center px-1 py-2 gap-2 mb-1">
      <span className="material-symbols-outlined text-primary text-xl font-variation-fill">{icon}</span>
      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
    </div>
    {children}
  </section>
);

export default RegistroAula;
