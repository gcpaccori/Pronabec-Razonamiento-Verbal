(() => {
  'use strict';

  const BLOCK_MS = 30 * 60 * 1000;
  const TICK_MS = 3000;
  const KEY = 'pronabec-adaptive-session-v3';
  const LEGACY_V2 = 'pronabec-adaptive-session-v2';
  const LEGACY_V1 = 'pronabec-adaptive-session-v1';

  const orderedQuestions = (window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []);
  const questions = new Map(orderedQuestions.map(q => [q.id, q]));
  const order = new Map(orderedQuestions.map((q, i) => [q.id, i + 1]));

  const blank = () => ({
    blockNumber: 1,
    blockActiveMs: 0,
    lifetimeActiveMs: 0,
    completedSessions: 0,
    lastReportedBlock: 0,
    lastTick: Date.now(),
    blockAnswered: {},
    answerEvents: [],
    progressAnswered: {},
    lastPosition: null,
    sessionHistory: [],
    reportOpen: false
  });

  let session = load();
  syncAppProgress();
  save();

  function load() {
    try {
      const current = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (current && typeof current === 'object') {
        return { ...blank(), ...current, lastTick:Date.now(), reportOpen:false };
      }

      const v2 = JSON.parse(localStorage.getItem(LEGACY_V2) || 'null');
      if (v2 && typeof v2 === 'object') {
        return {
          ...blank(),
          blockNumber: Number(v2.blockNumber) || 1,
          blockActiveMs: Math.min(Number(v2.blockActiveMs) || 0, BLOCK_MS),
          lifetimeActiveMs: Number(v2.totalActiveMs) || Number(v2.blockActiveMs) || 0,
          completedSessions: Math.max(0, (Number(v2.blockNumber) || 1) - 1),
          lastReportedBlock: Math.max(0, (Number(v2.blockNumber) || 1) - 1),
          blockAnswered: v2.answered || {},
          answerEvents: v2.answerEvents || []
        };
      }

      const v1 = JSON.parse(localStorage.getItem(LEGACY_V1) || 'null');
      if (v1 && typeof v1 === 'object') {
        return {
          ...blank(),
          blockActiveMs: Math.min(Number(v1.activeMs) || 0, BLOCK_MS),
          lifetimeActiveMs: Number(v1.activeMs) || 0,
          blockAnswered: v1.answered || {},
          answerEvents: v1.firstAnswers || []
        };
      }
    } catch (_) {}
    return blank();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (_) {}
  }

  function syncAppProgress() {
    try {
      const candidateKeys = Object.keys(localStorage).filter(k => /^pronabec-sim-v2-\d+$/.test(k));
      for (const key of candidateKeys) {
        const appState = JSON.parse(localStorage.getItem(key) || '{}');
        for (const [id, selected] of Object.entries(appState.answers || {})) {
          const q = questions.get(id);
          if (!q || !selected || session.progressAnswered[id]) continue;
          session.progressAnswered[id] = {
            id,
            firstCorrect: selected === q.correct_answer,
            lastSelected: selected,
            attempts: 1,
            firstSeenAt: null,
            lastSeenAt: null
          };
        }
      }
    } catch (_) {}
  }

  function currentQuestionId() {
    return document.querySelector('.nav-num.current')?.getAttribute('title') || '';
  }

  function capturePosition() {
    const id = currentQuestionId();
    if (!id) return;
    session.lastPosition = {
      id,
      globalIndex: order.get(id) || null,
      totalQuestions: orderedQuestions.length,
      updatedAt: new Date().toISOString()
    };
    save();
  }

  function median(values) {
    const v = values.filter(Number.isFinite).slice().sort((a,b) => a-b);
    if (!v.length) return 0;
    const i = Math.floor(v.length / 2);
    return v.length % 2 ? v[i] : (v[i - 1] + v[i]) / 2;
  }

  function paceMs() {
    const a = session.answerEvents || [];
    const intervals = [];
    for (let i = 1; i < a.length; i++) {
      const d = a[i].activeMs - a[i - 1].activeMs;
      if (d >= 5000 && d <= 12 * 60 * 1000) intervals.push(d);
    }
    if (intervals.length) return median(intervals);
    const count = Object.keys(session.blockAnswered || {}).length;
    return count ? session.blockActiveMs / count : 0;
  }

  function routeRange() {
    const pace = paceMs();
    const completed = Object.keys(session.blockAnswered || {}).length;
    if (!pace) return { low:Math.max(1, completed), high:Math.max(1, completed) };
    const target = Math.max(1, Math.round(BLOCK_MS / pace));
    return {
      low: Math.max(1, Math.floor(target * .9)),
      high: Math.max(1, Math.ceil(target * 1.1))
    };
  }

  function blockSnapshot() {
    const rows = Object.values(session.blockAnswered || {});
    const { low, high } = routeRange();
    return {
      sessionNumber: session.blockNumber,
      endedAt: new Date().toISOString(),
      activeMs: Math.min(session.blockActiveMs, BLOCK_MS),
      answered: rows.length,
      correctFirstTry: rows.filter(x => x.correct).length,
      routeLow: low,
      routeHigh: high,
      lastQuestionId: session.lastPosition?.id || currentQuestionId() || null,
      globalProgressAnswered: Object.keys(session.progressAnswered || {}).length,
      totalQuestions: orderedQuestions.length
    };
  }

  function summaryHtml(snapshot) {
    return `
      <div class="session-sheet" role="dialog" aria-modal="true" aria-label="Recorrido de 30 minutos">
        <button class="session-close" type="button" aria-label="Continuar">×</button>
        <div class="session-kicker">30 minutos efectivos</div>
        <h3>Este fue tu recorrido</h3>
        <div class="session-big">${snapshot.answered}<span> ejercicios trabajados</span></div>
        <p class="session-pace">En primera respuesta resolviste correctamente <b>${snapshot.correctFirstTry}</b>.</p>
        <div class="session-route">Con tu ritmo actual, una siguiente sesión de media hora puede apuntar a <b>${snapshot.routeLow}–${snapshot.routeHigh} ejercicios</b>.</div>
        <button class="session-continue" type="button">Continuar estudiando</button>
      </div>`;
  }

  function registerCompletedBlock() {
    if (session.lastReportedBlock === session.blockNumber) {
      return session.sessionHistory[session.sessionHistory.length - 1] || blockSnapshot();
    }

    capturePosition();
    const snapshot = blockSnapshot();
    session.completedSessions += 1;
    session.lastReportedBlock = session.blockNumber;
    session.sessionHistory.push(snapshot);
    if (session.sessionHistory.length > 100) session.sessionHistory = session.sessionHistory.slice(-100);
    save();
    return snapshot;
  }

  function beginNextBlock() {
    session.blockNumber = session.completedSessions + 1;
    session.blockActiveMs = 0;
    session.lastTick = Date.now();
    session.blockAnswered = {};
    session.answerEvents = [];
    session.reportOpen = false;
    save();
  }

  function showSummary() {
    if (session.reportOpen) return;
    const snapshot = registerCompletedBlock();
    session.reportOpen = true;
    save();

    document.querySelector('.session-backdrop')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'session-backdrop';
    wrap.innerHTML = summaryHtml(snapshot);
    document.body.appendChild(wrap);

    const close = () => {
      wrap.remove();
      beginNextBlock();
    };
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('.session-close, .session-continue')) close();
    });
  }

  function pageIsActive() {
    const visible = document.visibilityState === 'visible';
    const focused = typeof document.hasFocus !== 'function' || document.hasFocus();
    return visible && focused;
  }

  function tick() {
    const now = Date.now();
    const delta = Math.max(0, Math.min(now - (session.lastTick || now), TICK_MS * 2));
    session.lastTick = now;

    if (pageIsActive() && !session.reportOpen) {
      session.blockActiveMs += delta;
      session.lifetimeActiveMs += delta;
    }
    capturePosition();
    save();

    if (!session.reportOpen && session.blockActiveMs >= BLOCK_MS) showSummary();
  }

  document.addEventListener('click', e => {
    const option = e.target.closest('[data-option]');
    if (!option || session.reportOpen) return;

    const id = currentQuestionId();
    const q = questions.get(id);
    if (!id || !q) return;

    const selected = option.getAttribute('data-option');
    const correct = selected === q.correct_answer;
    const nowIso = new Date().toISOString();

    if (!session.blockAnswered[id]) {
      session.blockAnswered[id] = {
        id,
        selected,
        correct,
        activeMs: session.blockActiveMs
      };
      session.answerEvents.push({ id, activeMs:session.blockActiveMs });
    }

    const prior = session.progressAnswered[id];
    session.progressAnswered[id] = prior
      ? { ...prior, lastSelected:selected, attempts:(Number(prior.attempts) || 0) + 1, lastSeenAt:nowIso }
      : { id, firstCorrect:correct, lastSelected:selected, attempts:1, firstSeenAt:nowIso, lastSeenAt:nowIso };

    capturePosition();
    save();
  }, { capture:true });

  document.addEventListener('visibilitychange', () => {
    session.lastTick = Date.now();
    capturePosition();
    save();
  });
  window.addEventListener('focus', () => { session.lastTick = Date.now(); save(); });
  window.addEventListener('blur', () => { session.lastTick = Date.now(); capturePosition(); save(); });
  window.addEventListener('pagehide', () => { session.lastTick = Date.now(); capturePosition(); save(); });

  const app = document.getElementById('app');
  if (app) {
    new MutationObserver(() => capturePosition()).observe(app, { childList:true, subtree:true });
  }

  // Todo empieza y se guarda en silencio. No existe ningún contador visible.
  session.lastTick = Date.now();
  save();
  window.setInterval(tick, TICK_MS);
  window.setTimeout(() => {
    capturePosition();
    if (!session.reportOpen && session.blockActiveMs >= BLOCK_MS) showSummary();
  }, 700);
})();
