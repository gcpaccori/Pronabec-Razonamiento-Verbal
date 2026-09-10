(() => {
  'use strict';

  function applyThinkingMode() {
    const guided = document.querySelector('.smart-reading[data-question]');
    if (!guided) return;

    // En las primeras 50, un error activa pistas pero no revela visualmente la correcta.
    document.querySelectorAll('.question-card .option.correct:not(.selected)').forEach(option => {
      option.classList.remove('correct');
      option.classList.add('answer-hidden');
    });
  }

  const app = document.getElementById('app');
  if (!app) return;
  const observer = new MutationObserver(applyThinkingMode);
  observer.observe(app, { childList:true, subtree:true });
  applyThinkingMode();
})();