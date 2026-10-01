'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';

export default function MotoCostsPage({ params }) {
  const { id: motoId } = use(params);
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedYear, setSelectedYear] = useState('TOUT');
  const [selectedMonth, setSelectedMonth] = useState('TOUT');

  const [selectedGroup, setSelectedGroup] = useState(null);

  /*
  ============================================================
  CHARGEMENT DES DONNÉES
  ============================================================
  */

  const fetchCostsData = async () => {
    if (!motoId) return;

    const { data: motoData, error } = await supabase
      .from('motos')
      .select('*')
      .eq('id', motoId)
      .single();

    if (error || !motoData) {
      router.push('/dashboard');
      return;
    }

    setMoto(motoData);

    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .eq('moto_id', motoId)
      .order('performed_at', {
        ascending: false,
      });

    if (logsData) {
      setLogs(logsData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCostsData();
  }, [motoId]);

  /*
  ============================================================
  AJOUT D'UNE DÉPENSE
  ============================================================
  */

  const handleAddCost = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Veuillez renseigner le motif de la dépense.');
      return;
    }

    const numericAmount = parseFloat(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      alert('Veuillez renseigner un montant valide.');
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('logs')
      .insert([
        {
          moto_id: motoId,
          user_id: user?.id || null,
          title: title.trim(),

          /*
          La page dépenses crée aussi un log.
          On conserve hours_at_done car la colonne
          Supabase peut être NOT NULL.
          */

          hours_at_done: moto?.hours || 0,

          cost: numericAmount,

          notes:
            'Dépense ajoutée depuis la page dédiée',
        },
      ]);

    if (error) {
      console.error(
        'Erreur Supabase:',
        error
      );

      alert(
        "Erreur lors de l'ajout de la dépense : " +
          error.message
      );

      setSubmitting(false);
      return;
    }

    setTitle('');
    setAmount('');
    setShowModal(false);

    await fetchCostsData();

    setSubmitting(false);
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070809] text-white flex items-center justify-center">

        <div className="flex flex-col items-center">

          <div className="relative w-14 h-14 rounded-2xl bg-[#111315] border border-zinc-800 flex items-center justify-center">

            <div className="absolute inset-0 rounded-2xl bg-orange-500/10 animate-pulse" />

            <div className="relative w-6 h-6 rounded-full border-2 border-zinc-700 border-t-orange-500 animate-spin" />

          </div>

          <p className="mt-4 text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-600">
            Chargement
          </p>

        </div>

      </div>
    );
  }

  /*
  ============================================================
  ANNÉES DISPONIBLES
  ============================================================
  */

  const years = Array.from(
    new Set(
      logs
        .filter((log) => log.performed_at)
        .map((log) =>
          new Date(
            log.performed_at
          ).getFullYear()
        )
    )
  ).sort((a, b) => b - a);

  /*
  ============================================================
  FILTRE ANNÉE / MOIS
  ============================================================
  */

  const filteredLogs = logs.filter((log) => {
    if (!log.performed_at) {
      return false;
    }

    const date = new Date(
      log.performed_at
    );

    const yearMatches =
      selectedYear === 'TOUT' ||
      date.getFullYear().toString() ===
        selectedYear;

    const monthMatches =
      selectedMonth === 'TOUT' ||
      date.getMonth().toString() ===
        selectedMonth;

    return (
      yearMatches &&
      monthMatches
    );
  });

  /*
  ============================================================
  TOTAL
  ============================================================
  */

  const totalCost = filteredLogs.reduce(
    (acc, log) =>
      acc +
      (parseFloat(log.cost) || 0),
    0
  );

  /*
  ============================================================
  REGROUPEMENT DES DÉPENSES
  ============================================================
  */

  const groupedMap = {};

  filteredLogs.forEach((log) => {
    const cleanTitle =
      log.title?.trim() ||
      'Dépense';

    const key =
      cleanTitle.toLowerCase();

    if (!groupedMap[key]) {
      groupedMap[key] = {
        title: cleanTitle,
        totalCost: 0,
        count: 0,
        items: [],
      };
    }

    groupedMap[key].totalCost +=
      parseFloat(log.cost) || 0;

    groupedMap[key].count += 1;

    groupedMap[key].items.push(log);
  });

  const groupedLogs = Object.values(
    groupedMap
  ).sort(
    (a, b) =>
      b.totalCost - a.totalCost
  );

  /*
  ============================================================
  MOIS
  ============================================================
  */

  const monthsList = [
    { id: '0', name: 'Janvier' },
    { id: '1', name: 'Février' },
    { id: '2', name: 'Mars' },
    { id: '3', name: 'Avril' },
    { id: '4', name: 'Mai' },
    { id: '5', name: 'Juin' },
    { id: '6', name: 'Juillet' },
    { id: '7', name: 'Août' },
    { id: '8', name: 'Septembre' },
    { id: '9', name: 'Octobre' },
    { id: '10', name: 'Novembre' },
    { id: '11', name: 'Décembre' },
  ];

  /*
  ============================================================
  FORMAT MONNAIE
  ============================================================
  */

  const formatMoney = (value) => {
    return Number(value || 0)
      .toFixed(2)
      .replace('.', ',');
  };

  /*
  ============================================================
  FORMAT DATE
  ============================================================
  */

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    return new Date(
      value
    ).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <div className="min-h-screen bg-[#070809] text-zinc-100 overflow-x-hidden">

      {/* BACKGROUND */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-orange-500/[0.035] blur-[100px]" />

        <div className="absolute bottom-0 -left-40 w-80 h-80 rounded-full bg-orange-600/[0.02] blur-[100px]" />

      </div>


      <main className="relative w-full max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-36">


        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="flex items-center justify-between h-11 mb-6">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/${motoId}`
              )
            }
            className="flex items-center gap-2 min-h-[44px] -ml-2 px-2 text-zinc-500 active:text-white transition-colors"
          >

            <span className="w-8 h-8 rounded-xl bg-[#101214] border border-zinc-900 flex items-center justify-center text-xl">
              ‹
            </span>

            <span className="text-xs font-medium">
              Retour
            </span>

          </button>


          <div className="flex items-center gap-2 max-w-[45%]">

            <span className="relative flex w-2 h-2 shrink-0">

              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-50 animate-ping" />

              <span className="relative inline-flex w-2 h-2 rounded-full bg-orange-500" />

            </span>

            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600 truncate">
              {moto?.name || 'Ma moto'}
            </span>

          </div>

        </header>


        {/* ==================================================
            TITRE
        ================================================== */}

        <section className="mb-5">

          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-orange-500 mb-2">
            Gestion financière
          </p>

          <div className="flex items-end justify-between gap-3">

            <div className="min-w-0">

              <h1 className="text-[30px] sm:text-4xl leading-none font-black tracking-[-0.04em]">
                Dépenses
              </h1>

              <p className="mt-2 text-[10px] text-zinc-700">
                Suivez les dépenses liées à votre moto.
              </p>

            </div>


            <div className="relative shrink-0">

              <div className="absolute inset-0 rounded-2xl bg-orange-500/10 blur-xl" />

              <div className="relative w-12 h-12 rounded-2xl bg-[#111315] border border-zinc-800 flex items-center justify-center text-xl">
                💶
              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            TOTAL
        ================================================== */}

        <section className="relative mb-3">

          <div className="relative overflow-hidden rounded-3xl bg-[#0e1011] border border-zinc-800">

            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-orange-500/30 to-transparent" />

            <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-orange-500/[0.035] blur-3xl" />


            <div className="relative p-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />

                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                      Budget filtré
                    </span>

                  </div>


                  <div className="flex items-baseline gap-2 mt-2">

                    <span className="text-[42px] sm:text-5xl leading-none font-black font-mono tracking-[-0.06em]">
                      {formatMoney(totalCost)}
                    </span>

                    <span className="text-xl font-black text-orange-500">
                      €
                    </span>

                  </div>

                </div>


                <div className="text-right">

                  <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-700">
                    Dépenses
                  </div>

                  <div className="mt-1 text-xl font-black font-mono text-zinc-300">
                    {filteredLogs.length}
                  </div>

                  <div className="text-[8px] text-zinc-700 uppercase">
                    opération
                    {filteredLogs.length > 1
                      ? 's'
                      : ''}
                  </div>

                </div>

              </div>


              <div className="flex gap-1 mt-5">

                {Array.from({
                  length: 10,
                }).map((_, index) => (

                  <div
                    key={index}
                    className={
                      'h-[2px] flex-1 rounded-full ' +
                      (
                        index <
                        Math.min(
                          groupedLogs.length,
                          10
                        )
                          ? 'bg-orange-500/60'
                          : 'bg-zinc-900'
                      )
                    }
                  />

                ))}

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            FILTRES
        ================================================== */}

        <section className="mb-7 rounded-3xl bg-[#0d0f10] border border-zinc-900 p-4 sm:p-5">

          <div className="flex items-center justify-between gap-3 mb-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />

                <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-700">
                  Recherche
                </span>

              </div>

              <h2 className="text-sm font-bold">
                Filtrer par période
              </h2>

            </div>


            {(selectedYear !== 'TOUT' ||
              selectedMonth !== 'TOUT') && (

              <button
                type="button"
                onClick={() => {
                  setSelectedYear('TOUT');
                  setSelectedMonth('TOUT');
                }}
                className="min-h-[38px] px-3 rounded-xl bg-orange-500/10 border border-orange-500/10 text-[8px] font-mono uppercase tracking-wider text-orange-400 active:scale-95"
              >
                Réinitialiser
              </button>

            )}

          </div>


          <div className="grid grid-cols-2 gap-2">

            <div>

              <label className="block mb-2 text-[8px] font-mono uppercase tracking-widest text-zinc-700">
                Année
              </label>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value
                  )
                }
                className="w-full h-12 bg-[#08090a] border border-zinc-900 focus:border-orange-500/50 rounded-xl px-3 text-[10px] text-white font-mono focus:outline-none"
              >

                <option value="TOUT">
                  Toutes
                </option>

                {years.map((year) => (

                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label className="block mb-2 text-[8px] font-mono uppercase tracking-widest text-zinc-700">
                Mois
              </label>

              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value
                  )
                }
                className="w-full h-12 bg-[#08090a] border border-zinc-900 focus:border-orange-500/50 rounded-xl px-3 text-[10px] text-white font-mono focus:outline-none"
              >

                <option value="TOUT">
                  Tous
                </option>

                {monthsList.map(
                  (month) => (

                    <option
                      key={month.id}
                      value={month.id}
                    >
                      {month.name}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>

        </section>


        {/* ==================================================
            POSTES DE DÉPENSE
        ================================================== */}

        <section>

          <div className="flex items-end justify-between gap-3 mb-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />

                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-zinc-700">
                  Répartition
                </span>

              </div>

              <h2 className="text-xl font-black tracking-tight">
                Postes de dépenses
              </h2>

            </div>


            <span className="text-[8px] font-mono text-zinc-700 text-right">
              {groupedLogs.length}{' '}
              poste
              {groupedLogs.length > 1
                ? 's'
                : ''}
            </span>

          </div>


          {groupedLogs.length === 0 ? (

            <div className="rounded-3xl bg-[#0d0f10] border border-dashed border-zinc-900 p-10 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#08090a] border border-zinc-900 flex items-center justify-center text-xl">
                📊
              </div>

              <h3 className="mt-4 text-sm font-bold text-zinc-500">
                Aucune dépense
              </h3>

              <p className="mt-2 text-[10px] leading-relaxed text-zinc-700 max-w-[250px] mx-auto">
                Aucune dépense enregistrée pour cette période.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

              {groupedLogs.map(
                (group, index) => (

                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setSelectedGroup(
                        group
                      )
                    }
                    className="group relative overflow-hidden text-left w-full rounded-2xl bg-[#0d0f10] border border-zinc-900 p-4 active:scale-[0.98] transition-all"
                  >

                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500/60" />


                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-500/[0.07] border border-orange-500/10 flex items-center justify-center text-orange-400 text-sm">
                          🔧
                        </div>


                        <div className="min-w-0">

                          <h3 className="text-[12px] font-bold text-zinc-200 uppercase truncate">
                            {group.title}
                          </h3>

                          <p className="text-[9px] font-mono text-zinc-600 mt-1">

                            {group.count}{' '}

                            intervention
                            {group.count > 1
                              ? 's'
                              : ''}

                          </p>

                        </div>

                      </div>


                      <div className="text-right shrink-0">

                        <span className="text-[12px] font-mono font-black text-orange-400">
                          {formatMoney(
                            group.totalCost
                          )}{' '}
                          €
                        </span>

                        <p className="text-[7px] font-mono uppercase tracking-widest text-zinc-800 mt-1">
                          Détail →
                        </p>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </section>


        {/* ==================================================
            BOUTON AJOUT
        ================================================== */}

        <div className="fixed bottom-5 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">

          <button
            type="button"
            onClick={() =>
              setShowModal(true)
            }
            className="pointer-events-auto min-h-[58px] bg-orange-500 text-black font-black px-6 rounded-2xl shadow-[0_8px_35px_rgba(249,115,22,.25)] border border-orange-300/20 active:scale-[0.96] transition-transform flex items-center gap-3"
          >

            <span className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center text-xl leading-none">
              +
            </span>

            <span className="text-[10px] font-mono uppercase tracking-[0.12em] font-extrabold">
              Ajouter une dépense
            </span>

          </button>

        </div>


        {/* ==================================================
            MODAL DÉTAIL
        ================================================== */}

        {selectedGroup && (

          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">

            <div className="relative bg-[#0d0f10] border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-hidden">

              <div className="absolute top-0 left-0 right-0 h-[2px] bg-orange-500" />


              <div className="p-5 border-b border-zinc-900">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <span className="text-[8px] font-mono font-bold text-orange-500 uppercase tracking-[0.2em]">
                      Détail regroupé
                    </span>

                    <h3 className="text-base font-black text-white uppercase tracking-tight mt-1 truncate">
                      {selectedGroup.title}
                    </h3>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setSelectedGroup(
                        null
                      )
                    }
                    className="w-10 h-10 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 active:text-white flex items-center justify-center"
                  >
                    ×
                  </button>

                </div>

              </div>


              <div className="p-4 overflow-y-auto max-h-[55vh]">

                <div className="space-y-2">

                  {selectedGroup.items.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="bg-[#08090a] border border-zinc-900 p-3.5 rounded-2xl"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-[9px] font-mono text-zinc-600">

                              {formatDate(
                                item.performed_at
                              )}

                              {' • '}

                              <span className="text-orange-400">
                                {item.hours_at_done || 0}h
                              </span>

                            </p>

                            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                              {item.notes ||
                                'Aucune note'}
                            </p>

                          </div>


                          <span className="shrink-0 text-[11px] font-mono font-bold text-orange-400">
                            {formatMoney(
                              item.cost
                            )}{' '}
                            €
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              <div className="p-4 border-t border-zinc-900">

                <div className="flex items-center justify-between mb-3">

                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                    Total cumulé
                  </span>

                  <span className="text-base font-mono font-black text-white">
                    {formatMoney(
                      selectedGroup.totalCost
                    )}{' '}
                    €
                  </span>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedGroup(
                      null
                    )
                  }
                  className="w-full min-h-[48px] bg-zinc-900 border border-zinc-800 text-zinc-400 active:text-white font-mono text-[9px] uppercase tracking-widest rounded-xl"
                >
                  Fermer
                </button>

              </div>

            </div>

          </div>

        )}


        {/* ==================================================
            MODAL AJOUT DÉPENSE
        ================================================== */}

        {showModal && (

          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">

            <div className="relative bg-[#0d0f10] border border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

              <div className="absolute top-0 left-0 right-0 h-[2px] bg-orange-500" />


              <div className="p-5 border-b border-zinc-900">

                <div className="flex items-center justify-between">

                  <div>

                    <span className="text-[8px] font-mono font-bold text-orange-500 uppercase tracking-[0.2em]">
                      Nouvelle opération
                    </span>

                    <h3 className="text-base font-black text-white mt-1">
                      Ajouter une dépense
                    </h3>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 active:text-white flex items-center justify-center"
                  >
                    ×
                  </button>

                </div>

              </div>


              <form
                onSubmit={handleAddCost}
                className="p-5 space-y-5"
              >

                {/* MOTIF */}

                <div>

                  <label className="block mb-2 text-[8px] font-mono uppercase tracking-widest text-zinc-600">
                    Motif ou pièce
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Ex : Vidange, pneu arrière..."
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    className="w-full h-14 bg-[#08090a] border border-zinc-900 focus:border-orange-500/50 rounded-2xl px-4 text-[13px] text-white placeholder:text-zinc-700 focus:outline-none transition-colors"
                  />

                </div>


                {/* MONTANT */}

                <div>

                  <label className="block mb-2 text-[8px] font-mono uppercase tracking-widest text-zinc-600">
                    Montant
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) =>
                        setAmount(
                          e.target.value
                        )
                      }
                      className="w-full h-14 bg-[#08090a] border border-zinc-900 focus:border-orange-500/50 rounded-2xl px-4 pr-10 text-[14px] text-white placeholder:text-zinc-700 focus:outline-none transition-colors font-mono"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-orange-500">
                      €
                    </span>

                  </div>

                </div>


                {/* INFO */}

                <div className="rounded-2xl bg-orange-500/[0.04] border border-orange-500/10 p-3">

                  <div className="flex items-start gap-3">

                    <span className="w-8 h-8 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center text-sm">
                      ℹ️
                    </span>

                    <p className="text-[9px] leading-relaxed text-zinc-600">
                      Cette dépense sera enregistrée dans le carnet de la moto avec le compteur actuel de{' '}
                      <span className="text-orange-400 font-mono">
                        {Number(
                          moto?.hours || 0
                        ).toFixed(1)}
                        H
                      </span>
                      .
                    </p>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="grid grid-cols-2 gap-2 pt-1">

                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="min-h-[52px] rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 active:text-white font-mono text-[9px] uppercase tracking-widest"
                  >
                    Annuler
                  </button>


                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[52px] rounded-2xl bg-orange-500 text-black font-mono text-[9px] uppercase tracking-widest font-black disabled:bg-zinc-800 disabled:text-zinc-600"
                  >
                    {submitting
                      ? 'Enregistrement...'
                      : 'Confirmer'}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </main>


      {/* ==================================================
          CSS GLOBAL
      ================================================== */}

      <style jsx global>{`

        * {
          -webkit-tap-highlight-color: transparent;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #070809;
        }

        input,
        textarea,
        select,
        button {
          -webkit-appearance: none;
          appearance: none;
        }

        select option {
          background: #101214;
          color: white;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

      `}</style>

    </div>
  );
}