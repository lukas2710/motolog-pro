'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("is_premium", "true");
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-6 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-[#111114] border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-center">
        
        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
          PAIEMENT VALIDÉ
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Bienvenue dans l'Illimité</h1>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Ton compte a été mis à jour avec succès. Tu peux désormais ajouter autant de composants et d'entretiens que tu veux.
          </p>
        </div>

        <div className="bg-black/40 border border-zinc-800/80 p-4 rounded-2xl space-y-3 text-left">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-300">Statut du compte</span>
            <span className="text-emerald-400 font-bold">ACTIF (ILLIMITÉ)</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-500 leading-normal">
            Toutes les restrictions sur les composants ont été levées sur l'ensemble de ton garage.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            RETOURNER AU GARAGE
          </button>
        </div>

      </div>
    </div>
  );
}