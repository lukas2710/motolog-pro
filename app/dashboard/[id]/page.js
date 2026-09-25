'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase';

export default function MotoDetailPage({ params }) {
  const { id: motoId } = use(params);
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLogModal, setShowLogModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);

  const [logTitle, setLogTitle] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logCost, setLogCost] = useState('0');

  const [partName, setPartName] = useState('');
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
      setShowLogModal(false);
      await fetchMotoData();
    }
    setSubmitting(false);
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('parts').insert([
      {
        moto_id: motoId,
        user_id: user.id,
        name: partName,
        interval_hours: parseFloat(intervalHours),
        last_service_hours: parseFloat(lastServiceHours),
      },
    ]);

    if (!error) {
      setPartName('');
      setIntervalHours('40');
      setShowPartModal(false);
      await fetchMotoData();
    }
    setSubmitting(false);
  };

  const handleResetPart = async (part) => {
    const costInput = prompt(`Coût du remplacement pour "${part.name}" (€) :`, '0');
    if (costInput === null) return;

    const cost = parseFloat(costInput) || 0;
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('parts')
      .update({ last_service_hours: moto.hours })
      .eq('id', part.id);

    await supabase.from('logs').insert([
      {
        moto_id: motoId,
        user_id: user.id,
        title: `Entretien : ${part.name}`,
        hours_at_done: moto.hours,
        cost: cost,
        notes: `Remplacement effectué à ${moto.hours}h`,
      },
    ]);

    await fetchMotoData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Chargement...</p>
        </div>
      </div>
    );
  }

  const overdueParts = parts.filter(p => (moto.hours - p.last_service_hours) >= p.interval_hours);
  const upcomingParts = parts.filter(p => (moto.hours - p.last_service_hours) < p.interval_hours);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-6 pb-28 font-sans selection:bg-orange-500 selection:text-black">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            ← GARAGE
          </button>
          
          <Link
            href={`/dashboard/${motoId}/costs`}
            className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-xl transition-all"
          >
            📊 Dépenses
          </Link>
        </div>

        {/* Hero Card Moto */}
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

        {/* Section Entretiens URGENTS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              A FAIRE EN PRIORITÉ ({overdueParts.length})
            </h2>
          </div>

          {overdueParts.length === 0 ? (
            <div className="bg-[#111114] border border-zinc-800/50 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 font-mono">Aucun entretien en retard.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueParts.map((part) => {
                const hoursUsed = moto.hours - part.last_service_hours;
                const overdueHours = (hoursUsed - part.interval_hours).toFixed(1);

                return (
                  <div
                    key={part.id}
                    onClick={() => handleResetPart(part)}
                    className="group bg-gradient-to-r from-[#241012] to-[#140b0c] border border-red-500/30 hover:border-red-500/60 p-4 rounded-2xl space-y-3 cursor-pointer transition-all shadow-md active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs tracking-wide text-zinc-100 uppercase">{part.name}</h3>
                        <p className="text-[10px] font-mono text-zinc-400">Intervalle : {part.interval_hours}h</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                        +{overdueHours}h retard
                      </span>
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

        {/* Section Entretiens À venir */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              PROCHAINS ENTRETIENS ({upcomingParts.length})
            </h2>
          </div>

          {upcomingParts.length === 0 ? (
            <div className="bg-[#111114] border border-zinc-800/50 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-500 font-mono">Aucun composant sous surveillance.</p>
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
                    onClick={() => handleResetPart(part)}
                    className="group bg-[#111114] border border-zinc-800/80 hover:border-orange-500/40 p-4 rounded-2xl space-y-3 cursor-pointer transition-all shadow-md active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs tracking-wide text-zinc-200 uppercase">{part.name}</h3>
                        <p className="text-[10px] font-mono text-zinc-500">Prévu tous les {part.interval_hours}h</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                        Dans {remainingHours}h
                      </span>
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

        {/* Historique */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
            HISTORIQUE DES TRAVAUX
          </h2>

          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-[#111114] border border-zinc-800/50 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-zinc-200">{log.title}</h3>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    {new Date(log.performed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} • {log.hours_at_done}h
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-orange-400">
                  {log.cost ? `${Number(log.cost).toFixed(2)} €` : '0,00 €'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bouton d'action flottant (+ composant) */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => setShowPartModal(true)}
          className="pointer-events-auto bg-gradient-to-r from-orange-600 to-orange-400 text-black font-black text-xl px-6 py-3 rounded-2xl shadow-xl shadow-orange-500/25 border border-orange-300/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>+</span>
          <span className="text-xs font-mono uppercase tracking-wider">Composant</span>
        </button>
      </div>

      {/* Modals */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajouter un composant</h3>
            <form onSubmit={handleAddPart} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Désignation</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Piston, Vidange, Pneu..."
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPartModal(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-mono text-xs rounded-xl">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-orange-500 text-black font-mono text-xs font-bold rounded-xl">
                  {submitting ? '...' : 'Créer'}
                </button>
              </div>
            </form>
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