'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      setUser(user);
      setNewEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

      if (profile?.is_premium) {
        setIsPremium(true);
        localStorage.setItem("is_premium", "true");
      } else {
        setIsPremium(false);
        localStorage.setItem("is_premium", "false");
      }

      setLoading(false);
    }

    loadUser();
  }, [router]);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const updates = {};

    if (newEmail !== user.email) updates.email = newEmail;
    if (newPassword.trim() !== '') updates.password = newPassword;

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      setMessage(`Erreur : ${error.message}`);
    } else {
      setMessage('Modifications enregistrées avec succès !');
      setNewPassword('');
    }

    setSubmitting(false);
  };

  const handleCheckStatus = async () => {
    if (!user) return;

    setSubmitting(true);
    setMessage('');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (error) {
      setMessage(`Erreur de vérification : ${error.message}`);
    } else if (profile?.is_premium) {
      setIsPremium(true);
      localStorage.setItem("is_premium", "true");
      setMessage('Statut vérifié : Compte Premium actif !');
    } else {
      setIsPremium(false);
      localStorage.setItem("is_premium", "false");
      setMessage('Statut vérifié : Compte Standard (Non Premium).');
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-orange-500 animate-spin"></div>

          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase">
            Chargement du compte
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-orange-500 selection:text-black">

      {/* Décor arrière-plan */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/[0.035] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[450px] h-[450px] bg-orange-600/[0.025] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <button
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all"
          >
            <span className="w-9 h-9 rounded-xl bg-[#111114] border border-zinc-800 flex items-center justify-center group-hover:border-orange-500/40 group-hover:text-orange-400 transition-all">
              ←
            </span>

            <span className="hidden sm:block text-[10px] font-mono font-bold tracking-[0.18em] uppercase">
              Retour
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.7)]" />

            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
              Mon compte
            </span>
          </div>

        </div>


        {/* PROFIL */}
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-800/80 bg-[#101012] shadow-2xl mb-5">

          {/* Ligne orange supérieure */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />

          <div className="p-5 sm:p-7">

            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="relative shrink-0">

                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700 flex items-center justify-center shadow-xl">
                  <span className="text-2xl sm:text-3xl">
                    👤
                  </span>
                </div>

                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#101012] flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${isPremium ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-orange-500'}`} />
                </div>

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[9px] font-mono tracking-[0.25em] text-zinc-600 uppercase mb-1">
                  Profil utilisateur
                </p>

                <p className="text-sm sm:text-base font-semibold text-white truncate">
                  {user?.email}
                </p>

                <div className="mt-2">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-[0.15em] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase">
                      <span>⚡</span>
                      Premium actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-[0.15em] text-orange-400 bg-orange-500/[0.08] border border-orange-500/20 px-2.5 py-1 rounded-lg uppercase">
                      <span>○</span>
                      Compte gratuit
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>


        {/* MES MOTOS */}
        <button
          onClick={() => router.push('/dashboard')}
          className="group w-full relative overflow-hidden rounded-[24px] border border-zinc-800 bg-[#101012] hover:border-orange-500/30 transition-all duration-300 mb-5 shadow-xl"
        >

          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative p-5 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                🏍️
              </div>

              <div className="text-left">
                <p className="text-[9px] font-mono tracking-[0.2em] text-zinc-600 uppercase mb-1">
                  Garage
                </p>

                <p className="text-sm font-bold text-white">
                  Mes motos
                </p>

                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Gérer tes motos et diagnostics
                </p>
              </div>

            </div>

            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all">
              →
            </div>

          </div>

        </button>


        {/* PREMIUM */}
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[#101012] shadow-2xl mb-5">

          {isPremium && (
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.04] blur-[60px] rounded-full pointer-events-none" />
          )}

          {!isPremium && (
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/[0.06] blur-[60px] rounded-full pointer-events-none" />
          )}

          <div className="relative p-5 sm:p-7">

            <div className="flex items-start justify-between gap-4 mb-6">

              <div>
                <p className="text-[9px] font-mono font-bold tracking-[0.25em] text-zinc-600 uppercase mb-2">
                  Abonnement
                </p>

                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {isPremium ? 'Ton compte Premium' : 'Passe au niveau supérieur'}
                </h2>

                <p className="text-[11px] text-zinc-500 mt-1">
                  {isPremium
                    ? 'Ton accès Premium est actuellement actif.'
                    : 'Débloque toutes les fonctionnalités de ton espace.'
                  }
                </p>
              </div>

              {isPremium ? (
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                  ⚡
                </div>
              ) : (
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">
                  🔒
                </div>
              )}

            </div>


            {/* Avantages Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">

              <div className="flex items-center gap-3 rounded-xl bg-black/30 border border-zinc-800/70 px-3 py-3">
                <span className="text-sm">🔧</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Diagnostics avancés
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-black/30 border border-zinc-800/70 px-3 py-3">
                <span className="text-sm">🏍️</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Gestion des motos
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-black/30 border border-zinc-800/70 px-3 py-3">
                <span className="text-sm">⚡</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Accès illimité
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-black/30 border border-zinc-800/70 px-3 py-3">
                <span className="text-sm">📚</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Assistance technique
                </span>
              </div>

            </div>


            {!isPremium && (
              <button
                onClick={() => router.push('/upgrade')}
                className="group relative w-full overflow-hidden py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-[10px] font-black tracking-[0.12em] rounded-xl transition-all shadow-[0_8px_30px_rgba(249,115,22,0.18)]"
              >
                <span className="relative z-10">
                  PASSER AU PREMIUM — 9,99 €
                </span>
              </button>
            )}

            {isPremium && (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                <span className="text-emerald-400 text-xs">
                  ✓
                </span>

                <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-emerald-400 uppercase">
                  Abonnement Premium actif
                </span>
              </div>
            )}

          </div>
        </div>


        {/* VERIFICATION STATUT */}
        <div className="rounded-[24px] border border-zinc-800 bg-[#101012] shadow-xl mb-5">

          <div className="p-5">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <span className="text-sm">🔄</span>
                </div>

                <div>
                  <p className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    Vérification
                  </p>

                  <p className="text-[9px] text-zinc-600 mt-1">
                    Actualiser ton statut Premium
                  </p>
                </div>

              </div>

              <button
                onClick={handleCheckStatus}
                disabled={submitting}
                className="shrink-0 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[9px] font-mono font-bold text-zinc-300 hover:text-white transition-all disabled:opacity-50"
              >
                {submitting ? '...' : 'VÉRIFIER'}
              </button>

            </div>

          </div>
        </div>


        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-5 p-4 rounded-2xl text-[10px] font-mono leading-relaxed ${
              message.includes('Erreur')
                ? 'bg-red-500/[0.07] border border-red-500/20 text-red-400'
                : 'bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-sm">
                {message.includes('Erreur') ? '⚠️' : '✓'}
              </span>

              <span>
                {message}
              </span>
            </div>
          </div>
        )}


        {/* COMPTE / SECURITE */}
        <div className="rounded-[28px] border border-zinc-800 bg-[#101012] shadow-2xl overflow-hidden mb-5">

          <div className="px-5 sm:px-7 pt-6 pb-4 border-b border-zinc-800/70">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                🔐
              </div>

              <div>
                <p className="text-[9px] font-mono tracking-[0.25em] text-zinc-600 uppercase">
                  Paramètres
                </p>

                <h2 className="text-sm font-bold text-white mt-0.5">
                  Compte & sécurité
                </h2>
              </div>

            </div>

          </div>


          <div className="p-5 sm:p-7">

            <form onSubmit={handleUpdateAccount} className="space-y-5">

              {/* EMAIL */}
              <div>

                <label className="flex items-center gap-2 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2">
                  <span>✉️</span>
                  Adresse email
                </label>

                <div className="relative">

                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#08080a] border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/60 p-3.5 pl-4 rounded-xl text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/5 transition-all"
                  />

                </div>

              </div>


              {/* MOT DE PASSE */}
              <div>

                <label className="flex items-center gap-2 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2">
                  <span>🔑</span>
                  Nouveau mot de passe
                </label>

                <input
                  type="password"
                  placeholder="Laisser vide pour conserver l'actuel"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#08080a] border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/60 p-3.5 pl-4 rounded-xl text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/5 transition-all"
                />

                <p className="text-[8px] font-mono text-zinc-700 mt-2">
                  Le mot de passe ne sera modifié que si tu renseignes un nouveau mot de passe.
                </p>

              </div>


              {/* ENREGISTRER */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white font-mono text-[10px] font-bold tracking-[0.12em] rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? 'MISE À JOUR EN COURS...' : 'ENREGISTRER LES MODIFICATIONS'}
              </button>

            </form>

          </div>

        </div>


        {/* INFORMATIONS COMPTE */}
        <div className="rounded-[24px] border border-zinc-800/70 bg-[#0d0d0f] mb-5">

          <div className="p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-600 uppercase">
                  Informations
                </p>

                <p className="text-[10px] text-zinc-500 mt-2">
                  Statut actuel du compte
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-lg text-[8px] font-mono font-bold tracking-wider uppercase ${
                isPremium
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
              }`}>
                {isPremium ? 'PREMIUM' : 'STANDARD'}
              </div>

            </div>

          </div>

        </div>


        {/* ZONE DECONNEXION */}
        <div className="rounded-[24px] border border-red-500/10 bg-red-500/[0.025] p-5">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-[9px] font-mono font-bold tracking-[0.2em] text-red-500/60 uppercase">
                Zone de déconnexion
              </p>

              <p className="text-[10px] text-zinc-600 mt-1">
                Quitter ton compte sur cet appareil.
              </p>

            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("is_premium");
                router.push('/');
              }}
              className="shrink-0 px-4 py-2.5 bg-red-500/[0.06] border border-red-500/15 hover:bg-red-500/[0.12] hover:border-red-500/25 text-red-400 font-mono text-[9px] font-bold tracking-wider rounded-xl transition-all"
            >
              SE DÉCONNECTER
            </button>

          </div>

        </div>


        {/* FOOTER */}
        <div className="pt-6 text-center">

          <div className="flex items-center justify-center gap-2 mb-2">

            <div className="h-px w-8 bg-zinc-800" />

            <span className="text-[8px] font-mono tracking-[0.25em] text-zinc-700 uppercase">
              Garage
            </span>

            <div className="h-px w-8 bg-zinc-800" />

          </div>

          <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">
            Diagnostic • Maintenance • Motocross
          </p>

        </div>

      </div>
    </div>
  );
}