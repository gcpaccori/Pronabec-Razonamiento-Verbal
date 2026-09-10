(() => {
  'use strict';

  const ACHIEVEMENTS = {
    first_step:['Primer paso','Empezaste tu recorrido.','✦'],
    questions_10:['10 ejercicios','Ya existe una base de práctica.','10'],
    questions_25:['25 ejercicios','Tu recorrido ya tiene consistencia.','25'],
    questions_50:['50 ejercicios','Superaste el primer gran bloque.','50'],
    questions_100:['100 ejercicios','Ya recorriste una parte importante del banco.','100'],
    halfway:['Mitad del banco','Llegaste a 140 ejercicios trabajados.','½'],
    complete_book:['Banco completo','Trabajaste los 280 ejercicios.','✓'],
    session_1:['Primera media hora','Completaste 30 minutos efectivos.','30'],
    sessions_5:['5 sesiones','Acumulaste cinco bloques de estudio.','5'],
    sessions_10:['10 sesiones','Ya construiste continuidad.','10'],
    precision_70:['70% al primer intento','Tu lectura empieza a ser más precisa.','70'],
    precision_85:['85% al primer intento','Alto control de primera respuesta.','85']
  };

  function fmtTime(ms) {
    const min = Math.floor((Number(ms) || 0) / 60000);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  function pct(n, total) {
    return total ? Math.min(100, Math.round((Number(n) || 0) * 100 / total)) : 0;
  }

  function nextGoal(p) {
    const n = Number(p.unique_questions) || 0;
    const milestones = [10,25,50,100,140,280];
    const next = milestones.find(x => n < x);
    if (!next) return '<b>Recorriste todo el banco.</b> Ahora el objetivo es fortalecer los ejercicios que todavía cuestan.';
    const remaining = next - n;
    return `Tu siguiente hito está a <b>${remaining} ejercicio${remaining === 1 ? '' : 's'}</b>. No necesitas correr: solo mantener el recorrido.`;
  }

  function achievementHtml(rows) {
    if (!rows?.length) return `<div class="next-goal">Tu primer logro aparecerá en cuanto completes tu primer ejercicio.</div>`;
    return `<div class="achievement-list">${rows.slice(0,8).map(row => {
      const meta = ACHIEVEMENTS[row.code] || [row.code,'Logro alcanzado.','✦'];
      return `<div class="achievement"><div class="achievement-icon">${meta[2]}</div><b>${meta[0]}</b><span>${meta[1]}</span></div>`;
    }).join('')}</div>`;
  }

  function sessionRows(rows) {
    if (!rows?.length) return `<div class="next-goal">Cuando completes tu primera sesión de 30 minutos, aparecerá aquí.</div>`;
    return `<div class="session-mini">${rows.slice(0,5).map((s, i) => {
      const worked = Number(s.questions_worked ?? s.answered) || 0;
      const correct = Number(s.first_try_correct ?? s.correctFirstTry) || 0;
      const accuracy = worked ? Math.round(correct * 100 / worked) : 0;
      const number = Number(s.session_number ?? s.sessionNumber) || (rows.length - i);
      return `<div class="session-mini-row"><b>Sesión ${number}</b><span>${worked} ejercicios · ${fmtTime(s.active_ms ?? s.activeMs)}</span><em>${accuracy}% 1.er intento</em></div>`;
    }).join('')}</div>`;
  }

  async function openProgress() {
    document.querySelector('.progress-backdrop')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'progress-backdrop';
    wrap.innerHTML = `<section class="progress-sheet"><div class="progress-grabber"></div><div class="progress-sheet-head"><div><div class="progress-kicker">Tu recorrido</div><h2>Cargando tu avance…</h2></div><button class="progress-close" type="button" aria-label="Cerrar">×</button></div></section>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('.progress-close')) wrap.remove();
    });

    let dashboard;
    try { dashboard = await window.PRONABEC_CLOUD?.getDashboard?.(); }
    catch (_) { dashboard = window.PRONABEC_CLOUD?.localDashboard?.(); }
    if (!dashboard || !wrap.isConnected) return;

    const p = dashboard.progress || {};
    const total = Number(p.total_questions) || 280;
    const unique = Number(p.unique_questions) || 0;
    const solved = Number(p.solved_questions) || 0;
    const sessions = Number(p.completed_sessions) || 0;
    const progressPct = pct(unique, total);
    const firstTry = unique ? Math.round((Number(p.first_try_correct) || 0) * 100 / unique) : 0;
    const sourceCopy = dashboard.source === 'cloud' ? 'Progreso sincronizado en tu cuenta' : 'Progreso guardado en este dispositivo';

    wrap.querySelector('.progress-sheet').innerHTML = `
      <div class="progress-grabber"></div>
      <div class="progress-sheet-head">
        <div><div class="progress-kicker">Tu recorrido</div><h2>Sí estás avanzando.</h2></div>
        <button class="progress-close" type="button" aria-label="Cerrar">×</button>
      </div>
      <div class="progress-hero">
        <div class="progress-hero-row"><strong>${progressPct}% <span>recorrido</span></strong><div class="progress-hero-copy">${unique} de ${total} ejercicios ya forman parte de tu camino.</div></div>
        <div class="progress-track"><i style="width:${progressPct}%"></i></div>
        <div class="progress-caption">El porcentaje cuenta ejercicios trabajados al menos una vez.</div>
      </div>
      <div class="progress-grid">
        <div class="progress-stat"><b>${solved}</b><span>resueltos correctamente alguna vez</span></div>
        <div class="progress-stat"><b>${sessions}</b><span>sesiones de 30 min completadas</span></div>
        <div class="progress-stat"><b>${fmtTime(p.total_active_ms)}</b><span>tiempo efectivo acumulado</span></div>
      </div>
      <div class="progress-section">
        <div class="progress-section-title"><h3>Siguiente hito</h3><span>${firstTry}% al primer intento</span></div>
        <div class="next-goal">${nextGoal(p)}</div>
      </div>
      <div class="progress-section">
        <div class="progress-section-title"><h3>Logros desbloqueados</h3><span>${dashboard.achievements?.length || 0}</span></div>
        ${achievementHtml(dashboard.achievements || [])}
      </div>
      <div class="progress-section">
        <div class="progress-section-title"><h3>Sesiones recientes</h3><span>30 min efectivos</span></div>
        ${sessionRows(dashboard.sessions || [])}
      </div>
      <div class="progress-source">${sourceCopy}</div>`;
  }

  function injectMenuButton() {
    const actions = document.querySelector('.side-actions');
    if (!actions || actions.querySelector('[data-my-progress]')) return;
    const btn = document.createElement('button');
    btn.className = 'side-action';
    btn.type = 'button';
    btn.setAttribute('data-my-progress','');
    btn.innerHTML = '<span aria-hidden="true">✦</span> Mi avance';
    actions.prepend(btn);
  }

  function injectSessionButton() {
    const sheet = document.querySelector('.session-sheet');
    if (!sheet || sheet.querySelector('[data-my-progress]')) return;
    const btn = document.createElement('button');
    btn.className = 'session-progress-link';
    btn.type = 'button';
    btn.setAttribute('data-my-progress','');
    btn.textContent = 'Ver mi avance acumulado';
    sheet.appendChild(btn);
  }

  function inject() {
    injectMenuButton();
    injectSessionButton();
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('[data-my-progress]')) return;
    e.preventDefault();
    document.body.classList.remove('drawer-open');
    document.querySelector('.session-backdrop')?.remove();
    openProgress();
  });

  new MutationObserver(inject).observe(document.documentElement, { childList:true, subtree:true });
  inject();

  window.PRONABEC_PROGRESS_UI = { open:openProgress };
})();
