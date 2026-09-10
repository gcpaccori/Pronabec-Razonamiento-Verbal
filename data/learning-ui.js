(() => {
  'use strict';

  const ordered = (window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []);
  const globalPosition = new Map(ordered.map((q, i) => [q.id, i + 1]));

  function ensurePracticeMode() {
    const practice = document.querySelector('[data-mode="practice"]');
    if (practice && !practice.classList.contains('active')) practice.click();
  }

  function currentQuestionId() {
    return document.querySelector('.nav-num.current')?.getAttribute('title') || '';
  }

  function applyStudyUI() {
    ensurePracticeMode();

    const id = currentQuestionId();
    const n = globalPosition.get(id);
    const tag = document.querySelector('.question-card .tag.current');
    if (tag && n) {
      tag.textContent = `Ejercicio ${n}`;
      tag.setAttribute('aria-label', `Ejercicio ${n}`);
      tag.title = id;
    }

    // Después de un error, la respuesta oficial vuelve a ser visible.
    // El aprendizaje ocurre conectando esa respuesta con la evidencia resaltada.
    document.querySelectorAll('.question-card .option.answer-hidden').forEach(option => {
      option.classList.remove('answer-hidden');
      option.classList.add('correct');
    });
  }

  const app = document.getElementById('app');
  if (!app) return;
  const observer = new MutationObserver(applyStudyUI);
  observer.observe(app, { childList:true, subtree:true });
  applyStudyUI();
})();