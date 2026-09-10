(() => {
  'use strict';

  const data = window.PRONABEC_DATA;
  if (!data || !Array.isArray(data.topics)) return;

  const clean = value => String(value || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\b(?:www\.)?pucp\.edu\.pe\/postulantes\b/gi, '')
    .replace(/\bpe\/postulantes\b/gi, '')
    .replace(/(^|\n)\s*Recuperado\s+de\s*:?[ \t]*(?=\n|$)/gi, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  for (const topic of data.topics) {
    for (const context of topic.contexts || []) {
      if (typeof context.text === 'string') context.text = clean(context.text);
    }
    for (const q of topic.questions || []) {
      if (typeof q.prompt === 'string') q.prompt = clean(q.prompt);
      if (typeof q.prelude_text === 'string') q.prelude_text = clean(q.prelude_text);
      if (typeof q.correct_answer_text === 'string') q.correct_answer_text = clean(q.correct_answer_text);
      for (const a of q.alternatives || []) {
        if (typeof a.text === 'string') a.text = clean(a.text);
      }
    }
  }
})();
