'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function DashboardPage() {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [motoBrand, setMotoBrand] = useState('');
  const [motoName, setMotoName] = useState('');
  const [motoYear, setMotoYear] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Installation PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // =========================================================
  // CHARGEMENT DES MOTOS
  // =========================================================

  const fetchMotos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/';
      return;
    }

    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false });

    if (!error && data) {
      setMotos(data);
    }

    setLoading(false);
  };

  // =========================================================
  // INITIALISATION
  // =========================================================

  useEffect(() => {
    fetchMotos();

    // Vérifie si l'application est déjà installée
    const checkInstalled = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    // Chrome / Android / Edge
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      // On garde l'événement pour pouvoir déclencher
      // l'installation au clic sur le bouton
      setDeferredPrompt(event);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    // Quand l'application est installée
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener(
      'appinstalled',
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      );
    };
  }, []);

  // =========================================================
  // INSTALLATION APPLICATION
  // =========================================================

  const handleInstallClick = async () => {
    // Déjà installée
    if (isInstalled) {
      return;
    }

    // Installation native disponible
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();

        const { outcome } =
          await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error(
          "Erreur installation :",
          error
        );
      }

      return;
    }

    // Pas de fenêtre native disponible
    alert(
      "L'installation automatique n'est pas disponible sur ce navigateur. Ouvre cette page avec Chrome puis réessaie."
    );
  };

  // =========================================================
  // AJOUTER UNE MOTO
  // =========================================================

  const handleAddMoto = async (e) => {
    e.preventDefault();

    if (
      !motoBrand.trim() ||
      !motoName.trim() ||
      !motoYear.trim()
    ) {
      return;
    }

    const isPremium =
      localStorage.getItem('is_premium') === 'true';

    const MAX_FREE_MOTOS = 1;

    if (
      !isPremium &&
      motos.length >= MAX_FREE_MOTOS
    ) {
      setShowUpgradeModal(true);
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('motos')
      .insert([
        {
          user_id: user.id,
          brand: motoBrand.trim(),
          name: motoName.trim(),
          year: parseInt(motoYear.trim(), 10),
        },
      ]);

    if (error) {
      alert(`Erreur : ${error.message}`);
      setSubmitting(false);
      return;
    }

    setMotoBrand('');
    setMotoName('');
    setMotoYear('');

    await fetchMotos();

    setSubmitting(false);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-orange-500 animate-spin" />

          <p className="text-[9px] font-mono tracking-[0.3em] text-zinc-600 uppercase">
            Chargement du garage
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 overflow-hidden">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-orange-500/[0.035] blur-[140px]" />

        <div className="absolute top-1/3 -left-60 w-[400px] h-[400px] rounded-full bg-orange-600/[0.015] blur-[120px]" />

        <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] rounded-full bg-orange-500/[0.02] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

      </div>


      {/* ================================================= */}
      {/* CONTENU */}
      {/* ================================================= */}

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="flex items-center justify-between mb-7">

          <div className="flex items-center gap-3">

            <div className="relative w-11 h-11 rounded-2xl bg-[#111114] border border-zinc-800 flex items-center justify-center shadow-xl">

              <span className="text-xl">
                🏍️
              </span>

              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-[#070708]" />

            </div>

            <div>

              <p className="text-[8px] font-mono font-bold tracking-[0.3em] text-orange-500 uppercase">
                MotoDiag
              </p>

              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                Mon Garage
              </h1>

            </div>

          </div>


          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 bg-[#101012] hover:border-red-500/30 hover:bg-red-500/[0.04] transition-all"
          >

            <span className="text-[9px] font-mono font-bold text-zinc-500 group-hover:text-red-400 uppercase tracking-wider">
              Quitter
            </span>

            <span className="text-xs text-zinc-600 group-hover:text-red-400">
              ↗
            </span>

          </button>

        </header>


        {/* ================================================= */}
        {/* HERO GARAGE */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[#101012] shadow-2xl mb-5">

          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />

          <div className="absolute right-0 top-0 w-52 h-52 bg-orange-500/[0.04] blur-[80px] rounded-full" />

          <div className="relative p-6 sm:p-8">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />

                  <span className="text-[8px] font-mono font-bold tracking-[0.25em] text-zinc-600 uppercase">
                    Garage en ligne
                  </span>

                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Tes motos.
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  Ton garage personnel, tes machines, ton suivi.
                </p>

              </div>


              <div className="hidden sm:flex flex-col items-end">

                <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-600 uppercase">
                  Machines
                </span>

                <span className="text-3xl font-black text-orange-500 mt-1">
                  {motos.length}
                </span>

              </div>

            </div>


            <div className="mt-7 grid grid-cols-3 gap-2">

              <div className="bg-black/30 border border-zinc-800/80 rounded-xl p-3">

                <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">
                  Motos
                </p>

                <p className="text-sm font-bold text-white mt-1">
                  {motos.length}
                </p>

              </div>


              <div className="bg-black/30 border border-zinc-800/80 rounded-xl p-3">

                <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">
                  Garage
                </p>

                <p className="text-sm font-bold text-emerald-400 mt-1">
                  ACTIF
                </p>

              </div>


              <div className="bg-black/30 border border-zinc-800/80 rounded-xl p-3">

                <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">
                  Diagnostic
                </p>

                <p className="text-sm font-bold text-orange-400 mt-1">
                  PRÊT
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* BOUTON INSTALLATION */}
        {/* ================================================= */}

        {!isInstalled && (

          <section className="relative overflow-hidden rounded-[24px] border border-orange-500/20 bg-gradient-to-r from-orange-500/[0.07] via-[#101012] to-[#101012] mb-5 shadow-xl">

            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500" />

            <div className="absolute right-0 top-0 w-40 h-40 bg-orange-500/[0.04] blur-[70px] rounded-full" />

            <div className="relative p-4 sm:p-5">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl">
                  📱
                </div>


                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2">

                    <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-orange-400 uppercase">
                      Application
                    </span>

                    <span className="w-1 h-1 rounded-full bg-zinc-700" />

                    <span className="text-[8px] font-mono text-zinc-600 uppercase">
                      PWA
                    </span>

                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                    Installer MotoDiag
                  </h3>

                  <p className="text-[9px] text-zinc-600 mt-1 hidden sm:block">
                    Installe MotoDiag directement sur ton appareil.
                  </p>

                </div>


                {/* BOUTON QUI LANCE DIRECTEMENT L'INSTALLATION */}

                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="shrink-0 px-4 py-3 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black font-mono text-[9px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all"
                >
                  INSTALLER
                </button>

              </div>

            </div>

          </section>

        )}


        {/* ================================================= */}
        {/* AJOUT MOTO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[26px] border border-zinc-800 bg-[#101012] shadow-xl mb-7">

          <div className="px-5 sm:px-7 py-5 border-b border-zinc-800/70 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">

                <span className="text-base">
                  ＋
                </span>

              </div>

              <div>

                <p className="text-[8px] font-mono tracking-[0.25em] text-zinc-600 uppercase">
                  Nouveau véhicule
                </p>

                <h2 className="text-sm font-bold text-white mt-0.5">
                  Ajouter une moto
                </h2>

              </div>

            </div>

          </div>


          <form
            onSubmit={handleAddMoto}
            className="p-5 sm:p-7 space-y-4"
          >

            <div>

              <label className="block text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-[0.18em] mb-2">
                Marque
              </label>

              <input
                type="text"
                required
                placeholder="Ex : Yamaha, YCF, Honda..."
                value={motoBrand}
                onChange={(e) =>
                  setMotoBrand(e.target.value)
                }
                className="w-full bg-[#08080a] border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/60 p-3.5 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/[0.06] transition-all"
              />

            </div>


            <div>

              <label className="block text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-[0.18em] mb-2">
                Modèle
              </label>

              <input
                type="text"
                required
                placeholder="Ex : YZ 125, Dirt 190, CRF 250..."
                value={motoName}
                onChange={(e) =>
                  setMotoName(e.target.value)
                }
                className="w-full bg-[#08080a] border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/60 p-3.5 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/[0.06] transition-all"
              />

            </div>


            <div>

              <label className="block text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-[0.18em] mb-2">
                Année
              </label>

              <input
                type="number"
                required
                placeholder="Ex : 2024"
                value={motoYear}
                onChange={(e) =>
                  setMotoYear(e.target.value)
                }
                className="w-full bg-[#08080a] border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/60 p-3.5 rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/[0.06] transition-all"
              />

            </div>


            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-[10px] font-black tracking-[0.18em] uppercase rounded-xl shadow-[0_8px_30px_rgba(249,115,22,.16)] transition-all disabled:opacity-50"
            >
              {submitting
                ? 'CRÉATION EN COURS...'
                : '＋ AJOUTER AU GARAGE'}
            </button>

          </form>

        </section>


        {/* ================================================= */}
        {/* MOTOS */}
        {/* ================================================= */}

        <section>

          <div className="flex items-end justify-between mb-4">

            <div>

              <p className="text-[8px] font-mono font-bold tracking-[0.25em] text-orange-500 uppercase">
                Garage
              </p>

              <h2 className="text-lg font-black text-white mt-1">
                Tes machines
              </h2>

            </div>

            <span className="text-[9px] font-mono text-zinc-700">
              {motos.length} MACHINE
              {motos.length > 1 ? 'S' : ''}
            </span>

          </div>


          {motos.length === 0 ? (

            <div className="relative overflow-hidden rounded-[24px] border border-dashed border-zinc-800 bg-[#0d0d0f] p-10 sm:p-14 text-center">

              <div className="relative">

                <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl mb-4">
                  🏍️
                </div>

                <h3 className="text-sm font-bold text-zinc-300">
                  Ton garage est vide
                </h3>

                <p className="text-[10px] font-mono text-zinc-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  Ajoute ta première moto pour commencer à utiliser ton espace personnel.
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-3">

              {motos.map((moto) => (

                <Link
                  key={moto.id}
                  href={`/dashboard/${moto.id}`}
                  className="group block relative overflow-hidden rounded-[22px] border border-zinc-800 bg-[#101012] hover:border-orange-500/40 hover:bg-[#121214] transition-all duration-300 shadow-lg"
                >

                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

                  <div className="p-5">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-orange-500/20 flex items-center justify-center text-xl group-hover:scale-105 transition-all">
                        🏍️
                      </div>


                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2 mb-1">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                          <span className="text-[7px] font-mono font-bold tracking-[0.2em] text-zinc-600 uppercase">
                            Véhicule enregistré
                          </span>

                        </div>

                        <h3 className="font-black text-sm sm:text-base text-white uppercase truncate group-hover:text-orange-400 transition-colors">
                          {moto.brand} {moto.name}
                        </h3>

                        <p className="text-[9px] font-mono text-zinc-600 mt-1 uppercase">
                          Année {moto.year}
                        </p>

                      </div>


                      <div className="shrink-0 flex items-center gap-2">

                        <span className="hidden sm:block text-[8px] font-mono font-bold tracking-wider text-zinc-700 uppercase group-hover:text-orange-500 transition-colors">
                          Ouvrir
                        </span>

                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 flex items-center justify-center text-zinc-600 group-hover:text-orange-400 transition-all">
                          →
                        </div>

                      </div>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="pt-10 text-center">

          <div className="flex items-center justify-center gap-3 mb-3">

            <div className="h-px w-10 bg-zinc-800" />

            <span className="text-[8px] font-mono tracking-[0.3em] text-zinc-700 uppercase">
              MotoDiag
            </span>

            <div className="h-px w-10 bg-zinc-800" />

          </div>

          <p className="text-[7px] font-mono text-zinc-800 tracking-[0.2em] uppercase">
            Diagnostic • Maintenance • Garage
          </p>

        </div>

      </main>


      {/* ===================================================== */}
      {/* MODAL PREMIUM */}
      {/* ===================================================== */}

      {showUpgradeModal && (

        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">

          <div className="relative overflow-hidden bg-[#101012] border border-orange-500/25 rounded-[28px] w-full max-w-sm shadow-[0_25px_100px_rgba(0,0,0,.7)]">

            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

            <div className="relative p-6 sm:p-7">

              <div className="flex justify-between items-start mb-6">

                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl">
                  ⚡
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowUpgradeModal(false)
                  }
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-white"
                >
                  ✕
                </button>

              </div>


              <span className="inline-flex text-[8px] font-mono font-bold tracking-[0.2em] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg uppercase">
                Limite gratuite atteinte
              </span>


              <h3 className="text-xl font-black text-white mt-4">
                Passe au Premium
              </h3>


              <p className="text-[11px] text-zinc-500 leading-relaxed mt-2">
                La version gratuite est limitée à
                l'enregistrement d'une seule moto.
                Débloque l'ajout illimité de motos à vie
                pour <strong className="text-white">10 €</strong>.
              </p>


              <div className="grid grid-cols-2 gap-2 mt-6 mb-6">

                <div className="rounded-xl bg-black/30 border border-zinc-800 p-3">

                  <span className="text-sm">
                    🏍️
                  </span>

                  <p className="text-[8px] font-mono text-zinc-500 mt-2">
                    MOTOS
                  </p>

                  <p className="text-xs font-bold text-white">
                    ILLIMITÉES
                  </p>

                </div>


                <div className="rounded-xl bg-black/30 border border-zinc-800 p-3">

                  <span className="text-sm">
                    ⚡
                  </span>

                  <p className="text-[8px] font-mono text-zinc-500 mt-2">
                    ACCÈS
                  </p>

                  <p className="text-xs font-bold text-white">
                    PREMIUM
                  </p>

                </div>

              </div>


              <div className="space-y-2">

                <Link
                  href="/upgrade"
                  className="block w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-[10px] font-black tracking-[0.12em] rounded-xl transition-all text-center"
                >
                  DÉBLOQUER L'ILLIMITÉ — 10 €
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setShowUpgradeModal(false)
                  }
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white border border-zinc-800 font-mono text-[9px] font-bold tracking-wider rounded-xl transition-all"
                >
                  FERMER
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}