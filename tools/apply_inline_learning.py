from pathlib import Path

coach = r'''(() => {
  'use strict';

  const all = (window.PRONABEC_DATA?.topics || []).flatMap(t =>
    (t.questions || []).map(q => ({ ...q, topic: t }))
  );
  const coached = new Set(all.slice(0, 50).map(q => q.id));

  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const STOP = new Set('a al algo ante bajo con contra cual cuales de del desde donde el ella en entre era es esa ese esta este esto fue ha hacia hay la las le les lo los mas me mi muy no o para pero por porque que se si sin sobre son su sus te tu un una uno unos unas y ya como cuando quien qué cuál cómo dónde más'.split(' '));
  const words = s => norm(s).split(/[^a-z0-9ñ]+/).filter(w => w.length > 2 && !STOP.has(w));
  const set = s => new Set(words(s));
  const overlap = (text, target) => {
    const a = set(text), b = set(target);
    if (!a.size || !b.size) return 0;
    let hit = 0;
    for (const w of a) if (b.has(w)) hit++;
    return hit / Math.sqrt(a.size * b.size);
  };

  function skill(q) {
    const p = norm(q.prompt), t = norm(q.topic?.title);
    if (/idea (principal|central)|resume|tema central|medularmente/.test(p)) return 'main';
    if (/infiere|deduce|concluir|conclusion/.test(p)) return 'infer';
    if (/incompatible|incorrect|no se puede/.test(p)) return 'falsify';
    if (/sinonim|significa|sentido|termino/.test(p) || t.includes('sinonimia')) return 'meaning';
    if (/antonim|opuesto/.test(p) || t.includes('antonimia')) return 'opposite';
    if (/tipo de texto|texto es|clasifica/.test(p) || t.includes('tipos de textos')) return 'type';
    if (/proposito|finalidad|intencion|para que/.test(p)) return 'purpose';
    return 'evidence';
  }

  const notes = {
    main: {
      evidence:'Aquí está una idea que organiza el sentido global. No la leas como dato aislado: observa cómo explica las demás partes.',
      contrast:'Este giro cambia la dirección del texto. La idea principal debe conservar ambos lados, no quedarse solo con uno.'
    },
    infer: {
      evidence:'Esta frase es una premisa. La respuesta correcta debe salir de aquí con un solo paso lógico, sin añadir información externa.',
      contrast:'Este límite evita una inferencia exagerada. Si tu opción va más lejos que esta frase, ya estás imaginando.'
    },
    falsify: {
      evidence:'Usa esta frase como prueba. La opción incompatible es la que no puede convivir con esta evidencia sin deformarla.',
      contrast:'Aquí aparece una restricción decisiva. Compárala con tu opción: una pequeña inversión puede volverla falsa.'
    },
    meaning: {
      evidence:'El sentido de la palabra nace de esta oración completa. Sustitúyela mentalmente y conserva la misma relación.',
      contrast:'Este contraste fija el significado contextual. No uses una definición aislada de memoria.'
    },
    opposite: {
      evidence:'Esta oración revela el eje de significado. El antónimo debe invertir ese eje exacto, no ser solo una palabra distinta.',
      contrast:'El contraste muestra qué rasgo debe invertirse. Ese es el eje que debes conservar.'
    },
    type: {
      evidence:'Esta sección muestra qué hace el texto con la información. Esa función pesa más que el tema para reconocer el tipo textual.',
      contrast:'La forma en que cambia de una idea a otra revela su estructura.'
    },
    purpose: {
      evidence:'Aquí se ve el efecto que el autor busca producir en el lector. Eso responde al “para qué”, no solo al tema.',
      contrast:'Este giro revela la intención real del autor y evita confundir tema con propósito.'
    },
    evidence: {
      evidence:'Esta es la evidencia que debe gobernar tu elección. La alternativa correcta puede justificarse directamente desde aquí.',
      contrast:'Esta parte introduce un límite. Úsala para descartar opciones que generalizan o añaden demasiado.'
    }
  };

  function paragraphRole(text, index) {
    const n = norm(text);
    if (/\b(sin embargo|no obstante|pero|aunque|en cambio|a diferencia)\b/.test(n)) return ['contrast','Contraste'];
    if (/\b(por ello|por tanto|por lo tanto|asi|entonces|en conclusion|de este modo|en consecuencia)\b/.test(n)) return ['conclusion','Consecuencia'];
    if (/\b(por ejemplo|tal como|como muestra|un caso)\b/.test(n)) return ['example','Ejemplo'];
    if (index === 0) return ['frame','Planteamiento'];
    return ['support','Desarrollo'];
  }

  function splitSentences(p) {
    const x = clean(p);
    if (!x) return [];
    return x.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map(s => s.trim()).filter(Boolean) || [x];
  }

  function isCoachedWrong(q, selectedLetter) {
    return !!(q && coached.has(q.id) && selectedLetter && selectedLetter !== q.correct_answer);
  }

  function annotateContext(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter) || !q.context?.text) return '';
    const selected = (q.alternatives || []).find(a => a.letter === selectedLetter)?.text || '';
    const correct = (q.alternatives || []).find(a => a.letter === q.correct_answer)?.text || q.correct_answer_text || '';
    const target = `${q.prompt || ''} ${correct}`;
    const wrongTarget = `${q.prompt || ''} ${selected}`;

    let paragraphs = String(q.context.text).split(/\n\s*\n+/).map(clean).filter(Boolean);
    if (paragraphs.length < 2) {
      const sents = splitSentences(q.context.text);
      paragraphs = [];
      for (let i = 0; i < sents.length; i += 3) paragraphs.push(sents.slice(i, i + 3).join(' '));
    }

    const rows = [];
    paragraphs.forEach((p, pi) => {
      splitSentences(p).forEach((s, si) => rows.push({pi, si, text:s, good:overlap(s,target), bad:overlap(s,wrongTarget)}));
    });
    if (!rows.length) return '';

    const best = rows.reduce((a,b) => b.good > a.good ? b : a, rows[0]);
    const other = rows.filter(r => !(r.pi === best.pi && r.si === best.si));
    const wrong = other.length ? other.reduce((a,b) => b.bad > a.bad ? b : a, other[0]) : null;
    const copy = notes[skill(q)] || notes.evidence;

    return paragraphs.map((p, pi) => {
      const [role, roleName] = paragraphRole(p, pi);
      const body = splitSentences(p).map((s, si) => {
        const isBest = pi === best.pi && si === best.si;
        const isWrong = wrong && pi === wrong.pi && si === wrong.si && wrong.bad > 0.08;
        if (isBest) return `<mark class="guide-mark evidence">${esc(s)}</mark><span class="inline-teach-note evidence-note">${esc(copy.evidence)}</span>`;
        if (isWrong) return `<mark class="guide-mark contrast-mark">${esc(s)}</mark><span class="inline-teach-note contrast-note">${esc(copy.contrast)}</span>`;
        return esc(s);
      }).join(' ');
      return `<div class="guide-paragraph role-${role}"><span class="guide-role">${roleName}</span><p>${body}</p></div>`;
    }).join('');
  }

  function annotatePrelude(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter) || !q.prelude_text) return '';
    return `<div class="guided-prelude"><span class="guide-role">Dato de trabajo</span><p>${esc(q.prelude_text)}</p></div>`;
  }

  function compactFeedback(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter)) return '';
    return `<div class="feedback bad feedback-return"><div><b>No memorices la letra ${esc(q.correct_answer)}.</b> Vuelve al texto marcado arriba y explica por qué esa evidencia descarta tu alternativa.</div></div>`;
  }

  window.PRONABEC_COACH = { coached, isCoachedWrong, annotateContext, annotatePrelude, compactFeedback };
})();
'''
Path('data/learning-coach.js').write_text(coach, encoding='utf-8')

app_path = Path('app.js')
app = app_path.read_text(encoding='utf-8')
start = app.index('  function renderContext(q) {')
end = app.index('function renderVisual(q)', start)
app = app[:start] + '''  function renderContext(q) {
    if (!q.context) return '';
    const txt = q.context.text || '';
    const selected = state.answers[q.id];
    const guided = isFeedbackVisible(q) && window.PRONABEC_COACH?.annotateContext?.(q, selected);
    return `<section class="context ${guided ? 'guided-context' : ''}">
      <div class="context-head">${icon('book')}<h3>${esc(q.context.label || 'Texto de referencia')}</h3>${guided ? '<span class="guided-badge">Lectura guiada</span>' : ''}</div>
      <div class="context-text">${guided || esc(txt)}</div>
    </section>`;
  }

''' + app[end:]

start = app.index('  function renderFeedback(q, selected, isCorrect) {')
end = app.index('function renderQuestion()', start)
app = app[:start] + '''  function renderFeedback(q, selected, isCorrect) {
    if (!isFeedbackVisible(q)) return '';
    if (!selected) {
      return `<div class="feedback neutral">${icon('grid')}<div>Sin respuesta. La alternativa correcta es <b>${esc(q.correct_answer)}</b>${q.correct_answer_text ? ` — ${esc(q.correct_answer_text)}` : ''}.</div></div>`;
    }
    if (isCorrect) return `<div class="feedback ok">${icon('check')}<div><b>Respuesta correcta</b></div></div>`;
    const inline = window.PRONABEC_COACH?.compactFeedback?.(q, selected);
    if (inline) return inline;
    return `<div class="feedback bad">${icon('x')}<div><b>Respuesta incorrecta</b> · La correcta es <b>${esc(q.correct_answer)}</b>${q.correct_answer_text ? ` — ${esc(q.correct_answer_text)}` : ''}</div></div>`;
  }

''' + app[end:]

old = '${q.prelude_text ? `<div class="prelude">${esc(q.prelude_text)}</div>` : \'\'}'
new = '${q.prelude_text ? (window.PRONABEC_COACH?.annotatePrelude?.(q, selected) || `<div class="prelude">${esc(q.prelude_text)}</div>`) : \'\'}'
if old not in app:
    raise SystemExit('prelude marker not found')
app = app.replace(old, new, 1)

needle = '''    state.answers[q.id] = letter;
    saveProgress();
    render();
  }'''
replace = '''    state.answers[q.id] = letter;
    saveProgress();
    render();
    if (state.mode === 'practice' && letter !== q.correct_answer && window.PRONABEC_COACH?.coached?.has(q.id)) {
      requestAnimationFrame(() => document.querySelector('.guided-context, .guided-prelude')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }'''
if needle not in app:
    raise SystemExit('choose marker not found')
app = app.replace(needle, replace, 1)
app_path.write_text(app, encoding='utf-8')

css_path = Path('styles.css')
css = css_path.read_text(encoding='utf-8')
marker = '/* INLINE GUIDED READING V2 */'
if marker in css:
    css = css.split(marker)[0].rstrip() + '\n'
css += r'''

/* INLINE GUIDED READING V2 */
.guided-context{background:#fff;border-color:#dfe5ec;box-shadow:0 8px 28px rgba(24,39,75,.06)}
.guided-context .context-head{margin-bottom:14px}
.guided-badge{margin-left:auto;padding:5px 9px;border-radius:999px;background:#eef4ff;color:#3159b8;font-size:10px;font-weight:850;letter-spacing:.03em;text-transform:uppercase}
.guided-context .context-text{max-height:none;overflow:visible;padding-right:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:16px;line-height:1.72;color:#252b35}
.guide-paragraph{position:relative;margin:0 0 11px;padding:13px 13px 13px 15px;border-radius:13px;border-left:3px solid #dfe5ec;background:#fafbfc}
.guide-paragraph:last-child{margin-bottom:0}
.guide-paragraph.role-frame{border-left-color:#7ea2f8;background:#f8faff}
.guide-paragraph.role-support{border-left-color:#b9c3d0;background:#fafbfc}
.guide-paragraph.role-contrast{border-left-color:#e7a43b;background:#fffaf1}
.guide-paragraph.role-conclusion{border-left-color:#48a77b;background:#f5fbf8}
.guide-paragraph.role-example{border-left-color:#9b87d7;background:#faf8ff}
.guide-role{display:inline-block;margin-bottom:6px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:10px;line-height:1;font-weight:850;letter-spacing:.07em;text-transform:uppercase;color:#7a8492}
.guide-paragraph p,.guided-prelude p{margin:0}
.guide-mark{padding:.08em .16em;border-radius:.3em;color:inherit;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.guide-mark.evidence{background:#dff4e9;box-shadow:0 0 0 1px rgba(34,137,88,.12)}
.guide-mark.contrast-mark{background:#fff0c9;box-shadow:0 0 0 1px rgba(179,112,16,.12)}
.inline-teach-note{display:block;margin:8px 0 2px;padding:9px 10px;border-radius:10px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:12.5px;line-height:1.48;font-weight:650}
.evidence-note{background:#eef9f3;color:#246444;border:1px solid #d7ecdf}
.contrast-note{background:#fff8e9;color:#805818;border:1px solid #f1e0b7}
.guided-prelude{white-space:pre-line;background:#f8faff;border:1px solid #dfe8ff;border-left:3px solid #6d91ef;border-radius:14px;padding:13px 14px;margin-bottom:16px;color:#333c4b;line-height:1.62;font-size:15px}
.feedback-return{margin-top:12px;padding:11px 12px;font-size:12.5px;font-weight:600;background:#fff7f5;color:#8f423e}
@media(max-width:640px){
  .guided-context{margin:12px 12px 0;padding:13px 12px}
  .guided-context .context-text{font-size:15.5px;line-height:1.74}
  .guide-paragraph{padding:12px 11px 12px 13px;margin-bottom:9px}
  .inline-teach-note{font-size:12px;padding:8px 9px}
  .guided-badge{font-size:9px;padding:4px 7px}
}
'''
css_path.write_text(css, encoding='utf-8')

for p in [Path('.github/workflows/apply-inline-guided-reading.yml'), Path('tools/apply_inline_learning.py')]:
    if p.exists():
        p.unlink()
