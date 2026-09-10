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
  const compact = (s, n = 54) => {
    const v = clean(s);
    return v.length > n ? v.slice(0, n).replace(/\s+\S*$/, '') + '…' : v;
  };
  const keyWords = (s, n = 3) => [...new Set(words(s))].slice(0, n);

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
    if (kind === 'contrast' && /\b(sin embargo|pero|aunque|no obstante|en cambio|a diferencia|solo|unicamente)\b/.test(n)) return .3;
    if (kind === 'bridge' && /\b(por ello|por tanto|asi|entonces|porque|debido|de modo que|en consecuencia)\b/.test(n)) return .2;
    return 0;
  }

  function isCoachedWrong(q, selectedLetter) {
    return !!(q && coached.has(q.id) && selectedLetter && selectedLetter !== q.correct_answer);
  }

  function questionCue(q, selected, kind, sentence) {
    const s = skill(q);
    const demand = compact(q.prompt, 66);
    const wrongKeys = keyWords(selected, 2).join(' / ') || 'tu alternativa';
    const sentenceKeys = keyWords(sentence, 3).join(' · ');

    if (kind === 'key') {
      if (s === 'main') return `¿Esta frase explica también los otros párrafos, o solo uno?`;
      if (s === 'infer') return `¿Qué conclusión sale de «${sentenceKeys}» sin agregar nada externo?`;
      if (s === 'falsify') return `¿Qué opción no puede convivir con esta afirmación?`;
      if (s === 'meaning') return `Sustituye la palabra en esta misma frase: ¿qué sentido se conserva?`;
      if (s === 'opposite') return `¿Cuál es el eje que esta frase permite invertir exactamente?`;
      if (s === 'type') return `¿Qué está haciendo aquí el autor: narrar, explicar, sostener o indicar?`;
      if (s === 'purpose') return `Después de leer esto, ¿qué quiere que el lector comprenda o haga?`;
      return `La pregunta exige «${demand}». ¿Qué palabra de esta frase la responde?`;
    }

    if (kind === 'trap') {
      if (s === 'main') return `Tu opción recoge «${wrongKeys}». ¿Es el eje del texto o solo un detalle verdadero?`;
      if (s === 'infer') return `Tu opción usa «${wrongKeys}». ¿El texto da ese paso o lo estás completando tú?`;
      if (s === 'falsify') return `Compara «${wrongKeys}» con esta frase. ¿Confirma, invierte o exagera?`;
      if (s === 'meaning' || s === 'opposite') return `¿«${wrongKeys}» mantiene la relación exacta de esta oración?`;
      return `Tu opción se apoya en «${wrongKeys}». ¿Coincide con la función de esta parte o solo con sus palabras?`;
    }

    return `Une esta frase con la resaltada: ¿la relación es causa, contraste, consecuencia o ejemplo?`;
  }

  function pickMarks(text, q, selectedLetter) {
    const ranges = sentenceRanges(text);
    if (!ranges.length) return [];
    const selected = (q.alternatives || []).find(a => a.letter === selectedLetter)?.text || '';
    const correct = (q.alternatives || []).find(a => a.letter === q.correct_answer)?.text || q.correct_answer_text || '';
    const goodTarget = `${q.prompt || ''} ${correct}`;
    const wrongTarget = `${q.prompt || ''} ${selected}`;

    const scored = ranges.map((r, i) => ({
      ...r,
      i,
      good: overlap(r.text, goodTarget),
      wrong: overlap(r.text, wrongTarget),
      bridge: overlap(r.text, q.prompt || '') + cueBonus(r.text, 'bridge'),
      contrast: cueBonus(r.text, 'contrast')
    }));

    const key = scored.reduce((a,b) => b.good > a.good ? b : a, scored[0]);
    const remaining = scored.filter(r => r.i !== key.i);
    let trap = remaining.length ? remaining.reduce((a,b) => (b.wrong + b.contrast) > (a.wrong + a.contrast) ? b : a, remaining[0]) : null;
    if (trap && trap.wrong + trap.contrast < .1) trap = null;

    let second = trap;
    let kind = 'trap';
    if (!second && remaining.length) {
      second = remaining.reduce((a,b) => b.bridge > a.bridge ? b : a, remaining[0]);
      kind = 'bridge';
      if (second.bridge < .08) second = scored.find(r => Math.abs(r.i - key.i) === 1) || null;
    }

    const marks = [{...key, kind:'key', label:'Mira aquí', note:questionCue(q, selected, 'key', key.text)}];
    if (second) marks.push({...second, kind, label:kind === 'trap' ? 'Contrasta' : 'Conecta', note:questionCue(q, selected, kind, second.text)});
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
    return `<div class="feedback feedback-return"><b>Pista activa.</b> Lee solo lo resaltado y vuelve a elegir.</div>`;
  }

  window.PRONABEC_COACH = { coached, isCoachedWrong, annotateContext, annotatePrelude, compactFeedback };
})();