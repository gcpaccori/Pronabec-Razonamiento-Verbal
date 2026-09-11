(() => {
  'use strict';

  const bank = window.PRONABEC_CURATED_51_100 || {};
  const human = window.PRONABEC_HUMAN_EXAMPLES_51_100 || {};
  const base = window.PRONABEC_COACH || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const answerText = (q, letter) => (q?.alternatives || []).find(a => a.letter === letter)?.text || '';

  const allQuestions = (window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []);
  const byId = new Map(allQuestions.map(q => [q.id, q]));

  // Keep scoring aligned with the audited/official key loaded before this module.
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

  // Extraction artifact in exercise 51: an instruction leaked into alternative E.
  const q51 = byId.get('RV-06-001');
  if (q51) {
    const e = (q51.alternatives || []).find(a => a.letter === 'E');
    if (e && /Completa los espacios/i.test(e.text || '')) {
      e.text = String(e.text).split(/\n?Completa los espacios/i)[0].trim();
      q51.correct_answer_text = e.text;
    }
  }

  function entryFor(q) { return q ? bank[q.id] || null : null; }
  function humanFor(q) { return q ? human[q.id] || null : null; }

  function findFlexible(source, needle) {
    if (!source || !needle) return null;
    const pieces = String(needle).trim().split(/\s+/).map(reEsc);
    if (!pieces.length) return null;
    const match = new RegExp(pieces.join('\\s+'), 'i').exec(String(source));
    return match ? { start: match.index, end: match.index + match[0].length } : null;
  }

  function annotate(source, entry, humanLesson) {
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
        const note = humanLesson?.plain || entry.point;
        html += `<span class="curated-inline-note"><b>Mira esta parte</b><span>${esc(note)}</span></span>`;
      }
      cursor = mark.end;
    }
    html += esc(text.slice(cursor));
    return `<span class="curated-reading" data-curated-position="${entry.position}">${html}</span>`;
  }

  function annotateContext(q, selected) {
    const entry = entryFor(q);
    if (entry && selected && q.context?.text) return annotate(q.context.text, entry, humanFor(q));
    return base.annotateContext?.(q, selected) || '';
  }

  function annotatePrelude(q, selected) {
    const entry = entryFor(q);
    if (entry && selected && q.prelude_text) {
      const html = annotate(q.prelude_text, entry, humanFor(q));
      return html ? `<div class="prelude curated-prelude">${html}</div>` : '';
    }
    return base.annotatePrelude?.(q, selected) || '';
  }

  function annotatePrompt(q, selected) {
    const entry = entryFor(q);
    if (!entry || !selected) return '';
    return annotate(q.prompt || '', entry, humanFor(q));
  }

  function auditHtml(entry) {
    if (!entry?.audit) return '';
    return `<details class="curated-audit"><summary>El libro tiene un punto discutible aquí</summary><p>${esc(entry.audit)}</p></details>`;
  }

  function compactFeedback(q, selected) {
    const entry = entryFor(q);
    if (!entry || !selected || selected === q.correct_answer) {
      return base.compactFeedback?.(q, selected) || '';
    }

    const h = humanFor(q);
    const chosen = answerText(q, selected);
    const correct = answerText(q, q.correct_answer) || q.correct_answer_text || '';
    const specific = entry.wrong?.[selected] || 'Esta alternativa cambia una relación importante del texto.';
    const principle = h?.plain || entry.point;
    const example = h?.example || entry.transfer;

    return `<div class="feedback curated-feedback curated-wrong">
      <div class="curated-human-title">Veamos qué pasó aquí</div>
      <div class="curated-choice-card chosen">
        <span>Lo que elegiste</span>
        <b>${esc(chosen || selected)}</b>
      </div>
      <div class="curated-why">
        <b>¿Dónde cambia el sentido?</b>
        <p>${esc(specific)}</p>
      </div>
      <div class="curated-example">
        <b>Míralo con un ejemplo sencillo</b>
        <p>${esc(example)}</p>
      </div>
      <div class="curated-principle">
        <b>La idea que necesitas</b>
        <p>${esc(principle)}</p>
      </div>
      <div class="curated-choice-card correct">
        <span>La opción que conserva el sentido del ejercicio</span>
        <b>${esc(correct || q.correct_answer)}</b>
      </div>
      ${auditHtml(entry)}
    </div>`;
  }

  function successFeedback(q, selected) {
    const entry = entryFor(q);
    if (!entry || !selected || selected !== q.correct_answer) return '';
    const h = humanFor(q);
    const correct = answerText(q, selected) || q.correct_answer_text || '';
    return `<div class="feedback curated-feedback curated-right">
      <div class="curated-human-title">Bien. Lo importante no es la letra.</div>
      <div class="curated-choice-card correct"><span>Lo que conserva el sentido</span><b>${esc(correct || selected)}</b></div>
      <div class="curated-principle"><b>¿Por qué funciona?</b><p>${esc(h?.plain || entry.point)}</p></div>
      <div class="curated-example"><b>Un ejemplo para llevártelo</b><p>${esc(h?.example || entry.transfer)}</p></div>
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
