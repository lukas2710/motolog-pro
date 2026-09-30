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

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

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

    // Détection iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Écoute de l'événement PWA (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'app est déjà en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    } else {
      // Fallback si le navigateur ne déclenche pas l'événement automatique
      alert("Pour installer l'application, va dans le menu de ton navigateur (les 3 petits points) et sélectionne 'Ajouter à l'écran d'accueil' ou 'Installer l'application'.");
    }
  };

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
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 pb-32">
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

        {/* Bannière / Bouton d'installation PWA */}
        <div className="bg-gradient-to-r from-orange-950/40 via-[#121215] to-[#121215] border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 text-lg">
              📱
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase">Installer l'application</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Accède à ton garage directement depuis ton écran d'accueil.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-mono text-[11px] font-bold rounded-xl shrink-0 shadow-lg shadow-orange-500/20 transition"
          >
            Installer
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

      {/* Modal d'explication pour iOS (Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest">Installer sur iPhone</h3>
              <button onClick={() => setShowIOSModal(false)} className="text-zinc-400 hover:text-white text-lg font-bold px-2">✕</button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 font-mono">
              <p>Pour installer l'application sur ton iPhone ou iPad :</p>
              <ol className="list-decimal list-inside space-y-2 text-zinc-400">
                <li>Ouvre cette page dans <strong className="text-white">Safari</strong>.</li>
                <li>Appuie sur le bouton <strong className="text-orange-400">Partager</strong> en bas de l'écran (icône carré avec une flèche vers le haut).</li>
                <li>Foule vers le bas et sélectionne <strong className="text-white">« Sur l'écran d'accueil »</strong>.</li>
                <li>Appuie sur <strong className="text-white">Ajouter</strong> en haut à droite.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl mt-2"
            >
              Compris
            </button>
          </div>
        </div>
      )}

    </div>
  );
}