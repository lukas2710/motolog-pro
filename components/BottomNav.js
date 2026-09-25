'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const [activeMotoId, setActiveMotoId] = useState(null);

  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'dashboard' && segments[1] && !['costs', 'maintenance'].includes(segments[1])) {
      const currentId = segments[1];
      setActiveMotoId(currentId);
      localStorage.setItem('last_selected_moto', currentId);
    } else {
      const savedId = localStorage.getItem('last_selected_moto');
      if (savedId) setActiveMotoId(savedId);
    }
  }, [pathname]);

  if (!pathname || pathname === '/' || pathname === '/login') return null;

  // Définition exacte des routes
  const homeLink = activeMotoId ? `/dashboard/${activeMotoId}` : '/dashboard';
  const maintenanceLink = activeMotoId ? `/dashboard/${activeMotoId}/maintenance` : '/dashboard';
  const costsLink = activeMotoId ? `/dashboard/${activeMotoId}/costs` : '/dashboard';
  const accountLink = '/account';

  // Détection de la page active
  const isAccueilActive = activeMotoId && pathname === `/dashboard/${activeMotoId}`;
  const isMaintenanceActive = pathname.includes('/maintenance');
  const isCostsActive = pathname.includes('/costs');
  const isAccountActive = pathname === '/account' || pathname === '/dashboard';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-zinc-800/80 z-[9999] px-3 py-2">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around">

        {/* ACCUEIL */}
        <Link
          href={homeLink}
          className={`flex flex-col items-center justify-center min-w-[55px] py-1 transition-all ${
            isAccueilActive ? 'text-orange-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xl md:text-2xl">🏠</span>
          <span className="text-[10px] md:text-xs tracking-tight mt-0.5 uppercase">Accueil</span>
        </Link>

        {/* ENTRETIEN */}
        <Link
          href={maintenanceLink}
          className={`flex flex-col items-center justify-center min-w-[55px] py-1 transition-all ${
            isMaintenanceActive ? 'text-orange-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xl md:text-2xl">🛠️</span>
          <span className="text-[10px] md:text-xs tracking-tight mt-0.5 uppercase">Entretien</span>
        </Link>

        {/* DÉPENSES */}
        <Link
          href={costsLink}
          className={`flex flex-col items-center justify-center min-w-[55px] py-1 transition-all ${
            isCostsActive ? 'text-orange-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xl md:text-2xl">👛</span>
          <span className="text-[10px] md:text-xs tracking-tight mt-0.5 uppercase">Dépenses</span>
        </Link>

        {/* MON COMPTE & VÉHICULES FUSIONNÉS */}
        <Link
          href={accountLink}
          className={`flex flex-col items-center justify-center min-w-[55px] py-1 transition-all ${
            isAccountActive ? 'text-orange-500 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="text-xl md:text-2xl">👤</span>
          <span className="text-[10px] md:text-xs tracking-tight mt-0.5 uppercase">Compte</span>
        </Link>

      </div>
    </nav>
  );
}