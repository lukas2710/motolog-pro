'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'; // Adapte selon ton import client habituel

// Initialise ton client supabase si ce n'est pas déjà fait ailleurs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Tu dois être connecté pour acheter.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke('creer-paiement', {
      body: { userId: user.id, email: user.email }
    });

    if (error || !data?.url) {
      console.error(error);
      alert("Erreur lors de la création de la session de paiement.");
      setLoading(false);
      return;
    }

    // Redirection vers Stripe
    window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-6 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-[#111114] border border-orange-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-center">
        
        <span className="text-[10px] font-mono font-bold tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full uppercase">
          ACCÈS ILLIMITÉ
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Débloquez tout le potentiel</h1>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Plus aucune limite de composants ni d'entretiens sur vos motos. Profitez d'un accès à vie complet.
          </p>
        </div>

        <div className="bg-black/40 border border-zinc-800/80 p-4 rounded-2xl space-y-3 text-left">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-300">Accès illimité à vie</span>
            <span className="text-orange-400 font-bold">9,99 €</span>
          </div>
          <ul className="text-[10px] font-mono text-zinc-500 space-y-1.5 list-disc list-inside">
            <li>Composants illimités par moto</li>
            <li>Gestion de toutes vos motos</li>
            <li>Suivi des coûts et statistiques</li>
          </ul>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "CHARGEMENT..." : "OBTENIR L'ILLIMITÉ (9,99 €)"}
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-2.5 bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs rounded-xl transition-colors"
          >
            Retour
          </button>
        </div>

      </div>
    </div>
  );
}