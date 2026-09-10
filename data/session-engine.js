(() => {
  'use strict';

  const BLOCK_MS = 30 * 60 * 1000;
  const TICK_MS = 3000;
  const KEY = 'pronabec-adaptive-session-v2';
  const LEGACY_KEY = 'pronabec-adaptive-session-v1';
  const questions = new Map((window.PRONABEC_DATA?.topics || [])
    .flatMap(t => t.questions || []).map(q => [q.id, q]));

  const blank = () => ({
    blockNumber: 1,
    blockActiveMs: 0,
    totalActiveMs: 0,
    lastTick: Date.now(),
    answered: {},
    answerEvents: [],
    reportOpen: false
  });

  let session = load();

  function load() {
    try {
      const current = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (current && typeof current === 'object') {
        return { ...blank(), ...current, lastTick: Date.now(), reportOpen:false };
      }
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      if (legacy && typeof legacy === 'object') {
        return {
          ...blank(),
          blockActiveMs: Math.min(Number(legacy.activeMs) || 0, BLOCK_MS - 1),
          totalActiveMs: Number(legacy.activeMs) || 0,
          answered: legacy.answered || {},
          answerEvents: legacy.firstAnswers || []
        };
      }
    } catch (_) {}
    return blank();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (_) {}
  }

  function currentQuestionId() {
    return document.querySelector('.nav-num.current')?.getAttribute('title') || '';
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
    const count = Object.keys(session.answered || {}).length;
    return count ? session.blockActiveMs / count : 0;
  }

  function routeRange() {
    const pace = paceMs();
    const completed = Object.keys(session.answered || {}).length;
    if (!pace) return { low:Math.max(1, completed), high:Math.max(1, completed) };
    const target = Math.max(1, Math.round(BLOCK_MS / pace));
    return {
      low: Math.max(1, Math.floor(target * .9)),
      high: Math.max(1, Math.ceil(target * 1.1))
    };
  }

  function summaryHtml() {
    const rows = Object.values(session.answered || {});
    const completed = rows.length;
    const correct = rows.filter(x => x.correct).length;
    const { low, high } = routeRange();
    return `
      <div class="session-sheet" role="dialog" aria-modal="true" aria-label="Recorrido de 30 minutos">
        <button class="session-close" type="button" aria-label="Continuar">×</button>
        <div class="session-kicker">30 minutos efectivos</div>
        <h3>Este fue tu recorrido</h3>
        <div class="session-big">${completed}<span> ejercicios trabajados</span></div>
        <p class="session-pace">En primera respuesta resolviste correctamente <b>${correct}</b>.</p>
        <div class="session-route">Con tu ritmo actual, una siguiente sesión de media hora puede apuntar a <b>${low}–${high} ejercicios</b>.</div>
        <button class="session-continue" type="button">Continuar estudiando</button>
      </div>`;
  }

  function beginNextBlock() {
    session.blockNumber += 1;
    session.blockActiveMs = 0;
    session.lastTick = Date.now();
    session.answered = {};
    session.answerEvents = [];
    session.reportOpen = false;
    save();
  }

  function showSummary() {
    if (session.reportOpen) return;
    session.reportOpen = true;
    save();
    document.querySelector('.session-backdrop')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'session-backdrop';
    wrap.innerHTML = summaryHtml();
    document.body.appendChild(wrap);
    const close = () => {
      wrap.remove();
      beginNextBlock();
    };
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('.session-close, .session-continue')) close();
    });
  }

  function tick() {
    const now = Date.now();
    const delta = Math.max(0, Math.min(now - (session.lastTick || now), TICK_MS * 2));
    session.lastTick = now;

    if (document.visibilityState === 'visible' && !session.reportOpen) {
      session.blockActiveMs += delta;
      session.totalActiveMs += delta;
    }
    save();

    if (!session.reportOpen && session.blockActiveMs >= BLOCK_MS) showSummary();
  }

  document.addEventListener('click', e => {
    const option = e.target.closest('[data-option]');
    if (!option || session.reportOpen) return;
    const id = currentQuestionId();
    const q = questions.get(id);
    if (!id || !q || session.answered[id]) return;
    const selected = option.getAttribute('data-option');
    session.answered[id] = {
      id,
      selected,
      correct: selected === q.correct_answer,
      activeMs: session.blockActiveMs
    };
    session.answerEvents.push({ id, activeMs:session.blockActiveMs });
    save();
  }, { capture:true });

  document.addEventListener('visibilitychange', () => {
    session.lastTick = Date.now();
    save();
  });

  window.addEventListener('pagehide', () => {
    session.lastTick = Date.now();
    save();
  });

  // La sesión empieza silenciosamente al entrar. No hay cronómetro visible.
  session.lastTick = Date.now();
  save();
  window.setInterval(tick, TICK_MS);
  window.setTimeout(() => {
    if (!session.reportOpen && session.blockActiveMs >= BLOCK_MS) showSummary();
  }, 600);
})();