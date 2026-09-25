'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const activatePremium = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Enregistre le statut dans le cloud Supabase lié à l'e-mail du compte
        await supabase.auth.updateUser({
          data: { is_premium: true }
        });
      }
      localStorage.setItem("is_premium", "true");
    };

    activatePremium();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md w-full bg-[#111114] border border-emerald-500/30 p-8 rounded-3xl space-y-4 shadow-2xl">
        <h1 className="text-xl font-black text-white">Paiement validé !</h1>
        <p className="text-xs text-zinc-400 font-mono">Ton compte est désormais en illimité sur tous tes appareils.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold rounded-xl transition-all"
        >
          Retourner au garage
        </button>
      </div>
    </div>
  );
}