import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const NovaTurma: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        students_count: 0,
        status: 'ATIVA',
    });

    const [schedules, setSchedules] = useState([{ day_of_week: 1, startTime: '', endTime: '' }]);

    const diasSemana = [
        { val: 0, label: 'Domingo' },
        { val: 1, label: 'Segunda-feira' },
        { val: 2, label: 'Terça-feira' },
        { val: 3, label: 'Quarta-feira' },
        { val: 4, label: 'Quinta-feira' },
        { val: 5, label: 'Sexta-feira' },
        { val: 6, label: 'Sábado' },
    ];

    useEffect(() => {
        if (isEditing) {
            fetchTurma();
        }
    }, [id]);

    const fetchTurma = async () => {
        const { data, error } = await supabase
            .from('turmas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erro ao buscar turma:', error);
            alert('Turma não encontrada.');
            navigate('/turmas');
        } else if (data) {
            const { data: agendaData } = await supabase
                .from('agenda')
                .select('*')
                .eq('turma_id', id);

            setFormData({
                name: data.name,
                subject: data.subject,
                students_count: data.students_count || 0,
                status: data.status || 'ATIVA',
            });

            if (agendaData && agendaData.length > 0) {
                setSchedules(agendaData.map(a => {
                    const times = a.time.split(' - ');
                    return {
                        day_of_week: a.day_of_week ?? 1,
                        startTime: times[0] || '',
                        endTime: times[1] || ''
                    };
                }));
            }
        }
    };

    const addSchedule = () => {
        setSchedules([...schedules, { day_of_week: 1, startTime: '', endTime: '' }]);
    };

    const removeSchedule = (index: number) => {
        if (schedules.length > 1) {
            setSchedules(schedules.filter((_, i) => i !== index));
        }
    };

    const updateSchedule = (index: number, field: string, value: any) => {
        const newSchedules = [...schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setSchedules(newSchedules);
    };

    const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
        // Remove tudo que não for número
        const digits = value.replace(/\D/g, '');

        // Limita a 4 dígitos
        const limited = digits.substring(0, 4);

        // Aplica a máscara HH:MM
        let masked = limited;
        if (limited.length > 2) {
            masked = `${limited.substring(0, 2)}:${limited.substring(2)}`;
        }

        updateSchedule(index, field, masked);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let turmaId = id;

        const firstSched = schedules[0];
        const dayLabel = diasSemana.find(d => d.val === firstSched.day_of_week)?.label.substring(0, 3);
        const timeRange = firstSched.startTime + (firstSched.endTime ? ` - ${firstSched.endTime}` : '');
        const next_class_desc = `${dayLabel} ${timeRange}`;

        const finalTurmaData = { ...formData, next_class: next_class_desc };

        if (isEditing) {
            const { error } = await supabase
                .from('turmas')
                .update(finalTurmaData)
                .eq('id', id);

            if (error) {
                alert('Erro ao atualizar turma.');
                setLoading(false);
                return;
            }
        } else {
            const { data, error } = await supabase
                .from('turmas')
                .insert([finalTurmaData])
                .select()
                .single();

            if (error) {
                alert('Erro ao criar turma.');
                setLoading(false);
                return;
            }
            turmaId = data.id;
        }

        if (turmaId) {
            await supabase.from('agenda').delete().eq('turma_id', turmaId);

            const agendaInserts = schedules
                .filter(s => s.startTime.trim() !== '')
                .map(s => ({
                    turma_id: turmaId,
                    title: `${formData.name} - ${formData.subject}`,
                    time: s.startTime + (s.endTime ? ` - ${s.endTime}` : ''),
                    day_of_week: s.day_of_week,
                    type: 'CLASS' as any
                }));

            if (agendaInserts.length > 0) {
                await supabase.from('agenda').insert(agendaInserts);
            }
        }

        navigate('/turmas');
        setLoading(false);
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-primary size-10 flex items-center justify-center rounded-2xl bg-slate-50 active:scale-90 transition-transform">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-slate-900 text-base font-black uppercase tracking-tight">{isEditing ? 'Editar Turma' : 'Cadastrar Turma'}</h2>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="space-y-1.5 text-center mb-4">
                            <div className="size-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="material-symbols-outlined text-3xl font-variation-fill">school</span>
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Informações Básicas</h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Turma</label>
                            <input
                                required
                                className="w-full rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 text-base font-bold placeholder:font-normal focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white outline-none transition-all"
                                placeholder="Ex: 9º Ano A"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina</label>
                            <input
                                required
                                className="w-full rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 text-base font-bold placeholder:font-normal focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white outline-none transition-all"
                                placeholder="Ex: Matemática"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd. Alunos</label>
                                <input
                                    type="number"
                                    className="w-full rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 text-base font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white outline-none transition-all"
                                    value={formData.students_count}
                                    onChange={(e) => setFormData({ ...formData, students_count: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    className="w-full rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 text-base font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white outline-none transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="ATIVA">Ativa</option>
                                    <option value="AVALIAÇÃO PENDENTE">Pendente</option>
                                    <option value="CONCLUÍDA">Concluída</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl font-variation-fill">schedule</span>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horários</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addSchedule}
                                className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Adicionar
                            </button>
                        </div>

                        <div className="space-y-3">
                            {schedules.map((sched, index) => (
                                <div key={index} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 relative pt-10">
                                    <div className="absolute top-3 left-4">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Horário #{index + 1}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSchedule(index)}
                                        className="absolute top-2 right-2 size-8 flex items-center justify-center text-red-300 active:text-red-500"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>

                                    <div className="space-y-3">
                                        <div className="relative">
                                            <select
                                                className="w-full bg-white border border-slate-100 rounded-2xl h-12 px-4 text-xs font-bold uppercase outline-none"
                                                value={sched.day_of_week}
                                                onChange={(e) => updateSchedule(index, 'day_of_week', parseInt(e.target.value))}
                                            >
                                                {diasSemana.map(d => (
                                                    <option key={d.val} value={d.val}>{d.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">Início</span>
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full bg-white border border-slate-100 rounded-2xl h-12 px-4 text-sm font-bold outline-none"
                                                    placeholder="00:00"
                                                    value={sched.startTime}
                                                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-widest">Término</span>
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full bg-white border border-slate-100 rounded-2xl h-12 px-4 text-sm font-bold outline-none"
                                                    placeholder="00:00"
                                                    value={sched.endTime}
                                                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-black h-18 py-6 rounded-[28px] shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8 text-sm uppercase tracking-[0.2em]"
                    >
                        {loading ? <span className="animate-spin material-symbols-outlined">sync</span> : (
                            <>
                                <span className="material-symbols-outlined font-variation-fill">save</span>
                                <span>{isEditing ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default NovaTurma;
