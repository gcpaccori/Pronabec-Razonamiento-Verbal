(() => {
  'use strict';
  const chunk = {
    'RV-10-006': {
      position:101, answer:'B', focus:'Antonimia creada por prefijo', anchor:'culpar / disculpar',
      point:'Las dos palabras conservan la base «culpar», pero «dis-» cambia la orientación del significado. Por eso el libro las clasifica como antónimos gramaticales: la oposición se construye modificando la misma raíz.',
      transfer:'Cuando dos palabras opuestas comparten raíz y una usa un prefijo que cambia el significado, piensa primero en antonimia gramatical.',
      wrong:{
        A:{plausible:'Sí son palabras opuestas, así que reconocer antonimia era una buena pista.',break:'La opción dice «lexicales», pero aquí la oposición se forma sobre la misma raíz mediante el prefijo «dis-».'},
        C:{plausible:'Ambas hablan de responsabilidad por una falta.',break:'No significan casi lo mismo: culpar atribuye responsabilidad y disculpar la retira o perdona.'},
        D:{plausible:'Se parecen bastante en su terminación.',break:'La paronimia se basa en parecido de forma o sonido, no en una oposición de significado construida con un prefijo.'},
        E:{plausible:'La palabra «antónimas» sí apunta a la relación principal.',break:'«Libres» no explica cómo se forma la oposición; el rasgo decisivo es que comparten raíz y cambia el prefijo.'}
      }
    },
    'RV-10-007': {
      position:102, answer:'C', focus:'Cohiponimia bajo una misma categoría', anchor:'cohipónimo de Marte',
      point:'Marte y Júpiter están al mismo nivel dentro de una categoría mayor: ambos son planetas. Ninguno contiene al otro; son miembros hermanos del mismo grupo.',
      transfer:'Para hallar un cohipónimo, busca otra palabra que responda al mismo hiperónimo.',
      wrong:{
        A:{plausible:'«Martes» se parece mucho a «Marte» en la forma.',break:'La pregunta no pide parecido de palabra; martes es un día de la semana y Marte es un planeta.'},
        B:{plausible:'La Luna también es un cuerpo celeste.',break:'Compartir un tema amplio no basta: la Luna es un satélite natural, no otro planeta del mismo nivel que Marte.'},
        D:{plausible:'«Jueves» puede hacer pensar en Júpiter por asociaciones culturales.',break:'Jueves es un día de la semana; no pertenece a la categoría planeta.'},
        E:{plausible:'Marte puede asociarse culturalmente con la guerra.',break:'Eso es una asociación de significado, no cohiponimia. Guerra no es un planeta.'}
      }
    },
    'RV-10-008': {
      position:103, answer:'A', focus:'Inclusión semántica según el criterio del ejercicio', anchor:'hipónimos del hiperónimo colegio',
      point:'El ejercicio agrupa «horario» y «clases» como conceptos incluidos dentro del ámbito de colegio. La clave escolar usa aquí una noción amplia de inclusión semántica.',
      transfer:'En estos ejercicios, busca el par cuyos dos elementos pertenecen claramente al ámbito general propuesto; luego descarta pares formados por oposiciones o palabras sin relación común.',
      audit:'En semántica estricta, «horario» y «clases» son más bien elementos asociados a un colegio que especies del concepto «colegio». La clave del libro usa «hipónimo» de manera amplia.',
      wrong:{
        B:{plausible:'«Lejos / cerca» forman una pareja clara.',break:'Su relación es de oposición espacial, no de inclusión bajo «colegio».'},
        C:{plausible:'«Feliz / infeliz» también forman una relación semántica reconocible.',break:'Son antónimos y no nombran componentes o conceptos incluidos en colegio.'},
        D:{plausible:'«Arriba / abajo» están muy relacionados entre sí.',break:'También son opuestos espaciales; la relación pedida es con el término general «colegio».'},
        E:{plausible:'«Lapicero» sí puede asociarse a un colegio.',break:'«Feliz» rompe el par: los dos términos deben pertenecer al mismo ámbito general.'}
      }
    },
    'RV-10-009': {
      position:104, answer:'B', focus:'Serie bajo una categoría literaria común', anchor:'Los miserables, Madame Bovary, Rojo y negro',
      point:'La serie reúne novelas representativas de la literatura francesa del siglo XIX. «Papá Goriot» mantiene ese mismo marco cultural y genérico.',
      transfer:'En una serie semántica, no busques solo “otra obra literaria”; identifica la categoría más específica que comparten todos los elementos.',
      wrong:{
        A:{plausible:'«La madre» también es una novela conocida.',break:'No mantiene el marco de literatura francesa que organiza la serie.'},
        C:{plausible:'Es una obra literaria muy reconocida.',break:'Ser literatura es demasiado general; «Narraciones extraordinarias» pertenece a otra tradición y además es un conjunto de relatos.'},
        D:{plausible:'También es una obra narrativa clásica.',break:'No comparte la pertenencia a la literatura francesa que une a los títulos base.'},
        E:{plausible:'También es una novela importante.',break:'Pertenece a la literatura peruana; cambia la categoría específica de la serie.'}
      }
    },
    'RV-10-010': {
      position:105, answer:'E', bookAnswer:'A', focus:'Cohipónimos geográficos del hiperónimo departamento', anchor:'cohipónimos del hiperónimo departaMentos',
      point:'Cusco, Arequipa y Piura son nombres de departamentos del Perú. Los tres están al mismo nivel bajo el hiperónimo «departamentos».',
      transfer:'Si el hiperónimo es una clase administrativa, cada elemento de la respuesta debe ser una unidad de esa misma clase, no un sitio turístico, distrito, provincia o comida.',
      audit:'El solucionario impreso explica correctamente que «Cusco, Arequipa y Piura» son los departamentos, pero al final imprime «Respuesta A». Esa letra contradice su propia explicación; por aprendizaje, la app corrige la clave a E y conserva la nota del libro.',
      wrong:{
        A:{plausible:'Machu Picchu y Sacsayhuamán están fuertemente asociados con Cusco.',break:'Son sitios arqueológicos, no departamentos. La relación temática con un lugar no los vuelve miembros de la categoría «departamentos».'},
        B:{plausible:'Lince, Trujillo y Lima son nombres geográficos.',break:'Mezcla unidades distintas: Lince es distrito y Trujillo es ciudad/provincia; no son tres departamentos del mismo nivel.'},
        C:{plausible:'Canta, Barranca y Huacho pertenecen al mapa del Perú.',break:'No forman una lista de departamentos equivalentes; son unidades/localidades de otro nivel territorial.'},
        D:{plausible:'Cebiche, pisco y mazamorra comparten una categoría.',break:'Esa categoría es gastronomía, no división territorial.'}
      }
    },
    'RV-11-001': {
      position:106, answer:'A', focus:'Tema que integra toda la experiencia del narrador', anchor:'no volver a tocar jamás un “cuerpo”, sino al ser humano',
      secondary:'no en el ser humano',
      point:'El relato no se queda en el dolor físico del médico. Toda la experiencia lo lleva a cambiar su manera de mirar al paciente: deja de verlo como un cuerpo que debe tratar y reconoce a una persona que siente miedo, dolor y necesita contacto humano.',
      transfer:'El tema debe abarcar el inicio, el desarrollo y el cambio final del texto; un detalle repetido no siempre es el asunto central.',
      wrong:{
        B:{plausible:'El dolor aparece muchas veces y mueve la experiencia del narrador.',break:'Es el medio que provoca su aprendizaje, no la reflexión final que organiza todo el relato.'},
        C:{plausible:'El protagonista es médico y ahora está enfermo.',break:'Que un médico pueda enfermarse inicia la situación, pero el texto va más lejos: aprende a reconocer la humanidad del paciente.'},
        D:{plausible:'La enfermedad y la hospitalización son difíciles.',break:'La lectura no desarrolla “enfermedades graves” en general; desarrolla cómo cambia la mirada del médico al vivir como paciente.'},
        E:{plausible:'La enfermera cumple un papel decisivo al final.',break:'El texto está narrado desde el médico y su transformación; no presenta el punto de vista de las enfermeras como tema.'}
      }
    },
    'RV-11-002': {
      position:107, answer:'B', focus:'Emoción expresada por señales textuales', anchor:'la aprensión, el temor contenido',
      secondary:'posar la mano sobre la mía',
      point:'El propio narrador nombra lo que ve en la mirada: aprensión y temor contenido. Esa combinación se traduce mejor como ansiedad y preocupación.',
      transfer:'Cuando el texto nombra la emoción y además muestra una conducta corporal, usa ambas pistas antes de elegir una etiqueta emocional.',
      wrong:{
        A:{plausible:'El paciente busca la mano del médico, gesto que podría asociarse con confianza.',break:'Ese gesto aparece precisamente porque hay temor y necesidad de apoyo; el texto dice «aprensión» y «temor contenido».'},
        C:{plausible:'Una mirada silenciosa puede parecer neutra.',break:'Aquí no es neutra: el autor describe explícitamente miedo y tensión.'},
        D:{plausible:'El sufrimiento puede producir resentimiento.',break:'El texto no muestra enojo contra el médico; muestra miedo y vulnerabilidad.'},
        E:{plausible:'El paciente podría rechazar procedimientos dolorosos.',break:'La conducta descrita es acercarse y buscar contacto con el médico, no apartarse de él.'}
      }
    },
    'RV-11-003': {
      position:108, answer:'D', focus:'Sentido figurado por inversión de roles', anchor:'al otro extremo del escalpelo',
      secondary:'no soy un médico. Soy tan solo un hombre',
      point:'«El otro lado del escalpelo» no describe una ubicación física. Significa vivir la cirugía desde el papel opuesto: ya no sostener el instrumento como cirujano, sino recibir la intervención como paciente.',
      transfer:'Cuando una expresión figurada contrapone dos posiciones, identifica primero qué rol tenía el personaje y cuál ocupa ahora.',
      wrong:{
        A:{plausible:'La frase contiene una imagen espacial: “otro lado”.',break:'El contexto no habla de distancia respecto al instrumento, sino del cambio de rol médico → paciente.'},
        B:{plausible:'El escalpelo invita a imaginar cómo se sostiene físicamente.',break:'Nada en el pasaje trata de cogerlo por una parte; el narrador ni siquiera está operando.'},
        C:{plausible:'Como paciente debe seguir indicaciones médicas.',break:'Eso puede ocurrir, pero no explica la metáfora central del “otro lado”.'},
        E:{plausible:'El hospital tiene rutinas y el personal realiza tareas repetidas.',break:'La frase se refiere al narrador y a su nueva condición, no a la rutina del personal.'}
      }
    },
    'RV-11-004': {
      position:109, answer:'B', focus:'Concentración quirúrgica explícita', anchor:'absorto en la tarea quirúrgica',
      secondary:'puedo concentrarme en un hueso o un vaso sanguíneo',
      point:'Cuando opera, el narrador se concentra por completo en la tarea técnica. El texto incluso contrasta esa concentración con pensar en el ser humano que está detrás del cuerpo.',
      transfer:'En preguntas literales, una palabra fuerte como «absorto» puede resolver el ítem si la relacionas con la alternativa que la parafrasea.',
      wrong:{
        A:{plausible:'En una operación puede haber comunicación entre colegas.',break:'El pasaje no menciona conversación; insiste en la concentración del cirujano.'},
        C:{plausible:'Un cirujano suele buscar la recuperación del paciente.',break:'No se afirma aquí que piense en el pronóstico mientras opera; se dice que está absorto en la tarea.'},
        D:{plausible:'Más adelante recuerda frustración ante una paciente moribunda.',break:'Ese recuerdo corresponde a otro momento; no describe su estado habitual durante una operación.'},
        E:{plausible:'Una cirugía puede generar ansiedad por cometer errores.',break:'El narrador describe dominio técnico y concentración, no ansiedad en ese momento.'}
      }
    },
    'RV-11-005': {
      position:110, answer:'B', focus:'Paráfrasis de “atención eficiente”', anchor:'El personal me atiende con destreza',
      secondary:'Brindar una atención eficiente es lo que hacemos mejor',
      point:'En este contexto, «eficiente» significa que el personal realiza la atención con destreza, cuidado y buen desempeño. «Atender con esmero» conserva esa idea sin añadir rechazo ni autonomía indebida.',
      transfer:'Para parafrasear una expresión, reemplázala por otra y comprueba si la escena sigue significando lo mismo.',
      wrong:{
        A:{plausible:'El personal sí sigue procedimientos e indicaciones.',break:'La opción añade “sin tener cuidado con el paciente”, justo lo contrario del esmero descrito.'},
        C:{plausible:'El trabajo hospitalario tiene tareas rutinarias.',break:'«Rutinaria» habla de repetición; «eficiente» evalúa la calidad con que se realiza la atención.'},
        D:{plausible:'El narrador critica cierta frialdad médica en otros pasajes.',break:'La frase preguntada describe destreza y atención, no indiferencia o rechazo.'},
        E:{plausible:'El personal puede tomar decisiones dentro de su función.',break:'El texto no define eficiencia como actuar sin consultar; esa idea no aparece en la escena.'}
      }
    }
  };
  window.PRONABEC_CURATED_101_150 = Object.assign(window.PRONABEC_CURATED_101_150 || {}, chunk);
})();