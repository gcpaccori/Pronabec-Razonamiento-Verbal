(() => {
  'use strict';

  const bank = window.PRONABEC_CURATED_101_150 || {};
  const human = window.PRONABEC_HUMAN_EXAMPLES_101_150 || {};
  const base = window.PRONABEC_COACH || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const reEsc = s => String(s).replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
  const answerText = (q, letter) => (q?.alternatives || []).find(a => a.letter === letter)?.text || '';

  const allQuestions = (window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []);
  const byId = new Map(allQuestions.map(q => [q.id, q]));

  // Only repair a scoring key when the book's own prose and its printed letter contradict each other.
  // We preserve the printed key in book_correct_answer for auditability.
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

  const newEntry = q => q ? bank[q.id] || null : null;
  const humanFor = q => q ? human[q.id] || null : null;

  function findFlexible(source, needle) {
    if (!source || !needle) return null;
    const pieces = String(needle).trim().split(/\s+/).map(reEsc);
    if (!pieces.length) return null;
    const match = new RegExp(pieces.join('\\s+'), 'i').exec(String(source));
    return match ? { start: match.index, end: match.index + match[0].length } : null;
  }

  function annotate(source, entry, lesson) {
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
        html += `<span class="curated-inline-note curated-inline-note-v2"><b>Aquí está la pista</b><span>${esc(lesson?.plain || entry.point)}</span></span>`;
      }
      cursor = mark.end;
    }
    html += esc(text.slice(cursor));
    return `<span class="curated-reading curated-reading-v2" data-curated-position="${entry.position}">${html}</span>`;
  }

  function annotateContext(q, selected) {
    const entry = newEntry(q);
    if (entry && selected && q.context?.text) return annotate(q.context.text, entry, humanFor(q));
    return base.annotateContext?.(q, selected) || '';
  }

  function annotatePrelude(q, selected) {
    const entry = newEntry(q);
    if (entry && selected && q.prelude_text) {
      const html = annotate(q.prelude_text, entry, humanFor(q));
      return html ? `<div class="prelude curated-prelude">${html}</div>` : '';
    }
    return base.annotatePrelude?.(q, selected) || '';
  }

  function annotatePrompt(q, selected) {
    const entry = newEntry(q);
    if (entry && selected) return annotate(q.prompt || '', entry, humanFor(q));
    return base.annotatePrompt?.(q, selected) || '';
  }

  function auditHtml(entry) {
    if (!entry?.audit) return '';
    const title = entry.bookAnswer && entry.bookAnswer !== entry.answer
      ? 'Corrección editorial detectada'
      : 'Un detalle del libro que conviene saber';
    return `<details class="curated-audit"><summary>${esc(title)}</summary><p>${esc(entry.audit)}</p></details>`;
  }

  function wrongParts(entry, selected) {
    const raw = entry?.wrong?.[selected];
    if (!raw) return {
      plausible:'La alternativa comparte alguna palabra o idea con el ejercicio, por eso puede atraer a primera vista.',
      break:'Pero no conserva la relación exacta que la pregunta está evaluando.'
    };
    if (typeof raw === 'string') return { plausible:'La alternativa parece cercana al tema.', break:raw };
    return {
      plausible: raw.plausible || 'La alternativa parece cercana al tema.',
      break: raw.break || raw.reason || 'No conserva la relación exacta del ejercicio.'
    };
  }

  function compactFeedback(q, selected) {
    const entry = newEntry(q);
    if (!entry || !selected || selected === q.correct_answer) {
      return base.compactFeedback?.(q, selected) || '';
    }

    const h = humanFor(q);
    const chosen = answerText(q, selected);
    const correct = answerText(q, q.correct_answer) || q.correct_answer_text || '';
    const parts = wrongParts(entry, selected);

    return `<div class="feedback curated-feedback curated-wrong curated-feedback-v2">
      <div class="curated-human-title">Vamos a separar lo que se parece de lo que realmente responde</div>

      <div class="curated-choice-card chosen">
        <span>Tu elección</span>
        <b>${esc(chosen || selected)}</b>
      </div>

      <div class="curated-guided-grid">
        <div class="curated-tempting">
          <b>Lo que sí viste</b>
          <p>${esc(parts.plausible)}</p>
        </div>
        <div class="curated-break">
          <b>El detalle que cambia todo</b>
          <p>${esc(parts.break)}</p>
        </div>
      </div>

      <div class="curated-example">
        <b>Un ejemplo fuera del ejercicio</b>
        <p>${esc(h?.example || entry.transfer)}</p>
      </div>

      <div class="curated-principle">
        <b>La regla que puedes reutilizar</b>
        <p>${esc(entry.transfer || h?.plain || entry.point)}</p>
      </div>

      <div class="curated-choice-card correct">
        <span>La opción que conserva la relación</span>
        <b>${esc(correct || q.correct_answer)}</b>
      </div>

      ${auditHtml(entry)}
    </div>`;
  }

  function successFeedback(q, selected) {
    const entry = newEntry(q);
    if (!entry || !selected || selected !== q.correct_answer) {
      return base.successFeedback?.(q, selected) || '';
    }
    const h = humanFor(q);
    const correct = answerText(q, selected) || q.correct_answer_text || '';

    return `<div class="feedback curated-feedback curated-right curated-feedback-v2">
      <div class="curated-human-title">Sí: esta opción conserva la relación importante</div>
      <div class="curated-choice-card correct">
        <span>La respuesta</span>
        <b>${esc(correct || selected)}</b>
      </div>
      <div class="curated-principle">
        <b>Qué viste bien</b>
        <p>${esc(h?.plain || entry.point)}</p>
      </div>
      <div class="curated-example">
        <b>Un ejemplo para reconocerlo después</b>
        <p>${esc(h?.example || entry.transfer)}</p>
      </div>
      ${auditHtml(entry)}
    </div>`;
  }

  const coached = new Set([...(base.coached || []), ...Object.keys(bank)]);
  window.PRONABEC_COACH = {
    ...base,
    coached,
    entryFor(q) { return newEntry(q) || base.entryFor?.(q) || null; },
    annotateContext,
    annotatePrelude,
    annotatePrompt,
    compactFeedback,
    successFeedback
  };
})();