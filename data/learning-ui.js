(() => {
  'use strict';

  const ordered = (window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []);
  const globalPosition = new Map(ordered.map((q, i) => [q.id, i + 1]));

  let applying = false;
  let scheduled = false;
  let switchingMode = false;

  function ensurePracticeMode() {
    const practice = document.querySelector('[data-mode="practice"]');
    if (!practice || practice.classList.contains('active') || switchingMode) return;
    switchingMode = true;
    practice.click();
    queueMicrotask(() => { switchingMode = false; });
  }

  function currentQuestionId() {
    return document.querySelector('.nav-num.current')?.getAttribute('title') || '';
  }

  function applyStudyUI() {
    if (applying) return;
    applying = true;

    try {
      ensurePracticeMode();

      const id = currentQuestionId();
      const n = globalPosition.get(id);
      const tag = document.querySelector('.question-card .tag.current');
      if (tag && n) {
        const label = `Ejercicio ${n}`;
        // Importante: no reescribir el mismo nodo si ya tiene el valor correcto.
        // textContent genera una mutación y antes hacía que el observer se llamara a sí mismo.
        if (tag.textContent !== label) tag.textContent = label;
        if (tag.getAttribute('aria-label') !== label) tag.setAttribute('aria-label', label);
        if (tag.title !== id) tag.title = id;
      }

      // Después de un error, la respuesta oficial permanece visible para conectar
      // explícitamente evidencia + alternativa correcta.
      document.querySelectorAll('.question-card .option.answer-hidden').forEach(option => {
        option.classList.remove('answer-hidden');
        option.classList.add('correct');
      });
    } finally {
      applying = false;
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyStudyUI();
    });
  }

  const app = document.getElementById('app');
  if (!app) return;

  // Solo observamos reemplazos de contenido del render principal. Las mutaciones
  // producidas por esta capa quedan idempotentes y no pueden crear un bucle.
  const observer = new MutationObserver(scheduleApply);
  observer.observe(app, { childList:true, subtree:true });
  applyStudyUI();
})();