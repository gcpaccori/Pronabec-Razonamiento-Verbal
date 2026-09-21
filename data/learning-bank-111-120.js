(() => {
  'use strict';
  const chunk = {
    'RV-11-006': {
      position:111, answer:'D', focus:'Cambio emocional del médico al convertirse en paciente', anchor:'siente que los ojos se le llenan de lágrimas',
      secondary:'habitualmente indiferente y controlado',
      point:'Lo sorprendente es que alguien acostumbrado a mostrarse controlado termina emocionalmente desbordado. Su propia vulnerabilidad rompe la imagen profesional que tenía de sí mismo.',
      transfer:'Cuando una pregunta pide qué resulta inesperado para un personaje, busca el contraste entre “cómo era normalmente” y “qué le ocurre ahora”.',
      wrong:{
        A:{plausible:'El protagonista, siendo médico, termina hospitalizado.',break:'El texto no presenta enfermar como algo increíble; lo que destaca es que pierde su habitual control emocional.'},
        B:{plausible:'La cortesía con pacientes forma parte del trato humano que aprende.',break:'No se dice que le parezca increíble poder ser cortés; el cambio visible es emocional.'},
        C:{plausible:'El médico suele mostrar seguridad y dominio de sí.',break:'Eso es precisamente lo habitual en él, no lo que ahora le sorprende.'},
        E:{plausible:'Transmitir seguridad es una conducta típica del médico.',break:'También pertenece a su rol habitual; la escena decisiva es que ahora llora y se siente vulnerable.'}
      }
    },
    'RV-11-007': {
      position:112, answer:'B', focus:'Emoción evocada por un recuerdo explícito', anchor:'Nuevamente siento el temor, la frustración',
      secondary:'nada dio resultado',
      point:'El recuerdo de la paciente moribunda reactiva la frustración de haber hecho todo lo posible sin conseguir salvarla. La palabra aparece de forma explícita y está conectada con el fracaso de sus esfuerzos.',
      transfer:'Si una emoción está nombrada y luego el texto explica su causa, prioriza esa relación antes de inferir otra emoción posible.',
      wrong:{
        A:{plausible:'Un fracaso doloroso podría dejar resentimiento.',break:'El narrador no culpa a nadie; describe frustración y deseo de huir.'},
        C:{plausible:'Los médicos pueden protegerse emocionalmente con distancia.',break:'Aquí ocurre lo contrario: el recuerdo todavía lo afecta intensamente.'},
        D:{plausible:'El dolor de pacientes es un tema general del relato.',break:'La pregunta pide qué emoción le provoca ese recuerdo al protagonista, no qué sufren los operados.'},
        E:{plausible:'La situación sí puede generar preocupación.',break:'El texto usa una emoción más precisa: frustración ante no poder cambiar el desenlace.'}
      }
    },
    'RV-11-008': {
      position:113, answer:'E', focus:'Símbolo que produce una transformación moral', anchor:'establecer un auténtico contacto conmigo',
      secondary:'resuelvo no volver a tocar jamás un “cuerpo”, sino al ser humano',
      point:'La enfermera no hace un milagro médico; hace algo humano: reconoce el sufrimiento del paciente. Ese gesto lleva al narrador a revisar cómo él mismo trata a quienes atiende.',
      transfer:'En una metáfora espiritual, identifica qué acción concreta recibe un significado mayor y qué cambio provoca en el personaje.',
      wrong:{
        A:{plausible:'“La mano de Dios” puede sonar literalmente a milagro.',break:'No hay curación sobrenatural ni medicina decisiva; el gesto importante es la empatía.'},
        B:{plausible:'La enfermera sí muestra paciencia y consideración.',break:'La pregunta apunta al sentido profundo de la imagen: ese gesto provoca una reflexión y una decisión en el médico.'},
        C:{plausible:'El texto critica la indiferencia clínica en general.',break:'La enfermera hace exactamente lo contrario: se detiene a reconocer sus sentimientos.'},
        D:{plausible:'El narrador está harto de ser manipulado físicamente.',break:'La enfermera no expresa rechazo; establece contacto humano.'}
      }
    },
    'RV-11-009': {
      position:114, answer:'C', focus:'Causa inmediata de la curiosidad', anchor:'divisé en un pequeño basural un objeto brillante',
      secondary:'curiosidad muy explicable en mi temperamento de coleccionista',
      point:'El temperamento de coleccionista explica por qué suele interesarse por objetos, pero el estímulo inmediato que llama su atención en esa escena es el brillo del objeto.',
      transfer:'Cuando hay una causa general y un disparador inmediato, fíjate cuál de los dos responde exactamente al “por qué” de ese momento.',
      audit:'La alternativa B es plausible porque el narrador menciona su temperamento de coleccionista. El solucionario privilegia C como causa inmediata: primero “divisa un objeto brillante” y luego se acerca.',
      wrong:{
        A:{plausible:'El basural hace extraña la aparición del objeto.',break:'Lo que el narrador señala como perceptivamente llamativo es que el objeto brillaba.'},
        B:{plausible:'El texto dice que su curiosidad era explicable por su temperamento de coleccionista.',break:'Eso describe una predisposición personal; la clave del libro toma el brillo como el estímulo concreto que activa la curiosidad en esa escena.'},
        D:{plausible:'El malecón es el lugar donde ocurre el hallazgo.',break:'Frecuentar un lugar no explica por sí mismo por qué ese objeto específico llamó su atención.'}
      }
    },
    'RV-11-010': {
      position:115, answer:'B', focus:'Causa literal del olvido', anchor:'aquel traje que usaba poco',
      secondary:'No puedo precisar cuánto tiempo estuvo guardada',
      point:'La insignia quedó olvidada porque estaba en el bolsillo de un traje que el protagonista usaba poco. El hallazgo en la lavandería confirma que siguió allí sin que él la recordara.',
      transfer:'En preguntas causales literales, conecta el “por qué” con la frase que explica directamente la circunstancia.',
      wrong:{
        A:{plausible:'Al ser de plata, uno podría imaginar que quiso protegerla.',break:'El narrador dice que no le dio mayor importancia; no la escondió por seguridad.'},
        C:{plausible:'La insignia reaparece cuando el traje vuelve de la lavandería.',break:'No la olvidó en la lavandería: ya estaba guardada en el bolsillo antes de enviarlo a lavar.'},
        D:{plausible:'El protagonista efectivamente dejó de pensar en la insignia.',break:'Sí se olvidó de ella, pero el texto explica dónde quedó y por qué permaneció tanto tiempo: en un traje poco usado.'}
      }
    },
    'RV-11-011': {
      position:116, answer:'D', focus:'Consecuencia directa del rescate de la insignia', anchor:'este rescate inesperado me conmovió',
      secondary:'decidí usarla',
      point:'El rescate de la insignia no lo lleva a devolverla ni a una reunión de inmediato. La consecuencia textual es simple y directa: se conmueve y decide usarla.',
      transfer:'Cuando el texto dice “esto me llevó a…”, separa la consecuencia inmediata de los hechos que ocurren después.',
      wrong:{
        A:{plausible:'Al recuperar un objeto ajeno podría corresponder devolverlo.',break:'El narrador no busca dueño; decide ponérselo.'},
        B:{plausible:'Más adelante recibe una tarjeta blanca.',break:'Eso ocurre después y por otra cadena de sucesos; no es la consecuencia inmediata del rescate.'},
        C:{plausible:'Al final de la sesión alguien pinta rayas en una pizarra.',break:'Es un hecho muy posterior y realizado por otro personaje.'}
      }
    },
    'RV-11-012': {
      position:117, answer:'B', focus:'Sinonimia contextual de “añejas”', anchor:'añejas encuadernaciones',
      point:'En una librería de viejo, «añejas encuadernaciones» describe encuadernaciones antiguas, envejecidas. «Viejas» conserva ese sentido de tiempo.',
      transfer:'Para deducir vocabulario, sustituye cada opción dentro de la frase y pregunta cuál mantiene la escena sin añadir otra cualidad.',
      wrong:{
        A:{plausible:'Los libros antiguos pueden parecer raros.',break:'«Añejas» marca antigüedad, no rareza.'},
        C:{plausible:'El protagonista está revisando libros y eso puede sugerir interés.',break:'La palabra no evalúa si son interesantes; describe su antigüedad.'},
        D:{plausible:'Una encuadernación antigua puede ser costosa.',break:'El precio no aparece en el significado contextual de «añejas».'}
      }
    },
    'RV-11-013': {
      position:118, answer:'C', focus:'Caracterización literal por desconocimiento', anchor:'me era enteramente desconocido',
      secondary:'no había preguntado por dicho autor',
      point:'El narrador no reconoce a Feifer y lo dice de manera explícita: le era enteramente desconocido. Las demás opciones convierten información que el librero cuenta después en conocimiento previo del protagonista.',
      transfer:'Distingue lo que el personaje sabía antes de la conversación de lo que recién aprende durante ella.',
      wrong:{
        A:{plausible:'El librero afirma que Feifer fue asesinado.',break:'Eso es información que recibe en ese momento; no define cómo conocía al autor antes.'},
        B:{plausible:'El librero dice que Feifer estuvo en Pilsen.',break:'También es un dato nuevo y enigmático, no algo que el protagonista supiera.'},
        D:{plausible:'El relato menciona que murió de un bastonazo en Praga.',break:'Es otra revelación del librero; no contradice que para el protagonista el autor fuera desconocido.'}
      }
    },
    'RV-11-014': {
      position:119, answer:'B', focus:'Vocabulario inferido por la forma de la acción', anchor:'me abordó intempestivamente',
      secondary:'antes de que yo pudiera reaccionar',
      point:'El hombre aparece y actúa antes de que el protagonista pueda reaccionar. Esa rapidez inesperada muestra que «intempestivamente» significa de forma sorpresiva o fuera de lo previsto.',
      transfer:'Para una palabra desconocida, observa qué ocurre justo después: muchas veces la reacción del personaje revela el sentido.',
      wrong:{
        A:{plausible:'El abordaje brusco podría sentirse rudo.',break:'El texto no enfatiza violencia o maltrato, sino aparición inesperada.'},
        C:{plausible:'La escena resulta extraña y casi absurda.',break:'«Cómica» describe efecto humorístico, no la manera repentina de actuar.'},
        D:{plausible:'Todo el episodio es extraño.',break:'«Extraña» es demasiado general; la pista «antes de que pudiera reaccionar» apunta específicamente a sorpresa y rapidez.'}
      }
    },
    'RV-11-015': {
      position:120, answer:'C', focus:'Causa inferida por un rasgo compartido', anchor:'tenían una insignia igual a la mía',
      secondary:'todos me estrechaban la mano con gran familiaridad',
      point:'La familiaridad de desconocidos se entiende por la señal que todos comparten: llevan la misma insignia. Para ellos, esa marca identifica al protagonista como parte del grupo.',
      transfer:'Cuando una conducta extraña aparece junto a un rasgo compartido, prueba si ese rasgo funciona como señal de pertenencia.',
      wrong:{
        A:{plausible:'Una reunión puede tener una lista de asistentes esperados.',break:'El narrador ni siquiera sabe bien qué ocurre; el texto no dice que lo esperaran por nombre.'},
        B:{plausible:'Saludar con familiaridad suele indicar conocimiento previo.',break:'El protagonista los encuentra como sujetos extraños; la familiaridad nace de la insignia compartida.'},
        D:{plausible:'En una organización podría existir una regla de saludo.',break:'No se menciona obligación alguna; el indicio visible que explica el trato es la insignia igual.'}
      }
    }
  };
  window.PRONABEC_CURATED_101_150 = Object.assign(window.PRONABEC_CURATED_101_150 || {}, chunk);
})();