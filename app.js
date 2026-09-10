(() => {
  'use strict';

  const APP_VERSION = '2.1.0';
  const app = document.getElementById('app');
  const fileInput = document.getElementById('jsonFile');
  let DATA = window.PRONABEC_DATA || { topics: [] };
  const PAGE_IMAGES = window.PRONABEC_PAGE_IMAGES || {};

  const state = {
    topicId: 'all',
    search: '',
    mode: 'practice',
    current: 0,
    answers: {},
    marked: {},
    contextExpanded: false,
    examSubmitted: false,
    datasetName: DATA?.metadata?.title || DATA?.metadata?.dataset || 'PRONABEC Razonamiento Verbal'
  };

  const ICONS = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    bookmark: '<path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17.5 6.5 21Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    x: '<path d="m7 7 10 10M17 7 7 17"/>',
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/>',
    chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m5 17 4-4 3 3 2-2 5 3"/>',
    upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 14v5h14v-5"/>'
  };

  function icon(name, cls = '') {
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function storageKey() {
    return `pronabec-sim-v2-${flattenAll().length}`;
  }

  function legacyStorageKey() {
    return `pronabec-sim-v1-${flattenAll().length}`;
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(storageKey()) || localStorage.getItem(legacyStorageKey()) || '{}';
      const saved = JSON.parse(raw);
      state.answers = saved.answers || {};
      state.marked = saved.marked || {};
      state.mode = saved.mode || 'practice';
    } catch (_) {}
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify({
        answers: state.answers,
        marked: state.marked,
        mode: state.mode
      }));
    } catch (_) {}
  }

  function esc(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[c]));
  }

  function norm(s = '') {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function flattenAll() {
    return (DATA.topics || []).flatMap(t =>
      (t.questions || []).map(q => ({
        ...q,
        topic: t,
        context: (t.contexts || []).find(c => String(c.id) === String(q.context_id)) || null
      }))
    );
  }

  function filtered() {
    let qs = flattenAll();
    if (state.topicId !== 'all') qs = qs.filter(q => String(q.topic_id) === String(state.topicId));
    const s = norm(state.search.trim());
    if (s) {
      qs = qs.filter(q => norm([
        q.id,
        q.prompt,
        q.prelude_text,
        q.context?.text,
        ...(q.alternatives || []).map(a => a.text)
      ].join(' ')).includes(s));
    }
    return qs;
  }

  function currentQuestions() { return filtered(); }

  function currentQ() {
    const qs = currentQuestions();
    if (!qs.length) return null;
    state.current = Math.max(0, Math.min(state.current, qs.length - 1));
    return qs[state.current];
  }

  function currentTopic() {
    return state.topicId === 'all'
      ? null
      : (DATA.topics || []).find(x => String(x.id) === String(state.topicId));
  }

  function sectionTitle() {
    const t = currentTopic();
    return t ? `${t.topic_number}. ${t.title}` : 'Todos los ejercicios';
  }

  function answeredCount(qs = currentQuestions()) {
    return qs.filter(q => state.answers[q.id]).length;
  }

  function correctCount(qs = currentQuestions()) {
    return qs.filter(q => state.answers[q.id] && state.answers[q.id] === q.correct_answer).length;
  }

  function scorePct(qs = currentQuestions()) {
    const ans = answeredCount(qs);
    return ans ? Math.round(correctCount(qs) * 100 / ans) : 0;
  }

  function isFeedbackVisible(q) {
    return state.mode === 'practice' ? !!state.answers[q.id] : state.examSubmitted;
  }

  function pageRange(q) {
    const a = Number(q.original_page_start || 0);
    const b = Number(q.original_page_end || a);
    const out = [];
    for (let p = a; p <= b; p++) if (PAGE_IMAGES[p]) out.push(p);
    return out;
  }

  function toast(msg) {
    document.querySelector('.toast')?.remove();
    const d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2400);
  }

  function openDrawer() { document.body.classList.add('drawer-open'); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); }

  function setTopic(id) {
    closeDrawer();
    state.topicId = id;
    state.current = 0;
    state.examSubmitted = false;
    state.contextExpanded = false;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setMode(mode) {
    state.mode = mode;
    state.examSubmitted = false;
    saveProgress();
    render();
  }

  function choose(letter) {
    const q = currentQ();
    if (!q) return;
    if (state.mode === 'exam' && state.examSubmitted) return;
    state.answers[q.id] = letter;
    saveProgress();
    render();
    if (state.mode === 'practice' && letter !== q.correct_answer && window.PRONABEC_COACH?.coached?.has(q.id)) {
      requestAnimationFrame(() => document.querySelector('.guided-context, .guided-prelude')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  function move(delta) {
    const qs = currentQuestions();
    if (!qs.length) return;
    state.current = Math.max(0, Math.min(qs.length - 1, state.current + delta));
    state.contextExpanded = false;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jump(i) {
    state.current = i;
    state.contextExpanded = false;
    closeDrawer();
    document.querySelector('.modal-backdrop')?.remove();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleMark() {
    const q = currentQ();
    if (!q) return;
    state.marked[q.id] = !state.marked[q.id];
    if (!state.marked[q.id]) delete state.marked[q.id];
    saveProgress();
    render();
  }

  function resetProgress() {
    if (!confirm('¿Borrar todas tus respuestas y preguntas marcadas?')) return;
    state.answers = {};
    state.marked = {};
    state.examSubmitted = false;
    saveProgress();
    render();
    toast('Progreso reiniciado');
  }

  function submitExam() {
    const qs = currentQuestions();
    if (!qs.length) return;
    const n = answeredCount(qs);
    if (n < qs.length && !confirm(`Has respondido ${n} de ${qs.length}. ¿Finalizar de todos modos?`)) return;
    state.examSubmitted = true;
    render();
    showResults();
  }

  function resultRows(qs) {
    return qs.map((q, i) => {
      const a = state.answers[q.id] || '—';
      const ok = a === q.correct_answer;
      return `<div class="result-row ${ok ? 'good' : 'bad'}">
        <b>${esc(q.id)}</b>
        <div class="result-status">${ok ? 'Respuesta correcta' : `Elegiste ${esc(a)} · Correcta ${esc(q.correct_answer)}`}</div>
        <button class="btn compact" type="button" data-jump-result="${i}">Ver</button>
      </div>`;
    }).join('');
  }

  function showResults() {
    const qs = currentQuestions();
    const good = correctCount(qs);
    const answered = answeredCount(qs);
    const pct = qs.length ? Math.round(good * 100 / qs.length) : 0;
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Resultados">
      <div class="modal-grabber"></div>
      <div class="modal-head">
        <div><div class="modal-title">Tus resultados</div><div class="score-sub">${answered} de ${qs.length} respondidas</div></div>
        <button class="icon-btn" type="button" data-close-modal aria-label="Cerrar">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="score-panel">
          <div><div class="score-big">${pct}%</div><div class="score-sub">puntaje sobre el total</div></div>
          <div class="score-caption"><b>${good} correctas</b>${qs.length - good} por mejorar</div>
        </div>
        <div class="result-list">${resultRows(qs)}</div>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" data-export>${icon('upload')} Exportar</button>
        <button class="btn primary" type="button" data-close-modal>Cerrar</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('[data-close-modal]')) modal.remove();
      const j = e.target.closest('[data-jump-result]');
      if (j) jump(Number(j.dataset.jumpResult));
      if (e.target.closest('[data-export]')) exportResults();
    });
  }

  function showNavigator() {
    const qs = currentQuestions();
    if (!qs.length) return;
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Mapa de preguntas">
      <div class="modal-grabber"></div>
      <div class="modal-head">
        <div><div class="modal-title">Mapa de preguntas</div><div class="score-sub">Toca un número para ir directamente</div></div>
        <button class="icon-btn" type="button" data-close-modal aria-label="Cerrar">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="drawer-nav-grid">${renderNavButtons(qs, 'data-nav-jump')}</div>
        <div class="legend"><span><i class="dot a"></i>Respondida</span><span><i class="dot m"></i>Marcada</span></div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('[data-close-modal]')) modal.remove();
      const n = e.target.closest('[data-nav-jump]');
      if (n) jump(Number(n.dataset.navJump));
    });
  }

  function exportResults() {
    const qs = currentQuestions();
    const out = {
      generated_at: new Date().toISOString(),
      app_version: APP_VERSION,
      mode: state.mode,
      topic: state.topicId,
      score: {
        correct: correctCount(qs),
        answered: answeredCount(qs),
        total: qs.length,
        percent: qs.length ? Math.round(correctCount(qs) * 100 / qs.length) : 0
      },
      answers: qs.map(q => ({
        id: q.id,
        selected: state.answers[q.id] || null,
        correct: q.correct_answer,
        is_correct: state.answers[q.id] === q.correct_answer
      }))
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resultado_pronabec.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || !Array.isArray(d.topics)) throw new Error('Estructura no compatible');
        DATA = d;
        state.topicId = 'all';
        state.current = 0;
        state.answers = {};
        state.marked = {};
        state.examSubmitted = false;
        state.datasetName = file.name;
        closeDrawer();
        render();
        toast(`Base cargada: ${file.name}`);
      } catch (e) {
        alert('No se pudo cargar el JSON: ' + e.message);
      }
    };
    r.readAsText(file, 'utf-8');
  }

  function renderSidebar() {
    const topics = DATA.topics || [];
    return `<aside class="sidebar" aria-label="Menú principal">
      <div class="sidebar-head">
        <div class="brand">
          <div class="brand-badge">P</div>
          <div class="brand-copy"><h1>Simulador PRONABEC</h1><small>Razonamiento Verbal</small></div>
        </div>
        <button class="icon-btn sidebar-close" type="button" data-close-drawer aria-label="Cerrar menú">${icon('close')}</button>
      </div>

      <div class="search-wrap">
        <span class="search-icon">${icon('search')}</span>
        <input id="searchInput" class="search" value="${esc(state.search)}" placeholder="Buscar pregunta o texto" autocomplete="off">
      </div>

      <div class="side-section">
        <div class="side-title"><span>Temas</span><span>${topics.length}</span></div>
        <div class="topic-list">
          <button class="topic-btn ${state.topicId === 'all' ? 'active' : ''}" type="button" data-topic="all">
            <span class="topic-copy">Todos los ejercicios</span><span class="count-pill">${flattenAll().length}</span>
          </button>
          ${topics.map(t => `<button class="topic-btn ${String(state.topicId) === String(t.id) ? 'active' : ''}" type="button" data-topic="${esc(t.id)}">
            <span class="topic-copy">${esc(t.topic_number + '. ' + t.title)}</span><span class="count-pill">${(t.questions || []).length}</span>
          </button>`).join('')}
        </div>
      </div>

      <div class="side-actions">
        <button class="side-action" type="button" data-open-navigator>${icon('grid')} Mapa de preguntas</button>
        ${state.mode === 'exam' && !state.examSubmitted ? `<button class="side-action" type="button" data-submit>${icon('check')} Finalizar examen</button>` : `<button class="side-action" type="button" data-results>${icon('chart')} Ver resultados</button>`}
        <button class="side-action" type="button" data-load-json>${icon('file')} Cargar otro JSON</button>
        <button class="side-action danger" type="button" data-reset>${icon('reset')} Reiniciar progreso</button>
      </div>
    </aside>`;
  }

  function renderModeSwitch(extraClass = '') {
    return `<div class="mode-switch ${extraClass}" aria-label="Modo de estudio">
      <button type="button" data-mode="practice" class="${state.mode === 'practice' ? 'active' : ''}">Práctica</button>
      <button type="button" data-mode="exam" class="${state.mode === 'exam' ? 'active' : ''}">Examen</button>
    </div>`;
  }

  function renderHeader() {
    const qs = currentQuestions();
    const answered = answeredCount(qs);
    const progress = qs.length ? Math.round(answered * 100 / qs.length) : 0;
    const accuracyVisible = !(state.mode === 'exam' && !state.examSubmitted);
    const accuracy = accuracyVisible ? scorePct(qs) + '%' : 'Oculta';
    const correct = accuracyVisible ? correctCount(qs) : '—';
    const title = sectionTitle();

    return `<div class="mobile-appbar">
        <button class="icon-btn" type="button" data-open-drawer aria-label="Abrir menú">${icon('menu')}</button>
        <div class="mobile-title"><div class="mobile-kicker">PRONABEC</div><h1>${esc(title)}</h1></div>
        <button class="icon-btn" type="button" data-open-navigator aria-label="Mapa de preguntas">${icon('grid')}</button>
      </div>
      <div class="mobile-mode-row">${renderModeSwitch()}</div>

      <div class="topbar">
        <div class="topbar-main">
          <div class="topbar-left"><div class="eyebrow">Simulador PRONABEC · Razonamiento Verbal</div><h2>${esc(title)}</h2></div>
          <div class="top-actions">${renderModeSwitch()}${state.mode === 'exam' ? '<button class="btn primary" type="button" data-submit>Finalizar examen</button>' : '<button class="btn" type="button" data-results>Ver resultados</button>'}</div>
        </div>
      </div>

      <section class="progress-card" aria-label="Progreso">
        <div class="progress-top">
          <div class="progress-label"><strong>${answered} / ${qs.length}</strong><span>respondidas</span></div>
          <div class="progress-percent">${progress}%</div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="progress-meta"><span>Correctas <b>${correct}</b></span><span>Precisión <b>${accuracy}</b></span><span>${qs.filter(q => state.marked[q.id]).length ? `Marcadas <b>${qs.filter(q => state.marked[q.id]).length}</b>` : 'Tu avance se guarda automáticamente'}</span></div>
      </section>`;
  }

  function renderContext(q) {
    if (!q.context) return '';
    const txt = q.context.text || '';
    const selected = state.answers[q.id];
    const guided = isFeedbackVisible(q) && window.PRONABEC_COACH?.annotateContext?.(q, selected);
    return `<section class="context ${guided ? 'guided-context' : ''}">
      <div class="context-head">${icon('book')}<h3>${esc(q.context.label || 'Texto de referencia')}</h3>${guided ? '<span class="guided-badge">Lectura guiada</span>' : ''}</div>
      <div class="context-text">${guided || esc(txt)}</div>
    </section>`;
  }

function renderVisual(q) {
    if (!q.requires_visual) return '';
    const pages = pageRange(q);
    return `<section class="visual-wrap">
      <div class="visual-title">${icon('image')} Material visual · página ${esc(q.original_page_start)}${q.original_page_end && q.original_page_end !== q.original_page_start ? '–' + esc(q.original_page_end) : ''}</div>
      ${pages.length
        ? `<div class="page-images">${pages.map(p => `<img class="page-img" loading="lazy" data-zoom src="${esc(PAGE_IMAGES[p])}" alt="Página ${p}">`).join('')}</div>`
        : '<div>Esta pregunta requiere material visual, pero no hay una imagen asociada.</div>'}
    </section>`;
  }

  function renderFeedback(q, selected, isCorrect) {
    if (!isFeedbackVisible(q)) return '';
    if (!selected) {
      return `<div class="feedback neutral">${icon('grid')}<div>Sin respuesta. La alternativa correcta es <b>${esc(q.correct_answer)}</b>${q.correct_answer_text ? ` — ${esc(q.correct_answer_text)}` : ''}.</div></div>`;
    }
    if (isCorrect) return `<div class="feedback ok">${icon('check')}<div><b>Respuesta correcta</b></div></div>`;
    const inline = window.PRONABEC_COACH?.compactFeedback?.(q, selected);
    if (inline) return inline;
    return `<div class="feedback bad">${icon('x')}<div><b>Respuesta incorrecta</b> · La correcta es <b>${esc(q.correct_answer)}</b>${q.correct_answer_text ? ` — ${esc(q.correct_answer_text)}` : ''}</div></div>`;
  }

function renderQuestion() {
    const q = currentQ();
    const qs = currentQuestions();
    if (!q) return `<div class="card empty"><b>No encontramos preguntas.</b><br>Prueba con otro tema o borra el texto de búsqueda.</div>`;

    const selected = state.answers[q.id];
    const show = isFeedbackVisible(q);
    const isCorrect = selected === q.correct_answer;
    const marked = !!state.marked[q.id];
    const options = (q.alternatives || []).map(a => {
      let cls = 'option';
      if (selected === a.letter) cls += ' selected';
      if (show && a.letter === q.correct_answer) cls += ' correct';
      if (show && selected === a.letter && selected !== q.correct_answer) cls += ' incorrect';
      const stateIcon = show && a.letter === q.correct_answer ? icon('check') : (show && selected === a.letter && selected !== q.correct_answer ? icon('x') : icon('check'));
      return `<button class="${cls}" type="button" data-option="${esc(a.letter)}" aria-pressed="${selected === a.letter ? 'true' : 'false'}">
        <span class="letter">${esc(a.letter)}</span>
        <span class="option-text">${esc(a.text)}</span>
        <span class="option-state">${stateIcon}</span>
      </button>`;
    }).join('');

    return `<article class="card question-card">
      <div class="q-head">
        <div class="q-meta">
          <button class="tag current" type="button" data-open-navigator>Pregunta ${state.current + 1} de ${qs.length}</button>
          ${q.requires_visual ? '<span class="tag visual">Visual</span>' : ''}
          ${marked ? '<span class="tag marked">Revisar</span>' : ''}
        </div>
        <button class="mark-icon ${marked ? 'active' : ''}" type="button" data-mark aria-label="${marked ? 'Quitar marca' : 'Marcar para revisar'}">${icon('bookmark')}</button>
      </div>
      ${renderContext(q)}
      ${renderVisual(q)}
      <div class="q-body">
        ${q.prelude_text ? (window.PRONABEC_COACH?.annotatePrelude?.(q, selected) || `<div class="prelude">${esc(q.prelude_text)}</div>`) : ''}
        <p class="prompt">${esc(q.prompt)}</p>
        <div class="options">${options}</div>
        ${renderFeedback(q, selected, isCorrect)}
      </div>
      <div class="q-footer">
        <div class="nav-group"><button class="btn" type="button" data-prev ${state.current === 0 ? 'disabled' : ''}>${icon('chevronLeft')} Anterior</button><button class="btn primary" type="button" data-next ${state.current === qs.length - 1 ? 'disabled' : ''}>Siguiente ${icon('chevronRight')}</button></div>
        <div class="nav-group">${state.mode === 'exam' && !state.examSubmitted ? '<button class="btn" type="button" data-submit>Finalizar examen</button>' : '<button class="btn ghost" type="button" data-results>Resultados</button>'}</div>
      </div>
    </article>`;
  }

  function navButtonClass(q, i) {
    const a = state.answers[q.id];
    const show = isFeedbackVisible(q);
    let cls = 'nav-num';
    if (i === state.current) cls += ' current';
    if (a) cls += ' answered';
    if (show && a) cls += a === q.correct_answer ? ' correct' : ' wrong';
    if (state.marked[q.id]) cls += ' marked';
    return cls;
  }

  function renderNavButtons(qs, dataAttr = 'data-jump') {
    return qs.map((q, i) => `<button class="${navButtonClass(q, i)}" type="button" ${dataAttr}="${i}" title="${esc(q.id)}">${i + 1}</button>`).join('');
  }

  function renderNavigator() {
    const qs = currentQuestions();
    if (!qs.length) return '';
    return `<aside class="card navigator">
      <div class="navigator-head"><h3>Mapa de preguntas</h3><span class="q-id">${answeredCount(qs)}/${qs.length}</span></div>
      <div class="nav-grid">${renderNavButtons(qs)}</div>
      <div class="legend"><span><i class="dot a"></i>Respondida</span><span><i class="dot m"></i>Marcada</span></div>
    </aside>`;
  }

  function renderMobileDock() {
    const q = currentQ();
    const qs = currentQuestions();
    if (!q || !qs.length) return '';
    const marked = !!state.marked[q.id];
    return `<nav class="mobile-dock" aria-label="Navegación de preguntas">
      <div class="dock-inner">
        <button class="dock-btn" type="button" data-prev ${state.current === 0 ? 'disabled' : ''}>${icon('chevronLeft')} Anterior</button>
        <button class="dock-btn mark ${marked ? 'active' : ''}" type="button" data-mark aria-label="${marked ? 'Quitar marca' : 'Marcar para revisar'}">${icon('bookmark')}</button>
        ${state.mode === 'exam' && !state.examSubmitted && state.current === qs.length - 1
          ? `<button class="dock-btn next" type="button" data-submit>Finalizar ${icon('check')}</button>`
          : `<button class="dock-btn next" type="button" data-next ${state.current === qs.length - 1 ? 'disabled' : ''}>Siguiente ${icon('chevronRight')}</button>`}
      </div>
    </nav>`;
  }

  function render() {
    app.innerHTML = `<div class="app-shell">
      ${renderSidebar()}
      <div class="drawer-backdrop" data-close-drawer></div>
      <main class="main">
        ${renderHeader()}
        <div class="workspace">${renderQuestion()}${renderNavigator()}</div>
      </main>
      ${renderMobileDock()}
    </div>`;
    bindAll();
  }

  function bindAll() {
    document.querySelectorAll('[data-open-drawer]').forEach(el => el.onclick = openDrawer);
    document.querySelectorAll('[data-close-drawer]').forEach(el => el.onclick = closeDrawer);
    document.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => setTopic(el.dataset.topic));
    document.querySelectorAll('[data-option]').forEach(el => el.onclick = () => choose(el.dataset.option));
    document.querySelectorAll('[data-prev]').forEach(el => el.onclick = () => move(-1));
    document.querySelectorAll('[data-next]').forEach(el => el.onclick = () => move(1));
    document.querySelectorAll('[data-jump]').forEach(el => el.onclick = () => jump(Number(el.dataset.jump)));
    document.querySelectorAll('[data-mark]').forEach(el => el.onclick = toggleMark);
    document.querySelectorAll('[data-submit]').forEach(el => el.onclick = submitExam);
    document.querySelectorAll('[data-results]').forEach(el => el.onclick = () => { closeDrawer(); showResults(); });
    document.querySelectorAll('[data-open-navigator]').forEach(el => el.onclick = () => { closeDrawer(); showNavigator(); });
    document.querySelectorAll('[data-mode]').forEach(el => el.onclick = () => setMode(el.dataset.mode));
    document.querySelectorAll('[data-load-json]').forEach(el => el.onclick = () => fileInput.click());
    document.querySelectorAll('[data-reset]').forEach(el => el.onclick = resetProgress);

    document.querySelectorAll('[data-zoom]').forEach(img => img.onclick = () => {
      const z = document.createElement('div');
      z.className = 'zoom';
      z.innerHTML = `<img src="${img.src}" alt="Vista ampliada">`;
      z.onclick = () => z.remove();
      document.body.appendChild(z);
    });

    const s = document.getElementById('searchInput');
    if (s) s.oninput = () => {
      state.search = s.value;
      state.current = 0;
      render();
      setTimeout(() => {
        const n = document.getElementById('searchInput');
        if (n) {
          n.focus();
          n.setSelectionRange(n.value.length, n.value.length);
        }
      }, 0);
    };
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) importJSON(fileInput.files[0]);
    fileInput.value = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDrawer();
      document.querySelector('.modal-backdrop')?.remove();
      return;
    }
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (/^[1-5]$/.test(e.key)) {
      const q = currentQ();
      const a = q?.alternatives?.[Number(e.key) - 1];
      if (a) choose(a.letter);
    }
  });

  loadProgress();
  render();
})();
