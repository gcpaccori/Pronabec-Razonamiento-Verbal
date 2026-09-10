(() => {
  'use strict';

  const data = window.PRONABEC_DATA;
  if (!data || !Array.isArray(data.topics)) return;

  const stripNoise = value => String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\b(?:www\.)?pucp\.edu\.pe\/postulantes\b/gi, '')
    .replace(/\bpe\/postulantes\b/gi, '')
    .replace(/(^|\n)\s*Recuperado\s+de\s*:?[ \t]*(?=\n|$)/gi, '$1')
    .trim();

  // PDF extraction often inserts a newline at the end of every printed line and
  // even divides words with hyphens. This removes those layout artifacts while
  // preserving real paragraph boundaries.
  const unwrapPdfLines = value => {
    let s = stripNoise(value);
    if (!s) return '';

    // Rejoin words broken only because they reached the right edge of the PDF.
    s = s.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\n(?=[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1');

    // Protect real blank-line paragraph breaks before collapsing line wraps.
    const PARA = '\uE000';
    s = s.replace(/\n[ \t]*\n+/g, PARA);
    s = s.replace(/[ \t]*\n[ \t]*/g, ' ');
    s = s.replace(new RegExp(PARA, 'g'), '\n\n');
    s = s.replace(/[ \t]{2,}/g, ' ').replace(/ *\n\n */g, '\n\n').trim();
    return s;
  };

  const sentences = text => text.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map(x => x.trim()).filter(Boolean) || [text];

  // Some source texts lost every original paragraph break during extraction.
  // Reconstruct calm reading blocks instead of showing one huge wall of text.
  const reflowLongText = value => {
    const s = unwrapPdfLines(value);
    if (!s || s.includes('\n\n') || s.length < 430) return s;

    const parts = sentences(s);
    if (parts.length < 3) return s;

    const paragraphs = [];
    let current = '';
    for (const sentence of parts) {
      const candidate = current ? `${current} ${sentence}` : sentence;
      // Aim for roughly 2–3 sentences / 260–430 chars per paragraph on mobile.
      if (current && current.length >= 250 && candidate.length > 430) {
        paragraphs.push(current.trim());
        current = sentence;
      } else {
        current = candidate;
      }
    }
    if (current.trim()) paragraphs.push(current.trim());
    return paragraphs.join('\n\n');
  };

  // Short fields should never preserve PDF line endings.
  const cleanInline = value => unwrapPdfLines(value).replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  for (const topic of data.topics) {
    for (const context of topic.contexts || []) {
      if (typeof context.text === 'string') context.text = reflowLongText(context.text);
    }
    for (const q of topic.questions || []) {
      if (typeof q.prompt === 'string') q.prompt = cleanInline(q.prompt);
      if (typeof q.prelude_text === 'string') q.prelude_text = reflowLongText(q.prelude_text);
      if (typeof q.correct_answer_text === 'string') q.correct_answer_text = cleanInline(q.correct_answer_text);
      for (const a of q.alternatives || []) {
        if (typeof a.text === 'string') a.text = cleanInline(a.text);
      }
    }
  }
})();
