(() => {
  'use strict';
  const chunk = {
  "RV-06-001": {
    "position": 51,
    "answer": "E",
    "focus": "Función semántica de conectores",
    "anchor": "recientemente, cerca, semejante",
    "point": "La secuencia no se resuelve por cómo suenan las palabras, sino por la función que cumplen: «recientemente» sitúa en el tiempo, «cerca» ubica en el lugar y «semejante» establece comparación.",
    "transfer": "Primero etiqueta la relación de cada conector; después busca la alternativa que reproduzca ese orden.",
    "wrong": {
      "A": "Acertaba tiempo y lugar, pero convertía «semejante» en espacio cuando su función es comparar.",
      "B": "Intercambiaba tiempo y lugar desde el primer término.",
      "C": "Desplazaba «recientemente» a espacio y «cerca» a tiempo.",
      "D": "Reconocía la comparación final, pero invertía las dos primeras funciones."
    }
  },
  "RV-06-002": {
    "position": 52,
    "answer": "E",
    "focus": "Concesión seguida de contraste",
    "anchor": "las acusaciones difamantes",
    "point": "La primera relación admite una dificultad sin impedir la acción: «a pesar de». La segunda contrapone la serenidad inicial con el descontrol posterior: «sin embargo».",
    "transfer": "Distingue obstáculo tolerado (concesión) de giro entre dos hechos (adversación).",
    "wrong": {
      "A": "«Por» expresa causa, pero aquí las acusaciones son un obstáculo que no impide mantenerse serenas.",
      "B": "«Ante» ubica una circunstancia, pero «si bien» no encaja como giro entre las dos acciones.",
      "C": "«Entonces» introduce consecuencia; el segundo tramo es oposición, no resultado.",
      "D": "«Aunque» podría introducir concesión, pero «más» no cumple aquí la función adversativa requerida."
    }
  },
  "RV-06-003": {
    "position": 53,
    "answer": "B",
    "focus": "Corrección de criterio y adición",
    "anchor": "No se mide el amor",
    "point": "La oración cambia el criterio de medición: no «por» los besos, «sino» por la comprensión. «Uno y otro» completa una relación recíproca entre dos personas.",
    "transfer": "Cuando aparece «no X, sino Y», el segundo miembro reemplaza el criterio del primero; luego revisa cómo se coordinan los elementos internos.",
    "wrong": {
      "A": "«Con» no expresa el criterio de medición y «o» rompe la reciprocidad entre uno y otro.",
      "C": "«Ante» no introduce medida y «u» solo reemplaza a «o» ante sonido /o/, lo que aquí no ocurre.",
      "D": "«Si no» introduce condición negativa; la estructura exige el adversativo unido «sino».",
      "E": "«O» presenta alternativa, pero la oración corrige un criterio anterior con «sino»."
    }
  },
  "RV-06-004": {
    "position": 54,
    "answer": "D",
    "focus": "Enumeración coordinada",
    "anchor": "debilidades",
    "point": "Se suman dos grupos equivalentes: debilidades y vicios; luego, mente y actos. En ambos puntos la relación es aditiva, por eso funciona «y - y».",
    "transfer": "Si dos elementos tienen el mismo rango sintáctico y ambos se acumulan, la relación básica es copulativa.",
    "wrong": {
      "A": "«O» convertiría debilidades y vicios en alternativas, no en males acumulados.",
      "B": "«Como» pide otra estructura comparativa y «aun» no coordina mente con actos.",
      "C": "La primera «y» encaja, pero «aunque» introduciría una concesión inexistente.",
      "E": "«A fin de» expresa finalidad; el texto no presenta los actos como objetivo."
    }
  },
  "RV-06-005": {
    "position": 55,
    "answer": "D",
    "focus": "Secuencia, contraste y negación coordinada",
    "anchor": "Bebió su jugo de naranja",
    "point": "Primero se acumulan dos acciones afirmativas con «y»; luego aparece el giro «pero no probó»; dentro de esa negación, «ni» une los dos alimentos rechazados.",
    "transfer": "Lee la oración por bloques: suma afirmativa → giro adversativo → enumeración negativa.",
    "wrong": {
      "A": "«Luego» marca tiempo, pero el punto central es el contraste entre beber y no comer; «o» tampoco expresa negación conjunta.",
      "B": "«Entonces» convertiría el no comer en consecuencia de beber, relación que el texto no afirma.",
      "C": "«O» presenta alternativas donde hay suma y «mas» no resuelve la coordinación negativa final.",
      "E": "«Aunque» abriría una concesión que la oración no necesita y el último «y» pierde la negación de «ni»."
    }
  },
  "RV-06-006": {
    "position": 56,
    "answer": "B",
    "focus": "Expectativa contrariada y doble negación",
    "anchor": "un hombre conocedor",
    "point": "«Conocedor» crea una expectativa positiva que se rompe con «pero». Después, «no sabía lo que era la virtud ni el vicio» coordina dos elementos bajo la misma negación.",
    "transfer": "Busca primero la expectativa que el texto crea; el conector suele indicar si se mantiene, se explica o se rompe.",
    "wrong": {
      "A": "«Y» sumaría información compatible, pero aquí la segunda idea contradice lo esperable de un conocedor.",
      "C": "«Pues» daría una causa, cuando el segundo tramo funciona como contraste.",
      "D": "«Ya que» introduce explicación causal y «además» no conserva la negación doble.",
      "E": "«Debido a que» también fuerza causalidad y «aún» no coordina virtud con vicio."
    }
  },
  "RV-06-007": {
    "position": 57,
    "answer": "E",
    "focus": "Concesión resistente y continuidad negativa",
    "anchor": "la bulla persista",
    "point": "«Por más que» presenta una dificultad que no cambia la decisión de leer. Después, «ni me dormiré» añade una segunda conducta negada.",
    "transfer": "La concesión muestra que un obstáculo existe pero no altera el resultado; «ni» prolonga una negación.",
    "wrong": {
      "A": "«Incluso» intensifica, pero no construye la concesión completa; «ya que» introduce causa.",
      "B": "«Aunque» puede ser concesivo, pero «porque» convertiría la segunda decisión en causa.",
      "C": "«Como» y «asimismo» producen una lectura aditiva, no concesiva-negativa.",
      "D": "«Por ello» presentaría el no dormir como consecuencia de la bulla, cuando es otra decisión del hablante."
    }
  },
  "RV-06-008": {
    "position": 58,
    "answer": "A",
    "focus": "Coordinación y localización",
    "anchor": "Los cuadros",
    "point": "Cuadros y colores se acumulan; danzan y corren también son acciones coordinadas; ambas ocurren «en mi cuerpo». La estructura completa es suma + suma + lugar.",
    "transfer": "Antes de elegir preposiciones, identifica qué elementos se coordinan y qué complemento responde a «dónde».",
    "wrong": {
      "B": "«O» vuelve excluyentes elementos que el texto presenta juntos.",
      "C": "«Mas» introduciría oposición y «de mi cuerpo» cambiaría la relación espacial.",
      "D": "«Además» no encaja dentro del sintagma nominal y «con mi cuerpo» modifica el sentido.",
      "E": "La primera «o» rompe la suma y «por mi cuerpo» expresa recorrido, no localización."
    }
  },
  "RV-06-009": {
    "position": 59,
    "answer": "C",
    "focus": "Concesión y extensión",
    "anchor": "progreso de la medicina moderna",
    "point": "El progreso médico haría esperable abandonar remedios tradicionales, pero ocurre lo contrario: «a pesar del». Luego se suma población peruana y del mundo.",
    "transfer": "Una concesión aparece cuando el segundo hecho se mantiene pese a una condición que hacía esperar otra cosa.",
    "wrong": {
      "A": "«No obstante del» no es la construcción normativa adecuada y «o» separaría poblaciones que se agregan.",
      "B": "«Si bien del» está mal construido; «hasta» tampoco coordina Perú con el mundo.",
      "D": "«Si del» no forma una relación lógica válida en esta estructura.",
      "E": "«A causa del» diría que el progreso médico provoca el uso de plantas, justo lo contrario del contraste planteado."
    }
  },
  "RV-06-010": {
    "position": 60,
    "answer": "E",
    "bookAnswer": "C",
    "focus": "Dirección lógica causa → consecuencia",
    "anchor": "CAUSA: CONSECUENCIA",
    "point": "Leído literalmente, el ejercicio pide la relación incorrecta. «Debido a» introduce causa y «dado que» también introduce causa; por eso E rompe el patrón causa → consecuencia.",
    "transfer": "No memorices pares: prueba la dirección. El primer conector debe responder «¿por qué?» y el segundo «¿qué ocurrió por eso?».",
    "audit": "El solucionario del libro marca C, pero su propia explicación resuelve como si el enunciado pidiera una relación correcta. La lectura literal del ítem hace que E sea la opción coherente.",
    "wrong": {
      "A": "«Dado que» introduce causa y «así que» consecuencia: sí respeta el patrón.",
      "B": "«Motivo de» señala causa y «por eso» introduce resultado: también respeta el patrón.",
      "C": "«Puesto que» es causal y «por consiguiente» consecutivo: es un par válido.",
      "D": "«A causa de» abre la causa y «de manera que» presenta su efecto: también es válido."
    }
  }
};
  window.PRONABEC_CURATED_51_100 = Object.assign(window.PRONABEC_CURATED_51_100 || {}, chunk);
})();
