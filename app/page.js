'use client';

import { useState } from 'react';
import { supabase } from './supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
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
        // Redirection directe par le navigateur pour forcer le chargement de la page dashboard
        window.location.href = '/dashboard';
      } else {
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage("Erreur de connexion.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#111114] border border-zinc-800 p-6 rounded-2xl space-y-6">
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight">Connexion Garage</h1>
          <p className="text-xs font-mono text-zinc-500 mt-1">Accède au suivi de tes motos</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2.5 text-sm text-white mt-1 focus:outline-none focus:border-orange-500"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-400">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2.5 text-sm text-white mt-1 focus:outline-none focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs uppercase py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}