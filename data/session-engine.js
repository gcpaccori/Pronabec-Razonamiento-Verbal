(() => {
  'use strict';

  const LIMIT_MS = 30 * 60 * 1000;
  const IDLE_MS = 2 * 60 * 1000;
  const TICK_MS = 5000;
  const KEY = 'pronabec-adaptive-session-v1';
  const questions = new Map((window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []).map(q => [q.id, q]));

  const blank = () => ({
    startedAt: null,
    activeMs: 0,
    lastTick: Date.now(),
    lastInteraction: Date.now(),
    firstAnswers: [],
    answered: {},
    reported: false
  });

  let session = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object') return { ...blank(), ...raw, lastTick: Date.now(), lastInteraction: Date.now() };
    } catch (_) {}
    return blank();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (_) {}
  }

  function freshSession() {
    session = blank();
    save();
  }

  function touch() {
    const now = Date.now();
    session.lastInteraction = now;
    if (!session.startedAt) {
      session.startedAt = now;
      session.lastTick = now;
    } else if (session.reported) {
      freshSession();
      session.startedAt = now;
      session.lastInteraction = now;
      session.lastTick = now;
    }
    save();
  }

  function currentQuestionId() {
    return document.querySelector('.nav-num.current')?.getAttribute('title') || '';
  }

  function median(values) {
    const v = values.slice().sort((a,b) => a-b);
    if (!v.length) return 0;
    const i = Math.floor(v.length / 2);
    return v.length % 2 ? v[i] : (v[i - 1] + v[i]) / 2;
  }

  function paceMs() {
    const a = session.firstAnswers || [];
    const intervals = [];
    for (let i = 1; i < a.length; i++) {
      const d = a[i].activeMs - a[i - 1].activeMs;
      if (d >= 8000 && d <= 12 * 60 * 1000) intervals.push(d);
    }
    if (intervals.length) return median(intervals);
    const count = Object.keys(session.answered || {}).length;
    return count ? session.activeMs / count : 0;
  }

  function fmtPace(ms) {
    if (!ms || !Number.isFinite(ms)) return 'ritmo aún variable';
    const sec = Math.max(1, Math.round(ms / 1000));
    if (sec < 60) return `${sec} s por ejercicio`;
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m} min ${s ? s + ' s' : ''} por ejercicio`.replace('  ', ' ');
  }

  function summaryHtml() {
    const rows = Object.values(session.answered || {});
    const completed = rows.length;
    const correct = rows.filter(x => x.correct).length;
    const accuracy = completed ? Math.round(correct * 100 / completed) : 0;
    const pace = paceMs();
    const target = pace ? Math.max(1, Math.round(LIMIT_MS / pace)) : completed;
    const low = Math.max(1, Math.round(target * .9));
    const high = Math.max(low, Math.round(target * 1.1));
    return `
      <div class="session-sheet" role="dialog" aria-modal="true" aria-label="Recorrido de 30 minutos">
        <div class="session-glow"></div>
        <button class="session-close" type="button" aria-label="Cerrar">×</button>
        <div class="session-kicker">Sesión completada</div>
        <h3>Tu recorrido de 30 minutos</h3>
        <div class="session-big">${completed}<span> ejercicios</span></div>
        <div class="session-stats">
          <div><b>${correct}</b><span>correctos</span></div>
          <div><b>${accuracy}%</b><span>precisión</span></div>
        </div>
        <p class="session-pace">Tu ritmo observado fue de <b>${fmtPace(pace)}</b>.</p>
        <div class="session-route">Para otra sesión de media hora, tu recorrido adaptativo es de <b>${low}–${high} ejercicios</b>. No necesitas perseguir el número: úsalo solo como referencia de carga.</div>
      </div>`;
  }

  function showSummary() {
    if (session.reported) return;
    session.reported = true;
    save();
    document.querySelector('.session-backdrop')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'session-backdrop';
    wrap.innerHTML = summaryHtml();
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('.session-close')) wrap.remove();
    });
  }

  function tick() {
    if (!session.startedAt || session.reported) return;
    const now = Date.now();
    const delta = Math.max(0, Math.min(now - (session.lastTick || now), TICK_MS * 2));
    session.lastTick = now;
    if (document.visibilityState === 'visible' && now - session.lastInteraction <= IDLE_MS) {
      session.activeMs += delta;
    }
    save();
    if (session.activeMs >= LIMIT_MS) showSummary();
  }

  document.addEventListener('pointerdown', e => {
    if (e.target.closest('.question-card, .mobile-dock, .navigator')) touch();
  }, { capture: true });

  document.addEventListener('click', e => {
    const option = e.target.closest('[data-option]');
    if (!option) return;
    touch();
    const id = currentQuestionId();
    const q = questions.get(id);
    if (!id || !q || session.answered[id]) return;
    const selected = option.getAttribute('data-option');
    session.answered[id] = { id, selected, correct: selected === q.correct_answer, activeMs: session.activeMs };
    session.firstAnswers.push({ id, activeMs: session.activeMs });
    save();
  }, { capture: true });

  document.addEventListener('visibilitychange', () => {
    session.lastTick = Date.now();
    if (document.visibilityState === 'visible') session.lastInteraction = Date.now();
    save();
  });

  window.setInterval(tick, TICK_MS);
  window.setTimeout(() => {
    session.lastTick = Date.now();
    if (session.startedAt && !session.reported && session.activeMs >= LIMIT_MS) showSummary();
  }, 1200);
})();
