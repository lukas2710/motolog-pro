"use client";

import { useMemo, useState, useEffect } from "react";

/*
  ============================================================
  DIAGNOSTIC MOTO / DIRT / MOTOCROSS
  ============================================================
*/

// ... (toutes les constantes ENGINE_TYPES, BIKE_FAMILIES, etc. restent identiques)

// [Garde toutes les constantes et fonctions utilitaires du fichier d'origine ici...]

export default function DiagnosticMotoPage() {
  // -----------------------------------------------------------------
  // GESTION PREMIUM / PAYWALL
  // -----------------------------------------------------------------
  const [isPremium, setIsPremium] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Vérifie ton statut premium (ici via localStorage ou ta logique Supabase/Stripe habituelle)
    // Adapte cette vérification selon la façon dont tu stockes le statut sur tes autres pages
    const checkPremiumStatus = () => {
      const storedPremium = localStorage.getItem("is_premium");
      if (storedPremium === "true") {
        setIsPremium(true);
      }
      setLoadingAuth(false);
    };
    checkPremiumStatus();
  }, []);

  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    engine: null,
    family: null,
    displacement: null,
    model: null,
    symptom: null,
  });
  const [answers, setAnswers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Si la vérification est en cours
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  // SI PAS PREMIUM : BLOCAGE DE LA PAGE COMME SUR TES AUTRES PAGES
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Contenu Réservé aux Membres Premium</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Cette page de diagnostic avancé est bloquée. Débloque l'accès complet pour l'utiliser.
          </p>
          <button
            onClick={() => {
              // Simulation ou redirection vers ton lien Stripe / Checkout
              window.location.href = "/upgrade"; 
            }}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl transition text-white"
          >
            Débloquer l'accès (Premium)
          </button>
          <p className="text-xs text-zinc-500 mt-4">
            Déjà client ? Connecte-toi ou vérifie ton compte.
          </p>
        </div>
      </div>
    );
  }

  // CODE NORMAL DE LA PAGE SI PREMIUM
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl font-bold">DIAGNOSTIC MOTO / DIRT / MOTOCROSS</h1>
            <p className="text-xs text-emerald-400 font-mono mt-1">✓ Accès Premium Débloqué</p>
          </div>
        </header>

        {/* Le reste de ton application / questionnaire de diagnostic */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-300">Bienvenue dans ton outil de diagnostic interactif.</p>
          {/* Insère ici le rendu habituel de ton composant (step, questions, solutions) */}
        </div>
      </div>
    </div>
  );
}

const ENGINE_TYPES = [
  {
    id: "2t",
    title: "2 TEMPS",
    icon: "⚡",
    description: "Carburation, clapets, échappement, compression, allumage...",
  },
  {
    id: "4t",
    title: "4 TEMPS",
    icon: "🔥",
    description: "Soupapes, distribution, injection/carbu, décompresseur...",
  },
];

const BIKE_FAMILIES = [
  {
    id: "mx",
    title: "Motocross / Enduro",
    icon: "🏁",
    description: "YZ, CRF, KX, KTM, Husqvarna, GasGas, Beta...",
  },
  {
    id: "dirt",
    title: "Dirt / Pit Bike",
    icon: "🛠️",
    description: "YCF, CRZ, Apollo, Bastos, BSE, moteurs YX, Zongshen...",
  },
  {
    id: "other",
    title: "Autre / je ne sais pas",
    icon: "❓",
    description: "Mini-cross, préparation, moteur remplacé...",
  },
];

const DISPLACEMENTS = [
  "50",
  "65",
  "85",
  "88",
  "110",
  "125",
  "140",
  "150",
  "160",
  "190",
  "200",
  "250",
  "300",
  "350",
  "450",
  "500+",
  "Autre",
];

const DIRT_MODEL_SUGGESTIONS = [
  "YCF Start 88",
  "YCF Start 125",
  "YCF Pilot 125",
  "YCF Pilot 150",
  "YCF Bigy 150",
  "YCF Factory 150",
  "YCF Factory 190",
  "YCF Bigy 190 Daytona",
  "CRZ ERZ 150",
  "CRZ ERZ 250",
  "CRZ ERZ 300",
  "Apollo 125",
  "Pit Bike 125",
  "Pit Bike 140",
  "Pit Bike 160",
  "Pit Bike 190",
  "Autre",
];

const MX_MODEL_SUGGESTIONS = [
  "Yamaha YZ 85",
  "Yamaha YZ 125",
  "Yamaha YZ 250",
  "Yamaha YZ 250F",
  "Yamaha YZ 450F",
  "Honda CRF 250R",
  "Honda CRF 450R",
  "Kawasaki KX 250",
  "Kawasaki KX 450",
  "KTM 85 SX",
  "KTM 125 SX",
  "KTM 250 SX",
  "KTM 250 SX-F",
  "KTM 350 SX-F",
  "KTM 450 SX-F",
  "Husqvarna TC 125",
  "Husqvarna TC 250",
  "Husqvarna FC 250",
  "Husqvarna FC 450",
  "GasGas MC 125",
  "GasGas MC 250",
  "GasGas MC 250F",
  "GasGas MC 450F",
  "Autre",
];

const SYMPTOMS = [
  {
    id: "starting",
    icon: "🔑",
    title: "Elle ne démarre pas",
    description: "Pas de démarrage, démarreur, kick, essence, étincelle...",
  },
  {
    id: "running",
    icon: "🏍️",
    title: "Elle démarre mais fonctionne mal",
    description: "Broute, cale, trous à l'accélération, manque de puissance...",
  },
  {
    id: "electrical",
    icon: "⚡",
    title: "Problème électrique",
    description: "Batterie, démarreur, phare, coupures, stator, CDI, injection...",
  },
  {
    id: "engine",
    icon: "🔧",
    title: "Bruit / moteur",
    description: "Claquement, sifflement, fumée, chauffe, huile, compression...",
  },
  {
    id: "clutch",
    icon: "⚙️",
    title: "Embrayage / boîte",
    description: "Patine, accroche, vitesses difficiles, faux point mort...",
  },
  {
    id: "chassis",
    icon: "🛞",
    title: "Freins / suspension / roues",
    description: "Fourche, amortisseur, freins, roulements, direction...",
  },
  {
    id: "fuel",
    icon: "⛽",
    title: "Essence / carburation / injection",
    description: "Carbu, gicleurs, richesse, injecteur, pompe, arrivée d'essence...",
  },
  {
    id: "cooling",
    icon: "🌡️",
    title: "Elle chauffe",
    description: "Surchauffe, liquide, radiateur, ventilateur, pompe à eau...",
  },
  {
    id: "maintenance",
    icon: "🧰",
    title: "Entretien / contrôle général",
    description: "Je veux savoir quoi vérifier avant de rouler.",
  },
];

/* ============================================================
   OUTILS
============================================================ */

function youtubeSearch(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}`;
}

/* ============================================================
   SOLUTIONS
============================================================ */

const SOLUTIONS = {
  battery: {
    title: "Contrôler la batterie",
    icon: "🔋",
    level: "Facile",
    tools: "Multimètre + chargeur de batterie",
    tutorial: [
      "Coupe le contact et vérifie que les cosses sont propres et serrées.",
      "Inspecte les câbles positif et négatif jusqu'au châssis/moteur.",
      "Mesure la tension batterie au repos.",
      "Si elle est basse, recharge-la puis refais la mesure.",
      "Si elle chute fortement pendant le démarrage, contrôle la batterie et les connexions.",
      "Compare toujours les valeurs aux indications du constructeur.",
    ],
    safety:
      "Ne crée jamais de court-circuit directement entre les bornes de batterie.",
    videoQuery: "tester batterie moto motocross multimètre",
  },

  starter: {
    title: "Contrôler le démarreur électrique",
    icon: "⚙️",
    level: "Intermédiaire",
    tools: "Multimètre + clés",
    tutorial: [
      "Vérifie d'abord la batterie et les masses.",
      "Actionne le bouton de démarreur et écoute le comportement.",
      "Un simple clic peut orienter vers relais, batterie ou câble.",
      "Si le relais colle mais que le moteur ne tourne pas, contrôle le câble vers le démarreur.",
      "Contrôle ensuite le démarreur selon la procédure du manuel.",
      "Ne remplace pas le démarreur avant d'avoir contrôlé alimentation et masse.",
    ],
    safety:
      "Mets la moto au point mort et éloigne la chaîne de tout objet avant un test.",
    videoQuery: "tester démarreur moto motocross relais démarreur",
  },

  fuelFlow: {
    title: "Contrôler l'arrivée d'essence",
    icon: "⛽",
    level: "Facile",
    tools: "Récipient propre + pince + chiffons",
    tutorial: [
      "Vérifie qu'il y a réellement du carburant dans le réservoir.",
      "Contrôle le robinet si la moto en possède un.",
      "Débranche la durite au point prévu pour le contrôle.",
      "Vérifie que le carburant arrive correctement.",
      "Contrôle filtre, durite pincée et mise à l'air du bouchon.",
      "Sur injection, la pompe et le circuit haute pression demandent une méthode spécifique.",
    ],
    safety:
      "Travaille moteur froid, loin d'une flamme, cigarette ou étincelle.",
    videoQuery: "tester arrivée essence moto carburateur motocross",
  },

  carburetor: {
    title: "Nettoyer et contrôler le carburateur",
    icon: "🧪",
    level: "Intermédiaire",
    tools: "Tournevis + nettoyant carburateur + air comprimé",
    tutorial: [
      "Ferme l'essence avant de démonter.",
      "Retire la cuve et inspecte les dépôts.",
      "Démonte les gicleurs sans les agrandir avec un fil métallique.",
      "Souffle les conduits à l'air comprimé.",
      "Contrôle le flotteur et le pointeau.",
      "Vérifie également la mise à l'air de la cuve.",
      "Remonte avec les réglages correspondant au modèle.",
    ],
    safety:
      "Ne souffle jamais un carburateur vers ton visage et ne travaille pas près d'une flamme.",
    videoQuery: "nettoyage carburateur dirt bike motocross gicleur flotteur",
  },

  airFilter: {
    title: "Contrôler le filtre à air",
    icon: "🌬️",
    level: "Facile",
    tools: "Produit filtre à air + huile filtre + produit nettoyant",
    tutorial: [
      "Retire le filtre et inspecte son état.",
      "Un filtre mousse doit être propre et correctement huilé.",
      "Un filtre trop chargé peut réduire fortement les performances.",
      "Un filtre mal monté peut laisser passer de la poussière.",
      "Nettoie également la boîte à air.",
      "Vérifie que le filtre est parfaitement étanche sur son support.",
    ],
    safety:
      "Ne roule jamais en tout-terrain avec un filtre absent ou mal monté.",
    videoQuery: "nettoyer huiler filtre à air motocross dirt bike",
  },

  sparkPlug: {
    title: "Contrôler la bougie",
    icon: "⚡",
    level: "Facile",
    tools: "Clé à bougie + bougie adaptée",
    tutorial: [
      "Débranche l'antiparasite.",
      "Démonte la bougie avec la bonne clé.",
      "Observe son état : humide, sèche, très noire, blanche, endommagée.",
      "Contrôle l'étincelle avec un outil adapté.",
      "Ne te fie pas uniquement à une étincelle visible à l'air libre pour conclure.",
      "Si la bougie est douteuse, essaye une bougie connue bonne du bon modèle.",
    ],
    safety:
      "Pour un test d'étincelle, éloigne les vapeurs d'essence et utilise une méthode prévue pour cet usage.",
    videoQuery: "tester bougie étincelle motocross dirt bike",
  },

  ignition: {
    title: "Diagnostiquer l'allumage",
    icon: "⚡",
    level: "Intermédiaire",
    tools: "Multimètre + testeur d'étincelle",
    tutorial: [
      "Commence par la bougie.",
      "Puis contrôle antiparasite et câble haute tension.",
      "Inspecte les masses et connecteurs.",
      "Contrôle ensuite bobine et alimentation selon le manuel.",
      "Le stator et le capteur d'allumage peuvent être contrôlés au multimètre.",
      "Le CDI est généralement diagnostiqué par élimination plutôt que par une simple mesure.",
    ],
    safety:
      "Les systèmes d'allumage produisent une haute tension : utilise un testeur prévu pour cela.",
    videoQuery: "diagnostic stator CDI bobine allumage motocross multimètre",
  },

  stator: {
    title: "Contrôler le stator / capteur d'allumage",
    icon: "🧲",
    level: "Avancé",
    tools: "Multimètre",
    tutorial: [
      "Identifie les fils correspondant au stator et au capteur d'allumage.",
      "Débranche le connecteur avant les mesures de résistance si le manuel le demande.",
      "Mesure les bobinages selon la procédure constructeur.",
      "Contrôle également les éventuels défauts à la masse.",
      "Sur certains systèmes, une mesure de tension AC pendant le lancement est nécessaire.",
      "Compare chaque valeur avec le manuel de ton moteur.",
    ],
    safety:
      "Ne conclus pas à un CDI HS uniquement parce que le moteur ne démarre pas.",
    videoQuery: "tester stator CDI motocross multimètre",
  },

  compression: {
    title: "Contrôler la compression",
    icon: "📈",
    level: "Intermédiaire",
    tools: "Compressiomètre adapté",
    tutorial: [
      "Moteur dans les conditions prévues par le constructeur.",
      "Installe le compressiomètre avec l'adaptateur adapté.",
      "Effectue le nombre de cycles demandé par la procédure.",
      "Note la valeur obtenue.",
      "Compare-la aux données du manuel correspondant exactement à ton moteur.",
      "Une compression basse peut orienter vers piston, segments, cylindre, soupapes ou étanchéité de culasse selon le moteur.",
    ],
    safety:
      "Ne démonte pas le moteur uniquement sur une impression de compression au kick.",
    videoQuery: "test compression moteur motocross compressiomètre",
  },

  reeds: {
    title: "Contrôler les clapets 2T",
    icon: "🪽",
    level: "Intermédiaire",
    tools: "Tournevis + éclairage",
    tutorial: [
      "Dépose la boîte à air ou l'admission selon le modèle.",
      "Accède à la boîte à clapets.",
      "Inspecte chaque lamelle.",
      "Recherche fissure, éclat, déformation ou fermeture imparfaite.",
      "Contrôle également le support et son étanchéité.",
      "Remplace les éléments endommagés par les références prévues pour le moteur.",
    ],
    safety:
      "Évite que des saletés tombent dans l'admission pendant le démontage.",
    videoQuery: "contrôler clapets 2 temps motocross YZ 125",
  },

  powerValve: {
    title: "Contrôler la valve d'échappement 2T",
    icon: "💨",
    level: "Avancé",
    tools: "Outillage moteur + manuel atelier",
    tutorial: [
      "Identifie le système de valve utilisé par le moteur.",
      "Contrôle que le mécanisme n'est pas bloqué par la calamine.",
      "Vérifie les câbles, tringleries ou servomoteurs lorsqu'il y en a.",
      "Vérifie le montage et le calage si le moteur a été démonté.",
      "Ne règle pas une valve avec une valeur trouvée sur une autre moto.",
      "Utilise la procédure correspondant à l'année et au moteur.",
    ],
    safety:
      "Une mauvaise intervention sur la valve peut provoquer un fonctionnement anormal du moteur.",
    videoQuery: "réglage nettoyage valve échappement 2 temps motocross",
  },

  valves: {
    title: "Contrôler le jeu aux soupapes",
    icon: "🔩",
    level: "Avancé",
    tools: "Jeu de cales + outillage moteur + manuel atelier",
    tutorial: [
      "Moteur froid si la procédure constructeur le demande.",
      "Positionne le moteur au repère prévu.",
      "Vérifie que le piston est dans la position demandée.",
      "Mesure chaque jeu avec les cales adaptées.",
      "Compare admission et échappement avec les valeurs exactes du manuel.",
      "Si le jeu est hors tolérance, détermine le système de pastilles/réglage utilisé.",
    ],
    safety:
      "Une erreur de calage ou de mesure peut provoquer des dégâts moteur.",
    videoQuery: "contrôle réglage jeu soupapes motocross 4 temps",
  },

  timing: {
    title: "Contrôler la distribution",
    icon: "⛓️️",
    level: "Avancé",
    tools: "Clés moteur + manuel atelier",
    tutorial: [
      "Place le moteur sur le repère prévu.",
      "Contrôle la position du vilebrequin.",
      "Vérifie les repères d'arbre à cames.",
      "Contrôle également la chaîne et le tendeur.",
      "Si le moteur a été récemment démonté, suspecte particulièrement un mauvais calage.",
      "Ne fais jamais tourner un moteur à la force si la distribution semble bloquée.",
    ],
    safety:
      "Une distribution mal calée peut entraîner un contact piston/soupape.",
    videoQuery: "calage distribution moteur motocross 4 temps",
  },

  crankSeal2T: {
    title: "Rechercher une prise d'air / joint spi de vilebrequin 2T",
    icon: "💨",
    level: "Avancé",
    tools: "Outillage de contrôle d'étanchéité",
    tutorial: [
      "Un 2T peut présenter des symptômes de prise d'air sans fuite visible.",
      "Contrôle d'abord admission, pipe, clapets et carburateur.",
      "Inspecte les joints accessibles.",
      "Pour confirmer un problème de joint spi ou de carter, réalise un test d'étanchéité adapté au moteur.",
      "Une variation anormale du comportement peut orienter vers une prise d'air.",
      "Ne continue pas à rouler si le mélange devient très pauvre.",
    ],
    safety:
      "Une prise d'air importante sur un 2T peut provoquer une carburation dangereusement pauvre.",
    videoQuery: "test étanchéité moteur 2 temps joint spi vilebrequin motocross",
  },

  injector: {
    title: "Contrôler l'injection",
    icon: "💉",
    level: "Avancé",
    tools: "Multimètre + diagnostic adapté + manuel",
    tutorial: [
      "Commence par écouter la pompe lors de la mise sous contact lorsqu'elle est présente.",
      "Contrôle alimentation électrique et masse.",
      "Inspecte les connecteurs.",
      "Contrôle les symptômes liés à l'injecteur.",
      "Selon le modèle, les capteurs TPS, température, pression ou position moteur peuvent influencer l'injection.",
      "Ne remplace pas un injecteur ou un calculateur sans diagnostic.",
    ],
    safety:
      "Le circuit d'injection peut fonctionner sous pression. Respecte la procédure du constructeur.",
    videoQuery: "diagnostic injection EFI motocross injecteur TPS",
  },

  fuelPump: {
    title: "Contrôler la pompe à essence",
    icon: "⛽",
    level: "Intermédiaire",
    tools: "Multimètre + manomètre selon modèle",
    tutorial: [
      "Écoute si la pompe s'amorce lorsque le contact est mis.",
      "Contrôle son alimentation électrique.",
      "Inspecte les connecteurs.",
      "Vérifie le filtre ou tamis si accessible.",
      "Si nécessaire, contrôle la pression selon les données du manuel.",
      "Une pompe peut fonctionner électriquement tout en fournissant une pression insuffisante.",
    ],
    safety:
      "Dépressurise le circuit selon la procédure constructeur avant intervention.",
    videoQuery: "tester pompe essence injection moto pression",
  },

  coolant: {
    title: "Contrôler le circuit de refroidissement",
    icon: "🌡️",
    level: "Intermédiaire",
    tools: "Lampe + liquide adapté + outils",
    tutorial: [
      "Laisse le moteur refroidir complètement.",
      "Contrôle le niveau de liquide au point prévu.",
      "Inspecte durites, radiateurs et raccords.",
      "Recherche une fuite.",
      "Vérifie si les radiateurs sont bouchés par boue ou terre.",
      "Contrôle pompe à eau et circulation si nécessaire.",
      "Si la moto possède un ventilateur, contrôle également son fonctionnement.",
    ],
    safety:
      "N'ouvre jamais un circuit de refroidissement chaud sous pression.",
    videoQuery: "diagnostic surchauffe motocross radiateur pompe à eau",
  },

  exhaust: {
    title: "Contrôler l'échappement",
    icon: "💨",
    level: "Facile",
    tools: "Clés + lampe",
    tutorial: [
      "Inspecte le collecteur et le silencieux.",
      "Recherche fuite, fissure ou fixation desserrée.",
      "Sur un 2T, contrôle l'état du silencieux et de sa laine.",
      "Vérifie qu'aucun corps étranger ne bloque la sortie.",
      "Contrôle également les joints d'échappement.",
      "Une fuite peut modifier le comportement et le bruit.",
    ],
    safety:
      "Interviens uniquement sur un échappement froid.",
    videoQuery: "contrôle échappement silencieux motocross 2 temps",
  },

  oil: {
    title: "Contrôler huile et lubrification",
    icon: "🛢️",
    level: "Facile",
    tools: "Huile adaptée + bac + manuel",
    tutorial: [
      "Vérifie le niveau selon la position demandée par le constructeur.",
      "Contrôle la couleur et l'état général.",
      "Recherche une odeur ou contamination inhabituelle.",
      "Inspecte les éventuelles fuites.",
      "Si une vidange est nécessaire, utilise exactement la viscosité et quantité prévues.",
      "Inspecte l'ancienne huile pour détecter une présence anormale de particules métalliques.",
    ],
    safety:
      "Ne fais pas fonctionner le moteur avec un niveau d'huile insuffisant.",
    videoQuery: "vidange huile motocross 4 temps contrôle niveau",
  },

  clutch: {
    title: "Contrôler l'embrayage",
    icon: "⚙️",
    level: "Intermédiaire",
    tools: "Clés + manuel + éventuellement pied à coulisse",
    tutorial: [
      "Contrôle d'abord la garde au levier.",
      "Vérifie le fonctionnement du câble ou du système hydraulique.",
      "Si l'embrayage patine, contrôle l'état des disques et ressorts.",
      "Si l'embrayage reste entraîné, recherche problème de commande ou disques collés.",
      "Vérifie également l'huile adaptée au moteur.",
      "Compare l'épaisseur des composants avec les limites constructeur.",
    ],
    safety:
      "Une moto dont l'embrayage ou la commande présente un défaut important ne doit pas être utilisée normalement.",
    videoQuery: "diagnostic embrayage motocross patine accroche",
  },

  gearbox: {
    title: "Contrôler la boîte de vitesses",
    icon: "⚙️️",
    level: "Avancé",
    tools: "Manuel atelier + outillage moteur",
    tutorial: [
      "Note précisément les rapports concernés.",
      "Vérifie d'abord réglage de commande et sélecteur.",
      "Contrôle le niveau et l'état de l'huile.",
      "Si une vitesse saute sous charge, ne te contente pas de régler le sélecteur.",
      "Une usure interne peut concerner pignons, crabots, fourchette ou mécanisme de sélection.",
      "Un démontage peut être nécessaire pour confirmer.",
    ],
    safety:
      "Si une vitesse saute brutalement ou si la boîte se bloque, évite de rouler.",
    videoQuery: "diagnostic boîte vitesse motocross vitesse saute",
  },

  brakes: {
    title: "Contrôler le freinage",
    icon: "🛑",
    level: "Intermédiaire",
    tools: "Clés + liquide adapté + purgeur",
    tutorial: [
      "Contrôle l'état des plaquettes.",
      "Inspecte le disque.",
      "Recherche une fuite au maître-cylindre, durite ou étrier.",
      "Un levier spongieux peut indiquer de l'air dans le circuit.",
      "Purge uniquement avec le liquide recommandé.",
      "Contrôle également le retour du piston et l'état des joints.",
    ],
    safety:
      "Un frein qui fuit, reste spongieux ou ne freine plus correctement = pas de roulage.",
    videoQuery: "purge frein motocross dirt bike frein hydraulique",
  },

  fork: {
    title: "Contrôler la fourche",
    icon: "🔧",
    level: "Intermédiaire",
    tools: "Chiffon + pied d'atelier si possible",
    tutorial: [
      "Nettoie les tubes avant inspection.",
      "Recherche une trace d'huile.",
      "Contrôle les joints spi et caches-poussière.",
      "Vérifie que les tubes ne sont pas rayés.",
      "Contrôle également les roulements de direction et l'alignement.",
      "Si la fourche fuit fortement, prévois une révision.",
    ],
    safety:
      "Une fuite importante peut contaminer le frein avant.",
    videoQuery: "diagnostic fuite joint spi fourche motocross",
  },

  shock: {
    title: "Contrôler l'amortisseur arrière",
    icon: "🔩",
    level: "Avancé",
    tools: "Pied d'atelier + manuel suspension",
    tutorial: [
      "Recherche toute fuite d'huile.",
      "Contrôle le comportement en compression et détente.",
      "Observe si la moto s'enfonce anormalement.",
      "Inspecte les biellettes et roulements.",
      "Vérifie les réglages sans les modifier tous en même temps.",
      "Pour une intervention interne ou recharge gaz, utilise un professionnel équipé.",
    ],
    safety:
      "Ne démonte pas une bonbonne d'amortisseur sous pression.",
    videoQuery: "diagnostic amortisseur arrière motocross suspension",
  },

  bearings: {
    title: "Contrôler les roulements",
    icon: "⭕",
    level: "Intermédiaire",
    tools: "Lève-moto + mains",
    tutorial: [
      "Soulève la roue concernée.",
      "Fais tourner la roue et écoute les bruits.",
      "Recherche du jeu latéral.",
      "Pour la direction, contrôle le point dur autour du centre.",
      "Contrôle également les roulements de bras oscillant et biellettes.",
      "Remplace tout roulement présentant jeu ou fonctionnement irrégulier.",
    ],
    safety:
      "Un roulement de roue ou de direction fortement endommagé peut compromettre le contrôle de la moto.",
    videoQuery: "contrôle roulement roue direction motocross",
  },

  chain: {
    title: "Contrôler chaîne et transmission",
    icon: "⛓️",
    level: "Facile",
    tools: "Réglet + clés + graisse chaîne",
    tutorial: [
      "Contrôle la tension au point indiqué par le constructeur.",
      "Vérifie l'alignement de la roue.",
      "Inspecte chaîne, pignon et couronne.",
      "Recherche dents très pointues ou chaîne présentant des points durs.",
      "Nettoie avant lubrification.",
      "Après réglage, serre l'axe de roue au couple constructeur.",
    ],
    safety:
      "Ne règle jamais une chaîne moteur en marche.",
    videoQuery: "réglage tension chaîne motocross dirt bike",
  },

  throttle: {
    title: "Contrôler la poignée de gaz",
    icon: "🕹️",
    level: "Facile",
    tools: "Clés + lubrifiant câble",
    tutorial: [
      "Tourne la poignée moteur arrêté.",
      "Elle doit revenir librement.",
      "Inspecte le câble sur toute sa longueur.",
      "Recherche un câble pincé ou effiloché.",
      "Contrôle également le boîtier de gaz.",
      "Sur injection, vérifie aussi le retour mécanique du papillon.",
    ],
    safety:
      "Si la poignée ne revient pas librement, ne roule pas.",
    videoQuery: "contrôle réglage câble accélérateur motocross",
  },

  steering: {
    title: "Contrôler la direction",
    icon: "🛞",
    level: "Intermédiaire",
    tools: "Lève-moto + clés",
    tutorial: [
      "Soulève l'avant.",
      "Tourne le guidon doucement de gauche à droite.",
      "Recherche un point dur au centre.",
      "Contrôle le jeu en tirant et poussant la fourche.",
      "Inspecte les roulements et le serrage des tés.",
      "Après intervention, respecte les couples de serrage constructeur.",
    ],
    safety:
      "Un jeu important ou point dur dans la direction doit être corrigé avant de rouler.",
    videoQuery: "contrôle roulement colonne direction motocross",
  },

  wheel: {
    title: "Contrôler une roue",
    icon: "🛞",
    level: "Facile",
    tools: "Lève-moto + clé à rayons si nécessaire",
    tutorial: [
      "Contrôle la pression du pneu.",
      "Inspecte le pneu pour coupure ou hernie.",
      "Fais tourner la roue et recherche un voile important.",
      "Contrôle les rayons sur une roue à rayons.",
      "Recherche un jeu au niveau du moyeu.",
      "Vérifie également le serrage et les entretoises.",
    ],
    safety:
      "Un pneu endommagé ou un jeu important de roue nécessite une réparation avant roulage.",
    videoQuery: "contrôle roue rayons roulement motocross",
  },

  intakeLeak: {
    title: "Rechercher une prise d'air à l'admission",
    icon: "🌬️",
    level: "Intermédiaire",
    tools: "Inspection visuelle + outil de test adapté",
    tutorial: [
      "Inspecte la pipe d'admission.",
      "Contrôle les colliers.",
      "Recherche fissures et déformation.",
      "Sur carburateur, vérifie la fixation du carburateur.",
      "Sur injection, contrôle le corps de papillon et ses joints.",
      "Pour confirmer une fuite, utilise une méthode de test adaptée au moteur.",
    ],
    safety:
      "Évite de pulvériser des produits inflammables autour d'un moteur chaud pour chercher une fuite.",
    videoQuery: "tester prise air admission motocross dirt bike",
  },

  coolingFan: {
    title: "Contrôler ventilateur / température",
    icon: "🌡️️",
    level: "Intermédiaire",
    tools: "Multimètre + manuel",
    tutorial: [
      "Vérifie si la moto possède réellement un ventilateur.",
      "Contrôle fusible et alimentation.",
      "Inspecte le connecteur.",
      "Contrôle le capteur ou système de commande selon le modèle.",
      "Vérifie que le radiateur n'est pas bouché par la boue.",
      "Si le ventilateur ne fonctionne pas, ne remplace pas immédiatement le moteur du ventilateur.",
    ],
    safety:
      "Un moteur qui chauffe anormalement doit être arrêté avant d'être endommagé.",
    videoQuery: "tester ventilateur radiateur motocross",
  },

  maintenance: {
    title: "Faire le contrôle général avant roulage",
    icon: "🧰",
    level: "Facile",
    tools: "Clés + pression pneus + produits entretien",
    tutorial: [
      "Contrôle huile et liquide de refroidissement si présents.",
      "Contrôle filtre à air.",
      "Vérifie chaîne, couronne et pignon.",
      "Contrôle pression et état des pneus.",
      "Vérifie rayons, roues et roulements.",
      "Contrôle freins et commandes.",
      "Recherche vis desserrées ou pièces fissurées.",
      "Après lavage, sèche et lubrifie les zones nécessaires.",
    ],
    safety:
      "Une moto tout-terrain doit être contrôlée avant chaque sortie, particulièrement après une chute.",
    videoQuery: "checklist entretien avant roulage motocross dirt bike",
  },

  oilLeak: {
    title: "Rechercher une fuite d'huile",
    icon: "🛢️",
    level: "Facile",
    tools: "Nettoyant + lampe + chiffons",
    tutorial: [
      "Nettoie d'abord complètement la zone.",
      "Fais tourner le moteur quelques instants si nécessaire et si cela reste sûr.",
      "Recherche l'origine exacte de la fuite.",
      "Contrôle bouchon de vidange, couvercle, carter, joints et axe concerné.",
      "Vérifie le niveau d'huile.",
      "Si une fuite provient d'un carter fissuré ou d'un joint interne, programme une réparation.",
    ],
    safety:
      "Ne roule pas avec une fuite importante ou une baisse rapide du niveau d'huile.",
    videoQuery: "trouver fuite huile moteur motocross dirt bike",
  },
};

/* ============================================================
   QUESTIONS
============================================================ */

function buildQuestions(profile) {
  const questions = [];

  if (profile.symptom === "starting") {
    questions.push({
      id: "start_method",
      icon: "🔑",
      title: "Comment démarres-tu la moto ?",
      description: "Cela permet de séparer immédiatement les problèmes de lancement.",
      choices: [
        {
          id: "electric",
          label: "Démarreur électrique",
          hint: "Bouton / démarreur",
        },
        {
          id: "kick",
          label: "Kick uniquement",
          hint: "Pas de démarreur électrique",
        },
        {
          id: "both",
          label: "Les deux",
          hint: "Kick + démarreur",
        },
      ],
    });

    questions.push({
      id: "start_rotation",
      icon: "🔄",
      title: "Quand tu lances le moteur, que se passe-t-il ?",
      description: "Écoute et ressens le comportement du moteur.",
      choices: [
        {
          id: "normal",
          label: "Le moteur tourne normalement",
          hint: "Il entraîne correctement le moteur",
        },
        {
          id: "slow",
          label: "Il tourne lentement / clic",
          hint: "Démarreur faible ou lancement difficile",
        },
        {
          id: "blocked",
          label: "Il ne tourne pas / kick bizarre",
          hint: "Blocage ou résistance anormale",
        },
      ],
    });

    questions.push({
      id: "start_blocked",
      icon: "🚨",
      title: "Quand tu dis qu'il ne tourne pas, lequel correspond ?",
      description: "Cette réponse est importante avant de chercher l'essence ou l'allumage.",
      when: (a) => a.start_rotation === "blocked",
      choices: [
        {
          id: "locked",
          label: "Bloqué net",
          hint: "Le moteur refuse de tourner",
        },
        {
          id: "kickback",
          label: "Le kick revient violemment",
          hint: "Retour / à-coup",
        },
        {
          id: "gear",
          label: "Ça semble lié à la transmission",
          hint: "Vitesse / roue / embrayage",
        },
      ],
    });

    questions.push({
      id: "start_battery",
      icon: "🔋",
      title: "As-tu contrôlé la batterie ?",
      description: "Une batterie faible peut faire tourner le démarreur sans permettre un lancement correct.",
      when: (a) =>
        (a.start_method === "electric" || a.start_method === "both") &&
        a.start_rotation === "slow",
      choices: [
        {
          id: "good",
          label: "Elle semble bonne",
          hint: "Tension contrôlée",
        },
        {
          id: "low",
          label: "Elle est faible",
          hint: "Démarreur lent / batterie faible",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Jamais mesurée",
        },
      ],
    });

    questions.push({
      id: "start_fuel",
      icon: "⛽",
      title: "L'essence arrive-t-elle correctement ?",
      description: "Contrôle robinet, durite, filtre, mise à l'air et alimentation.",
      when: (a) =>
        a.start_rotation === "normal" || a.start_rotation === "slow",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Carburant présent à l'admission",
        },
        {
          id: "no",
          label: "Non",
          hint: "Pas d'arrivée d'essence",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas encore contrôlé",
        },
      ],
    });

    questions.push({
      id: "start_spark",
      icon: "⚡",
      title: "As-tu une étincelle correcte à la bougie ?",
      description: "Il faut distinguer absence, étincelle faible et étincelle correcte.",
      when: (a) =>
        a.start_rotation === "normal" || a.start_rotation === "slow",
      choices: [
        {
          id: "strong",
          label: "Oui, forte et régulière",
          hint: "Test effectué correctement",
        },
        {
          id: "weak",
          label: "Faible / irrégulière",
          hint: "Étincelle douteuse",
        },
        {
          id: "none",
          label: "Aucune",
          hint: "Pas d'étincelle",
        },
      ],
    });

    questions.push({
      id: "start_plug",
      icon: "🔩",
      title: "Comment est la bougie après plusieurs essais ?",
      description: "L'état de la bougie donne une indication sur le mélange.",
      when: (a) =>
        a.start_rotation === "normal" || a.start_rotation === "slow",
      choices: [
        {
          id: "dry",
          label: "Sèche",
          hint: "Peut orienter vers alimentation",
        },
        {
          id: "wet",
          label: "Mouillée",
          hint: "Peut orienter vers noyade",
        },
        {
          id: "black",
          label: "Très noire",
          hint: "Mélange / huile / allumage à examiner",
        },
      ],
    });

    questions.push({
      id: "start_compression",
      icon: "📈",
      title: "La compression semble-t-elle normale ?",
      description: "Idéalement, utilise un compressiomètre plutôt que la sensation au kick.",
      when: (a) =>
        a.start_rotation === "normal" || a.start_rotation === "slow",
      choices: [
        {
          id: "normal",
          label: "Oui",
          hint: "Sensation normale / mesure correcte",
        },
        {
          id: "low",
          label: "Elle semble faible",
          hint: "Kick très facile ou mesure basse",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas encore mesurée",
        },
      ],
    });

    questions.push({
      id: "start_2t_reeds",
      icon: "🪽",
      title: "Sur ce 2T, les clapets ont-ils été contrôlés ?",
      description: "Particulièrement intéressant si essence, étincelle et compression semblent correctes.",
      when: (a) =>
        profile.engine === "2t" &&
        (a.start_rotation === "normal" || a.start_rotation === "slow"),
      choices: [
        {
          id: "good",
          label: "Oui, ils sont bons",
          hint: "Pas de lamelle cassée",
        },
        {
          id: "damaged",
          label: "Ils sont abîmés",
          hint: "Lamelle fissurée / déformée",
        },
        {
          id: "unknown",
          label: "Jamais contrôlés",
          hint: "À vérifier",
        },
      ],
    });

    questions.push({
      id: "start_4t_valves",
      icon: "🔩",
      title: "Le jeu aux soupapes a-t-il été contrôlé ?",
      description: "Sur un 4T, un jeu incorrect peut notamment influencer le démarrage.",
      when: (a) =>
        profile.engine === "4t" &&
        (a.start_rotation === "normal" || a.start_rotation === "slow"),
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Contrôlé récemment",
        },
        {
          id: "bad",
          label: "Il était hors tolérance",
          hint: "Réglage nécessaire",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Jamais contrôlé",
        },
      ],
    });

    questions.push({
      id: "start_timing",
      icon: "⛓️",
      title: "La distribution a-t-elle été récemment démontée ?",
      description: "Si oui, le calage devient une piste importante sur un 4T.",
      when: (a) =>
        profile.engine === "4t" &&
        (a.start_rotation === "normal" || a.start_rotation === "slow"),
      choices: [
        {
          id: "no",
          label: "Non",
          hint: "Moteur non ouvert récemment",
        },
        {
          id: "yes",
          label: "Oui",
          hint: "Travaux récents",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Historique inconnu",
        },
      ],
    });
  }

  if (profile.symptom === "running") {
    questions.push({
      id: "run_regime",
      icon: "📊",
      title: "À quel régime le problème apparaît-il ?",
      description: "Le régime aide à différencier circuit de ralenti, aiguille et pleine charge.",
      choices: [
        {
          id: "idle",
          label: "Ralenti",
          hint: "À l'arrêt / très bas régime",
        },
        {
          id: "mid",
          label: "Mi-régime",
          hint: "Ouverture intermédiaire",
        },
        {
          id: "high",
          label: "Haut régime",
          hint: "Pleine charge / haut dans les tours",
        },
      ],
    });

    questions.push({
      id: "run_behavior",
      icon: "🏍️",
      title: "Quel est le symptôme principal ?",
      choices: [
        {
          id: "bog",
          label: "Trou à l'accélération",
          hint: "Elle hésite quand j'ouvre",
        },
        {
          id: "cut",
          label: "Elle coupe",
          hint: "Coupure nette ou ratés",
        },
        {
          id: "stall",
          label: "Elle cale",
          hint: "Le moteur s'arrête",
        },
      ],
    });

    questions.push({
      id: "run_smoke",
      icon: "💨",
      title: "Quelle fumée observes-tu ?",
      choices: [
        {
          id: "none",
          label: "Pas de fumée anormale",
          hint: "Aspect normal",
        },
        {
          id: "black",
          label: "Noire",
          hint: "Mélange riche possible",
        },
        {
          id: "bluewhite",
          label: "Bleue / blanche",
          hint: "Huile ou liquide selon moteur",
        },
      ],
    });

    questions.push({
      id: "run_filter",
      icon: "🌬️",
      title: "Quel est l'état du filtre à air ?",
      choices: [
        {
          id: "clean",
          label: "Propre et correctement huilé",
          hint: "Entretien récent",
        },
        {
          id: "dirty",
          label: "Très sale",
          hint: "Beaucoup de poussière",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À contrôler",
        },
      ],
    });

    questions.push({
      id: "run_intake",
      icon: "🌬️",
      title: "As-tu contrôlé une éventuelle prise d'air ?",
      choices: [
        {
          id: "no",
          label: "Non",
          hint: "Pas encore",
        },
        {
          id: "yes",
          label: "Oui, rien trouvé",
          hint: "Admission contrôlée",
        },
        {
          id: "leak",
          label: "Oui, fuite trouvée",
          hint: "Pipe / joint / carburateur",
        },
      ],
    });

    questions.push({
      id: "run_fuel",
      icon: "⛽",
      title: "L'arrivée d'essence semble-t-elle correcte ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Débit normal",
        },
        {
          id: "poor",
          label: "Faible",
          hint: "Débit douteux",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas contrôlée",
        },
      ],
    });

    questions.push({
      id: "run_overheat",
      icon: "🌡️️",
      title: "La moto chauffe-t-elle anormalement ?",
      choices: [
        {
          id: "no",
          label: "Non",
          hint: "Température normale",
        },
        {
          id: "yes",
          label: "Oui",
          hint: "Très chaude / liquide",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas de mesure",
        },
      ],
    });

    questions.push({
      id: "run_2t",
      icon: "⚡",
      title: "Sur ce 2T, les clapets / valve ont-ils été contrôlés ?",
      description: "Ces éléments peuvent fortement modifier la réponse moteur.",
      when: () => profile.engine === "2t",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Contrôle effectué",
        },
        {
          id: "problem",
          label: "Problème trouvé",
          hint: "Clapets / valve",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "À contrôler",
        },
      ],
    });

    questions.push({
      id: "run_4t",
      icon: "🔥",
      title: "Sur ce 4T, les soupapes ont-elles été contrôlées ?",
      description: "Un jeu incorrect peut influencer ralenti, démarrage et comportement.",
      when: () => profile.engine === "4t",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Contrôle récent",
        },
        {
          id: "problem",
          label: "Hors tolérance",
          hint: "Réglage nécessaire",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "À contrôler",
        },
      ],
    });

    questions.push({
      id: "run_fuel_system",
      icon: "🧪",
      title: "Quel système d'alimentation as-tu ?",
      choices: [
        {
          id: "carb",
          label: "Carburateur",
          hint: "Cuve + gicleurs",
        },
        {
          id: "efi",
          label: "Injection",
          hint: "Injecteur + ECU",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À identifier",
        },
      ],
    });
  }

  if (profile.symptom === "electrical") {
    questions.push({
      id: "elec_main",
      icon: "⚡",
      title: "Quel élément électrique pose problème ?",
      choices: [
        {
          id: "starter",
          label: "Démarreur",
          hint: "Ne tourne pas / clic",
        },
        {
          id: "spark",
          label: "Étincelle",
          hint: "Pas d'allumage",
        },
        {
          id: "lights",
          label: "Éclairage / accessoires",
          hint: "Phare, compteur...",
        },
      ],
    });

    questions.push({
      id: "elec_battery",
      icon: "🔋",
      title: "État de la batterie ?",
      choices: [
        {
          id: "good",
          label: "Bonne",
          hint: "Mesurée / récente",
        },
        {
          id: "low",
          label: "Faible",
          hint: "Démarreur lent",
        },
        {
          id: "unknown",
          label: "Inconnu",
          hint: "Pas mesurée",
        },
      ],
    });

    questions.push({
      id: "elec_fuse",
      icon: "🧯",
      title: "As-tu contrôlé fusibles et masses ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Tout semble propre",
        },
        {
          id: "fuse",
          label: "Fusible grillé",
          hint: "Ou protection coupée",
        },
        {
          id: "ground",
          label: "Masse douteuse",
          hint: "Oxydation / câble",
        },
      ],
    });

    questions.push({
      id: "elec_spark",
      icon: "⚡",
      title: "L'étincelle est-elle présente ?",
      choices: [
        {
          id: "strong",
          label: "Forte",
          hint: "Étincelle régulière",
        },
        {
          id: "weak",
          label: "Faible",
          hint: "Douteuse",
        },
        {
          id: "none",
          label: "Aucune",
          hint: "Pas d'étincelle",
        },
      ],
    });

    questions.push({
      id: "elec_charge",
      icon: "🔋",
      title: "Le système recharge-t-il la batterie ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Tension qui augmente moteur tournant",
        },
        {
          id: "no",
          label: "Non",
          hint: "Elle se vide",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas mesuré",
        },
      ],
    });

    questions.push({
      id: "elec_stator",
      icon: "🧲",
      title: "Le stator / capteur d'allumage a-t-il été contrôlé ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Valeurs conformes au manuel",
        },
        {
          id: "bad",
          label: "Valeur anormale",
          hint: "Résistance / tension",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "À contrôler",
        },
      ],
    });

    questions.push({
      id: "elec_connectors",
      icon: "🔌",
      title: "Les connecteurs sont-ils propres ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Propres et secs",
        },
        {
          id: "corrosion",
          label: "Oxydés",
          hint: "Vert-de-gris / humidité",
        },
        {
          id: "loose",
          label: "Un connecteur bouge",
          hint: "Broche / cosse",
        },
      ],
    });

    questions.push({
      id: "elec_water",
      icon: "💧",
      title: "La panne est-elle apparue après eau / lavage ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Après lavage / pluie",
        },
        {
          id: "no",
          label: "Non",
          hint: "Sans rapport",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Historique incertain",
        },
      ],
    });
  }

  if (profile.symptom === "engine") {
    questions.push({
      id: "engine_noise",
      icon: "🔊",
      title: "D'où semble venir le bruit ?",
      choices: [
        {
          id: "top",
          label: "Haut moteur",
          hint: "Culasse / soupapes / piston",
        },
        {
          id: "bottom",
          label: "Bas moteur",
          hint: "Vilebrequin / bielle",
        },
        {
          id: "side",
          label: "Côté embrayage / boîte",
          hint: "Carter latéral",
        },
      ],
    });

    questions.push({
      id: "engine_rpm",
      icon: "📊",
      title: "À quel moment le bruit apparaît-il ?",
      choices: [
        {
          id: "idle",
          label: "Au ralenti",
          hint: "Sans charge",
        },
        {
          id: "load",
          label: "En accélérant / charge",
          hint: "Sous effort",
        },
        {
          id: "all",
          label: "Tout le temps",
          hint: "Présent en permanence",
        },
      ],
    });

    questions.push({
      id: "engine_oil",
      icon: "🛢️",
      title: "Quel est l'état de l'huile ?",
      choices: [
        {
          id: "normal",
          label: "Normale",
          hint: "Pas d'anomalie visible",
        },
        {
          id: "low",
          label: "Niveau bas",
          hint: "Manque d'huile",
        },
        {
          id: "metal",
          label: "Particules / limaille",
          hint: "Anormal",
        },
      ],
    });

    questions.push({
      id: "engine_smoke",
      icon: "💨",
      title: "Y a-t-il de la fumée ?",
      choices: [
        {
          id: "none",
          label: "Non",
          hint: "Pas de fumée anormale",
        },
        {
          id: "blue",
          label: "Bleue",
          hint: "Huile possible",
        },
        {
          id: "white",
          label: "Blanche",
          hint: "Selon moteur : liquide / huile",
        },
      ],
    });

    questions.push({
      id: "engine_coolant",
      icon: "🌡️",
      title: "Le liquide de refroidissement bouge-t-il anormalement ?",
      choices: [
        {
          id: "normal",
          label: "Rien d'anormal",
          hint: "Niveau stable",
        },
        {
          id: "loss",
          label: "Il baisse",
          hint: "Perte de liquide",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas contrôlé",
        },
      ],
    });

    questions.push({
      id: "engine_compression",
      icon: "📈",
      title: "La compression est-elle correcte ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Mesurée",
        },
        {
          id: "low",
          label: "Faible",
          hint: "Mesure / sensation",
        },
        {
          id: "unknown",
          label: "Inconnue",
          hint: "Pas mesurée",
        },
      ],
    });

    questions.push({
      id: "engine_recent",
      icon: "🔧",
      title: "Le moteur a-t-il été ouvert récemment ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Piston / culasse / distribution",
        },
        {
          id: "no",
          label: "Non",
          hint: "Aucun travail récent",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Moto d'occasion",
        },
      ],
    });

    questions.push({
      id: "engine_2t_seal",
      icon: "💨",
      title: "Sur ce 2T, une prise d'air moteur a-t-elle été recherchée ?",
      when: () => profile.engine === "2t",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Test effectué",
        },
        {
          id: "leak",
          label: "Fuite trouvée",
          hint: "Étanchéité mauvaise",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "Jamais testé",
        },
      ],
    });

    questions.push({
      id: "engine_4t_timing",
      icon: "⛓️",
      title: "Sur ce 4T, distribution et soupapes ont-elles été contrôlées ?",
      when: () => profile.engine === "4t",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Tout est conforme",
        },
        {
          id: "problem",
          label: "Problème trouvé",
          hint: "Jeu / calage",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "À contrôler",
        },
      ],
    });
  }

  if (profile.symptom === "clutch") {
    questions.push({
      id: "clutch_behavior",
      icon: "⚙️",
      title: "Quel est le problème d'embrayage ?",
      choices: [
        {
          id: "slip",
          label: "Il patine",
          hint: "Le régime monte sans accélérer",
        },
        {
          id: "drag",
          label: "Il reste entraîné",
          hint: "La moto veut avancer embrayage tiré",
        },
        {
          id: "lever",
          label: "Le levier est anormal",
          hint: "Dur / mou / garde incorrecte",
        },
      ],
    });

    questions.push({
      id: "clutch_cable",
      icon: "🧵",
      title: "Commande câble ou hydraulique ?",
      choices: [
        {
          id: "cable",
          label: "Câble",
          hint: "Commande mécanique",
        },
        {
          id: "hydraulic",
          label: "Hydraulique",
          hint: "Maître-cylindre",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À identifier",
        },
      ],
    });

    questions.push({
      id: "clutch_oil",
      icon: "🛢️",
      title: "L'huile est-elle adaptée et récente ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Vidange récente",
        },
        {
          id: "no",
          label: "Non / doute",
          hint: "Huile inconnue",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Historique inconnu",
        },
      ],
    });

    questions.push({
      id: "gear_behavior",
      icon: "⚙️",
      title: "La boîte présente-t-elle aussi un problème ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Vitesse saute / passe mal",
        },
        {
          id: "no",
          label: "Non",
          hint: "Boîte normale",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Difficile à déterminer",
        },
      ],
    });
  }

  if (profile.symptom === "chassis") {
    questions.push({
      id: "chassis_part",
      icon: "🛞",
      title: "Quelle partie pose problème ?",
      choices: [
        {
          id: "brake",
          label: "Frein",
          hint: "Avant ou arrière",
        },
        {
          id: "suspension",
          label: "Suspension",
          hint: "Fourche / amortisseur",
        },
        {
          id: "wheel",
          label: "Roue / direction",
          hint: "Jeu / roulement / guidage",
        },
      ],
    });

    questions.push({
      id: "chassis_brake",
      icon: "🛑",
      title: "Si c'est le frein, quel est le symptôme ?",
      when: (a) => a.chassis_part === "brake",
      choices: [
        {
          id: "spongy",
          label: "Levier spongieux",
          hint: "Course longue",
        },
        {
          id: "weak",
          label: "Freinage faible",
          hint: "Manque de puissance",
        },
        {
          id: "drag",
          label: "Le frein reste serré",
          hint: "Roue freinée",
        },
      ],
    });

    questions.push({
      id: "chassis_suspension",
      icon: "🔧",
      title: "Si c'est la suspension, quel est le symptôme ?",
      when: (a) => a.chassis_part === "suspension",
      choices: [
        {
          id: "leak",
          label: "Fuite d'huile",
          hint: "Tube / amortisseur",
        },
        {
          id: "soft",
          label: "Trop molle",
          hint: "S'enfonce trop",
        },
        {
          id: "hard",
          label: "Trop dure / point dur",
          hint: "Fonctionnement anormal",
        },
      ],
    });

    questions.push({
      id: "chassis_wheel",
      icon: "⭕",
      title: "Si c'est roue / direction ?",
      when: (a) => a.chassis_part === "wheel",
      choices: [
        {
          id: "play",
          label: "Jeu",
          hint: "Roue / direction",
        },
        {
          id: "rough",
          label: "Roulement rugueux",
          hint: "Bruit / résistance",
        },
        {
          id: "steering",
          label: "Direction bizarre",
          hint: "Point dur / guidonnage",
        },
      ],
    });

    questions.push({
      id: "chassis_chain",
      icon: "⛓️️",
      title: "Chaîne et transmission finale sont-elles correctes ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Tension et alignement OK",
        },
        {
          id: "bad",
          label: "Non",
          hint: "Détendue / trop tendue / usée",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À contrôler",
        },
      ],
    });
  }

  if (profile.symptom === "fuel") {
    questions.push({
      id: "fuel_type",
      icon: "🧪",
      title: "Carburateur ou injection ?",
      choices: [
        {
          id: "carb",
          label: "Carburateur",
          hint: "Gicleurs / cuve",
        },
        {
          id: "efi",
          label: "Injection",
          hint: "Injecteur / pompe / ECU",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À identifier",
        },
      ],
    });

    questions.push({
      id: "fuel_symptom",
      icon: "🏍️",
      title: "Quel est le symptôme ?",
      choices: [
        {
          id: "bog",
          label: "Trou à l'ouverture",
          hint: "Hésitation",
        },
        {
          id: "rich",
          label: "Elle semble trop riche",
          hint: "Fumée / réponse lourde",
        },
        {
          id: "lean",
          label: "Elle semble trop pauvre",
          hint: "Montée régime / chauffe",
        },
      ],
    });

    questions.push({
      id: "fuel_filter",
      icon: "🌬️",
      title: "Filtre à air ?",
      choices: [
        {
          id: "clean",
          label: "Propre",
          hint: "Entretien OK",
        },
        {
          id: "dirty",
          label: "Sale",
          hint: "Très chargé",
        },
        {
          id: "unknown",
          label: "Inconnu",
          hint: "À contrôler",
        },
      ],
    });

    questions.push({
      id: "fuel_jets",
      icon: "🔩",
      title: "Sur carburateur, les gicleurs ont-ils été contrôlés ?",
      when: (a) => a.fuel_type === "carb",
      choices: [
        {
          id: "clean",
          label: "Oui",
          hint: "Propres",
        },
        {
          id: "blocked",
          label: "Bouchés",
          hint: "Saletés trouvées",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "À démonter",
        },
      ],
    });

    questions.push({
      id: "fuel_pump",
      icon: "⛽",
      title: "Sur injection, la pompe s'amorce-t-elle ?",
      when: (a) => a.fuel_type === "efi",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Bruit d'amorçage",
        },
        {
          id: "no",
          label: "Non",
          hint: "Aucun bruit",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À vérifier",
        },
      ],
    });

    questions.push({
      id: "fuel_leak",
      icon: "💧",
      title: "As-tu une fuite d'essence ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Durite / carbu / réservoir",
        },
        {
          id: "no",
          label: "Non",
          hint: "Aucune fuite",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À inspecter",
        },
      ],
    });
  }

  if (profile.symptom === "cooling") {
    questions.push({
      id: "cooling_level",
      icon: "🌡️",
      title: "Le niveau de liquide est-il correct ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Niveau conforme",
        },
        {
          id: "low",
          label: "Bas",
          hint: "Il manque du liquide",
        },
        {
          id: "empty",
          label: "Très bas / vide",
          hint: "Anormal",
        },
      ],
    });

    questions.push({
      id: "cooling_leak",
      icon: "💧",
      title: "Y a-t-il une fuite ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Durite / radiateur / pompe",
        },
        {
          id: "no",
          label: "Non",
          hint: "Pas de fuite visible",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "À inspecter",
        },
      ],
    });

    questions.push({
      id: "cooling_radiator",
      icon: "🧱",
      title: "Les radiateurs sont-ils propres ?",
      choices: [
        {
          id: "clean",
          label: "Oui",
          hint: "Air qui circule",
        },
        {
          id: "mud",
          label: "Bouchés par terre",
          hint: "Boues / herbe",
        },
        {
          id: "damaged",
          label: "Ailettes très pliées",
          hint: "Circulation réduite",
        },
      ],
    });

    questions.push({
      id: "cooling_fan",
      icon: "🌀",
      title: "La moto possède-t-elle un ventilateur ?",
      choices: [
        {
          id: "yes",
          label: "Oui et il fonctionne",
          hint: "Il se déclenche",
        },
        {
          id: "yes_broken",
          label: "Oui mais il ne fonctionne pas",
          hint: "Jamais de déclenchement",
        },
        {
          id: "no",
          label: "Non",
          hint: "Pas équipé",
        },
      ],
    });

    questions.push({
      id: "cooling_pump",
      icon: "💧",
      title: "La pompe à eau a-t-elle été contrôlée ?",
      choices: [
        {
          id: "good",
          label: "Oui",
          hint: "Circulation OK",
        },
        {
          id: "problem",
          label: "Problème trouvé",
          hint: "Pompe / turbine",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "À contrôler",
        },
      ],
    });
  }

  if (profile.symptom === "maintenance") {
    questions.push({
      id: "maint_hours",
      icon: "⏱️",
      title: "Tu connais le nombre d'heures moteur ?",
      choices: [
        {
          id: "known",
          label: "Oui",
          hint: "Compteur d'heures",
        },
        {
          id: "estimated",
          label: "Approximatif",
          hint: "Je connais à peu près",
        },
        {
          id: "unknown",
          label: "Non",
          hint: "Historique inconnu",
        },
      ],
    });

    questions.push({
      id: "maint_air",
      icon: "🌬️",
      title: "Filtre à air entretenu régulièrement ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Entretien régulier",
        },
        {
          id: "no",
          label: "Non",
          hint: "Souvent oublié",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Historique inconnu",
        },
      ],
    });

    questions.push({
      id: "maint_chain",
      icon: "⛓️",
      title: "Chaîne / pignon / couronne ?",
      choices: [
        {
          id: "good",
          label: "Bons",
          hint: "Usure normale",
        },
        {
          id: "worn",
          label: "Usés",
          hint: "Dents / chaîne",
        },
        {
          id: "unknown",
          label: "À contrôler",
          hint: "Je ne sais pas",
        },
      ],
    });

    questions.push({
      id: "maint_brakes",
      icon: "🛑",
      title: "Freins ?",
      choices: [
        {
          id: "good",
          label: "Bons",
          hint: "Plaquettes / liquide OK",
        },
        {
          id: "worn",
          label: "Usés",
          hint: "À prévoir",
        },
        {
          id: "unknown",
          label: "À contrôler",
          hint: "Je ne sais pas",
        },
      ],
    });

    questions.push({
      id: "maint_bolts",
      icon: "🔩",
      title: "Tu contrôles les serrages régulièrement ?",
      choices: [
        {
          id: "yes",
          label: "Oui",
          hint: "Après les sorties",
        },
        {
          id: "no",
          label: "Non",
          hint: "Rarement",
        },
        {
          id: "unknown",
          label: "Je ne sais pas",
          hint: "Pas de routine",
        },
      ],
    });
  }

  return questions;
}

/* ============================================================
   CONSTRUCTION DES SOLUTIONS
============================================================ */

function makeSolution(id, reason = "") {
  if (!SOLUTIONS[id]) return null;

  return {
    id,
    reason,
    ...SOLUTIONS[id],
  };
}

function buildSolutions(profile, answers) {
  const result = [];
  const add = (id, reason) => {
    const item = makeSolution(id, reason);
    if (!item) return;

    if (!result.some((x) => x.id === id)) {
      result.push(item);
    }
  };

  /*
    STARTING
  */

  if (profile.symptom === "starting") {
    if (answers.start_rotation === "slow") {
      if (answers.start_battery === "low") {
        add(
          "battery",
          "Le moteur est entraîné trop lentement et la batterie est signalée faible."
        );
      } else {
        add(
          "battery",
          "Le lancement est lent ou fait simplement cliquer le système de démarrage."
        );
        add(
          "starter",
          "Si la batterie est correcte, le circuit de démarrage devient une piste importante."
        );
      }
    }

    if (answers.start_rotation === "blocked") {
      if (answers.start_blocked === "kickback") {
        if (profile.engine === "4t") {
          add(
            "timing",
            "Un retour violent du kick sur un 4T peut justifier un contrôle du calage, distribution et système de décompression."
          );
        } else {
          add(
            "ignition",
            "Un comportement anormal au lancement impose de contrôler l'allumage et le fonctionnement mécanique avant d'insister."
          );
        }
      }

      if (answers.start_blocked === "locked") {
        add(
          "compression",
          "Un moteur qui refuse de tourner doit être contrôlé mécaniquement avant toute tentative répétée."
        );
        add(
          "oilLeak",
          "Contrôle également le niveau d'huile et recherche d'un problème mécanique visible."
        );
      }

      if (answers.start_blocked === "gear") {
        add(
          "clutch",
          "Le comportement semble lié à la transmission ou à l'embrayage."
        );
        add(
          "gearbox",
          "Contrôle le fonctionnement de la boîte et du mécanisme de sélection."
        );
      }
    }

    if (answers.start_fuel === "no") {
      add(
        "fuelFlow",
        "Le carburant n'arrive pas correctement au moteur."
      );
      add(
        "carburetor",
        "Sur carburateur, la cuve, le pointeau et les gicleurs doivent être contrôlés."
      );
    }

    if (answers.start_fuel === "unknown") {
      add(
        "fuelFlow",
        "L'arrivée d'essence n'a pas encore été confirmée."
      );
    }

    if (answers.start_spark === "none") {
      add(
        "sparkPlug",
        "Commence par la bougie et le test d'étincelle."
      );
      add(
        "ignition",
        "Si la bougie est correcte, il faut remonter le circuit d'allumage."
      );
      add(
        "stator",
        "Le stator et le capteur d'allumage deviennent des contrôles possibles si l'allumage reste absent."
      );
    }

    if (answers.start_spark === "weak") {
      add(
        "sparkPlug",
        "Une étincelle faible ou irrégulière commence par la bougie, l'antiparasite et la bobine."
      );
      add(
        "ignition",
        "Poursuis ensuite sur le circuit d'allumage."
      );
    }

    if (answers.start_plug === "wet") {
      add(
        "sparkPlug",
        "Une bougie mouillée après plusieurs essais peut correspondre à un moteur noyé."
      );
      add(
        "carburetor",
        "Sur carburateur, contrôle pointeau, flotteur, starter et niveau de cuve."
      );
    }

    if (answers.start_plug === "dry") {
      add(
        "fuelFlow",
        "Une bougie sèche après de nombreux essais peut orienter vers un manque de carburant."
      );
    }

    if (answers.start_plug === "black") {
      add(
        "carburetor",
        "Une bougie très noire peut justifier un contrôle de richesse, filtre, starter et carburation."
      );
      add(
        "airFilter",
        "Un filtre trop chargé peut participer à un mélange trop riche."
      );
    }

    if (answers.start_compression === "low") {
      add(
        "compression",
        "Une compression réellement basse doit être confirmée avec un compressiomètre."
      );

      if (profile.engine === "2t") {
        add(
          "reeds",
          "Sur un 2T, les clapets font partie du contrôle de l'admission, même si la compression mécanique doit être vérifiée séparément."
        );
      }

      if (profile.engine === "4t") {
        add(
          "valves",
          "Sur un 4T, un problème de soupapes peut affecter l'étanchéité et le démarrage."
        );
        add(
          "timing",
          "Distribution et décompresseur doivent être envisagés si le moteur présente une compression anormale."
        );
      }
    }

    if (profile.engine === "2t") {
      if (answers.start_2t_reeds === "damaged") {
        add(
          "reeds",
          "Les clapets sont signalés endommagés."
        );
      }

      if (answers.start_2t_reeds === "unknown") {
        add(
          "reeds",
          "Les clapets n'ont jamais été contrôlés."
        );
      }

      add(
        "crankSeal2T",
        "Si carburant, étincelle et compression sont corrects mais que le démarrage reste impossible, l'étanchéité du moteur 2T peut être investiguée."
      );
    }

    if (profile.engine === "4t") {
      if (answers.start_4t_valves === "bad") {
        add(
          "valves",
          "Le jeu aux soupapes a été signalé hors tolérance."
        );
      }

      if (answers.start_4t_valves === "unknown") {
        add(
          "valves",
          "Le jeu aux soupapes n'a pas été contrôlé."
        );
      }

      if (answers.start_timing === "yes") {
        add(
          "timing",
          "La distribution a été démontée récemment : le calage doit être vérifié."
        );
      }
    }
  }

  /*
    RUNNING
  */

  if (profile.symptom === "running") {
    if (answers.run_filter === "dirty") {
      add(
        "airFilter",
        "Le filtre à air est très sale."
      );
    }

    if (answers.run_intake === "leak") {
      add(
        "intakeLeak",
        "Une prise d'air a été détectée à l'admission."
      );
    }

    if (answers.run_intake === "no") {
      add(
        "intakeLeak",
        "Une prise d'air n'a pas encore été exclue."
      );
    }

    if (answers.run_fuel === "poor") {
      add(
        "fuelFlow",
        "Le débit de carburant est signalé faible."
      );
      add(
        "fuelPump",
        "Sur injection, une pompe peut fournir un débit ou une pression insuffisante."
      );
    }

    if (answers.run_behavior === "bog") {
      if (answers.run_regime === "idle") {
        add(
          "carburetor",
          "Un trou à très bas régime oriente notamment vers le circuit de ralenti et la réponse à l'ouverture."
        );
      }

      if (answers.run_regime === "mid") {
        add(
          "carburetor",
          "À mi-régime, contrôle notamment aiguille, circuit intermédiaire et niveau de cuve sur carburateur."
        );
      }

      if (answers.run_regime === "high") {
        add(
          "fuelFlow",
          "À pleine charge, le débit d'essence doit être suffisant."
        );
      }

      if (profile.engine === "2t") {
        add(
          "reeds",
          "Des clapets défectueux peuvent modifier fortement la réponse d'un 2T."
        );
        add(
          "powerValve",
          "La valve d'échappement doit être envisagée si le comportement est anormal dans les régimes concernés."
        );
      }

      if (profile.engine === "4t") {
        add(
          "valves",
          "Sur 4T, contrôle le jeu aux soupapes si l'entretien est inconnu."
        );
      }
    }

    if (answers.run_behavior === "cut") {
      add(
        "ignition",
        "Une coupure nette peut provenir de l'allumage ou d'une coupure électrique."
      );
      add(
        "fuelFlow",
        "Une alimentation carburant insuffisante peut aussi provoquer une coupure sous charge."
      );
      add(
        "stator",
        "Si la coupure est liée au régime ou intermittente, le circuit stator/capteur mérite un contrôle."
      );
    }

    if (answers.run_behavior === "stall") {
      add(
        "carburetor",
        "Un ralenti instable ou un moteur qui cale peut être lié à la carburation."
      );
      add(
        "intakeLeak",
        "Une prise d'air peut perturber le ralenti."
      );

      if (profile.engine === "4t") {
        add(
          "valves",
          "Le jeu aux soupapes fait partie des contrôles importants si le problème est récurrent."
        );
      }
    }

    if (answers.run_smoke === "black") {
      add(
        "airFilter",
        "Une admission trop restreinte peut contribuer à un mélange riche."
      );
      add(
        "carburetor",
        "Sur carburateur, contrôle richesse, starter, niveau de cuve et gicleurs."
      );
    }

    if (answers.run_smoke === "bluewhite") {
      add(
        "compression",
        "Une fumée anormale peut justifier un contrôle de compression et d'étanchéité selon le moteur."
      );
      add(
        "oil",
        "Contrôle niveau et état de l'huile."
      );
    }

    if (answers.run_overheat === "yes") {
      add(
        "coolant",
        "La température est anormale."
      );
      add(
        "coolingFan",
        "Si la moto possède un ventilateur, contrôle son fonctionnement."
      );
    }

    if (profile.engine === "2t") {
      if (answers.run_2t === "problem") {
        add(
          "reeds",
          "Un problème de clapets ou de valve a été identifié."
        );
      }

      if (answers.run_2t === "unknown") {
        add(
          "reeds",
          "Les clapets n'ont pas été contrôlés."
        );
        add(
          "powerValve",
          "La valve d'échappement peut être contrôlée si le symptôme apparaît dans les régimes correspondants."
        );
      }
    }

    if (profile.engine === "4t") {
      if (answers.run_4t === "problem") {
        add(
          "valves",
          "Le jeu aux soupapes est signalé hors tolérance."
        );
      }

      if (answers.run_4t === "unknown") {
        add(
          "valves",
          "Le jeu aux soupapes n'a pas été contrôlé."
        );
      }
    }

    if (answers.run_fuel_system === "carb") {
      add(
        "carburetor",
        "Le diagnostic doit passer par les circuits du carburateur."
      );
    }

    if (answers.run_fuel_system === "efi") {
      add(
        "injector",
        "Le système est en injection : contrôle pompe, injecteur, capteurs et alimentation électrique."
      );
    }
  }

  /*
    ELECTRICAL
  */

  if (profile.symptom === "electrical") {
    if (answers.elec_battery === "low") {
      add(
        "battery",
        "La batterie est faible."
      );
    }

    if (answers.elec_battery === "unknown") {
      add(
        "battery",
        "La batterie n'a pas encore été mesurée."
      );
    }

    if (answers.elec_fuse === "fuse") {
      add(
        "battery",
        "Un fusible est grillé : il faut chercher pourquoi avant de remettre une protection."
      );
    }

    if (answers.elec_fuse === "ground") {
      add(
        "ignition",
        "Une mauvaise masse peut provoquer de nombreuses pannes électriques."
      );
    }

    if (answers.elec_spark === "none") {
      add(
        "sparkPlug",
        "Commence par confirmer l'absence d'étincelle avec une méthode correcte."
      );
      add(
        "ignition",
        "Remonte ensuite le circuit d'allumage."
      );
      add(
        "stator",
        "Le stator/capteur devient une piste si les contrôles précédents sont corrects."
      );
    }

    if (answers.elec_spark === "weak") {
      add(
        "sparkPlug",
        "Commence par la bougie et l'antiparasite."
      );
      add(
        "ignition",
        "Contrôle ensuite bobine, alimentation et masses."
      );
    }

    if (answers.elec_charge === "no") {
      add(
        "stator",
        "Un problème de charge peut provenir du stator ou d'un élément du circuit de charge."
      );
      add(
        "battery",
        "Contrôle également l'état de la batterie."
      );
    }

    if (answers.elec_stator === "bad") {
      add(
        "stator",
        "Le contrôle du stator a donné une valeur anormale."
      );
    }

    if (answers.elec_stator === "unknown") {
      add(
        "stator",
        "Le stator n'a pas encore été contrôlé."
      );
    }

    if (answers.elec_connectors === "corrosion") {
      add(
        "ignition",
        "Les connecteurs oxydés peuvent provoquer résistance, faux contact ou coupure."
      );
    }

    if (answers.elec_connectors === "loose") {
      add(
        "ignition",
        "Un connecteur mal verrouillé peut provoquer une panne intermittente."
      );
    }

    if (answers.elec_water === "yes") {
      add(
        "ignition",
        "Une panne apparue après lavage oriente vers humidité, connecteur, antiparasite, coupe-circuit ou masse."
      );
    }
  }

  /*
    ENGINE
  */

  if (profile.symptom === "engine") {
    if (answers.engine_oil === "low") {
      add(
        "oil",
        "Le niveau d'huile est bas."
      );
    }

    if (answers.engine_oil === "metal") {
      add(
        "oil",
        "La présence de particules métalliques demande de rechercher leur origine."
      );
      add(
        "gearbox",
        "Si les particules sont importantes, moteur et transmission doivent être investigués avant roulage."
      );
    }

    if (answers.engine_compression === "low") {
      add(
        "compression",
        "La compression est signalée faible."
      );

      if (profile.engine === "4t") {
        add(
          "valves",
          "Contrôle soupapes et étanchéité de la culasse."
        );
      }

      if (profile.engine === "2t") {
        add(
          "reeds",
          "Contrôle l'admission et les clapets, mais confirme surtout la compression mécanique."
        );
      }
    }

    if (answers.engine_coolant === "loss") {
      add(
        "coolant",
        "Le liquide de refroidissement baisse."
      );
    }

    if (answers.engine_noise === "top") {
      if (profile.engine === "4t") {
        add(
          "valves",
          "Un bruit en haut moteur justifie un contrôle du jeu aux soupapes."
        );
        add(
          "timing",
          "Contrôle également chaîne de distribution, tendeur et calage."
        );
      } else {
        add(
          "compression",
          "Sur un 2T, piston/segments/cylindre doivent être envisagés si le bruit vient du haut moteur."
        );
        add(
          "powerValve",
          "Une valve d'échappement encrassée ou endommagée peut également produire un fonctionnement anormal."
        );
      }
    }

    if (answers.engine_noise === "bottom") {
      add(
        "oil",
        "Contrôle immédiatement l'huile avant de continuer à faire tourner le moteur."
      );
      add(
        "compression",
        "Un bruit de bas moteur peut nécessiter un contrôle mécanique approfondi."
      );
    }

    if (answers.engine_noise === "side") {
      add(
        "clutch",
        "Un bruit côté embrayage nécessite un contrôle de l'embrayage et de sa commande."
      );
      add(
        "gearbox",
        "Si le bruit varie avec les vitesses, contrôle également la transmission."
      );
    }

    if (answers.engine_recent === "yes") {
      add(
        "timing",
        "Après une ouverture moteur, calage, serrages et remontage doivent être vérifiés."
      );
    }

    if (profile.engine === "2t") {
      if (answers.engine_2t_seal === "leak") {
        add(
          "crankSeal2T",
          "Une fuite d'étanchéité moteur 2T a été signalée."
        );
      }

      if (answers.engine_2t_seal === "unknown") {
        add(
          "crankSeal2T",
          "L'étanchéité du moteur 2T n'a pas été contrôlée."
        );
      }
    }

    if (profile.engine === "4t") {
      if (answers.engine_4t_timing === "problem") {
        add(
          "timing",
          "Un problème de distribution ou de soupapes est signalé."
        );
      }

      if (answers.engine_4t_timing === "unknown") {
        add(
          "timing",
          "Distribution et soupapes n'ont pas été contrôlées."
        );
      }
    }
  }

  /*
    EMBRAYAGE
  */

  if (profile.symptom === "clutch") {
    if (answers.clutch_behavior === "slip") {
      add(
        "clutch",
        "Le symptôme correspond à un embrayage qui peut patiner."
      );
    }

    if (answers.clutch_behavior === "drag") {
      add(
        "clutch",
        "L'embrayage semble rester entraîné."
      );
    }

    if (answers.clutch_cable === "cable") {
      add(
        "clutch",
        "Contrôle d'abord garde, câble et commande avant de démonter l'embrayage."
      );
    }

    if (answers.clutch_oil === "no") {
      add(
        "oil",
        "L'huile est inconnue ou potentiellement inadaptée."
      );
    }

    if (answers.gear_behavior === "yes") {
      add(
        "gearbox",
        "Un problème de boîte accompagne le problème d'embrayage."
      );
    }
  }

  /*
    CHASSIS
  */

  if (profile.symptom === "chassis") {
    if (answers.chassis_part === "brake") {
      add(
        "brakes",
        "Le problème concerne le freinage."
      );
    }

    if (answers.chassis_brake === "spongy") {
      add(
        "brakes",
        "Le levier spongieux nécessite un contrôle du circuit hydraulique."
      );
    }

    if (answers.chassis_part === "suspension") {
      add(
        "fork",
        "La suspension avant ou arrière doit être inspectée."
      );
      add(
        "shock",
        "L'amortisseur et les biellettes doivent également être contrôlés si nécessaire."
      );
    }

    if (answers.chassis_suspension === "leak") {
      add(
        "fork",
        "Une fuite de suspension est signalée."
      );
      add(
        "shock",
        "Détermine si la fuite vient de la fourche ou de l'amortisseur."
      );
    }

    if (answers.chassis_part === "wheel") {
      add(
        "wheel",
        "Contrôle roue, pneu, rayons, entretoises et moyeu."
      );
      add(
        "bearings",
        "Les roulements doivent être contrôlés en cas de jeu ou bruit."
      );
      add(
        "steering",
        "Si le problème vient de la direction, contrôle également les roulements de colonne."
      );
    }

    if (answers.chassis_wheel === "play") {
      add(
        "bearings",
        "Un jeu est signalé."
      );
    }

    if (answers.chassis_wheel === "steering") {
      add(
        "steering",
        "La direction présente un comportement anormal."
      );
    }

    if (answers.chassis_chain === "bad") {
      add(
        "chain",
        "La transmission finale doit être contrôlée et réglée."
      );
    }
  }

  /*
    FUEL
  */

  if (profile.symptom === "fuel") {
    if (answers.fuel_type === "carb") {
      add(
        "carburetor",
        "Le diagnostic concerne un carburateur."
      );

      if (answers.fuel_jets === "blocked") {
        add(
          "carburetor",
          "Les gicleurs sont bouchés."
        );
      }

      if (answers.fuel_jets === "unknown") {
        add(
          "carburetor",
          "Les gicleurs n'ont pas été contrôlés."
        );
      }
    }

    if (answers.fuel_type === "efi") {
      add(
        "injector",
        "Le système fonctionne par injection."
      );

      if (answers.fuel_pump === "no") {
        add(
          "fuelPump",
          "La pompe à essence ne s'amorce pas."
        );
      }

      if (answers.fuel_pump === "unknown") {
        add(
          "fuelPump",
          "L'amorçage de la pompe n'a pas été vérifié."
        );
      }
    }

    if (answers.fuel_symptom === "rich") {
      add(
        "airFilter",
        "Contrôle le filtre à air."
      );
      if (answers.fuel_type === "carb") {
        add(
          "carburetor",
          "Contrôle le niveau de cuve, le pointeau et la taille des gicleurs."
        );
      }
    }

    if (answers.fuel_symptom === "lean") {
      add(
        "intakeLeak",
        "Vérifie l'absence de prise d'air à l'admission."
      );
      add(
        "fuelFlow",
        "Vérifie que l'essence arrive en quantité suffisante."
      );
    }

    if (answers.fuel_filter === "dirty") {
      add(
        "airFilter",
        "Le filtre à air est sale."
      );
    }

    if (answers.fuel_leak === "yes") {
      add(
        "fuelFlow",
        "Une fuite de carburant a été repérée : sécurise le circuit."
      );
    }
  }

  /*
    COOLING
  */

  if (profile.symptom === "cooling") {
    if (answers.cooling_level === "low" || answers.cooling_level === "empty") {
      add(
        "coolant",
        "Le niveau de liquide de refroidissement est insuffisant."
      );
    }

    if (answers.cooling_leak === "yes") {
      add(
        "coolant",
        "Une fuite sur le circuit de refroidissement a été détectée."
      );
    }

    if (answers.cooling_radiator === "mud") {
      add(
        "coolant",
        "Les radiateurs sont obstrués par de la terre ou de la boue."
      );
    }

    if (answers.cooling_radiator === "damaged") {
      add(
        "coolant",
        "Les ailettes du radiateur sont pliées, réduisant le flux d'air."
      );
    }

    if (answers.cooling_fan === "yes_broken") {
      add(
        "coolingFan",
        "Le ventilateur électrique ne se déclenche pas."
      );
    }

    if (answers.cooling_pump === "problem") {
      add(
        "coolant",
        "Un problème au niveau de la pompe à eau ou de sa turbine a été identifié."
      );
    }
  }

  /*
    MAINTENANCE
  */

  if (profile.symptom === "maintenance") {
    add(
      "maintenance",
      "Effectue le contrôle général de sécurité et d'entretien."
    );

    if (answers.maint_air === "no") {
      add(
        "airFilter",
        "Le filtre à air n'est pas entretenu régulièrement."
      );
    }

    if (answers.maint_chain === "worn") {
      add(
        "chain",
        "La transmission secondaire présente une usure."
      );
    }

    if (answers.maint_brakes === "worn") {
      add(
        "brakes",
        "Les composants du freinage sont usés."
      );
    }
  }

  return result;
}