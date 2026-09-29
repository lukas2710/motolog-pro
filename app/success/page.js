'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';

export default function SuccessPage() {
  const router = useRouter();

  const handleActivateAndRedirect = async () => {
    localStorage.setItem("is_premium", "true");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', user.id);
    }

    router.push('/dashboard');
  };

  useEffect(() => {
    localStorage.setItem("is_premium", "true");
    
    const activatePremium = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', user.id);
      }
    };

    activatePremium();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-4 font-sans text-center selection:bg-emerald-500 selection:text-black">
      <div className="max-w-md w-full bg-[#111114] border border-emerald-500/30 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Animated Check Icon */}
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Paiement Validé</span>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Statut Illimité Activé</h1>
          <p className="text-xs text-zinc-400 font-mono">Ton compte est désormais mis à jour sur tous tes appareils.</p>
        </div>

        <button
          onClick={handleActivateAndRedirect}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          OK
        </button>

      </div>
    </div>
  );
}