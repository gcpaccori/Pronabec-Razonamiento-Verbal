(() => {
  'use strict';

  const bank = window.PRONABEC_CURATED_51_100 || {};
  const official = new Map((window.PRONABEC_DATA?.topics || []).flatMap(t => t.questions || []).map(q => [q.id, q]));

  const patches = {
    'RV-06-010': {
      point: 'La clave oficial marca C porque «puesto que» introduce causa y «por consiguiente» introduce consecuencia: forman con claridad la relación CAUSA → CONSECUENCIA. El problema es que el enunciado pide la relación «incorrecta», de modo que la redacción y la clave no están perfectamente alineadas.',
      transfer: 'Aprende la dirección lógica: causal responde «¿por qué?» y consecutivo responde «¿qué ocurrió por eso?». Si un ítem contradice su propia consigna, separa el concepto de la clave oficial.',
      wrong: {
        A: 'También forma causa → consecuencia: «dado que» abre la causa y «así que» el resultado.',
        B: 'También conserva la dirección causa → consecuencia: «motivo de» / «por eso».',
        D: 'También es una pareja causal-consecutiva: «a causa de» / «de manera que».',
        E: 'Leída literalmente la consigna, esta sería la candidata a «incorrecta», porque «debido a» y «dado que» son ambos causales. Por eso el ítem merece una nota de calidad.'
      }
    },
    'RV-08-004': {
      point: 'La clave oficial marca B interpretando «¿hace cuánto?» como una pregunta que exige una duración precisa; el texto solo dice «hace poco más de un año». Esa es la lógica con la que fue construido el solucionario.',
      transfer: 'Distingue entre dato aproximado y dato exacto. En preguntas de información explícita, revisa también si otra alternativa exige una acción que el texto nunca atribuye al personaje.',
      wrong: {
        A: 'Sí puede responderse: de niño conocía y admiraba al maestro Juli.',
        C: 'Esta alternativa también es problemática: el texto menciona Chota como lugar donde el público disfruta las corridas, pero no afirma que Roca Rey haya toreado allí.',
        D: 'Sí puede responderse: se le critica arriesgar demasiado y confundir valentía con temeridad.'
      }
    },
    'RV-08-008': {
      point: 'La clave oficial considera tesis la caracterización central del problema: el jefe tóxico maltrata para satisfacer su ego. El segundo párrafo desarrolla luego qué hacer frente a esa conducta.',
      transfer: 'Para hallar una tesis, pregunta qué afirmación organiza el resto del texto. Una definición puede funcionar como tesis si los párrafos posteriores explican sus consecuencias y respuestas.',
      wrong: {
        A: 'El texto no sostiene que todo trabajo con presión deba abandonarse; se concentra en el jefe tóxico.',
        C: 'No afirma que todos los empleados sean tratados del mismo modo; explica que cualquier persona en el rol de víctima potencial podría recibir el maltrato.',
        D: 'Es una conclusión prescriptiva muy fuerte del segundo párrafo y por eso compite con la clave. La clave oficial, sin embargo, toma como tesis la caracterización causal del primer párrafo.'
      }
    },
    'RV-08-010': {
      point: 'La clave oficial proyecta que el texto podría continuar cambiando el foco hacia recomendaciones para los jefes. Esa es la continuación prevista por el material, aunque el tramo inmediato todavía viene aconsejando al empleado.',
      transfer: 'Para anticipar una continuación, conserva tema y progresión, pero recuerda que algunos ítems admiten más de una continuación plausible si no hay una señal textual fuerte.',
      wrong: {
        A: 'Es una continuación discursivamente muy plausible porque mantiene al mismo destinatario y la misma secuencia de consejos; por eso el ítem es discutible.',
        B: 'La identificación del jefe tóxico ya fue desarrollada en el primer párrafo; volver allí repite información.',
        D: 'Abrir otros problemas laborales alejaría demasiado el texto de su eje específico.'
      }
    },
    'RV-09-005': {
      point: 'La clave oficial toma como peligro práctico que el correo no debe usarse para castigar, regañar o comunicar malas noticias. Esa recomendación nace de una limitación más básica: el correo transmite mal tonos y matices.',
      transfer: 'Separa mecanismo y consecuencia práctica: una limitación del medio puede producir una regla de uso. Ambos niveles pueden aparecer muy cerca y generar distractores fuertes.',
      wrong: {
        A: 'Esta frase es, de hecho, el primer peligro formulado literalmente por el texto: los correos transmiten mal tonos y matices. Por eso el ítem mezcla el peligro con la recomendación derivada.',
        B: 'El correo no impide la comunicación; justamente facilita contactar a muchas personas.',
        C: 'El segundo peligro es la expansión excesiva del mensaje, no una capacidad limitada.'
      }
    },
    'RV-09-009': {
      point: 'La clave oficial clasifica el texto bajo un tema amplio: innovaciones tecnológicas en la administración de empresas, tomando el correo electrónico como caso principal.',
      transfer: 'El tema se formula al nivel de generalidad que exige el examen. Si dos opciones cubren el texto, compara cuál coincide con el marco que el autor instala desde el inicio.',
      wrong: {
        A: 'Describe con mucha precisión el desarrollo real —beneficios y riesgos del correo— y por eso es un distractor especialmente fuerte frente a la clave amplia.',
        B: 'El teléfono aparece solo como alternativa para mensajes que no deberían quedar escritos.',
        C: 'No se narra una historia cronológica del correo; la comparación con el pasado sirve para explicar su ventaja.'
      }
    },
    'RV-09-015': {
      point: 'La clave oficial marca C y lee el fragmento como una oposición entre la fragilidad del hombre y la fuerza del universo. Sin embargo, el núcleo filosófico del pasaje está en que el hombre, aunque físicamente débil, sabe y piensa.',
      transfer: 'En textos filosóficos, identifica el contraste que organiza la idea: aquí fuerza física frente a conciencia. También aprende a reconocer cuando una clave escolar simplifica demasiado ese contraste.',
      wrong: {
        A: 'Solo recoge la fragilidad y deja fuera el giro decisivo: «pero una caña pensante».',
        B: 'Contradice el texto, que sí afirma que el hombre es físicamente débil.',
        D: 'Es conceptualmente una lectura muy fuerte del fragmento porque la conciencia distingue al hombre; aun así, no es la clave oficial del material.',
        E: 'La nobleza intelectual no impide que el universo pueda destruirlo físicamente.'
      }
    }
  };

  for (const [id, patch] of Object.entries(patches)) {
    const entry = bank[id];
    const q = official.get(id);
    if (!entry || !q) continue;
    entry.answer = q.correct_answer;
    entry.bookAnswer = q.correct_answer;
    entry.point = patch.point;
    entry.transfer = patch.transfer;
    entry.wrong = patch.wrong;
  }
})();
