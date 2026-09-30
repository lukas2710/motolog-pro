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

  // Filtres année / mois
  const [selectedYear, setSelectedYear] = useState('TOUT');
  const [selectedMonth, setSelectedMonth] = useState('TOUT');

  // Modal pour voir le groupe (ex: toutes les vidanges)
  const [selectedGroup, setSelectedGroup] = useState(null);

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

  // Extraire les années disponibles pour le filtre
  const years = Array.from(new Set(logs.map(log => new Date(log.performed_at).getFullYear()))).sort((a, b) => b - a);

  // Filtrage par année et mois
  const filteredLogs = logs.filter(log => {
    const date = new Date(log.performed_at);
    const yearMatches = selectedYear === 'TOUT' || date.getFullYear().toString() === selectedYear;
    const monthMatches = selectedMonth === 'TOUT' || date.getMonth().toString() === selectedMonth;
    return yearMatches && monthMatches;
  });

  const totalCost = filteredLogs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0);

  // Regroupement intelligent par titre normalisé (ex: "Vidange", "Pneu arrière", etc.)
  const groupedMap = {};
  filteredLogs.forEach(log => {
    const key = log.title.trim().toLowerCase();
    if (!groupedMap[key]) {
      groupedMap[key] = {
        title: log.title,
        totalCost: 0,
        count: 0,
        items: []
      };
    }
    groupedMap[key].totalCost += parseFloat(log.cost) || 0;
    groupedMap[key].count += 1;
    groupedMap[key].items.push(log);
  });

  const groupedLogs = Object.values(groupedMap).sort((a, b) => b.totalCost - a.totalCost);

  const monthsList = [
    { id: '0', name: 'Janvier' },
    { id: '1', name: 'Février' },
    { id: '2', name: 'Mars' },
    { id: '3', name: 'Avril' },
    { id: '4', name: 'Mai' },
    { id: '5', name: 'Juin' },
    { id: '6', name: 'Juillet' },
    { id: '7', name: 'Août' },
    { id: '8', name: 'Septembre' },
    { id: '9', name: 'Octobre' },
    { id: '10', name: 'Novembre' },
    { id: '11', name: 'Décembre' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-36">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">

        {/* Bouton Retour & Titre */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard/${motoId}`)}
            className="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-colors group bg-[#151210] border border-orange-950/40 px-3.5 py-2 rounded-xl"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> RETOUR MOTO
          </button>
          <span className="text-[10px] font-mono tracking-widest text-orange-500/80 uppercase bg-orange-950/30 border border-orange-900/30 px-3 py-1 rounded-full">
            {moto?.name}
          </span>
        </div>

        {/* Header Financier */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161311] via-[#110f0e] to-[#0a0a0c] border border-orange-900/40 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-[11px] font-mono font-bold tracking-widest text-orange-500/80 mb-2">
              BUDGET FILTRÉ
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {totalCost.toFixed(2).replace('.', ',')} <span className="text-orange-500 text-3xl">€</span>
            </div>
          </div>
        </div>

        {/* Filtres Année & Mois */}
        <div className="space-y-3 bg-[#121215] border border-zinc-800/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Filtrer par période</span>
            {(selectedYear !== 'TOUT' || selectedMonth !== 'TOUT') && (
              <button 
                onClick={() => { setSelectedYear('TOUT'); setSelectedMonth('TOUT'); }}
                className="text-[10px] font-mono text-orange-400 hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Années */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-black/70 border border-zinc-800 focus:border-orange-500 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none"
            >
              <option value="TOUT">Toutes les années</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Mois */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-black/70 border border-zinc-800 focus:border-orange-500 p-2.5 rounded-xl text-xs text-white font-mono focus:outline-none"
            >
              <option value="TOUT">Tous les mois</option>
              {monthsList.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste Regroupée par Type (ex: Vidange groupée) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-mono font-bold tracking-widest text-orange-500 uppercase">
              POSTES DE DÉPENSES REGROUPÉS ({groupedLogs.length})
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">Clique pour voir le détail</span>
          </div>

          {groupedLogs.length === 0 ? (
            <div className="bg-[#121215] border border-zinc-800/60 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-950/30 border border-orange-900/30 flex items-center justify-center text-orange-400 text-lg mx-auto">
                📊
              </div>
              <p className="text-xs font-mono text-zinc-400">Aucune donnée pour cette période.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupedLogs.map((group, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedGroup(group)}
                  className="group bg-[#121215] border border-zinc-800/60 hover:border-orange-500/50 p-4 rounded-2xl flex items-center justify-between transition-all shadow-lg cursor-pointer hover:bg-[#16161a]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-orange-950/30 border border-orange-900/30 flex items-center justify-center text-orange-400 text-sm group-hover:scale-105 transition-transform">
                      🔧
                    </div>
                    <div>
                      <h3 className="font-bold text-xs md:text-sm text-zinc-200 group-hover:text-white transition-colors uppercase">{group.title}</h3>
                      <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        {group.count} intervention{group.count > 1 ? 's' : ''} enregistrée{group.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs md:text-sm font-mono font-black text-orange-400 bg-orange-950/20 px-3 py-1.5 rounded-xl border border-orange-900/30 inline-block">
                      {group.totalCost.toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
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
          className="pointer-events-auto bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-black font-black text-xl px-7 py-3.5 rounded-2xl shadow-2xl shadow-orange-500/30 border border-orange-300/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2.5"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-xs font-mono uppercase tracking-widest font-extrabold">Ajouter une dépense</span>
        </button>
      </div>

      {/* Modal Détail du Groupe (quand on clique sur une catégorie regroupée) */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest">Détail regroupé</span>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mt-0.5">{selectedGroup.title}</h3>
              </div>
              <button onClick={() => setSelectedGroup(null)} className="text-zinc-400 hover:text-white text-lg font-bold px-2">✕</button>
            </div>

            <div className="space-y-2 pt-2">
              {selectedGroup.items.map((item) => (
                <div key={item.id} className="bg-black/50 border border-zinc-800/80 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {new Date(item.performed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} • <span className="text-orange-400">{item.hours_at_done}h</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{item.notes || 'Aucune note'}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    {item.cost ? `${Number(item.cost).toFixed(2).replace('.', ',')} €` : '0,00 €'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex justify-between items-center">
              <span className="text-xs font-mono text-zinc-400 uppercase">Total cumulé :</span>
              <span className="text-sm font-mono font-bold text-white">{selectedGroup.totalCost.toFixed(2).replace('.', ',')} €</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedGroup(null)}
              className="w-full py-2.5 bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs rounded-xl mt-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Ajout Dépense */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121215] border border-zinc-800 p-6 sm:p-7 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-xs font-mono font-bold text-orange-500 uppercase tracking-wider">Nouvelle dépense</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white text-xs font-mono">✕</button>
            </div>

            <form onSubmit={handleAddCost} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">Motif ou Pièce (ex: Vidange)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Vidange, Pneu arrière..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-800 focus:border-orange-500 p-3.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-800 focus:border-orange-500 p-3.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs rounded-xl">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20">
                  {submitting ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}