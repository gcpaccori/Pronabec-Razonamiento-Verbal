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
  const short = (s, n = 105) => {
    const v = clean(s);
    return v.length > n ? v.slice(0, n).replace(/\s+\S*$/, '') + '…' : v;
  };
  const STOP = new Set('a al algo ante bajo con contra cual cuales de del desde donde el ella en entre era es esa ese esta este esto fue ha hacia hay la las le les lo los mas me mi muy no o para pero porque que se si sin sobre son su sus un una uno unos unas y ya como cuando quien'.split(' '));
  const words = s => norm(s).split(/[^a-z0-9ñ]+/).filter(w => w.length > 2 && !STOP.has(w));
  const wordSet = s => new Set(words(s));
  const overlap = (text, target) => {
    const a = wordSet(text), b = wordSet(target);
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

  function sentenceRanges(text) {
    const source = String(text || '');
    const ranges = [];
    const re = /[^.!?…]+(?:[.!?…]+|$)/g;
    let m;
    while ((m = re.exec(source))) {
      const raw = m[0];
      if (!clean(raw)) continue;
      ranges.push({ start: m.index, end: m.index + raw.length, raw, text: clean(raw) });
    }
    if (!ranges.length && clean(source)) ranges.push({ start: 0, end: source.length, raw: source, text: clean(source) });
    return ranges;
  }

  function cueBonus(text, kind) {
    const n = norm(text);
    if (kind === 'contrast' && /\b(sin embargo|pero|aunque|no obstante|en cambio|a diferencia|solo|unicamente)\b/.test(n)) return .28;
    if (kind === 'bridge' && /\b(por ello|por tanto|asi|entonces|porque|debido|de modo que|en consecuencia)\b/.test(n)) return .2;
    return 0;
  }

  function isCoachedWrong(q, selectedLetter) {
    return !!(q && coached.has(q.id) && selectedLetter && selectedLetter !== q.correct_answer);
  }

  function noteFor(kind, q, selected, correct) {
    const s = skill(q);
    const c = short(correct, 96);
    const w = short(selected, 88);
    if (kind === 'key') {
      if (s === 'main') return `Esta frase sostiene el eje de «${c}». Si una opción no puede explicar esta parte y el resto del texto, no resume de verdad.`;
      if (s === 'infer') return `Desde esta evidencia sí puedes avanzar hasta «${c}». Esa conexión está autorizada por el texto; no necesita información externa.`;
      if (s === 'falsify') return `Toma esta frase como prueba. La respuesta «${c}» se decide comprobando qué alternativa choca con esta evidencia.`;
      if (s === 'meaning') return `Aquí se fija el sentido contextual que necesitas para llegar a «${c}». La palabra aislada no basta: manda la relación de esta oración.`;
      if (s === 'opposite') return `Esta parte muestra el eje semántico que debes invertir para llegar a «${c}», no solo buscar una palabra diferente.`;
      if (s === 'type') return `Esta frase muestra qué hace el texto con la información. Esa función es la pista específica que conduce a «${c}».`;
      if (s === 'purpose') return `Aquí aparece el efecto que el autor busca producir. Esa intención es la que sostiene «${c}».`;
      return `Esta es la evidencia de mayor peso para esta pregunta: conecta directamente con «${c}» sin añadir supuestos.`;
    }
    if (kind === 'trap') {
      if (s === 'main') return `Tu opción «${w}» puede sonar correcta porque recoge una parte real, pero esta zona es un detalle: no alcanza a organizar todo el texto.`;
      if (s === 'infer') return `Tu opción «${w}» se acerca a esta zona, pero exige un salto mayor del que la evidencia permite. Aquí conviene frenar la inferencia.`;
      if (s === 'falsify') return `Contrasta «${w}» con esta frase. El distractor parece plausible hasta que se enfrenta con este límite concreto.`;
      return `Esta parte explica por qué «${w}» puede atraer: comparte vocabulario o una idea cercana, pero no responde con la misma precisión que la correcta.`;
    }
    if (s === 'main') return `Esta parte conecta la idea central con un desarrollo concreto. Úsala para comprobar que «${c}» también explica los detalles.`;
    if (s === 'infer') return `Esta segunda pieza completa la cadena lógica. Lee ambas frases como premisas antes de elegir la conclusión.`;
    if (s === 'falsify') return `Este apoyo te permite verificar la alternativa desde otro punto del texto y evita decidir por intuición.`;
    if (s === 'meaning' || s === 'opposite') return `Esta relación vecina mantiene el tono y el sentido de la frase; úsala como control para no responder por memoria de diccionario.`;
    return `Esta parte funciona como puente: conecta la evidencia principal con lo que exactamente pregunta el enunciado.`;
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

    const key = scored.reduce((a, b) => b.good > a.good ? b : a, scored[0]);
    const remaining = scored.filter(r => r.i !== key.i);
    let trap = remaining.length ? remaining.reduce((a, b) => (b.wrong + b.contrast) > (a.wrong + a.contrast) ? b : a, remaining[0]) : null;
    if (trap && trap.wrong + trap.contrast < .09) trap = null;

    const bridgePool = remaining.filter(r => !trap || r.i !== trap.i);
    let bridge = bridgePool.length ? bridgePool.reduce((a, b) => b.bridge > a.bridge ? b : a, bridgePool[0]) : null;
    if (bridge && bridge.bridge < .08) {
      bridge = scored.find(r => Math.abs(r.i - key.i) === 1 && (!trap || r.i !== trap.i)) || null;
    }

    const marks = [{ ...key, kind: 'key', label: 'Clave', note: noteFor('key', q, selected, correct) }];
    if (bridge) marks.push({ ...bridge, kind: 'bridge', label: 'Conexión', note: noteFor('bridge', q, selected, correct) });
    if (trap) marks.push({ ...trap, kind: 'trap', label: 'Límite', note: noteFor('trap', q, selected, correct) });
    return marks.sort((a, b) => a.start - b.start);
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
      html += `<span class="smart-note note-${m.kind}"><b>${esc(m.label)}</b>${esc(m.note)}</span>`;
      cursor = m.end;
    }
    html += esc(source.slice(cursor));
    return `<span class="smart-reading">${html}</span>`;
  }

  function annotateContext(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter) || !q.context?.text) return '';
    return annotateExact(q.context.text, q, selectedLetter);
  }

  function annotatePrelude(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter) || !q.prelude_text) return '';
    const html = annotateExact(q.prelude_text, q, selectedLetter);
    return `<div class="prelude guided-prelude">${html}</div>`;
  }

  function compactFeedback(q, selectedLetter) {
    if (!isCoachedWrong(q, selectedLetter)) return '';
    const selected = (q.alternatives || []).find(a => a.letter === selectedLetter)?.text || '';
    const correct = (q.alternatives || []).find(a => a.letter === q.correct_answer)?.text || q.correct_answer_text || '';
    if (!q.context?.text && !q.prelude_text) {
      return `<div class="feedback bad feedback-return"><div><b>Revisa la relación.</b> «${esc(short(selected, 72))}» no cumple el mismo criterio que «${esc(short(correct, 72))}». Compara significado, función y alcance; no memorices la letra.</div></div>`;
    }
    return `<div class="feedback bad feedback-return"><div><b>Vuelve al texto.</b> Los colores señalan la evidencia, la conexión y el límite específicos de esta pregunta.</div></div>`;
  }

  window.PRONABEC_COACH = { coached, isCoachedWrong, annotateContext, annotatePrelude, compactFeedback };
})();