'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';

export default function MaintenancePage({ params }) {
  const { id: motoId } = use(params);
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // États du formulaire
  const [title, setTitle] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMaintenanceData = async () => {
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

    // Récupérer les pièces associées à cette moto (pour l'accueil)
    const { data: partsData } = await supabase
      .from('parts')
      .select('*')
      .eq('moto_id', motoId);

    if (partsData) setParts(partsData);

    // Récupérer l'historique des entretiens
    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .eq('moto_id', motoId)
      .order('performed_at', { ascending: false });

    if (logsData) setLogs(logsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, [motoId]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Utilisateur non connecté.");
      setSubmitting(false);
      return;
    }

    const numericHours = hours ? parseFloat(hours) : null;

    // 1. Insérer l'entretien dans la table logs
    const { error: logError } = await supabase.from('logs').insert([
      {
        user_id: user.id,
        moto_id: motoId,
        part_id: selectedPartId ? selectedPartId : null,
        title: title.trim(),
        performed_at: date,
        hours: numericHours,
        cost: cost ? parseFloat(cost) : 0,
        notes: notes.trim(),
      }
    ]);

    if (logError) {
      console.error(logError);
      alert("Erreur lors de l'enregistrement de l'entretien.");
      setSubmitting(false);
      return;
    }

    // 2. Si une pièce est liée et qu'on a renseigné des heures, mettre à jour la pièce sur l'accueil
    if (selectedPartId && numericHours !== null) {
      const { error: partError } = await supabase
        .from('parts')
        .update({ last_service_hours: numericHours })
        .eq('id', selectedPartId);

      if (partError) {
        console.error(partError);
        alert("Entretien enregistré, mais échec de la mise à jour de la pièce sur l'accueil.");
      }
    }

    // Réinitialiser le formulaire
    setTitle('');
    setSelectedPartId('');
    setHours('');
    setCost('');
    setNotes('');
    fetchMaintenanceData();
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white uppercase">{moto?.name || 'Moto'}</h1>
            <p className="text-xs font-mono text-zinc-500">HISTORIQUE ET ENTRETIENS</p>
          </div>
          <span className="text-3xl">🛠️</span>
        </div>

        {/* Formulaire d'ajout */}
        <form onSubmit={handleAddLog} className="bg-[#121215] border border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Ajouter un entretien</h2>

          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Titre / Intervention</label>
            <input
              type="text"
              required
              placeholder="Ex: Vidange, changement de piston..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Lier à une pièce (Accueil)</label>
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">Aucune pièce spécifique</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} (Max: {part.interval_hours}h)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Heures moteur (ex: 14)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Heures au compteur"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Coût (€)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Notes (optionnel)</label>
            <textarea
              placeholder="Détails, références de pièces..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {submitting ? 'ENREGISTREMENT...' : 'AJOUTER L\'ENTRETIEN'}
          </button>
        </form>

        {/* Liste des Entretiens */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Historique</h2>
          {logs.length === 0 ? (
            <div className="bg-[#121215] border border-zinc-800/60 rounded-xl p-8 text-center">
              <p className="text-xs font-mono text-zinc-500">Aucun entretien enregistré.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {logs.map((log) => {
                const linkedPart = parts.find((p) => p.id === log.part_id);
                return (
                  <div
                    key={log.id}
                    className="bg-[#121215] border border-zinc-800/60 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{log.title}</h3>
                        <p className="text-[10px] font-mono text-zinc-500">{log.performed_at} {log.hours !== null && `• ${log.hours}h`}</p>
                      </div>
                      {log.cost > 0 && (
                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                          {log.cost} €
                        </span>
                      )}
                    </div>

                    {linkedPart && (
                      <div className="text-[10px] font-mono text-orange-400/90 bg-orange-500/5 px-2 py-1 rounded border border-orange-500/20 inline-block w-fit">
                        Pièce liée : {linkedPart.name}
                      </div>
                    )}

                    {log.notes && (
                      <p className="text-xs text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-zinc-900">
                        {log.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}