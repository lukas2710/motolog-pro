import './globals.css';
import BottomNav from '../components/BottomNav';

export const metadata = {
  title: 'Suivi Moto',
  description: 'Application de suivi d\'entretien et dépenses moto',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-[#0a0a0c] text-zinc-100 antialiased pb-24">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}