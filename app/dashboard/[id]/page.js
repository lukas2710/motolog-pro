'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase';

const CATEGORIES = [
  { id: 'moteur', name: 'Moteur', icon: '🔧' },
  { id: 'echappement', name: 'Échappement', icon: '💨' },
  { id: 'carburation', name: 'Carburation', icon: '⛽' },
  { id: 'freinage', name: 'Freinage', icon: '🛑' },
  { id: 'roues', name: 'Roues', icon: '🛞' },
  { id: 'refroidissement', name: 'Refroidissement', icon: '🌡️' },
  { id: 'guidon', name: 'Guidon & commandes', icon: '🎛️' },
  { id: 'amortisseur', name: 'Amortisseur & fourche', icon: '🦾' },
  { id: 'electricite', name: 'Électricité', icon: '⚡' },
  { id: 'cadre', name: 'Cadre & châssis', icon: '🏍️' },
  { id: 'transmission', name: 'Transmission', icon: '⚙️' },
];

export default function MotoDetailPage({ params }) {
  const resolvedParams = use(params);
  const motoId = resolvedParams.id;
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('TOUS');

  const [showLogModal, setShowLogModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPartForHistory, setSelectedPartForHistory] = useState(null);

  const [logTitle, setLogTitle] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logCost, setLogCost] = useState('0');
  const [logPartId, setLogPartId] = useState('');

  const [partName, setPartName] = useState('');
  const [partCategory, setPartCategory] = useState(CATEGORIES[0].name);
  const [intervalHours, setIntervalHours] = useState('40');
  const [lastServiceHours, setLastServiceHours] = useState('0');

  const [submitting, setSubmitting] = useState(false);

  const fetchMotoData = async () => {
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
    setLogHours(motoData.hours.toString());

    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .eq('moto_id', motoId)
      .order('performed_at', { ascending: false });
    if (logsData) setLogs(logsData);

    const { data: partsData } = await supabase
      .from('parts')
      .select('*')
      .eq('moto_id', motoId)
      .order('created_at', { ascending: true });
    if (partsData) setParts(partsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchMotoData();
  }, [motoId]);

  const handleDeletePart = async (partId, e) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer ce contrôle ?")) return;

    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', partId);

    if (!error) {
      if (selectedPartForHistory?.id === partId) {
        setSelectedPartForHistory(null);
      }
      await fetchMotoData();
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('logs').insert([
      {
        moto_id: motoId,
        user_id: user.id,
        title: logTitle,
        hours_at_done: parseFloat(logHours),
        notes: logNotes,
        cost: parseFloat(logCost) || 0,
        part_id: logPartId ? logPartId : null,
      },
    ]);

    if (!error) {
      if (parseFloat(logHours) > moto.hours) {
        await supabase
          .from('motos')
          .update({ hours: parseFloat(logHours) })
          .eq('id', motoId);
      }
      setLogTitle('');
      setLogNotes('');
      setLogCost('0');
      setLogPartId('');
      setShowLogModal(false);
      await fetchMotoData();
    }
    setSubmitting(false);
  };

  const handleAddPart = async (e) => {
    e.preventDefault();

    const isPremium = localStorage.getItem("is_premium") === "true";
    const MAX_FREE_PARTS = 5;

    if (!isPremium && parts.length >= MAX_FREE_PARTS) {
      setShowPartModal(false);
      setShowUpgradeModal(true);
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('parts').insert([
      {
        moto_id: motoId,
        user_id: user.id,
        name: partName,
        category: partCategory,
        interval_hours: parseFloat(intervalHours),
        last_service_hours: parseFloat(lastServiceHours),
      },
    ]);

    if (!error) {
      setPartName('');
      setPartCategory(CATEGORIES[0].name);
      setIntervalHours('40');
      setLastServiceHours('0');
      setShowPartModal(false);
      await fetchMotoData();
    }
    setSubmitting(false);
  };

  if (loading || !moto) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Chargement...</p>
        </div>
      </div>
    );
  }

  const filteredParts = parts.filter(p => {
    if (activeFilter === 'TOUS') return true;
    return p.category === activeFilter;
  });

  const overdueParts = filteredParts.filter(p => (moto.hours - p.last_service_hours) >= p.interval_hours);
  const upcomingParts = filteredParts.filter(p => (moto.hours - p.last_service_hours) < p.interval_hours);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-6 pb-36 font-sans selection:bg-orange-500 selection:text-black">
      <div className="max-w-md md:max-w-xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            ← GARAGE
          </button>
          
          <Link className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-xl transition-all" href={`/dashboard/${motoId}/costs`}>
            📊 Dépenses
          </Link>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1815] via-[#12100e] to-[#0d0d0f] border border-orange-500/20 p-6 rounded-3xl shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full uppercase">
                {moto.brand || 'MOTO'}
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-2">{moto.name}</h1>
            </div>

            <button
              onClick={() => setShowLogModal(true)}
              className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-3 py-1.5 rounded-xl text-xs font-mono transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
            >
              + HEURES
            </button>
          </div>

          <div className="mt-6 flex items-baseline justify-between border-t border-zinc-800/80 pt-4">
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">COMPTEUR MOTEUR</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-4xl font-black text-white font-mono tracking-tight">{Math.floor(moto.hours)}</span>
                <span className="text-xl font-bold text-orange-400 font-mono">.{Math.round((moto.hours % 1) * 10)}h</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">ALERTES</p>
              <p className={`text-sm font-mono font-bold mt-1 ${overdueParts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {overdueParts.length > 0 ? `${overdueParts.length} URGENCE(S)` : 'TOUT EST OK'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveFilter('TOUS')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'TOUS'
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                : 'bg-[#111114] border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            🔥 TOUS ({parts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = parts.filter(p => p.category === cat.name).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.name)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                  activeFilter === cat.name
                    ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/20'
                    : 'bg-[#111114] border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              A FAIRE EN PRIORITÉ ({overdueParts.length})
            </h2>
          </div>

          {overdueParts.length === 0 ? (
            <div className="bg-[#111114] border border-zinc-800/50 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 font-mono">Aucun entretien en retard pour ce filtre.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueParts.map((part) => {
                const hoursUsed = moto.hours - part.last_service_hours;
                const overdueHours = (hoursUsed - part.interval_hours).toFixed(1);

                return (
                  <div
                    key={part.id}
                    onClick={() => setSelectedPartForHistory(part)}
                    className="bg-gradient-to-r from-[#241012] to-[#140b0c] border border-red-500/30 p-4 rounded-2xl space-y-3 shadow-md cursor-pointer hover:border-red-500/60 transition-all relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {part.category && (
                            <span className="text-xs">
                              {CATEGORIES.find(c => c.name === part.category)?.icon || '🔧'}
                            </span>
                          )}
                          <h3 className="font-bold text-xs tracking-wide text-zinc-100 uppercase">{part.name}</h3>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-400">Intervalle : {part.interval_hours}h {part.category ? `• ${part.category}` : ''} • <span className="text-orange-400 underline">Voir historique</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                          +{overdueHours}h retard
                        </span>
                        <button
                          onClick={(e) => handleDeletePart(part.id, e)}
                          title="Supprimer ce contrôle"
                          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg transition-colors bg-black/40 border border-zinc-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden p-0.5 border border-red-950">
                      <div className="h-full bg-red-500 rounded-full w-full"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              PROCHAINS ENTRETIENS ({upcomingParts.length})
            </h2>
          </div>

          {upcomingParts.length === 0 ? (
            <div className="bg-[#111114] border border-zinc-800/50 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 font-mono">Aucun composant sous surveillance pour ce filtre.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingParts.map((part) => {
                const hoursUsed = moto.hours - part.last_service_hours;
                const remainingHours = (part.interval_hours - hoursUsed).toFixed(1);
                const progress = Math.min((hoursUsed / part.interval_hours) * 100, 100);

                return (
                  <div
                    key={part.id}
                    onClick={() => setSelectedPartForHistory(part)}
                    className="bg-[#111114] border border-zinc-800/80 p-4 rounded-2xl space-y-3 shadow-md cursor-pointer hover:border-zinc-700 transition-all relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {part.category && (
                            <span className="text-xs">
                              {CATEGORIES.find(c => c.name === part.category)?.icon || '🔧'}
                            </span>
                          )}
                          <h3 className="font-bold text-xs tracking-wide text-zinc-200 uppercase">{part.name}</h3>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500">Prévu tous les {part.interval_hours}h {part.category ? `• ${part.category}` : ''} • <span className="text-orange-400 underline">Voir historique</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                          Dans {remainingHours}h
                        </span>
                        <button
                          onClick={(e) => handleDeletePart(part.id, e)}
                          title="Supprimer ce contrôle"
                          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg transition-colors bg-black/40 border border-zinc-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => setShowPartModal(true)}
          className="pointer-events-auto bg-gradient-to-r from-orange-600 to-orange-400 text-black font-black text-xl px-6 py-3 rounded-2xl shadow-xl shadow-orange-500/25 border border-orange-300/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>+</span>
          <span className="text-xs font-mono uppercase tracking-wider">Ajouter un contrôle</span>
        </button>
      </div>

      {selectedPartForHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase">Historique du composant</span>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mt-0.5">{selectedPartForHistory.name}</h3>
              </div>
              <button onClick={() => setSelectedPartForHistory(null)} className="text-zinc-400 hover:text-white text-lg font-bold px-2">✕</button>
            </div>

            <div className="space-y-2 pt-2">
              {logs.filter(log => log.part_id === selectedPartForHistory.id).length === 0 ? (
                <div className="bg-black/40 border border-zinc-800/60 p-4 rounded-2xl text-center">
                  <p className="text-xs text-zinc-500 font-mono">Aucun entretien enregistré spécifiquement pour ce composant.</p>
                </div>
              ) : (
                logs.filter(log => log.part_id === selectedPartForHistory.id).map(log => (
                  <div key={log.id} className="bg-black/50 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">{log.title}</h4>
                      <p className="text-[10px] font-mono text-zinc-500">
                        {new Date(log.performed_at).toLocaleDateString('fr-FR')} • {log.hours_at_done}h
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      {log.cost ? `${Number(log.cost).toFixed(2)} €` : '0,00 €'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={(e) => handleDeletePart(selectedPartForHistory.id, e)}
                className="w-1/2 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-mono text-xs rounded-xl transition-colors"
              >
                Supprimer le contrôle
              </button>
              <button
                type="button"
                onClick={() => setSelectedPartForHistory(null)}
                className="w-1/2 py-2.5 bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showPartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nouveau contrôle</h3>
            <form onSubmit={handleAddPart} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Nom de l'entretien *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Piston, Vidange, Pneu..."
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Catégorie *</label>
                <select
                  value={partCategory}
                  onChange={(e) => setPartCategory(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Intervalle (h)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Fait à (h)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lastServiceHours}
                    onChange={(e) => setLastServiceHours(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button type="submit" disabled={submitting} className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20">
                  {submitting ? 'ENREGISTREMENT...' : 'SAUVEGARDER'}
                </button>
                <button type="button" onClick={() => setShowPartModal(false)} className="w-full py-2 bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs rounded-xl">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] border border-orange-500/40 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-center">
            <span className="text-[10px] font-mono font-bold tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full uppercase">
              VERSION GRATUITE LIMITÉE
            </span>
            <h3 className="text-lg font-black text-white tracking-tight">Passez à la vitesse supérieure</h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Vous avez atteint la limite de 5 entretiens sur cette moto. Débloquez l'accès illimité à vie pour toutes vos motos et entretiens.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20" href="/upgrade">
                DÉCOUVRIR L'ILLIMITÉ
              </Link>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2 bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs rounded-xl transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mettre à jour les heures</h3>
            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Intervention</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sortie terrain / session"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Associer à un composant (optionnel)</label>
                <select
                  value={logPartId}
                  onChange={(e) => setLogPartId(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">-- Aucun composant spécifique --</option>
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.interval_hours}h)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Compteur (h)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Coût (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={logCost}
                    onChange={(e) => setLogCost(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-mono text-xs rounded-xl">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-orange-500 text-black font-mono text-xs font-bold rounded-xl">
                  {submitting ? '...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}