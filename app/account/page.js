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
      
      // Vérifie directement dans le compte Supabase (cloud) via user_metadata
      const cloudPremium = user.user_metadata?.is_premium === true;
      const localPremium = localStorage.getItem("is_premium") === "true";

      const premiumStatus = cloudPremium || localPremium;
      setIsPremium(premiumStatus);
      
      if (cloudPremium && !localPremium) {
        localStorage.setItem("is_premium", "true");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-6 pb-36 font-sans selection:bg-orange-500 selection:text-black">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl uppercase">
            👤 Mon Compte
          </span>
          <span className="text-xs font-mono text-zinc-500">{user?.email}</span>
        </div>

        {/* Statut du compte (Gratuit / Premium) */}
        <div className="bg-[#111114] border border-zinc-800/80 p-6 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Statut de l'abonnement</span>
            {isPremium ? (
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl uppercase shadow-lg shadow-emerald-500/10">
                ⚡ PREMIUM (ILLIMITÉ)
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl uppercase">
                🔒 COMPTE GRATUIT
              </span>
            )}
          </div>

          {!isPremium && (
            <div className="pt-2">
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                PASSER AU PREMIUM (9,99 €)
              </button>
            </div>
          )}
        </div>

        {/* Formulaire Modification Email / Mot de passe */}
        <div className="bg-[#111114] border border-zinc-800/80 p-6 rounded-3xl space-y-4 shadow-2xl">
          <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">Sécurité et Identifiants</h2>
          
          {message && (
            <div className={`p-3 rounded-xl text-xs font-mono ${message.includes('Erreur') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdateAccount} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Adresse email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Laisser vide pour ne pas changer"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold rounded-xl transition-all"
            >
              {submitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Déconnexion */}
        <div className="pt-2">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem("is_premium");
              router.push('/');
            }}
            className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-mono text-xs font-bold rounded-xl transition-all"
          >
            Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
}