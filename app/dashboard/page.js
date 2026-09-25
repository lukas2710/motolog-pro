'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Champs du formulaire
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [hours, setHours] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const fetchMotos = async () => {
    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMotos(data);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
        await fetchMotos();
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleAddMoto = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('motos').insert([
      {
        user_id: user.id,
        name,
        brand,
        year: parseInt(year),
        hours: parseFloat(hours),
      },
    ]);

    if (!error) {
      setName('');
      setBrand('');
      setYear(new Date().getFullYear());
      setHours('0');
      setShowModal(false);
      await fetchMotos();
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-sm font-bold text-zinc-400">Chargement de ton garage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* En-tête */}
        <header className="flex justify-between items-center bg-[#121215] border border-zinc-800 p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
              <span className="font-black text-xl tracking-wider uppercase text-white">
                MotoLog <span className="text-xs text-orange-500 font-bold">PRO</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Connecté en tant que : <span className="text-white font-semibold">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Déconnexion
          </button>
        </header>

        {/* Section Garage */}
        <main className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white">Mes Bécanes</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition"
            >
              + Ajouter une moto
            </button>
          </div>

          {motos.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center bg-[#121215]/50">
              <p className="text-zinc-500 text-sm font-medium">Aucune moto enregistrée pour le moment.</p>
              <p className="text-xs text-zinc-600 mt-1">Ajoute ta première bécane pour commencer le suivi d'entretien !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {motos.map((moto) => (
                <Link
                  key={moto.id}
                  href={`/dashboard/${moto.id}`}
                  className="bg-[#121215] border border-zinc-800 p-5 rounded-2xl flex justify-between items-center hover:border-orange-500 transition cursor-pointer group"
                >
                  <div>
                    <h3 className="font-black text-lg text-white group-hover:text-orange-400 transition">
                      {moto.name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {moto.brand} • Modèle {moto.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-orange-500">{moto.hours} h</span>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Compteur</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal d'ajout de moto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-white">Nouvelle Bécane</h3>
            <form onSubmit={handleAddMoto} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Modèle / Nom</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ERZ 250"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Marque</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ERZ / Honda / Yamaha"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Année</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Heures de vol</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-500 text-black font-extrabold rounded-xl text-xs uppercase"
                >
                  {submitting ? 'Ajout...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}