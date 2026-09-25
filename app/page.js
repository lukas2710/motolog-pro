'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, on l'envoie sur le dashboard
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMessage('Compte créé ! Tu peux maintenant te connecter.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-[#121215] border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
            <span className="font-black text-2xl tracking-wider uppercase text-white">
              MotoLog <span className="text-xs text-orange-500 font-bold">PRO</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isSignUp ? 'Créer un compte' : 'Espace Connexion'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUp
              ? 'Crée ton espace pour suivre le carnet d’entretien de tes bécanes.'
              : 'Accède à ton garage et au suivi de tes machines.'}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs text-center font-bold">
            {message}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1 uppercase">
              Adresse Email
            </label>
            <input
              type="email"
              required
              placeholder="pilote@motolog.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1 uppercase">
              Mot de passe
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-extrabold p-3 rounded-xl text-sm uppercase tracking-wider transition shadow-lg shadow-orange-500/10 disabled:opacity-50"
          >
            {loading
              ? 'Chargement...'
              : isSignUp
              ? 'S’inscrire'
              : 'Se connecter'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
              setErrorMsg('');
            }}
            className="text-xs text-zinc-400 hover:text-orange-400 transition font-semibold"
          >
            {isSignUp
              ? 'Déjà un compte ? Connecte-toi'
              : 'Pas encore de compte ? S’inscrire'}
          </button>
        </div>
      </div>
    </div>
  );
}