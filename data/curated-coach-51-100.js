(() => {
  'use strict';

  const bank = window.PRONABEC_CURATED_51_100 || {};
  const base = window.PRONABEC_COACH || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const answerText = (q, letter) => (q?.alternatives || []).find(a => a.letter === letter)?.text || '';

  const allQuestions = (window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []);
  const byId = new Map(allQuestions.map(q => [q.id, q]));

  // Apply the audited answer only where the source key conflicts with the literal
  // wording/evidence. Preserve the printed-book key for transparency.
  for (const [id, entry] of Object.entries(bank)) {
    const q = byId.get(id);
    if (!q) continue;
    if (entry.bookAnswer && entry.answer && q.correct_answer !== entry.answer) {
      q.book_correct_answer = q.correct_answer;
      q.book_correct_answer_text = q.correct_answer_text;
      q.correct_answer = entry.answer;
      q.correct_answer_text = answerText(q, entry.answer) || q.correct_answer_text;
    }
  }

  // Extraction artifact in exercise 51: the following instruction leaked into E.
  const q51 = byId.get('RV-06-001');
  if (q51) {
    const e = (q51.alternatives || []).find(a => a.letter === 'E');
    if (e && /Completa los espacios/i.test(e.text || '')) {
      e.text = String(e.text).split(/\n?Completa los espacios/i)[0].trim();
      q51.correct_answer_text = e.text;
    }
  }

  function entryFor(q) { return q ? bank[q.id] || null : null; }

  function findFlexible(source, needle) {
    if (!source || !needle) return null;
    const pieces = String(needle).trim().split(/\s+/).map(reEsc);
    if (!pieces.length) return null;
    const match = new RegExp(pieces.join('\\s+'), 'i').exec(String(source));
    return match ? { start: match.index, end: match.index + match[0].length } : null;
  }

  function annotate(source, entry) {
    const text = String(source || '');
    if (!text || !entry) return '';
    const primary = findFlexible(text, entry.anchor);
    const secondary = findFlexible(text, entry.secondary);
    if (!primary && !secondary) return '';

    const marks = [];
    if (primary) marks.push({ ...primary, kind:'primary' });
    if (secondary && (!primary || secondary.end <= primary.start || secondary.start >= primary.end)) {
      marks.push({ ...secondary, kind:'secondary' });
    }
    marks.sort((a,b) => a.start - b.start);

    let cursor = 0;
    let html = '';
    for (const mark of marks) {
      html += esc(text.slice(cursor, mark.start));
      html += `<span class="curated-hl curated-${mark.kind}">${esc(text.slice(mark.start, mark.end))}</span>`;
      if (mark.kind === 'primary') {
        html += `<span class="curated-inline-note"><b>${esc(entry.focus)}</b><span>${esc(entry.point)}</span></span>`;
      }
      cursor = mark.end;
    }
    html += esc(text.slice(cursor));
    return `<span class="curated-reading" data-curated-position="${entry.position}">${html}</span>`;
  }

  function annotateContext(q, selected) {
    const entry = entryFor(q);
    if (entry && selected && q.context?.text) return annotate(q.context.text, entry);
    return base.annotateContext?.(q, selected) || '';
  }

  function annotatePrelude(q, selected) {
    const entry = entryFor(q);
    if (entry && selected && q.prelude_text) {
      const html = annotate(q.prelude_text, entry);
      return html ? `<div class="prelude curated-prelude">${html}</div>` : '';
    }
    return base.annotatePrelude?.(q, selected) || '';
  }

  function annotatePrompt(q, selected) {
    const entry = entryFor(q);
    if (!entry || !selected) return '';
    return annotate(q.prompt || '', entry);
  }

  function auditHtml(entry) {
    if (!entry?.audit) return '';
    return `<details class="curated-audit"><summary>Nota de calidad del ítem</summary><p>${esc(entry.audit)}</p></details>`;
  }

  function compactFeedback(q, selected) {
    const entry = entryFor(q);
    if (!entry || !selected || selected === q.correct_answer) {
      return base.compactFeedback?.(q, selected) || '';
    }
    const correct = answerText(q, q.correct_answer) || q.correct_answer_text || '';
    const specific = entry.wrong?.[selected] || 'Esa alternativa no conserva el criterio central que decide este ejercicio.';
    return `<div class="feedback curated-feedback curated-wrong">
      <div class="curated-answer"><span>Respuesta que encaja</span><b>${esc(q.correct_answer)} · ${esc(correct)}</b></div>
      <p>${esc(entry.point)}</p>
      <p class="curated-choice"><b>Tu elección ${esc(selected)}:</b> ${esc(specific)}</p>
      <div class="curated-transfer"><b>Idea que queda</b><span>${esc(entry.transfer)}</span></div>
      ${auditHtml(entry)}
    </div>`;
  }

  function successFeedback(q, selected) {
    const entry = entryFor(q);
    if (!entry || !selected || selected !== q.correct_answer) return '';
    return `<div class="feedback curated-feedback curated-right">
      <div class="curated-answer"><span>Lo importante aquí</span><b>${esc(entry.focus)}</b></div>
      <p>${esc(entry.point)}</p>
      <div class="curated-transfer"><b>Para otros ejercicios</b><span>${esc(entry.transfer)}</span></div>
      ${auditHtml(entry)}
    </div>`;
  }

  const coached = new Set([...(base.coached || []), ...Object.keys(bank)]);
  window.PRONABEC_COACH = {
    ...base,
    coached,
    entryFor,
    annotateContext,
    annotatePrelude,
    annotatePrompt,
    compactFeedback,
    successFeedback
  };
})();
