'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';

export default function CostsPage({ params }) {
  const { id: motoId } = use(params);
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: motoData } = await supabase
        .from('motos')
        .select('*')
        .eq('id', motoId)
        .single();

      if (!motoData) {
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
  }, [motoId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-sm font-bold text-zinc-400">Calcul du bilan financier...</p>
      </div>
    );
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const totalCost = logs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

  const costWeek = logs
    .filter((log) => new Date(log.performed_at) >= oneWeekAgo)
    .reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

  const costMonth = logs
    .filter((log) => new Date(log.performed_at) >= oneMonthAgo)
    .reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

  const costYear = logs
    .filter((log) => new Date(log.performed_at) >= oneYearAgo)
    .reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.push(`/dashboard/${motoId}`)}
          className="text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-2"
        >
          ← Retour au suivi de la moto
        </button>

        <div className="bg-[#121215] border border-zinc-800 p-6 rounded-2xl">
          <h1 className="text-2xl font-black text-white">Bilan Financier Entretien</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Machine : <span className="text-orange-500 font-bold">{moto.name}</span> ({moto.brand})
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-zinc-500 uppercase">7 Derniers jours</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{costWeek.toFixed(2)} €</p>
          </div>
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-zinc-500 uppercase">30 Derniers jours</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{costMonth.toFixed(2)} €</p>
          </div>
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-zinc-500 uppercase">12 Derniers mois</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{costYear.toFixed(2)} €</p>
          </div>
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Total Cumulé</p>
            <p className="text-2xl font-black text-orange-500 mt-1">{totalCost.toFixed(2)} €</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h2 className="text-lg font-black text-white">Détail des dépense enregistrées</h2>

          {logs.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-[#121215]/50">
              <p className="text-zinc-500 text-xs">Aucun entretien enregistré.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="bg-[#121215] border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-white">{log.title}</p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(log.performed_at).toLocaleDateString('fr-FR')} • {log.hours_at_done}h compteur
                    </p>
                  </div>
                  <span className="font-black text-emerald-400 text-base">
                    {log.cost ? `${Number(log.cost).toFixed(2)} €` : '0.00 €'}
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