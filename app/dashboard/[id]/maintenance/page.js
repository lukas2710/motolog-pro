'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../supabase';

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

export default function MaintenancePage() {
  const params = useParams();
  const motoId = params.id;
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // États du formulaire
  const [title, setTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // État pour filtrer l'historique
  const [historyFilterCategory, setHistoryFilterCategory] = useState('');

  const fetchMaintenanceData = async () => {
    if (!motoId) return;

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

    const numericHours = hours !== '' ? parseFloat(hours) : null;

    const { error: logError } = await supabase.from('logs').insert([
      {
        user_id: user.id,
        moto_id: motoId,
        part_id: selectedPartId !== '' ? selectedPartId : null,
        title: title.trim(),
        performed_at: date,
        hours: numericHours,
        hours_at_done: numericHours,
        cost: cost !== '' ? parseFloat(cost) : 0,
        notes: notes.trim() !== '' ? notes.trim() : null,
      }
    ]);

    if (logError) {
      console.error("Erreur Supabase:", logError);
      alert(`Erreur lors de l'enregistrement : ${logError.message}`);
      setSubmitting(false);
      return;
    }

    if (selectedPartId !== '' && numericHours !== null) {
      const { error: partError } = await supabase
        .from('parts')
        .update({ last_service_hours: numericHours })
        .eq('id', selectedPartId);

      if (partError) {
        console.error(partError);
        alert("Entretien enregistré, mais échec de la mise à jour de la pièce sur l'accueil.");
      }
    }

    setTitle('');
    setFormCategory('');
    setSelectedPartId('');
    setHours('');
    setCost('');
    setNotes('');
    fetchMaintenanceData();
    setSubmitting(false);
  };

  // Filtrage des entretiens pour l'historique
  const filteredLogs = logs.filter((log) => {
    if (!historyFilterCategory) return true;
    // Si l'entretien a une pièce liée, on vérifie si la pièce correspond à la catégorie du filtre
    const linkedPart = parts.find((p) => p.id === log.part_id);
    if (linkedPart && linkedPart.category === historyFilterCategory) return true;
    
    // Optionnel : si le titre correspond ou contient la catégorie (sécurité supplémentaire)
    if (log.title.toLowerCase().includes(historyFilterCategory.toLowerCase())) return true;

    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* En-tête épuré */}
        <div className="flex items-center justify-between bg-gradient-to-r from-zinc-900/80 to-[#121215] border border-zinc-800/80 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-bold">Garage & Suivi</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase">{moto?.name || 'Moto'}</h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl shadow-inner">
            🛠️
          </div>
        </div>

        {/* Formulaire d'ajout redessiné */}
        <form onSubmit={handleAddLog} className="bg-[#121215]/90 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-4">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Nouvel entretien</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Titre / Intervention</label>
              <input
                type="text"
                required
                placeholder="Ex: Vidange boîte de vitesse, kit chaîne..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Filtrer les pièces par catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      setSelectedPartId('');
                    }}
                    className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" className="bg-zinc-900">Toutes les catégories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-zinc-900">{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Lier à une pièce</label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" className="bg-zinc-900">Aucune pièce spécifique</option>
                    {parts
                      .filter((part) => !formCategory || part.category === formCategory)
                      .map((part) => (
                        <option key={part.id} value={part.id} className="bg-zinc-900">
                          {part.name} (Max: {part.interval_hours}h)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Heures moteur</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 45.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Date de l'intervention</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Coût total (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">Notes / Références (optionnel)</label>
              <textarea
                placeholder="Remarques, références des pièces achetées..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 p-3.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'ENREGISTREMENT EN COURS...' : 'VALIDER L\'ENTRETIEN'}
          </button>
        </form>

        {/* Section Historique avec sélecteur de catégorie style Accueil */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215]/80 border border-zinc-800/70 p-4 rounded-2xl">
            <div>
              <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Historique des interventions</h2>
              <span className="text-[10px] font-mono text-zinc-500">{filteredLogs.length} affiché(s) sur {logs.length}</span>
            </div>

            {/* Sélecteur de filtre par catégorie (identique à l'accueil) */}
            <select
              value={historyFilterCategory}
              onChange={(e) => setHistoryFilterCategory(e.target.value)}
              className="bg-black/60 border border-zinc-800/80 focus:border-orange-500/80 px-3 py-2.5 rounded-xl text-xs text-zinc-300 focus:outline-none transition-all cursor-pointer"
            >
              <option value="" className="bg-zinc-900">📂 Toutes les catégories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-zinc-900">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="bg-[#121215]/60 border border-zinc-800/60 rounded-3xl p-10 text-center space-y-2">
              <span className="text-3xl">📭</span>
              <p className="text-xs font-mono text-zinc-500">Aucun entretien trouvé pour cette catégorie.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const linkedPart = parts.find((p) => p.id === log.part_id);
                return (
                  <div
                    key={log.id}
                    className="bg-[#121215]/80 border border-zinc-800/70 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all space-y-3 shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{log.title}</h3>
                        <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                          <span className="text-zinc-300">{log.performed_at}</span>
                          {log.hours !== null && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-orange-400/90 font-medium">{log.hours}h moteur</span>
                            </>
                          )}
                        </p>
                      </div>
                      {log.cost > 0 && (
                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl shrink-0">
                          {log.cost} €
                        </span>
                      )}
                    </div>

                    {linkedPart && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-orange-400 bg-orange-500/5 px-2.5 py-1 rounded-lg border border-orange-500/20">
                          🔗 Pièce liée : {linkedPart.name} {linkedPart.category ? `(${linkedPart.category})` : ''}
                        </span>
                      </div>
                    )}

                    {log.notes && (
                      <p className="text-xs text-zinc-300 bg-black/40 p-3 rounded-xl border border-zinc-900/80 leading-relaxed">
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