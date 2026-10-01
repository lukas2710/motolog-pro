'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../supabase';

const CATEGORIES = [
  { id: 'moteur', name: 'Moteur', icon: '🔧' },
  { id: 'echappement', name: 'Échappement', icon: '💨' },
  { id: 'carburation', name: 'Carburation', icon: '⛽' },
  { id: 'freinage', name: 'Freinage', icon: '🛑' },
  { id: 'roues', name: 'Roues', icon: '🛞' },
  { id: 'refroidissement', name: 'Refroidissement', icon: '🌡️' },
  { id: 'guidon', name: 'Guidon & commandes', icon: '🎛️' },
  { id: 'amortisseur', name: 'Amortisseur & fourche', icon: '🦾' },
  { id: 'electricite', name: 'Électricité', icon: '⚡' },
  { id: 'cadre', name: 'Cadre & châssis', icon: '🏍️' },
  { id: 'transmission', name: 'Transmission', icon: '⚙️' },
];

export default function MaintenancePage() {
  const params = useParams();
  const motoId = params.id;
  const router = useRouter();

  const [moto, setMoto] = useState(null);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [historyFilterCategory, setHistoryFilterCategory] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  /* =========================================================
     CHARGEMENT DES DONNÉES
  ========================================================= */

  const fetchMaintenanceData = async () => {
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

    const { data: partsData } = await supabase
      .from('parts')
      .select('*')
      .eq('moto_id', motoId);

    if (partsData) {
      setParts(partsData);
    }

    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .eq('moto_id', motoId)
      .order('performed_at', { ascending: false });

    if (logsData) {
      setLogs(logsData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, [motoId]);

  /* =========================================================
     PIÈCES DISPONIBLES
  ========================================================= */

  const availableParts = useMemo(() => {
    if (!formCategory) return [];

    return parts.filter(
      (part) => part.category === formCategory
    );
  }, [parts, formCategory]);

  /* =========================================================
     HISTORIQUE FILTRÉ
  ========================================================= */

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!historyFilterCategory) return true;

      const linkedPart = parts.find(
        (p) => p.id === log.part_id
      );

      if (
        linkedPart &&
        linkedPart.category === historyFilterCategory
      ) {
        return true;
      }

      if (
        log.title &&
        log.title
          .toLowerCase()
          .includes(historyFilterCategory.toLowerCase())
      ) {
        return true;
      }

      return false;
    });
  }, [logs, parts, historyFilterCategory]);

  const displayedLogs = showAllHistory
    ? filteredLogs
    : filteredLogs.slice(0, 5);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getPart = (partId) => {
    return parts.find((part) => part.id === partId);
  };

  const getCategory = (categoryName) => {
    return CATEGORIES.find(
      (category) => category.name === categoryName
    );
  };

  const formatDate = (value) => {
    if (!value) return '-';

    const dateParts = String(value).split('-');

    if (dateParts.length === 3) {
      return (
        dateParts[2] +
        '/' +
        dateParts[1] +
        '/' +
        dateParts[0]
      );
    }

    return new Date(value).toLocaleDateString('fr-FR');
  };

  /* =========================================================
     CHANGEMENT CATÉGORIE
  ========================================================= */

  const handleCategoryChange = (categoryName) => {
    setFormCategory(categoryName);
    setSelectedPartId('');
  };

  /* =========================================================
     OUVERTURE FORMULAIRE
  ========================================================= */

  const toggleForm = () => {
    const nextState = !isFormOpen;

    setIsFormOpen(nextState);

    if (nextState) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 50);
    }
  };

  /* =========================================================
     AJOUT ENTRETIEN (AVEC MISE À JOUR COMPTEUR MOTO)
  ========================================================= */

  const handleAddLog = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Veuillez renseigner le nom de l'entretien.");
      return;
    }

    if (hours === '') {
      alert("Veuillez renseigner le nombre d'heures moteur.");
      return;
    }

    const numericHours = parseFloat(hours);

    if (
      Number.isNaN(numericHours) ||
      numericHours < 0
    ) {
      alert("Veuillez renseigner un nombre d'heures valide.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Utilisateur non connecté.');
      setSubmitting(false);
      return;
    }

    const { error: logError } = await supabase
      .from('logs')
      .insert([
        {
          user_id: user.id,
          moto_id: motoId,

          part_id:
            selectedPartId !== ''
              ? selectedPartId
              : null,

          title: title.trim(),

          performed_at: date,

          hours: numericHours,

          hours_at_done: numericHours,

          cost: 0,

          notes:
            notes.trim() !== ''
              ? notes.trim()
              : null,
        },
      ]);

    if (logError) {
      console.error(
        'Erreur Supabase:',
        logError
      );

      alert(
        "Erreur lors de l'enregistrement : " +
          logError.message
      );

      setSubmitting(false);
      return;
    }

    /* =====================================================
       MISE À JOUR DU COMPTEUR DE LA MOTO (POUR SYNCHRO DASHBOARD)
    ===================================================== */

    const currentMotoHours = Number(moto?.hours || 0);
    if (numericHours > currentMotoHours) {
      const { error: motoUpdateError } = await supabase
        .from('motos')
        .update({ hours: numericHours })
        .eq('id', motoId);

      if (motoUpdateError) {
        console.error('Erreur mise à jour heures moto:', motoUpdateError);
      }
    }

    /* =====================================================
       MISE À JOUR DE LA PIÈCE
    ===================================================== */

    if (
      selectedPartId !== '' &&
      numericHours !== null
    ) {
      const { error: partError } = await supabase
        .from('parts')
        .update({
          last_service_hours: numericHours,
        })
        .eq('id', selectedPartId);

      if (partError) {
        console.error(partError);

        alert(
          "Entretien enregistré, mais échec de la mise à jour de la pièce sur l'accueil."
        );
      }
    }

    /* =====================================================
       RESET
    ===================================================== */

    setTitle('');
    setFormCategory('');
    setSelectedPartId('');
    setHours('');

    setDate(
      new Date().toISOString().split('T')[0]
    );

    setNotes('');

    setIsFormOpen(false);
    setShowAllHistory(false);

    await fetchMaintenanceData();

    setSubmitting(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  const handleDeleteLog = async (logId) => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer cet entretien ?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error(
        'Erreur suppression:',
        error
      );

      alert(
        "Erreur lors de la suppression : " +
          error.message
      );

      return;
    }

    await fetchMaintenanceData();
  };

  /* =========================================================
     LOADING
  ========================================================= */

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

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#070809] text-zinc-100 overflow-x-hidden">

      {/* BACKGROUND */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-orange-500/[0.035] blur-[100px]" />

        <div className="absolute bottom-0 -left-40 w-80 h-80 rounded-full bg-orange-600/[0.02] blur-[100px]" />

      </div>


      <main className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-32">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="flex items-center justify-between h-11 mb-5">

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 min-h-[44px] -ml-2 px-2 text-zinc-500 active:text-white transition-colors"
          >

            <span className="w-8 h-8 rounded-xl bg-[#101214] border border-zinc-900 flex items-center justify-center text-xl">
              ‹
            </span>

            <span className="text-xs font-medium">
              Retour
            </span>

          </button>


          <div className="flex items-center gap-2">

            <span className="relative flex w-2 h-2">

              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-50 animate-ping" />

              <span className="relative inline-flex w-2 h-2 rounded-full bg-orange-500" />

            </span>

            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600">
              Maintenance
            </span>

          </div>

        </header>


        {/* ===================================================
            MOTO
        =================================================== */}

        <section className="mb-5">

          <div className="flex items-end justify-between gap-3">

            <div className="min-w-0">

              {moto.brand && (
                <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-orange-500 mb-1">
                  {moto.brand}
                </p>
              )}

              <h1 className="text-[28px] sm:text-4xl leading-none font-black tracking-[-0.04em] truncate">
                {moto.name || 'Ma moto'}
              </h1>

              <p className="mt-2 text-[10px] text-zinc-700">
                Carnet d'entretien
              </p>

            </div>


            <div className="relative shrink-0">

              <div className="absolute inset-0 rounded-2xl bg-orange-500/10 blur-xl" />

              <div className="relative w-12 h-12 rounded-2xl bg-[#111315] border border-zinc-800 flex items-center justify-center text-xl">
                🏍️
              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            COMPTEUR
        =================================================== */}

        <section className="relative mb-3">

          <div className="relative overflow-hidden rounded-3xl bg-[#0e1011] border border-zinc-800">

            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-orange-500/30 to-transparent" />

            <div className="p-5">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />

                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                      Heures moteur
                    </span>

                  </div>

                  <div className="flex items-baseline gap-1 mt-1">

                    <span className="text-[46px] leading-none font-black font-mono tracking-[-0.07em]">
                      {Number(
                        moto.hours || 0
                      ).toFixed(1)}
                    </span>

                    <span className="text-sm font-bold text-orange-500">
                      H
                    </span>

                  </div>

                </div>


                <div className="text-right">

                  <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-700">
                    Carnet
                  </div>

                  <div className="mt-1 text-xl font-black font-mono text-zinc-300">
                    {logs.length}
                  </div>

                  <div className="text-[8px] text-zinc-700 uppercase">
                    intervention
                    {logs.length > 1
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
                          logs.length,
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


        {/* ===================================================
            BOUTON AJOUT
        =================================================== */}

        <button
          type="button"
          onClick={toggleForm}
          className={
            'relative w-full min-h-[58px] rounded-2xl mb-7 ' +
            'overflow-hidden flex items-center justify-center gap-3 ' +
            'font-black text-[12px] uppercase tracking-[0.08em] ' +
            'active:scale-[0.98] transition-all duration-200 ' +
            (
              isFormOpen
                ? 'bg-[#101214] border border-zinc-800 text-zinc-400'
                : 'bg-orange-500 text-black shadow-[0_8px_30px_rgba(249,115,22,.12)]'
            )
          }
        >

          <span
            className={
              'relative w-8 h-8 rounded-xl flex items-center justify-center text-xl ' +
              (
                isFormOpen
                  ? 'bg-zinc-900'
                  : 'bg-black/10'
              )
            }
          >
            {isFormOpen ? '×' : '+'}
          </span>

          <span>
            {isFormOpen
              ? 'Fermer le formulaire'
              : 'Ajouter un entretien'}
          </span>

        </button>


        {/* ===================================================
            FORMULAIRE
        =================================================== */}

        {isFormOpen && (

          <form
            onSubmit={handleAddLog}
            className="mb-8 rounded-3xl overflow-hidden bg-[#0d0f10] border border-zinc-800 shadow-2xl"
          >

            {/* HEADER FORM */}

            <div className="px-5 py-5 border-b border-zinc-900">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-orange-500">
                  🔧
                </div>

                <div>

                  <h2 className="text-sm font-bold">
                    Nouvel entretien
                  </h2>

                  <p className="text-[9px] text-zinc-600 mt-1">
                    Ajoutez l'intervention au carnet.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-4 sm:p-5 space-y-6">


              {/* 01 INTERVENTION */}

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <span className="flex w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 items-center justify-center text-[8px] font-black">
                    01
                  </span>

                  <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                    Intervention
                  </label>

                </div>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Ex : Vidange moteur"
                  className="w-full h-14 rounded-2xl bg-[#08090a] border border-zinc-900 px-4 text-[14px] text-white placeholder:text-zinc-700 outline-none focus:border-orange-500/50 transition-all"
                />

              </div>


              {/* 02 CATÉGORIE */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <div className="flex items-center gap-2">

                    <span className="flex w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 items-center justify-center text-[8px] font-black">
                      02
                    </span>

                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                      Catégorie
                    </label>

                  </div>

                  {formCategory && (
                    <span className="text-[8px] font-mono text-orange-500 uppercase">
                      Sélectionnée
                    </span>
                  )}

                </div>


                <div className="grid grid-cols-2 gap-2">

                  {CATEGORIES.map((category) => {

                    const isSelected =
                      formCategory ===
                      category.name;

                    const categoryParts =
                      parts.filter(
                        (part) =>
                          part.category ===
                          category.name
                      );

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          handleCategoryChange(
                            category.name
                          )
                        }
                        className={
                          'relative min-h-[70px] rounded-2xl border p-3 text-left overflow-hidden active:scale-[0.97] transition-all duration-200 ' +
                          (
                            isSelected
                              ? 'bg-orange-500/[0.09] border-orange-500/50'
                              : 'bg-[#08090a] border-zinc-900'
                          )
                        }
                      >

                        {isSelected && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-orange-500" />
                        )}

                        <div className="flex items-center gap-2">

                          <span
                            className={
                              'w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm ' +
                              (
                                isSelected
                                  ? 'bg-orange-500 text-black'
                                  : 'bg-zinc-900'
                              )
                            }
                          >
                            {category.icon}
                          </span>

                          <span
                            className={
                              'text-[10px] font-semibold leading-tight ' +
                              (
                                isSelected
                                  ? 'text-orange-300'
                                  : 'text-zinc-400'
                              )
                            }
                          >
                            {category.name}
                          </span>

                        </div>


                        <div className="mt-2 text-[8px] font-mono uppercase tracking-wider text-zinc-700">

                          {categoryParts.length > 0
                            ? (
                                categoryParts.length +
                                ' pièce' +
                                (
                                  categoryParts.length >
                                  1
                                    ? 's'
                                    : ''
                                )
                              )
                            : 'Aucune pièce'}

                        </div>

                      </button>
                    );
                  })}

                </div>

              </div>


              {/* 03 PIÈCE */}

              {formCategory && (

                <div>

                  <div className="flex items-center gap-2 mb-3">

                    <span className="flex w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 items-center justify-center text-[8px] font-black">
                      03
                    </span>

                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                      Pièce concernée
                    </label>

                  </div>


                  {availableParts.length === 0 ? (

                    <div className="rounded-2xl bg-[#08090a] border border-dashed border-zinc-900 p-5">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
                          ⚙️️
                        </div>

                        <div>

                          <p className="text-xs text-zinc-500 font-semibold">
                            Aucune pièce
                          </p>

                          <p className="text-[9px] text-zinc-700 mt-1">
                            L'entretien peut être enregistré sans pièce.
                          </p>

                        </div>

                      </div>

                    </div>

                  ) : (

                    <div className="space-y-2">

                      {availableParts.map(
                        (part) => {

                          const isSelected =
                            selectedPartId ===
                            part.id;

                          return (
                            <button
                              key={part.id}
                              type="button"
                              onClick={() =>
                                setSelectedPartId(
                                  isSelected
                                    ? ''
                                    : part.id
                                )
                              }
                              className={
                                'relative w-full min-h-[64px] rounded-2xl border p-3 flex items-center justify-between gap-3 text-left active:scale-[0.98] transition-all ' +
                                (
                                  isSelected
                                    ? 'bg-orange-500/[0.08] border-orange-500/50'
                                    : 'bg-[#08090a] border-zinc-900'
                                )
                              }
                            >

                              {isSelected && (
                                <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-orange-500 rounded-full" />
                              )}

                              <div className="flex items-center gap-3 min-w-0">

                                <div
                                  className={
                                    'w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ' +
                                    (
                                      isSelected
                                        ? 'bg-orange-500 text-black'
                                        : 'bg-zinc-900 text-zinc-600'
                                    )
                                  }
                                >
                                  {isSelected
                                    ? '✓'
                                    : '⚙'}
                                </div>

                                <div className="min-w-0">

                                  <p
                                    className={
                                      'text-xs font-semibold truncate ' +
                                      (
                                        isSelected
                                          ? 'text-orange-300'
                                          : 'text-zinc-300'
                                      )
                                    }
                                  >
                                    {part.name}
                                  </p>

                                  <div className="flex flex-wrap gap-2 mt-1">

                                    {part.interval_hours && (
                                      <span className="text-[8px] font-mono text-zinc-700">
                                        TOUS LES{' '}
                                        {part.interval_hours}
                                        H
                                      </span>
                                    )}

                                    {part.last_service_hours !==
                                      null &&
                                      part.last_service_hours !==
                                        undefined && (
                                        <span className="text-[8px] font-mono text-zinc-700">
                                          DERNIER{' '}
                                          {
                                            part.last_service_hours
                                          }
                                          H
                                        </span>
                                      )}

                                  </div>

                                </div>

                              </div>


                              <span
                                className={
                                  'w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs ' +
                                  (
                                    isSelected
                                      ? 'bg-orange-500/10 text-orange-500'
                                      : 'bg-zinc-900 text-zinc-700'
                                  )
                                }
                              >
                                {isSelected
                                  ? '✓'
                                  : '+'}
                              </span>

                            </button>
                          );
                        }
                      )}

                    </div>

                  )}

                </div>

              )}


              {/* 04 HEURES / DATE */}

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <span className="flex w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 items-center justify-center text-[8px] font-black">
                    04
                  </span>

                  <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                    Quand ?
                  </label>

                </div>


                <div className="grid grid-cols-2 gap-2">

                  <div className="relative">

                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={hours}
                      onChange={(e) =>
                        setHours(e.target.value)
                      }
                      placeholder="128.5"
                      className="w-full h-14 bg-[#08090a] border border-zinc-900 rounded-2xl px-4 pr-9 text-[14px] font-mono text-white placeholder:text-zinc-700 outline-none focus:border-orange-500/50 transition-all"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-orange-500/60">
                      H
                    </span>

                  </div>


                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                    className="w-full h-14 bg-[#08090a] border border-zinc-900 rounded-2xl px-3 text-[12px] text-white outline-none focus:border-orange-500/50 transition-all"
                  />

                </div>

              </div>


              {/* 05 NOTES */}

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <span className="flex w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 items-center justify-center text-[8px] font-black">
                    05
                  </span>

                  <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                    Notes (optionnel)
                  </label>

                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Détails, référence de pièce, couple de serrage..."
                  rows={3}
                  className="w-full rounded-2xl bg-[#08090a] border border-zinc-900 p-4 text-[13px] text-white placeholder:text-zinc-700 outline-none focus:border-orange-500/50 transition-all resize-none"
                />

              </div>


              {/* ACTIONS */}

              <div className="flex items-center gap-2 pt-2">

                <button
                  type="button"
                  onClick={toggleForm}
                  className="flex-1 h-12 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-orange-500 text-black font-black text-xs uppercase tracking-wider active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-orange-500/10"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>

              </div>

            </div>

          </form>

        )}


        {/* ===================================================
            HISTORIQUE DES INTERVENTIONS
        =================================================== */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
              Historique ({filteredLogs.length})
            </h2>

            {logs.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-[10px] font-mono text-orange-500 hover:underline"
              >
                {showAllHistory ? 'Voir moins' : 'Tout afficher'}
              </button>
            )}

          </div>


          {/* Filtres par catégorie */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            <button
              type="button"
              onClick={() => setHistoryFilterCategory('')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                historyFilterCategory === ''
                  ? 'bg-orange-500 text-black border-orange-500 font-bold'
                  : 'bg-[#0e1011] text-zinc-400 border-zinc-900 hover:border-zinc-700'
              }`}
            >
              Tous
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setHistoryFilterCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                  historyFilterCategory === cat.name
                    ? 'bg-orange-500 text-black border-orange-500 font-bold'
                    : 'bg-[#0e1011] text-zinc-400 border-zinc-900 hover:border-zinc-700'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>


          {displayedLogs.length === 0 ? (
            <div className="rounded-3xl bg-[#0e1011] border border-zinc-800 p-8 text-center">
              <p className="text-xs text-zinc-500 font-semibold">Aucun entretien enregistré</p>
              <p className="text-[10px] text-zinc-700 mt-1">Utilisez le bouton ci-dessus pour ajouter votre première intervention.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedLogs.map((log) => {
                const linkedPart = getPart(log.part_id);
                return (
                  <div
                    key={log.id}
                    className="group relative rounded-2xl bg-[#0e1011] border border-zinc-800 p-4 flex items-start justify-between gap-4 transition-all hover:border-zinc-700"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {log.title}
                        </span>
                        {linkedPart && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[9px] font-mono">
                            {linkedPart.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                        <span>📅 {formatDate(log.performed_at)}</span>
                        <span>•</span>
                        <span className="text-orange-500 font-bold">⚙️ {log.hours}H</span>
                      </div>

                      {log.notes && (
                        <p className="text-[11px] text-zinc-400 mt-2 bg-[#070809] p-2.5 rounded-xl border border-zinc-900">
                          {log.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      title="Supprimer l'intervention"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </section>

      </main>

    </div>
  );
}