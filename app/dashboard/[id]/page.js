"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabase";

const CATEGORIES = [
  { id: "moteur", name: "Moteur", icon: "🔧" },
  { id: "echappement", name: "Échappement", icon: "💨" },
  { id: "carburation", name: "Carburation", icon: "⛽" },
  { id: "freinage", name: "Freinage", icon: "🛑" },
  { id: "roues", name: "Roues", icon: "🛞" },
  { id: "refroidissement", name: "Refroidissement", icon: "🌡️" },
  { id: "guidon", name: "Guidon & commandes", icon: "🎛️" },
  { id: "amortisseur", name: "Amortisseur & fourche", icon: "🦾" },
  { id: "electricite", name: "Électricité", icon: "⚡" },
  { id: "cadre", name: "Cadre & châssis", icon: "🏍️" },
  { id: "transmission", name: "Transmission", icon: "⚙️" },
];

export default function MotoDetailPage({ params }) {
  const resolvedParams = use(params);
  const motoId = resolvedParams.id;
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("TOUS");

  const [showLogModal, setShowLogModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPartForHistory, setSelectedPartForHistory] = useState(null);

  const [logHours, setLogHours] = useState("");
  const [logReason, setLogReason] = useState("");

  const [partName, setPartName] = useState("");
  const [partCategory, setPartCategory] = useState(CATEGORIES[0].name);
  const [intervalHours, setIntervalHours] = useState("40");
  const [lastServiceHours, setLastServiceHours] = useState("0");

  const [submitting, setSubmitting] = useState(false);

  const fetchMotoData = async () => {
    const { data: motoData, error } = await supabase
      .from("motos")
      .select("*")
      .eq("id", motoId)
      .single();

    if (error || !motoData) {
      router.push("/dashboard");
      return;
    }

    setMoto(motoData);
    setLogHours(motoData.hours?.toString() || "0");

    const { data: logsData } = await supabase
      .from("logs")
      .select("*")
      .eq("moto_id", motoId)
      .order("performed_at", { ascending: false });

    if (logsData) setLogs(logsData);

    const { data: partsData } = await supabase
      .from("parts")
      .select("*")
      .eq("moto_id", motoId)
      .order("created_at", { ascending: true });

    if (partsData) setParts(partsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchMotoData();
  }, [motoId]);

  const handleDeletePart = async (partId, e) => {
    e.stopPropagation();

    if (!confirm("Voulez-vous vraiment supprimer ce contrôle ?")) return;

    const { error } = await supabase
      .from("parts")
      .delete()
      .eq("id", partId);

    if (!error) {
      if (selectedPartForHistory?.id === partId) {
        setSelectedPartForHistory(null);
      }

      await fetchMotoData();
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newHours = parseFloat(logHours);

    const { error } = await supabase.from("logs").insert([
      {
        moto_id: motoId,
        user_id: user.id,
        title: logReason,
        hours_at_done: newHours,
        notes: null,
        cost: 0,
        part_id: null,
      },
    ]);

    if (!error) {
      if (newHours > moto.hours) {
        await supabase
          .from("motos")
          .update({ hours: newHours })
          .eq("id", motoId);
      }

      setLogReason("");
      setShowLogModal(false);

      await fetchMotoData();
    }

    setSubmitting(false);
  };

  const handleAddPart = async (e) => {
    e.preventDefault();

    const isPremium =
      localStorage.getItem("is_premium") === "true";

    const MAX_FREE_PARTS = 5;

    if (!isPremium && parts.length >= MAX_FREE_PARTS) {
      setShowPartModal(false);
      setShowUpgradeModal(true);
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("parts").insert([
      {
        moto_id: motoId,
        user_id: user.id,
        name: partName,
        category: partCategory,
        interval_hours: parseFloat(intervalHours),
        last_service_hours: parseFloat(lastServiceHours),
      },
    ]);

    if (!error) {
      setPartName("");
      setPartCategory(CATEGORIES[0].name);
      setIntervalHours("40");
      setLastServiceHours("0");
      setShowPartModal(false);

      await fetchMotoData();
    }

    setSubmitting(false);
  };

  if (loading || !moto) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>

          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
            Initialisation diagnostic
          </p>
        </div>
      </div>
    );
  }

  const filteredParts = parts.filter((part) => {
    if (activeFilter === "TOUS") return true;
    return part.category === activeFilter;
  });

  const overdueParts = filteredParts.filter(
    (part) =>
      moto.hours - part.last_service_hours >=
      part.interval_hours
  );

  const upcomingParts = filteredParts.filter(
    (part) =>
      moto.hours - part.last_service_hours <
      part.interval_hours
  );

  const allOverdueParts = parts.filter(
    (part) =>
      moto.hours - part.last_service_hours >=
      part.interval_hours
  );

  const allUpcomingParts = parts.filter(
    (part) =>
      moto.hours - part.last_service_hours <
      part.interval_hours
  );

  const nextMaintenance =
    allUpcomingParts.length > 0
      ? Math.min(
          ...allUpcomingParts.map(
            (part) =>
              part.interval_hours -
              (moto.hours - part.last_service_hours)
          )
        )
      : null;

  const totalProgress =
    parts.length > 0
      ? Math.round(
          parts.reduce((sum, part) => {
            const used =
              moto.hours - part.last_service_hours;

            const progress =
              part.interval_hours > 0
                ? Math.min(
                    Math.max(
                      (used / part.interval_hours) * 100,
                      0
                    ),
                    100
                  )
                : 0;

            return sum + progress;
          }, 0) / parts.length
        )
      : 0;

  const getCategoryIcon = (category) => {
    return (
      CATEGORIES.find((cat) => cat.name === category)?.icon ||
      "🔧"
    );
  };

  const getProgressData = (part) => {
    const hoursUsed =
      moto.hours - part.last_service_hours;

    const progress =
      part.interval_hours > 0
        ? Math.min(
            Math.max(
              (hoursUsed / part.interval_hours) * 100,
              0
            ),
            100
          )
        : 0;

    const remaining =
      part.interval_hours - hoursUsed;

    return {
      hoursUsed,
      progress,
      remaining,
    };
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 font-sans selection:bg-orange-500 selection:text-black pb-44">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-[45%] -left-40 w-80 h-80 bg-orange-600/[0.035] rounded-full blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-md md:max-w-xl mx-auto px-4 sm:px-6 pt-5 space-y-7">

        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <span className="w-8 h-8 rounded-xl bg-[#111113] border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600">
              ←
            </span>

            <span className="text-[10px] font-mono uppercase tracking-wider">
              Garage
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.18em]">
              Diagnostic actif
            </span>
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] border border-zinc-800/80 bg-[#0e0e10] shadow-2xl">
          
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.08] via-transparent to-transparent pointer-events-none" />

          <div className="relative p-5 sm:p-6">
            
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-mono font-black tracking-[0.2em] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg uppercase">
                    {moto.brand || "MOTO"}
                  </span>

                  <span className="text-[9px] font-mono text-zinc-600">
                    / UNITÉ
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                  {moto.name}
                </h1>
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="shrink-0 bg-orange-500 hover:bg-orange-400 text-black font-black px-3.5 py-2 rounded-xl text-[10px] font-mono transition-all active:scale-95 shadow-lg shadow-orange-500/20"
              >
                + HEURES
              </button>
            </div>

            {/* Instrument */}
            <div className="mt-7 relative">
              <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

              <div className="relative text-center">
                <p className="text-[9px] font-mono tracking-[0.3em] text-zinc-600 uppercase mb-2">
                  Compteur moteur
                </p>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[64px] sm:text-[72px] leading-none font-black font-mono tracking-[-0.08em] text-white">
                    {Math.floor(moto.hours)}
                  </span>

                  <span className="text-2xl sm:text-3xl font-bold font-mono text-orange-500">
                    .
                    {Math.round(
                      (moto.hours % 1) * 10
                    )}
                    h
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />

                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                    Temps moteur enregistré
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-7 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  État maintenance
                </p>

                <p
                  className={`text-xs font-black font-mono uppercase mt-1 ${
                    allOverdueParts.length > 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {allOverdueParts.length > 0
                    ? `${allOverdueParts.length} contrôle(s) requis`
                    : "Système nominal"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  Dernier relevé
                </p>

                <p className="text-[10px] font-mono text-zinc-300 mt-1">
                  {moto.hours} h
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="grid grid-cols-3 gap-2">
          
          <div className="rounded-2xl bg-[#101012] border border-zinc-800/80 p-3">
            <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-600">
              Contrôles
            </p>

            <p className="text-xl font-black font-mono text-white mt-1">
              {parts.length}
            </p>

            <p className="text-[8px] text-zinc-600 font-mono mt-0.5">
              enregistrés
            </p>
          </div>

          <div
            className={`rounded-2xl border p-3 ${
              allOverdueParts.length > 0
                ? "bg-red-500/[0.05] border-red-500/20"
                : "bg-[#101012] border-zinc-800/80"
            }`}
          >
            <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-600">
              Retards
            </p>

            <p
              className={`text-xl font-black font-mono mt-1 ${
                allOverdueParts.length > 0
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {allOverdueParts.length}
            </p>

            <p className="text-[8px] text-zinc-600 font-mono mt-0.5">
              à traiter
            </p>
          </div>

          <div className="rounded-2xl bg-[#101012] border border-zinc-800/80 p-3">
            <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-600">
              Prochain
            </p>

            <p className="text-xl font-black font-mono text-orange-400 mt-1">
              {nextMaintenance !== null
                ? `${Math.max(
                    0,
                    nextMaintenance
                  ).toFixed(0)}h`
                : "—"}
            </p>

            <p className="text-[8px] text-zinc-600 font-mono mt-0.5">
              restant
            </p>
          </div>
        </section>

        {/* OVERALL CONDITION */}
        {parts.length > 0 && (
          <section className="rounded-2xl bg-[#0e0e10] border border-zinc-800/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Charge maintenance
                </p>

                <p className="text-[10px] font-mono text-zinc-700 mt-0.5">
                  Moyenne des intervalles
                </p>
              </div>

              <span className="text-xs font-black font-mono text-zinc-300">
                {totalProgress}%
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-black overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  totalProgress >= 100
                    ? "bg-red-500"
                    : totalProgress >= 75
                    ? "bg-amber-500"
                    : "bg-orange-500"
                }`}
                style={{
                  width: `${Math.min(
                    totalProgress,
                    100
                  )}%`,
                }}
              />
            </div>
          </section>
        )}

        {/* FILTERS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-orange-500">
                Diagnostic
              </p>

              <h2 className="text-sm font-black uppercase tracking-tight text-white mt-1">
                Zones de maintenance
              </h2>
            </div>

            <span className="text-[9px] font-mono text-zinc-600">
              {filteredParts.length} résultat(s)
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveFilter("TOUS")}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "TOUS"
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                  : "bg-[#111113] border border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              TOUT
              <span className="opacity-60">
                {parts.length}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const count = parts.filter(
                (part) => part.category === cat.name
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveFilter(cat.name)
                  }
                  className={`shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-xl text-[10px] font-mono transition-all flex items-center gap-1.5 ${
                    activeFilter === cat.name
                      ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/20"
                      : "bg-[#111113] border border-zinc-800 text-zinc-500 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="opacity-50">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* PRIORITY */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {overdueParts.length > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50" />
                )}

                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    overdueParts.length > 0
                      ? "bg-red-500"
                      : "bg-zinc-700"
                  }`}
                />
              </span>

              <h2 className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                À faire en priorité
              </h2>
            </div>

            <span className="text-[9px] font-mono text-red-400">
              {overdueParts.length}
            </span>
          </div>

          {overdueParts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.025] p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-bold text-emerald-400">
                    Aucun entretien en retard
                  </p>

                  <p className="text-[9px] font-mono text-zinc-600 mt-1">
                    Ta machine est à jour.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueParts.map((part) => {
                const { hoursUsed } =
                  getProgressData(part);

                const overdueHours = Math.max(
                  0,
                  hoursUsed - part.interval_hours
                ).toFixed(1);

                return (
                  <div
                    key={part.id}
                    onClick={() =>
                      setSelectedPartForHistory(part)
                    }
                    className="group relative overflow-hidden bg-[#120c0e] border border-red-500/20 hover:border-red-500/40 rounded-2xl p-4 cursor-pointer transition-all"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center justify-center text-lg">
                          {getCategoryIcon(
                            part.category
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs font-black uppercase tracking-wide text-zinc-100 truncate">
                            {part.name}
                          </h3>

                          <p className="text-[9px] font-mono text-zinc-600 mt-1">
                            {part.category ||
                              "Général"}{" "}
                            • intervalle{" "}
                            {part.interval_hours}h
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) =>
                          handleDeletePart(
                            part.id,
                            e
                          )
                        }
                        title="Supprimer"
                        className="shrink-0 w-8 h-8 rounded-lg bg-black/40 border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
                        +{overdueHours}h retard
                      </span>

                      <span className="text-[9px] font-mono text-zinc-600">
                        Dernier contrôle :{" "}
                        {part.last_service_hours}h
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-black overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-red-700 to-red-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* UPCOMING */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />

              <h2 className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                Sous surveillance
              </h2>
            </div>

            <span className="text-[9px] font-mono text-zinc-600">
              {upcomingParts.length}
            </span>
          </div>

          {upcomingParts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/70 bg-[#0d0d0f] p-6 text-center">
              <div className="text-2xl mb-2 opacity-40">
                🔧
              </div>

              <p className="text-xs font-bold text-zinc-400">
                Aucun contrôle enregistré
              </p>

              <p className="text-[9px] font-mono text-zinc-700 mt-1">
                Ajoute ton premier entretien avec le bouton ci-dessous.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingParts.map((part) => {
                const {
                  hoursUsed,
                  progress,
                  remaining,
                } = getProgressData(part);

                let progressColor =
                  "from-emerald-600 to-emerald-400";

                let badgeClass =
                  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

                let statusText = "NORMAL";

                if (progress >= 90) {
                  progressColor =
                    "from-red-600 to-red-400";

                  badgeClass =
                    "text-red-400 bg-red-500/10 border-red-500/20";

                  statusText = "URGENT";
                } else if (progress >= 75) {
                  progressColor =
                    "from-amber-600 to-amber-400";

                  badgeClass =
                    "text-amber-400 bg-amber-500/10 border-amber-500/20";

                  statusText = "BIENTÔT";
                }

                return (
                  <div
                    key={part.id}
                    onClick={() =>
                      setSelectedPartForHistory(part)
                    }
                    className="group bg-[#0e0e10] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">
                          {getCategoryIcon(
                            part.category
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs font-black uppercase tracking-wide text-zinc-200 truncate">
                            {part.name}
                          </h3>

                          <p className="text-[9px] font-mono text-zinc-600 mt-1">
                            {part.category ||
                              "Général"}{" "}
                            • tous les{" "}
                            {part.interval_hours}h
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`hidden sm:block text-[8px] font-mono font-bold px-2 py-1 rounded-md border ${badgeClass}`}
                        >
                          {statusText}
                        </span>

                        <button
                          onClick={(e) =>
                            handleDeletePart(
                              part.id,
                              e
                            )
                          }
                          title="Supprimer"
                          className="w-8 h-8 rounded-lg bg-black/40 border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">
                          Prochaine échéance
                        </p>

                        <p
                          className={`text-sm font-black font-mono mt-1 ${
                            progress >= 90
                              ? "text-red-400"
                              : progress >= 75
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {Math.max(
                            0,
                            remaining
                          ).toFixed(1)}
                          h
                        </p>
                      </div>

                      <span className="text-[9px] font-mono text-zinc-600">
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 rounded-full bg-black overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between mt-2">
                      <span className="text-[8px] font-mono text-zinc-700">
                        {hoursUsed.toFixed(1)}h utilisées
                      </span>

                      <span className="text-[8px] font-mono text-zinc-700">
                        / {part.interval_hours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM SPACE INFO */}
        <div className="pt-2 pb-4 text-center">
          <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-zinc-800">
            Moto Diagnostic System
          </p>
        </div>
      </div>

      {/* ADD CONTROL BUTTON
          DIMENSIONS CONSERVÉES DE L'ANCIEN CODE */}
      <div className="fixed bottom-28 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
        <button
          onClick={() => setShowPartModal(true)}
          className="pointer-events-auto bg-gradient-to-r from-orange-600 to-orange-400 text-black font-black text-xl px-6 py-3 rounded-2xl shadow-xl shadow-orange-500/25 border border-orange-300/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>+</span>

          <span className="text-xs font-mono uppercase tracking-wider">
            Ajouter un contrôle
          </span>
        </button>
      </div>

      {/* HISTORY MODAL */}
      {selectedPartForHistory && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e0e10] border border-zinc-800 rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

            <div className="p-5 border-b border-zinc-800/80">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    {getCategoryIcon(
                      selectedPartForHistory.category
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-orange-500">
                      Historique
                    </p>

                    <h3 className="text-sm font-black uppercase text-white mt-1">
                      {selectedPartForHistory.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedPartForHistory(null)
                  }
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                  <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-600">
                    Intervalle
                  </p>

                  <p className="text-sm font-black font-mono text-white mt-1">
                    {selectedPartForHistory.interval_hours}h
                  </p>
                </div>

                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                  <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-600">
                    Dernier contrôle
                  </p>

                  <p className="text-sm font-black font-mono text-orange-400 mt-1">
                    {selectedPartForHistory.last_service_hours}h
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {logs.filter(
                  (log) =>
                    log.part_id ===
                    selectedPartForHistory.id
                ).length === 0 ? (
                  <div className="bg-black/40 border border-zinc-800 rounded-2xl p-5 text-center">
                    <div className="text-2xl opacity-40 mb-2">
                      📋
                    </div>

                    <p className="text-xs text-zinc-500 font-mono leading-relaxed">
                      Aucun entretien enregistré
                      spécifiquement pour ce
                      composant.
                    </p>
                  </div>
                ) : (
                  logs
                    .filter(
                      (log) =>
                        log.part_id ===
                        selectedPartForHistory.id
                    )
                    .map((log) => (
                      <div
                        key={log.id}
                        className="bg-black/40 border border-zinc-800 p-3 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-200">
                            {log.title}
                          </h4>

                          <p className="text-[9px] font-mono text-zinc-600 mt-1">
                            {new Date(
                              log.performed_at
                            ).toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            •{" "}
                            {log.hours_at_done}h
                          </p>
                        </div>

                        <span className="text-xs font-mono font-bold text-orange-400">
                          {log.cost
                            ? `${Number(
                                log.cost
                              ).toFixed(2)} €`
                            : "0,00 €"}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="p-5 border-t border-zinc-800/80 flex gap-2">
              <button
                type="button"
                onClick={(e) =>
                  handleDeletePart(
                    selectedPartForHistory.id,
                    e
                  )
                }
                className="w-1/2 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-mono text-[10px] font-bold rounded-xl transition-colors"
              >
                SUPPRIMER
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedPartForHistory(null)
                }
                className="w-1/2 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-[10px] font-bold rounded-xl"
              >
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CONTROL MODAL */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e0e10] border border-zinc-800 rounded-[28px] w-full max-w-sm shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">
                  🔧
                </div>

                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-orange-500">
                    Maintenance
                  </p>

                  <h3 className="text-sm font-black text-white uppercase mt-1">
                    Nouveau contrôle
                  </h3>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleAddPart}
              className="p-5 space-y-4"
            >
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                  Nom de l'entretien *
                </label>

                <input
                  type="text"
                  required
                  placeholder="Piston, Vidange, Pneu..."
                  value={partName}
                  onChange={(e) =>
                    setPartName(e.target.value)
                  }
                  className="w-full bg-black/60 border border-zinc-800 p-3.5 rounded-xl text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                  Catégorie *
                </label>

                <select
                  value={partCategory}
                  onChange={(e) =>
                    setPartCategory(e.target.value)
                  }
                  className="w-full bg-black/60 border border-zinc-800 p-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/60"
                >
                  {CATEGORIES.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.name}
                    >
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                    Intervalle
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={intervalHours}
                      onChange={(e) =>
                        setIntervalHours(
                          e.target.value
                        )
                      }
                      className="w-full bg-black/60 border border-zinc-800 p-3.5 pr-9 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/60"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">
                      h
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                    Fait à
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={lastServiceHours}
                      onChange={(e) =>
                        setLastServiceHours(
                          e.target.value
                        )
                      }
                      className="w-full bg-black/60 border border-zinc-800 p-3.5 pr-9 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/60"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">
                      h
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/[0.04] border border-orange-500/10 rounded-xl p-3">
                <p className="text-[9px] font-mono text-zinc-600 leading-relaxed">
                  Le compteur sera utilisé pour
                  calculer automatiquement la
                  prochaine échéance.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-mono text-[10px] font-black tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                  {submitting
                    ? "ENREGISTREMENT..."
                    : "AJOUTER LE CONTRÔLE"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowPartModal(false)
                  }
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white font-mono text-[10px] rounded-xl"
                >
                  ANNULER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative bg-[#0e0e10] border border-orange-500/30 rounded-[30px] w-full max-w-sm shadow-2xl overflow-hidden">

            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/15 blur-[60px] rounded-full" />

            <div className="relative p-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
                ⚡
              </div>

              <span className="inline-block mt-4 text-[8px] font-mono font-black tracking-[0.2em] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full uppercase">
                LIMITE ATTEINTE
              </span>

              <h3 className="text-xl font-black text-white tracking-tight mt-4">
                Passez au Premium
              </h3>

              <p className="text-xs text-zinc-500 font-mono leading-relaxed mt-3">
                La version gratuite est limitée
                à 5 contrôles enregistrés.
              </p>

              <div className="mt-4 rounded-2xl bg-black/40 border border-zinc-800 p-4">
                <div className="text-3xl font-black text-orange-400">
                  10 €
                </div>

                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                  accès à vie • sans abonnement
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Link
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-mono text-[10px] font-black rounded-xl transition-all shadow-lg shadow-orange-500/20"
                  href="/upgrade"
                >
                  DÉBLOQUER L'ILLIMITÉ
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setShowUpgradeModal(false)
                  }
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white font-mono text-[10px] rounded-xl"
                >
                  FERMER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOURS MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e0e10] border border-zinc-800 rounded-[28px] w-full max-w-sm shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">
                  ⏱️
                </div>

                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-orange-500">
                    Compteur
                  </p>

                  <h3 className="text-sm font-black text-white uppercase mt-1">
                    Mettre à jour les heures
                  </h3>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleAddLog}
              className="p-5 space-y-4"
            >
              <div className="rounded-2xl bg-black/40 border border-zinc-800 p-4 text-center">
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  Compteur actuel
                </p>

                <p className="text-3xl font-black font-mono text-white mt-1">
                  {moto.hours}
                  <span className="text-orange-500 text-base">
                    h
                  </span>
                </p>
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                  Nouvelle heure du compteur
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={moto.hours}
                    required
                    value={logHours}
                    onChange={(e) =>
                      setLogHours(e.target.value)
                    }
                    className="w-full bg-black/60 border border-zinc-800 p-4 pr-10 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-orange-500/60"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-600">
                    h
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                  Motif de la sortie *
                </label>

                <input
                  type="text"
                  required
                  placeholder="Sortie terrain / session..."
                  value={logReason}
                  onChange={(e) =>
                    setLogReason(e.target.value)
                  }
                  className="w-full bg-black/60 border border-zinc-800 p-3.5 rounded-xl text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/60"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setShowLogModal(false)
                  }
                  className="w-1/2 py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white font-mono text-[10px] rounded-xl"
                >
                  ANNULER
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-mono text-[10px] font-black rounded-xl"
                >
                  {submitting
                    ? "..."
                    : "VALIDER"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}