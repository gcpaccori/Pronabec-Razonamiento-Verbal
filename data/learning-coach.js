(() => {
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
  const compact = (s, n = 94) => {
    const v = clean(s);
    return v.length > n ? v.slice(0, n).replace(/\s+\S*$/, '') + '…' : v;
  };
  const STOP = new Set('a al algo ante bajo con contra cual cuales de del desde donde el ella en entre era es esa ese esta este esto fue ha hacia hay la las le les lo los mas me mi muy no o para pero porque que se si sin sobre son su sus un una uno unos unas y ya como cuando quien qué cuál cómo dónde más'.split(' '));
  const words = s => norm(s).split(/[^a-z0-9ñ]+/).filter(w => w.length > 2 && !STOP.has(w));
  const wordSet = s => new Set(words(s));
  const overlap = (text, target) => {
    const a = wordSet(text), b = wordSet(target);
    if (!a.size || !b.size) return 0;
    let hit = 0;
    for (const w of a) if (b.has(w)) hit++;
    return hit / Math.sqrt(a.size * b.size);
  };
  const sharedTerms = (a, b, limit = 3) => {
    const bs = wordSet(b);
    return [...new Set(words(a).filter(w => bs.has(w)))].slice(0, limit);
  };

  function skill(q) {
    const p = norm(q.prompt), t = norm(q.topic?.title);
    if (/idea (principal|central)|resume|tema central|medularmente/.test(p)) return 'main';
    if (/infiere|deduce|concluir|conclusion/.test(p)) return 'infer';
    if (/incompatible|incorrect|no se puede|no corresponde/.test(p)) return 'falsify';
    if (/sinonim|significa|sentido|termino/.test(p) || t.includes('sinonimia')) return 'meaning';
    if (/antonim|opuesto/.test(p) || t.includes('antonimia')) return 'opposite';
    if (/tipo de texto|texto es|clasifica/.test(p) || t.includes('tipos de textos')) return 'type';
    if (/proposito|finalidad|intencion|para que/.test(p)) return 'purpose';
    return 'evidence';
  }

  function answerText(q, letter) {
    return (q.alternatives || []).find(a => a.letter === letter)?.text || '';
  }

  function sentenceRanges(text) {
    const source = String(text || '');
    const ranges = [];
    const re = /[^.!?…]+(?:[.!?…]+|$)/g;
    let m;
    while ((m = re.exec(source))) {
      if (!clean(m[0])) continue;
      ranges.push({ start:m.index, end:m.index + m[0].length, text:clean(m[0]) });
    }
    if (!ranges.length && clean(source)) ranges.push({ start:0, end:source.length, text:clean(source) });
    return ranges;
  }

  function cueBonus(text, kind) {
    const n = norm(text);
    if (kind === 'trap' && /\b(sin embargo|pero|aunque|no obstante|en cambio|a diferencia|solo|unicamente|excepto)\b/.test(n)) return .3;
    if (kind === 'bridge' && /\b(por ello|por tanto|asi|entonces|porque|debido|de modo que|en consecuencia)\b/.test(n)) return .2;
    return 0;
  }

  function isCoachedWrong(q, selectedLetter) {
    return !!(q && coached.has(q.id) && selectedLetter && selectedLetter !== q.correct_answer);
  }

  function truthReason(q, evidence, selectedLetter) {
    const s = skill(q);
    const correct = answerText(q, q.correct_answer) || q.correct_answer_text || '';
    const selected = answerText(q, selectedLetter) || '';
    const terms = sharedTerms(evidence, correct, 3);
    const anchor = terms.length ? `Fíjate en «${terms.join(' · ')}».` : 'Compara sujeto, relación y alcance.';

    if (s === 'main') return `La ${q.correct_answer} recoge una idea que puede organizar esta evidencia y el resto del texto; tu ${selectedLetter} reduce o desplaza ese eje. ${anchor}`;
    if (s === 'infer') return `La ${q.correct_answer} sale de esta evidencia sin añadir una premisa externa; tu ${selectedLetter} necesita un salto que el texto no entrega. ${anchor}`;
    if (s === 'falsify') return `La ${q.correct_answer} es la que falla al contrastarla con esta evidencia; las demás pueden convivir con lo dicho. ${anchor}`;
    if (s === 'meaning') return `La ${q.correct_answer} conserva el sentido que la palabra tiene dentro de esta oración; tu ${selectedLetter} puede ser cercana fuera del contexto, pero aquí altera la relación. ${anchor}`;
    if (s === 'opposite') return `La ${q.correct_answer} invierte el rasgo semántico que funciona en esta frase; tu ${selectedLetter} cambia de palabra sin invertir exactamente ese eje. ${anchor}`;
    if (s === 'type') return `La ${q.correct_answer} coincide con la función que cumple este fragmento; el tema por sí solo no determina el tipo de texto. ${anchor}`;
    if (s === 'purpose') return `La ${q.correct_answer} expresa para qué está construida esta parte del texto; tu ${selectedLetter} describe contenido, pero no necesariamente la intención. ${anchor}`;
    return `La ${q.correct_answer} coincide con esta evidencia en lo esencial; tu ${selectedLetter} cambia al menos una relación o el alcance. ${anchor}`;
  }

  function keyNote(q, evidence) {
    const correct = compact(answerText(q, q.correct_answer) || q.correct_answer_text || '', 88);
    return `Sostiene ${q.correct_answer}: «${correct}». ¿Qué relación exacta entre esta frase y esa opción hace que encajen?`;
  }

  function trapNote(q, selectedLetter, sentence) {
    const selected = compact(answerText(q, selectedLetter), 74);
    const s = skill(q);
    if (s === 'main') return `Tu ${selectedLetter}: «${selected}». ¿Es el eje global o un detalle que sí aparece pero no resume todo?`;
    if (s === 'infer') return `Tu ${selectedLetter}: «${selected}». ¿Qué parte de esta frase autoriza exactamente esa conclusión?`;
    if (s === 'falsify') return `Tu ${selectedLetter}: «${selected}». ¿Esta frase realmente la contradice o todavía puede ser verdadera?`;
    if (s === 'meaning' || s === 'opposite') return `Tu ${selectedLetter}: «${selected}». Sustitúyela aquí: ¿la oración conserva la misma relación?`;
    if (s === 'purpose') return `Tu ${selectedLetter}: «${selected}». ¿Describe lo que dice o lo que el autor busca lograr?`;
    const terms = sharedTerms(sentence, selected, 2);
    return `Tu ${selectedLetter}: «${selected}». ${terms.length ? `Comparte «${terms.join(' · ')}», pero` : 'Aunque parece cercana,'} ¿mantiene la misma relación y alcance?`;
  }

  function pickMarks(text, q, selectedLetter) {
    const ranges = sentenceRanges(text);
    if (!ranges.length) return [];
    const selected = answerText(q, selectedLetter);
    const correct = answerText(q, q.correct_answer) || q.correct_answer_text || '';
    const goodTarget = `${q.prompt || ''} ${correct}`;
    const wrongTarget = `${q.prompt || ''} ${selected}`;

    const scored = ranges.map((r, i) => ({
      ...r,
      i,
      good: overlap(r.text, goodTarget),
      wrong: overlap(r.text, wrongTarget),
      bridge: overlap(r.text, q.prompt || '') + cueBonus(r.text, 'bridge'),
      trap: cueBonus(r.text, 'trap')
    }));

    const key = scored.reduce((a,b) => b.good > a.good ? b : a, scored[0]);
    const remaining = scored.filter(r => r.i !== key.i);
    let trap = remaining.length ? remaining.reduce((a,b) => (b.wrong + b.trap) > (a.wrong + a.trap) ? b : a, remaining[0]) : null;
    if (trap && trap.wrong + trap.trap < .1) trap = null;

    let second = trap;
    let kind = 'trap';
    if (!second && remaining.length) {
      second = remaining.reduce((a,b) => b.bridge > a.bridge ? b : a, remaining[0]);
      kind = 'bridge';
      if (second.bridge < .08) second = scored.find(r => Math.abs(r.i - key.i) === 1) || null;
    }

    const marks = [{ ...key, kind:'key', label:`Por qué ${q.correct_answer}`, note:keyNote(q, key.text) }];
    if (second) {
      marks.push({
        ...second,
        kind,
        label:kind === 'trap' ? `Tu ${selectedLetter}` : 'Conecta',
        note:kind === 'trap' ? trapNote(q, selectedLetter, second.text) : 'Une esta frase con la verde: ¿la relación es causa, contraste, consecuencia o ejemplo?'
      });
    }
    return marks.sort((a,b) => a.start - b.start);
  }

  function annotateExact(text, q, selectedLetter) {
    const source = String(text || '');
    const marks = pickMarks(source, q, selectedLetter);
    if (!marks.length) return esc(source);
    let cursor = 0;
    let html = '';
    for (const m of marks) {
      if (m.start < cursor) continue;
      html += esc(source.slice(cursor, m.start));
      html += `<span class="smart-hl hl-${m.kind}">${esc(source.slice(m.start, m.end))}</span>`;
      html += `<span class="smart-note note-${m.kind}"><b>${esc(m.label)}</b> ${esc(m.note)}</span>`;
      cursor = m.end;
    }
    html += esc(source.slice(cursor));
    return `<span class="smart-reading" data-question="${esc(q.id)}">${html}</span>`;
  }

  function annotateContext(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter) || !q.context?.text) return '';
    return annotateExact(q.context.text, q, selectedLetter);
  }

  function annotatePrelude(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter) || !q.prelude_text) return '';
    return `<div class="prelude guided-prelude">${annotateExact(q.prelude_text, q, selectedLetter)}</div>`;
  }

  function compactFeedback(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter)) return '';
    const source = q.context?.text || q.prelude_text || '';
    const marks = source ? pickMarks(source, q, selectedLetter) : [];
    const evidence = marks.find(m => m.kind === 'key')?.text || '';
    const correct = compact(answerText(q, q.correct_answer) || q.correct_answer_text || '', 96);
    const selected = compact(answerText(q, selectedLetter), 78);

    if (!source) {
      return `<div class="feedback feedback-return feedback-truth"><b>Correcta ${esc(q.correct_answer)}:</b> ${esc(correct)}<span>Tu ${esc(selectedLetter)}: ${esc(selected)}. Compara la relación exacta que pide el enunciado, no solo palabras parecidas.</span></div>`;
    }

    return `<div class="feedback feedback-return feedback-truth"><b>Correcta ${esc(q.correct_answer)}:</b> ${esc(correct)}<span>${esc(truthReason(q, evidence, selectedLetter))}</span></div>`;
  }

  window.PRONABEC_COACH = { coached, isCoachedWrong, annotateContext, annotatePrelude, compactFeedback };
})();