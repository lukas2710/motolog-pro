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
    const costInput = prompt(`Combien t'a coûté cet entretien pour "${part.name}" (€) ?`, '0');
    if (costInput === null) return; // Annulé

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
        title: `Remplacement / Entretien : ${part.name}`,
        hours_at_done: moto.hours,
        cost: cost,
        notes: `Validé depuis les rappels d'usure (${part.interval_hours}h)`,
      },
    ]);

    await fetchMotoData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-sm font-bold text-zinc-400">Chargement de la bécane...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-2"
          >
            ← Retour au garage
          </button>
          <Link
            href={`/dashboard/${motoId}/costs`}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold px-3 py-1.5 rounded-xl text-xs transition"
          >
            📊 Bilan Financier / Coûts
          </Link>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
              {moto.brand}
            </span>
            <h1 className="text-3xl font-black text-white mt-2">{moto.name}</h1>
            <p className="text-xs text-zinc-400 mt-1">Année {moto.year}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-orange-500">{moto.hours} h</span>
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Compteur actuel</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white">Usure des pièces & Alertes</h2>
            <button
              onClick={() => {
                setLastServiceHours(moto.hours.toString());
                setShowPartModal(true);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
            >
              + Suivre une pièce
            </button>
          </div>

          {parts.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-6 text-center bg-[#121215]/50">
              <p className="text-zinc-500 text-xs">Aucun rappel de pièce configuré (ex: Piston tous les 40h).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parts.map((part) => {
                const hoursUsed = moto.hours - part.last_service_hours;
                const progress = Math.min((hoursUsed / part.interval_hours) * 100, 100);
                const isOverdue = hoursUsed >= part.interval_hours;

                return (
                  <div key={part.id} className="bg-[#121215] border border-zinc-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-white">{part.name}</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${isOverdue ? 'bg-red-500/20 text-red-400' : 'text-zinc-400'}`}>
                        {hoursUsed.toFixed(1)} / {part.interval_hours} h
                      </span>
                    </div>

                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          progress >= 100 ? 'bg-red-500' : progress > 75 ? 'bg-amber-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-zinc-500">
                        {isOverdue ? '⚠️ Remplacement recommandé !' : `Prochain entretien à ${(part.last_service_hours + part.interval_hours).toFixed(1)} h`}
                      </span>
                      <button
                        onClick={() => handleResetPart(part)}
                        className="text-[10px] bg-zinc-800 hover:bg-orange-500 hover:text-black font-bold px-2 py-1 rounded text-zinc-300 transition"
                      >
                        Marquer fait
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white">Historique des travaux</h2>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition"
            >
              + Nouvelle intervention
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-[#121215]/50">
              <p className="text-zinc-500 text-xs">Aucune intervention enregistrée.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-[#121215] border border-zinc-800 p-4 rounded-xl flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{log.title}</h3>
                    {log.notes && <p className="text-xs text-zinc-400">{log.notes}</p>}
                    <p className="text-[10px] text-zinc-600">Fait le {new Date(log.performed_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-black bg-zinc-800 text-orange-400 px-2.5 py-1 rounded-lg block">
                      {log.hours_at_done} h
                    </span>
                    <span className="text-xs font-bold text-emerald-400 block">
                      {log.cost ? `${log.cost} €` : '0 €'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPartModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-white">Suivre une nouvelle pièce</h3>
            <form onSubmit={handleAddPart} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Nom de la pièce</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Piston / Vidange / Kit Chaîne"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Intervalle (Heures)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="40"
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Fait à (Heures)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lastServiceHours}
                    onChange={(e) => setLastServiceHours(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPartModal(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-orange-500 text-black font-extrabold rounded-xl text-xs uppercase">
                  {submitting ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-white">Ajouter une intervention</h3>
            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Intervention</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Remplacement piston"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Heures au compteur</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Coût (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={logCost}
                    onChange={(e) => setLogCost(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Notes</label>
                <textarea
                  placeholder="ex: Piston Vertex cote A"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows="3"
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1 resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-orange-500 text-black font-extrabold rounded-xl text-xs uppercase">
                  {submitting ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}