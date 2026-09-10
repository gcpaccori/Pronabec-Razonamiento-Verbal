(() => {
  'use strict';

  const all = (window.PRONABEC_DATA?.topics || []).flatMap(t =>
    (t.questions || []).map(q => ({ ...q, topic: t }))
  );
  const coached = new Set(all.slice(0, 50).map(q => q.id));

  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const short = (s, n = 210) => {
    const v = clean(s);
    return v.length > n ? v.slice(0, n).replace(/\s+\S*$/, '') + '…' : v;
  };
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  function skill(q) {
    const p = clean(q.prompt).toLowerCase();
    const t = clean(q.topic?.title).toLowerCase();
    if (/idea (principal|central)|resume|tema central|medularmente/.test(p)) return 'main';
    if (/infiere|deduce|concluir|conclusión/.test(p)) return 'infer';
    if (/incompatible|no se puede|incorrect/.test(p)) return 'falsify';
    if (/sinónim|significa|sentido|término/.test(p) || t.includes('sinonimia')) return 'meaning';
    if (/antónim|opuesto/.test(p) || t.includes('antonimia')) return 'opposite';
    if (/tipo de texto|texto es|clasifica/.test(p) || t.includes('tipos de textos')) return 'type';
    if (/propósito|finalidad|intención|para qué/.test(p)) return 'purpose';
    return 'evidence';
  }

  const models = {
    main: {
      name:'Jerarquía de ideas',
      principle:'La idea principal no es el dato más llamativo: es la proposición que explica por qué las demás ideas están en el texto. Debe cubrir el conjunto sin añadir algo que el texto no sostenga.',
      steps:['Reduce cada párrafo a una función: plantea, explica, contrasta, ejemplifica o concluye.','Busca qué afirmación puede contener esas funciones bajo una sola idea.','Descarta alternativas demasiado estrechas, exageradas o que introducen una causa nueva.'],
      transfer:'Imagina que debes titular el texto con una sola oración que siga siendo verdadera después de borrar ejemplos y cifras. Esa oración se acerca a la idea central.'
    },
    infer: {
      name:'Inferencia controlada',
      principle:'Inferir no es imaginar. Es avanzar un paso lógico desde evidencias explícitas. La conclusión correcta debe ser necesaria o altamente respaldada por el texto, no solo posible en la vida real.',
      steps:['Ubica dos o más datos que funcionen como premisas.','Une solo lo que esas premisas autorizan; no completes con conocimiento externo.','Pregunta: «¿podría negar esta alternativa sin contradecir el texto?». Si sí, la inferencia es débil.'],
      transfer:'Convierte la evidencia en una flecha: “si el texto afirma X y Y, entonces puedo sostener Z”. Si Z necesita una cuarta idea no escrita, ya saliste del texto.'
    },
    falsify: {
      name:'Prueba de falsación',
      principle:'Cuando piden lo incompatible, no busques lo raro: busca la alternativa que choca con una evidencia concreta. Las otras deben poder sobrevivir a una comprobación textual.',
      steps:['Transforma cada alternativa en una afirmación verificable.','Busca una línea o relación del texto que la confirme o la contradiga.','Elige la que requiera negar, invertir o deformar lo dicho por el autor.'],
      transfer:'Haz de abogado contrario: intenta demostrar cada alternativa con una evidencia. La que no puedas sostener —o que el texto refute— es la candidata.'
    },
    meaning: {
      name:'Sustitución contextual',
      principle:'El significado contextual se decide por la función de la palabra dentro de esa oración. Dos palabras de diccionario pueden parecer sinónimas y, sin embargo, cambiar el sentido, el tono o la relación lógica.',
      steps:['Reemplaza mentalmente la palabra original por cada opción.','Conserva sujeto, acción, dirección y tono de la oración.','Elige la sustitución que mantiene el significado global, no la que “se parece” aislada.'],
      transfer:'Lee la oración sin mirar alternativas y predice primero una palabra propia. Después compara: predecir antes de reconocer reduce el engaño de opciones familiares.'
    },
    opposite: {
      name:'Eje semántico',
      principle:'Un antónimo contextual debe invertir el rasgo relevante en esa oración. No basta con ser “diferente”: tiene que ubicarse en el extremo opuesto del mismo eje de significado.',
      steps:['Define la palabra con una propiedad breve dentro de la frase.','Nombra el eje: aumentar/disminuir, permitir/impedir, unir/separar, etc.','Busca la opción que invierte ese eje sin romper la gramática ni el sentido contextual.'],
      transfer:'Si no puedes escribir “X ↔ Y” sobre un mismo eje conceptual, probablemente no tienes un verdadero antónimo contextual.'
    },
    type: {
      name:'Huella estructural del texto',
      principle:'Un tipo de texto se reconoce por lo que intenta lograr y por cómo organiza la información, no por una palabra suelta. Propósito + estructura + recursos forman una huella.',
      steps:['Pregunta qué intenta conseguir el autor: informar, explicar, argumentar, narrar, instruir.','Observa la organización dominante: secuencia, causa, comparación, tesis-razones, pasos.','Comprueba que la opción elegida explique ambas cosas a la vez.'],
      transfer:'Cambia el tema del texto pero conserva su estructura. Si seguiría perteneciendo al mismo tipo, identificaste la característica profunda y no el contenido superficial.'
    },
    purpose: {
      name:'Propósito comunicativo',
      principle:'El propósito responde a qué cambio busca producir el texto en el lector: comprender, aceptar, actuar, comparar o evaluar. El tema dice “de qué habla”; el propósito dice “para qué lo dice”.',
      steps:['Separa tema de intención.','Mira qué hace el cierre y qué información recibe más énfasis.','Prefiere el verbo que describe la operación comunicativa completa, no un detalle local.'],
      transfer:'Formula “El autor habla de ___ para que el lector ___”. El segundo espacio revela la finalidad.'
    },
    evidence: {
      name:'Lectura por evidencia',
      principle:'Resolver bien exige conectar afirmación y evidencia. La opción correcta es la que necesita menos suposiciones adicionales y explica mejor los datos disponibles.',
      steps:['Define exactamente qué pide el enunciado.','Busca la evidencia mínima suficiente antes de mirar de nuevo las alternativas.','Compara cada opción con esa evidencia y penaliza palabras absolutas, añadidos y cambios de relación.'],
      transfer:'Antes de marcar, completa mentalmente: “Elijo esta alternativa porque el texto muestra ___”. Si no puedes llenar el espacio con evidencia, todavía estás adivinando.'
    }
  };

  function whyTrap(selected, correct) {
    const s = clean(selected);
    const c = clean(correct);
    if (!s) return 'No hubo una respuesta seleccionada que podamos diagnosticar.';
    if (/siempre|nunca|únic|solo|todos|ningún|exclusiv/.test(s.toLowerCase())) return 'Tu opción contiene una formulación absoluta. Este tipo de alternativa suele convertir una idea parcial en una afirmación total; hay que exigir evidencia para cada palabra extrema.';
    if (s.length < c.length * .55) return 'Tu opción parece capturar un fragmento verdadero, pero probablemente es demasiado estrecha para lo que pregunta el enunciado. Un dato correcto puede ser una respuesta incorrecta si no cubre la relación completa.';
    if (s.length > c.length * 1.7) return 'Tu opción agrega bastante contenido. Cuantas más afirmaciones añade una alternativa, más puntos tiene para introducir algo que el texto nunca sostuvo.';
    return 'Tu elección es plausible, y por eso funciona como distractor. El error no está en que “suene mal”, sino en que explica la evidencia con menor precisión que la alternativa correcta.';
  }

  function build(q, selectedLetter) {
    if (!q || !coached.has(q.id) || !selectedLetter || selectedLetter === q.correct_answer) return '';
    const selected = (q.alternatives || []).find(a => a.letter === selectedLetter)?.text || '';
    const correct = (q.alternatives || []).find(a => a.letter === q.correct_answer)?.text || q.correct_answer_text || '';
    const m = models[skill(q)] || models.evidence;
    return `<section class="learning-coach" aria-label="Tutor de aprendizaje">
      <div class="coach-kicker">Aprender del error · ${esc(m.name)}</div>
      <h4>No memorices la letra ${esc(q.correct_answer)}. Reconstruye el criterio.</h4>
      <div class="coach-grid">
        <div class="coach-block coach-diagnosis"><b>Qué pasó en tu razonamiento</b><p>${esc(whyTrap(selected, correct))}</p></div>
        <div class="coach-block"><b>Modelo mental</b><p>${esc(m.principle)}</p></div>
      </div>
      <div class="coach-contrast">
        <div><span>Tu elección</span><p>${esc(short(selected))}</p></div>
        <div><span>La que mejor resiste la evidencia</span><p>${esc(short(correct))}</p></div>
      </div>
      <div class="coach-rebuild"><b>Reconstrúyelo en 3 movimientos</b><ol>${m.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
      <div class="coach-transfer"><b>Conexión que debes llevarte</b><p>${esc(m.transfer)}</p></div>
      <div class="coach-recall"><b>Antes de seguir:</b> aparta la vista 10 segundos y explica con tus propias palabras <em>qué regla habría permitido descartar tu alternativa sin conocer la respuesta correcta</em>.</div>
    </section>`;
  }

  window.PRONABEC_COACH = { build, coached };
})();
