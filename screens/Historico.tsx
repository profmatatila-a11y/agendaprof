import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Historico: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRegistrations();
    }, [selectedDate]);

    const fetchRegistrations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('registros_aula')
            .select('*, turmas!inner(name, subject)') // !inner garante que só traga registros de turmas que ainda existem
            .gte('data', `${selectedDate}T00:00:00`)
            .lte('data', `${selectedDate}T23:59:59`)
            .order('data', { ascending: false });

        if (error) {
            console.error('Erro ao buscar históricos:', error);
        } else {
            setRegistrations(data || []);
        }
        setLoading(false);
    };

    return (
        <div className="pb-32 bg-slate-50 min-h-screen">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 pt-8 pb-4 border-b border-slate-200/50">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico</h1>
                <p className="text-slate-500 text-sm mt-1">Consulte o que foi dado em aulas passadas.</p>

                <div className="mt-6">
                    <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-white h-14 shadow-sm px-4 gap-3">
                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                        <input
                            type="date"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-medium text-base outline-none"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="px-4 py-6 space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <span className="animate-spin material-symbols-outlined text-4xl">sync</span>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-slate-200">event_busy</span>
                        <p className="text-slate-400 font-medium">Nenhum registro encontrado para este dia.</p>
                    </div>
                ) : (
                    registrations.map((reg) => (
                        <div key={reg.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{reg.turmas?.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{reg.turmas?.subject}</p>
                                </div>
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {reg.horario}
                                </span>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">menu_book</span>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conteúdo</h4>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">{reg.conteudo}</p>
                                </div>

                                {reg.exercicios && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-slate-400 text-sm">edit_note</span>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atividades</h4>
                                        </div>
                                        <p className="text-slate-600 text-sm italic">"{reg.exercicios}"</p>
                                    </div>
                                )}

                                {reg.proximos_passos && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-primary text-sm">event_repeat</span>
                                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Próximos Passos</h4>
                                        </div>
                                        <p className="text-slate-700 text-sm font-medium">{reg.proximos_passos}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default Historico;
