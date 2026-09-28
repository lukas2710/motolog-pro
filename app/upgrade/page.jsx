'use client';
import { useState } from 'react';

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    // Remplace le lien ci-dessous par ton véritable lien de paiement Stripe
    window.location.href = 'https://buy.stripe.com/bJe9ASgyJ6hbd2v0e6f3a0l';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 p-8 rounded-2xl text-center space-y-4 max-w-md w-full shadow-xl">
        <h1 className="text-xl font-bold uppercase">Passer à la version Pro</h1>
        <p className="text-xs font-mono text-zinc-400">Débloque toutes les fonctionnalités de suivi pour ta moto.</p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl transition-all"
        >
          {loading ? 'REDIRECTION...' : 'SOUSCRIRE'}
        </button>
      </div>
    </div>
  );
}