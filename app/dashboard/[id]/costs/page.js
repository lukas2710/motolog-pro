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

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchCostsData();
  }, [motoId]);

  const handleAddCost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('logs').insert([
      {
        moto_id: motoId,
        user_id: user?.id || null,
        title: title,
        hours_at_done: moto?.hours || 0,
        cost: parseFloat(amount) || 0,
        notes: 'Dépense ajoutée depuis la page dédiée',
      },
    ]);

    if (!error) {
      setTitle('');
      setAmount('');
      setShowModal(false);
      await fetchCostsData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const totalCost = logs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-36">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">

        {/* Bouton Retour */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard/${motoId}`)}
            className="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            ← RETOUR MOTO
          </button>
        </div>

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

        {/* Historique des Dépenses */}
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

      {/* Bouton d'action flottant (+ Dépense) */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => setShowModal(true)}
          className="pointer-events-auto bg-gradient-to-r from-orange-600 to-orange-400 text-black font-black text-xl px-6 py-3 rounded-2xl shadow-xl shadow-orange-500/25 border border-orange-300/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>+</span>
          <span className="text-xs font-mono uppercase tracking-wider">Dépense</span>
        </button>
      </div>

      {/* Modal Ajout Dépense */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajouter une dépense</h3>
            <form onSubmit={handleAddCost} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Motif / Pièce</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Pneu arrière, Huile, Plaquettes..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-mono text-xs rounded-xl">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-orange-500 text-black font-mono text-xs font-bold rounded-xl">
                  {submitting ? '...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}