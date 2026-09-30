'use client';

import { useState } from 'react';
import { supabase } from './supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data?.session) {
          window.location.href = '/dashboard';
        } else {
          setSuccessMessage('Compte créé avec succès ! Vérifie tes e-mails pour confirmer ton inscription, puis connecte-toi.');
          setLoading(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data?.session) {
          window.location.href = '/dashboard';
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setErrorMessage("Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Glow effect arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111114] border border-zinc-800/80 p-8 rounded-3xl space-y-6 shadow-2xl relative backdrop-blur-xl">
        
        {/* En-tête */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-bold">Garage Privé</span>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            {isSignUp ? "Configure ton accès pour enregistrer tes machines" : 'Accède au suivi de maintenance de ton garage'}
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl font-mono flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-2xl font-mono flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#18181b]/80 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono"
              placeholder="pilote@garage.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#18181b]/80 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Traitement en cours...' : (isSignUp ? "S'inscrire" : 'Se connecter')}
          </button>
        </form>

        {/* Bascule Connexion / Inscription */}
        <div className="text-center pt-2 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-xs font-mono text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>

      </div>
    </div>
  );
}