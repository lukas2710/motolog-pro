'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';
export default function MotoCostsPage({ params }) {
  const { id: motoId } = use(params);
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCostsData = async () => {
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

    fetchCostsData();
  }, [motoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const totalCost = logs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">

        {/* Total Header */}
        <div className="bg-[#151210] border border-orange-950/60 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-orange-500/80 mb-1">
            <span>TOTAL DES DÉPENSES</span>
            <span className="text-zinc-400">{moto?.name}</span>
          </div>

          <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight my-2">
            {totalCost.toFixed(2).replace('.', ',')} €
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800/60">
            <button className="bg-[#1c1a19] border border-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-semibold hover:border-zinc-700 transition-all">
              📊 Statistiques
            </button>
            <button className="bg-[#1c1a19] border border-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-semibold hover:border-zinc-700 transition-all">
              📥 Factures
            </button>
          </div>
        </div>

        {/* Historique des Dépenses (2 colonnes sur écran PC) */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-mono font-bold tracking-widest text-orange-500 uppercase px-1">
            HISTORIQUE
          </h2>

          {logs.length === 0 ? (
            <div className="bg-[#121215] border border-zinc-800/60 rounded-xl p-8 text-center">
              <p className="text-xs font-mono text-zinc-500">Aucune dépense enregistrée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#121215] border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-400 text-xs">
                      ⚙️
                    </div>
                    <div>
                      <h3 className="font-bold text-xs md:text-sm text-zinc-200">{log.title}</h3>
                      <p className="text-[10px] md:text-xs font-mono text-zinc-500">
                        {new Date(log.performed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs md:text-sm font-mono font-bold text-orange-400">
                    {log.cost ? `${Number(log.cost).toFixed(2).replace('.', ',')} €` : '0,00 €'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}