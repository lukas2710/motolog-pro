'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function DashboardPage() {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire nouvelle moto
  const [motoBrand, setMotoBrand] = useState('');
  const [motoName, setMotoName] = useState('');
  const [motoYear, setMotoYear] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/';
      return;
    }

    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .eq('user_id', user.id);

    if (data) setMotos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMotos();
  }, []);

  const handleAddMoto = async (e) => {
    e.preventDefault();
    if (!motoBrand.trim() || !motoName.trim() || !motoYear.trim()) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('motos').insert([
      {
        user_id: user.id,
        brand: motoBrand.trim(),
        name: motoName.trim(),
        year: parseInt(motoYear.trim(), 10),
      }
    ]);

    if (error) {
      alert(`Erreur : ${error.message}`);
      setSubmitting(false);
      return;
    }

    setMotoBrand('');
    setMotoName('');
    setMotoYear('');
    fetchMotos();
    setSubmitting(false);
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
      <div className="max-w-md mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-[#121215] border border-zinc-800 p-5 rounded-2xl">
          <div>
            <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-bold">Garage Principal</span>
            <h1 className="text-xl font-extrabold text-white uppercase">Mes Motos</h1>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="text-xs font-mono text-zinc-400 hover:text-red-400 transition"
          >
            Déconnexion
          </button>
        </div>

        {/* Formulaire ajout de moto */}
        <form onSubmit={handleAddMoto} className="bg-[#121215] border border-zinc-800 p-6 rounded-3xl space-y-4">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Ajouter une moto</h2>
          <div className="space-y-3">
            <input
              type="text"
              required
              placeholder="Marque (Ex: Suzuki, Yamaha...)"
              value={motoBrand}
              onChange={(e) => setMotoBrand(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Modèle/Nom (Ex: ERZ 250, YZ 125...)"
              value={motoName}
              onChange={(e) => setMotoName(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
            />
            <input
              type="number"
              required
              placeholder="Année (Ex: 2024)"
              value={motoYear}
              onChange={(e) => setMotoYear(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 focus:border-orange-500 p-3 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {submitting ? 'Ajout...' : 'Créer la moto'}
          </button>
        </form>

        {/* Liste des motos */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Sélectionner une moto</h2>
          
          {motos.length === 0 ? (
            <div className="bg-[#121215]/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-xs font-mono text-zinc-500">Aucune moto dans ton garage.</p>
            </div>
          ) : (
            motos.map((moto) => (
              <Link
                key={moto.id}
                href={`/dashboard/${moto.id}`}
                className="block bg-[#121215] border border-zinc-800 hover:border-orange-500 p-5 rounded-2xl transition group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white uppercase group-hover:text-orange-500 transition">{moto.brand} {moto.name} ({moto.year})</h3>
                  <span className="text-xs font-mono text-zinc-500">Gérer →</span>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </div>
  );
}