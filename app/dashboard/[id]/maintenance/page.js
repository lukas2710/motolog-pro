'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';
export default function MaintenancePage({ params }) {
  const { id: motoId } = use(params);
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: motoData, error } = await supabase
        .from('motos')
        .select('*')
        .eq('id', motoId)
        .single();

      if (error || !motoData) {
        router.push('/dashboard');
        return;
      }
      setMoto(motoData);

      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('moto_id', motoId)
        .order('performed_at', { ascending: false });

      if (logsData) setLogs(logsData);
      setLoading(false);
    };

    fetchData();
  }, [motoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-32">
      {/* Container centré pour PC/Mobile */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white uppercase">{moto?.name || 'Moto'}</h1>
            <p className="text-xs font-mono text-zinc-500">HISTORIQUE DES ENTRETIENS</p>
          </div>
          <span className="text-3xl">🛠️</span>
        </div>

        {/* Liste des Entretiens (1 colonne mobile, 2 colonnes PC) */}
        {logs.length === 0 ? (
          <div className="bg-[#121215] border border-zinc-800/60 rounded-xl p-8 text-center">
            <p className="text-xs font-mono text-zinc-500">Aucun entretien enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#121215] border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-400">
                    🔧
                  </div>
                  <div>
                    <h3 className="font-bold text-xs md:text-sm text-zinc-200">{log.title}</h3>
                    <p className="text-[10px] md:text-xs font-mono text-zinc-500">
                      {new Date(log.performed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {log.hours && (
                  <span className="text-xs font-mono bg-zinc-800/60 px-2.5 py-1 rounded-md text-zinc-400">
                    {log.hours} h
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}