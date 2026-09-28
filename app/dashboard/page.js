'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../supabase';

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

export default function MotoDetailPage() {
  const params = useParams();
  const motoId = params?.id;
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [parts, setParts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire d'ajout de pièce
  const [partName, setPartName] = useState('');
  const [partCategory, setPartCategory] = useState(CATEGORIES[0].name);
  const [intervalHours, setIntervalHours] = useState('');
  const [lastServiceHours, setLastServiceHours] = useState('');
  const [submittingPart, setSubmittingPart] = useState(false);

  // Formulaire d'ajout de log / entretien
  const [logTitle, setLogTitle] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  const fetchData = async () => {
    if (!motoId) return;

    const { data: motoData, error: motoError } = await supabase
      .from('motos')
      .select('*')
      .eq('id', motoId)
      .single();

    if (motoError || !motoData) {
      router.push('/dashboard');
      return;
    }
    setMoto(motoData);

    const { data: partsData } = await supabase
      .from('parts')
      .select('*')
      .eq('moto_id', motoId);

    if (partsData) setParts(partsData);

    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .eq('moto_id', motoId)
      .order('performed_at', { ascending: false });

    if (logsData) setLogs(logsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [motoId]);

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partName.trim()) return;
    setSubmittingPart(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Utilisateur non connecté.");
      setSubmittingPart(false);
      return;
    }

    const { error } = await supabase.from('parts').insert([
      {
        user_id: user.id,
        moto_id: motoId,
        name: partName.trim(),
        category: partCategory,
        interval_hours: intervalHours !== '' ? parseFloat(intervalHours) : null,
        last_service_hours: lastServiceHours !== '' ? parseFloat(lastServiceHours) : 0,
      }
    ]);

    if (error) {
      alert(`Erreur : ${error.message}`);
      setSubmittingPart(false);
      return;
    }

    setPartName('');
    setIntervalHours('');
    setLastServiceHours('');
    fetchData();
    setSubmittingPart(false);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logTitle.trim()) return;
    setSubmittingLog(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Utilisateur non connecté.");
      setSubmittingLog(false);
      return;
    }

    const { error } = await supabase.from('logs').insert([
      {
        user_id: user.id,
        moto_id: motoId,
        title: logTitle.trim(),
        engine_hours: engineHours !== '' ? parseFloat(engineHours) : null,
        performed_at: new Date().toISOString(),
      }
    ]);

    if (error) {
      alert(`Erreur : ${error.message}`);
      setSubmittingLog(false);
      return;
    }

    setLogTitle('');
    setEngineHours('');
    fetchData();
    setSubmittingLog(false);
  };

  const handleDeletePart = async (partId) => {
    if (!confirm("Voulez-vous vraiment supprimer cette pièce ?")) return;

    setParts((prevParts) => prevParts.filter((p) => p.id !== partId));

    const { error, count } = await supabase
      .from('parts')
      .delete({ count: 'exact' })
      .eq('id', partId);

    if (error || count === 0) {
      alert(`Erreur lors de la suppression de la pièce : ${error?.message || 'Politique RLS bloquante'}`);
      fetchData();
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!confirm("Voulez-vous vraiment supprimer cet historique de contrôle ?")) return;

    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));

    const { error, count } = await supabase
      .from('logs')
      .delete({ count: 'exact' })
      .eq('id', logId);

    if (error || count === 0) {
      alert(`Erreur lors de la suppression du contrôle : ${error?.message || 'Politique RLS bloquante'}`);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex items-center justify-between bg-[#121215] border border-zinc-800 p-5 rounded-2xl">
          <div>
            <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-bold">Gestion des pièces & entretiens</span>
            <h1 className="text-xl font-extrabold text-white uppercase">{moto?.name}</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            ← Retour Garage
          </button>
        </div>

        {/* Formulaire d'ajout de pièce */}
        <form onSubmit={handleAddPart} className="bg-[#121215] border border-zinc-800 p-6 rounded-3xl space-y-4">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Ajouter un composant / pièce</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Nom de la pièce</label>
              <input
                type="text"
                required
                placeholder="Ex: Piston, Kit chaîne..."
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Catégorie</label>
              <select
                value={partCategory}
                onChange={(e) => setPartCategory(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-zinc-300 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-zinc-900">
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Intervalle (heures)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 15"
                value={intervalHours}
                onChange={(e) => setIntervalHours(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Dernier changement (heures)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 0"
                value={lastServiceHours}
                onChange={(e) => setLastServiceHours(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingPart}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {submittingPart ? 'Ajout en cours...' : 'Ajouter la pièce'}
          </button>
        </form>

        {/* Formulaire d'ajout rapide d'un contrôle/intervention */}
        <form onSubmit={handleAddLog} className="bg-[#121215] border border-zinc-800 p-6 rounded-3xl space-y-4">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Ajouter un historique / contrôle</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Titre de l'intervention</label>
              <input
                type="text"
                required
                placeholder="Ex: Vidange, Tension chaîne..."
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Heures moteur actuelles</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 45.5"
                value={engineHours}
                onChange={(e) => setEngineHours(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingLog}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-black tracking-widest uppercase rounded-xl transition disabled:opacity-50"
          >
            {submittingLog ? 'Enregistrement...' : 'Enregistrer le contrôle'}
          </button>
        </form>

        {/* Liste des pièces enregistrées (Cliquer sur la carte pour supprimer) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Pièces suivies ({parts.length})</h2>
            <span className="text-[10px] font-mono text-orange-500">Clique sur une pièce pour la supprimer</span>
          </div>

          {parts.length === 0 ? (
            <div className="bg-[#121215]/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-xs font-mono text-zinc-500">Aucune pièce enregistrée.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {parts.map((part) => (
                <div
                  key={part.id}
                  onClick={() => handleDeletePart(part.id)}
                  className="bg-[#121215] border border-zinc-800 hover:border-red-500/50 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition group"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition">{part.name}</h3>
                    <p className="text-[11px] font-mono text-zinc-400">
                      {part.category} {part.interval_hours ? `• Intervalle: ${part.interval_hours}h` : ''} • Dernier service : {part.last_service_hours ?? 0}h
                    </p>
                  </div>
                  <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/20 opacity-0 group-hover:opacity-100 transition">
                    Supprimer 🗑️
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique des contrôles / entretiens (Cliquer sur la carte pour supprimer) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Historique des contrôles ({logs.length})</h2>
            <span className="text-[10px] font-mono text-orange-500">Clique sur un contrôle pour le supprimer</span>
          </div>

          {logs.length === 0 ? (
            <div className="bg-[#121215]/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-xs font-mono text-zinc-500">Aucun contrôle enregistré.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => handleDeleteLog(log.id)}
                  className="bg-[#121215] border border-zinc-800 hover:border-red-500/50 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition group"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition">{log.title || log.description || 'Intervention'}</h3>
                    <p className="text-[11px] font-mono text-zinc-400">
                      {log.engine_hours ? `Heures moteur : ${log.engine_hours}h • ` : ''}{new Date(log.performed_at || log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/20 opacity-0 group-hover:opacity-100 transition">
                    Supprimer 🗑️
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