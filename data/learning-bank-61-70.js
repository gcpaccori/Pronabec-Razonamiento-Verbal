(() => {
  'use strict';
  const chunk = {
  "RV-07-001": {
    "position": 61,
    "answer": "D",
    "focus": "Arquitectura de relaciones múltiples",
    "anchor": "El incremento de informaciones",
    "point": "La oración acumula «informaciones y proliferación», luego rectifica el rumbo del argumento y vuelve a coordinar «potencia y utilización». La clave es mantener la estructura global, no escoger conectores de uno en uno.",
    "transfer": "En oraciones con tres huecos, reconstruye primero el mapa completo de relaciones y recién después valida cada conector.",
    "wrong": {
      "A": "«Ni» exige una negación coordinada que no existe al inicio y «o» separa elementos que el texto acumula.",
      "B": "«Mas» introduce contraste demasiado pronto y «es decir» reformula, pero el último miembro no es una reformulación.",
      "C": "«O» vuelve alternativas dos factores que el texto presenta conjuntamente y «debido a» altera la estructura del sujeto.",
      "E": "Acumula adversaciones donde la oración necesita primero coordinación y después un cambio de dirección."
    }
  },
  "RV-07-002": {
    "position": 62,
    "answer": "B",
    "focus": "Simultaneidad con contraste de grupos",
    "anchor": "numerosos científicos",
    "point": "La oración presenta dos líneas de investigación paralelas: unos estudian comunidades actuales, mientras otros comparan culturas antiguas. «Mientras» organiza esa simultaneidad y contraste.",
    "transfer": "Cuando aparecen «unos/otros» o dos grupos que actúan en paralelo, busca un conector que distribuya acciones, no uno que sume sin distinguir.",
    "wrong": {
      "A": "«Porque» convertiría el primer grupo en causa del segundo.",
      "C": "«Asimismo» solo añadiría información y perdería la distribución entre dos grupos.",
      "D": "«Sin embargo» marcaría oposición fuerte, aunque las investigaciones son complementarias.",
      "E": "«Además» suma, pero no expresa el paralelismo entre unos y otros."
    }
  },
  "RV-07-003": {
    "position": 63,
    "answer": "D",
    "focus": "Certeza y consecuencia",
    "anchor": "Esta estrategia es",
    "point": "«Indudablemente» refuerza la certeza de que la estrategia es contundente; «y por lo tanto» presenta su eficacia como consecuencia de esa contundencia.",
    "transfer": "Separa los conectores que expresan actitud del hablante de los que enlazan lógicamente dos proposiciones.",
    "wrong": {
      "A": "«No obstante» convertiría eficacia en contraste con contundencia, cuando el texto la presenta como compatible.",
      "B": "«A pesar de ello» también introduce una oposición que no existe.",
      "C": "«También/además» solo suman dos cualidades y pierden la relación de consecuencia.",
      "E": "«Pero» opone eficaz a contundente, relación contraria al sentido."
    }
  },
  "RV-07-004": {
    "position": 64,
    "answer": "D",
    "focus": "Reformulación, contraste y causa",
    "anchor": "Era un tipo sabiondo",
    "point": "«Es decir» reformula la primera caracterización; «no obstante» rompe la expectativa entre hablar bien y actuar mal; «porque» introduce la evidencia que explica esa contradicción.",
    "transfer": "Una misma oración puede cambiar de relación: reformula → contrasta → justifica. Identificar esa secuencia evita elegir conectores por cercanía.",
    "wrong": {
      "A": "«Por eso» haría que la incoherencia de sus actos fuera consecuencia de expresarse claramente.",
      "B": "«Además» suma cuando se necesita un giro adversativo, y «por ejemplo» no introduce la causa de la contradicción.",
      "C": "La primera reformulación funciona, pero «por el contrario» no introduce la razón de que elocuencia y actos no correspondan.",
      "E": "Solo acumula información y no representa el contraste central."
    }
  },
  "RV-07-005": {
    "position": 65,
    "answer": "E",
    "focus": "Frecuencia, consecuencia y finalidad",
    "anchor": "la realidad y los deseos se confunden",
    "point": "«Frecuentemente» sitúa la frecuencia del fenómeno; «por ello» deriva la necesidad de distinguir; «a fin de» expresa para qué se hace esa distinción.",
    "transfer": "Distingue tres planos: cuándo ocurre, qué se concluye de ello y con qué propósito se actúa.",
    "wrong": {
      "A": "«Porque» invertiría la dirección: la necesidad de distinguir no explica que realidad y deseos se confundan.",
      "B": "«Aunque» necesita una proposición principal contrastiva y «además» no expresa la consecuencia.",
      "C": "«Por tanto» no funciona como marcador inicial de frecuencia y «también» pierde la relación causal.",
      "D": "«A causa de» introduce causa, pero el último tramo expresa finalidad: evitar frustración."
    }
  },
  "RV-07-006": {
    "position": 66,
    "answer": "A",
    "focus": "Adición dentro de una condición y resultado",
    "anchor": "Si llegaras a alcanzar una vacante",
    "point": "Dentro de la condición se añade un logro más con «además»; cumplidas ambas condiciones, «entonces» introduce el resultado.",
    "transfer": "En estructuras con «si», identifica qué elementos pertenecen a la condición y cuál es la consecuencia que depende de ellos.",
    "wrong": {
      "B": "«Luego» sugiere secuencia temporal y «puede que» debilita una consecuencia que el enunciado presenta como directa.",
      "C": "«En caso de que» duplicaría innecesariamente la condición ya abierta por «si».",
      "D": "«También» puede sumar, pero «luego» es menos preciso que el consecuente «entonces».",
      "E": "«A continuación» convierte los logros en pasos temporales y no en condiciones acumuladas."
    }
  },
  "RV-07-007": {
    "position": 67,
    "answer": "D",
    "focus": "Concesión y persistencia temporal",
    "anchor": "cada vez se habla más sobre los ovnis",
    "point": "Hablar más del tema podría hacer esperar una explicación; «aunque» concede ese hecho y «todavía» indica que el misterio persiste.",
    "transfer": "La concesión reconoce un dato verdadero que no produce el resultado esperado; un adverbio temporal puede mostrar que el estado continúa.",
    "wrong": {
      "A": "«Si» no completa naturalmente el segundo miembro y cambia la estructura a condicional.",
      "B": "«También» suma información, pero no expresa persistencia del misterio.",
      "C": "«Puede que» introduce posibilidad y «sin embargo» queda redundante con una relación mal formada.",
      "E": "«Porque» presentaría el misterio como causa del aumento de conversaciones."
    }
  },
  "RV-07-008": {
    "position": 68,
    "answer": "C",
    "focus": "Concesión seguida de causa real",
    "anchor": "el chofer manejaba prudentemente",
    "point": "La prudencia hacía esperar que no chocara, por eso se usa una concesión: «por más que». El choque sí tiene una causa explícita: fallaron los frenos, introducida por «porque».",
    "transfer": "No confundas la circunstancia que no evitó el resultado con la causa que sí lo produjo.",
    "wrong": {
      "A": "«Aunque» encaja en el primer hueco, pero «entonces» convierte la falla de frenos en consecuencia del choque.",
      "B": "«Luego que» marca tiempo y «pero» oposición; ninguna relación explica adecuadamente la cadena.",
      "D": "«A pesar de que» en el segundo hueco haría concesiva la falla de frenos cuando en realidad es causal.",
      "E": "«Antes bien» no abre una concesión y la primera relación queda rota."
    }
  },
  "RV-07-009": {
    "position": 69,
    "answer": "D",
    "focus": "Escala argumentativa",
    "anchor": "el humo del cigarrillo afecta tu respiración",
    "point": "La estructura «si X, cuánto más Y» usa un caso menor para reforzar uno de mayor intensidad. No es simple adición: construye una escala.",
    "transfer": "Busca si el segundo caso se presenta como una versión más intensa del primero; ahí aparece una relación de gradación.",
    "wrong": {
      "A": "Introduce contraste, pero los dos agentes contaminantes apuntan en la misma dirección.",
      "B": "«Asimismo» suma y «aún más» intensifica, pero no forma la estructura condicional comparativa completa.",
      "C": "«Solamente... sino también» requiere la construcción «no solamente... sino también».",
      "E": "«Tanto... como» igualaría los dos casos; el texto quiere intensificar el segundo."
    }
  },
  "RV-07-010": {
    "position": 70,
    "answer": "A",
    "focus": "Subordinación y contraste",
    "anchor": "Sé que te buscan demasiados",
    "point": "El segundo «que» mantiene dos contenidos dependientes de «sé»: te buscan y te pretenden. «Pero» rompe la aparente conclusión de que mucha atención equivale a felicidad.",
    "transfer": "Identifica primero de qué verbo dependen las proposiciones; después observa si la última confirma o corrige la expectativa creada.",
    "wrong": {
      "B": "«Porque» convertiría la segunda afirmación en causa de la primera y «aunque» necesita otra estructura.",
      "C": "«Tal vez» cambia el grado de certeza y «por» no enlaza la conclusión.",
      "D": "«Y» puede sumar, pero «no» por sí solo no marca el contraste argumentativo.",
      "E": "«Puesto que» introduce una causa que el hablante no está construyendo."
    }
  }
};
  window.PRONABEC_CURATED_51_100 = Object.assign(window.PRONABEC_CURATED_51_100 || {}, chunk);
})();
