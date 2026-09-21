(() => {
  'use strict';
  const chunk = {
    'RV-13-010': {
      position:141, answer:'D', focus:'Método usado para vincular evidencia y sospechoso', anchor:'la policía hace análisis genéticos',
      secondary:'comparar el carné de identidad genético del sospechoso',
      point:'La investigación intenta relacionar muestras de la escena con el sospechoso mediante comparación genética. El análisis de ADN es el procedimiento que aporta esa evidencia de contacto.',
      transfer:'Cuando una pregunta pide “cómo” se comprueba algo, busca el procedimiento concreto descrito, no actividades generales de una investigación.',
      wrong:{
        A:{plausible:'Interrogar testigos es una técnica policial real.',break:'Este texto no desarrolla testimonios; el eje es la evidencia biológica.'},
        B:{plausible:'El sospechoso aparece desde el inicio y niega conocer a la víctima.',break:'La policía no resuelve esa contradicción interrogándolo más, sino comparando muestras genéticas.'},
        C:{plausible:'Toda investigación revisa hallazgos.',break:'La opción es demasiado general; el texto especifica una técnica concreta: análisis genético.'}
      }
    },
    'RV-13-011': {
      position:142, answer:'A', focus:'Ejemplo inicial como hilo conductor de una explicación', anchor:'Se ha cometido un asesinato',
      secondary:'Pero ¿cómo probarlo?',
      point:'El asesinato funciona como una situación-problema que da sentido a las explicaciones posteriores sobre ADN. No se desarrolla como historia policial autónoma: sirve para mostrar para qué puede utilizarse la genética.',
      transfer:'Cuando un texto expositivo empieza con una historia breve, pregunta si esa historia es el tema o si funciona como ejemplo que organiza la explicación.',
      wrong:{
        B:{plausible:'El caso se menciona con sospechoso, víctima y evidencias.',break:'El texto no intenta identificar a un culpable concreto; usa el caso para explicar el método genético.'},
        C:{plausible:'Los asesinatos sí son casos donde la policía usa ADN.',break:'Que sea un ejemplo posible no explica su función dentro de este texto: actúa como hilo conductor.'},
        D:{plausible:'El comienzo tiene elementos narrativos.',break:'No continúa contando la vida de los involucrados; cambia rápidamente a explicación científica.'}
      }
    },
    'RV-13-012': {
      position:143, answer:'B', focus:'Excepción explícita a la unicidad del ADN', anchor:'salvo los gemelos idénticos',
      point:'El texto afirma que es muy improbable que dos personas compartan el mismo ADN y señala una excepción concreta: los gemelos idénticos.',
      transfer:'En preguntas literales, palabras como “salvo”, “excepto” o “a menos que” suelen contener directamente la respuesta.',
      wrong:{
        A:{plausible:'El contexto del texto es una investigación de asesinato.',break:'Ser asesino no determina compartir ADN con otra persona.'},
        C:{plausible:'El ejemplo menciona cabellos pelirrojos.',break:'El color de cabello puede coincidir entre muchas personas sin que su ADN sea idéntico.'},
        D:{plausible:'La policía trabaja con estas muestras.',break:'La profesión no crea identidad genética entre individuos.'}
      }
    },
    'RV-13-013': {
      position:144, answer:'A', focus:'Límite probatorio del ADN', anchor:'Es solo una prueba entre muchas otras',
      secondary:'no proporciona necesariamente la prueba de un delito',
      point:'Probar contacto puede ser muy útil, pero no demuestra por sí solo que alguien cometió el delito. La clave A recoge esa cautela: el resultado genético es una pieza dentro de un conjunto mayor de pruebas.',
      transfer:'En inferencias forenses, distingue “estar relacionado con la escena o persona” de “ser culpable”. Evidencia de contacto no equivale automáticamente a evidencia de autoría.',
      audit:'La alternativa D también expresa una consecuencia literal del análisis: puede establecer cercanía o contacto. El solucionario elige A porque enfatiza la idea del apartado “Solo una prueba” y el límite de lo que el ADN permite concluir.',
      wrong:{
        B:{plausible:'Encontrar ADN puede vincular a una persona con la víctima.',break:'Ese vínculo no demuestra por sí solo que haya cometido el asesinato; pueden existir otras explicaciones para el contacto.'},
        C:{plausible:'El ADN suele percibirse como una prueba científica muy fuerte.',break:'El texto advierte expresamente que no es infalible para probar el delito completo.'},
        D:{plausible:'El texto sí dice que una coincidencia puede mostrar que el sospechoso estuvo cerca de la víctima.',break:'Es una consecuencia válida, pero la pregunta y la clave oficial ponen el foco en el valor probatorio: sigue siendo solo una evidencia entre varias.'}
      }
    },
    'RV-13-014': {
      position:145, answer:'C', focus:'Metáfora de identidad aplicada al ADN', anchor:'el ADN es como un carné de identidad genético',
      secondary:'es único para cada individuo',
      point:'La expresión “carné de identidad genético” significa que la configuración del ADN permite distinguir a una persona de casi todas las demás, del mismo modo que un documento identifica a su titular.',
      transfer:'En una metáfora explicativa, busca qué propiedad comparten los dos elementos comparados. Aquí la propiedad común es identificar de manera individual.',
      wrong:{
        A:{plausible:'La palabra “carné” puede hacer pensar en un documento que se compra o tramita.',break:'No es un objeto comercial; es una metáfora para la información genética.'},
        B:{plausible:'El ADN describe algo interno del cuerpo.',break:'No es una “representación gráfica de todo tu interior”; el concepto apunta a una configuración genética identificadora.'},
        D:{plausible:'Más adelante aparece un patrón de barras usado por especialistas.',break:'Ese patrón no sirve automáticamente para “hallar culpables”; sirve para comparar muestras y establecer coincidencias.'}
      }
    },
    'RV-13-015': {
      position:146, answer:'D', focus:'Identificar al agente especializado de un procedimiento', anchor:'El especialista en genética coge unas pocas células',
      secondary:'los especialistas en genética son capaces de comparar',
      point:'El texto nombra repetidamente a los especialistas en genética como quienes extraen, preparan y comparan las muestras de ADN.',
      transfer:'Cuando pregunten “quién realiza” un procedimiento, localiza el sujeto gramatical de los verbos técnicos: toma, prepara, analiza, compara.',
      wrong:{
        A:{plausible:'La policía solicita y utiliza los análisis en una investigación.',break:'El texto separa funciones: la policía investiga, pero el procedimiento técnico lo realizan especialistas en genética.'},
        B:{plausible:'Los familiares pueden aportar muestras en otros contextos.',break:'No aparecen realizando el procedimiento descrito.'},
        C:{plausible:'La palabra “investigadores” aparece al hablar de la escena del crimen.',break:'Recolectar evidencia no equivale a efectuar el análisis genético de laboratorio.'}
      }
    },
    'RV-14-001': {
      position:147, answer:'A', focus:'Término excluido por romper una serie de antónimos', anchor:'FIRMEZA',
      point:'Debilidad, inestabilidad, volubilidad y decaimiento se alejan de la idea de firmeza. “Solidez”, en cambio, se acerca a su significado. Por eso es el elemento que rompe la serie de contrarios.',
      transfer:'En término excluido, primero identifica qué relación comparten cuatro opciones. El excluido no siempre es “la palabra rara”; es la que no cumple esa relación.',
      wrong:{
        B:{plausible:'“Debilidad” contrasta claramente con firmeza.',break:'Precisamente por eso pertenece al grupo mayor de antónimos y no debe excluirse.'},
        C:{plausible:'“Inestabilidad” parece muy diferente de firmeza.',break:'Esa diferencia es la relación que comparte con las otras opciones negativas.'},
        D:{plausible:'“Volubilidad” no significa exactamente debilidad.',break:'Sí comparte el rasgo de falta de constancia o firmeza, por lo que encaja en la serie opuesta.'},
        E:{plausible:'“Decaimiento” parece menos directamente relacionado.',break:'Aun así expresa pérdida de vigor o firmeza; sigue del lado contrario al término guía.'}
      }
    },
    'RV-14-002': {
      position:148, answer:'D', focus:'Término excluido por antonimia frente a una serie sinonímica', anchor:'AMOR',
      point:'Cariño, afecto, apego y pasión pertenecen al campo de sentimientos de cercanía o amor. “Repulsión” expresa rechazo y va en dirección contraria.',
      transfer:'Si cuatro palabras forman una nube de significados cercanos y una expresa el polo opuesto, esa palabra es la excluida.',
      wrong:{
        A:{plausible:'Cariño no es idéntico a amor en intensidad.',break:'No necesita ser idéntico; basta con compartir el mismo campo afectivo y sentido cercano.'},
        B:{plausible:'Afecto es más general que amor.',break:'Sigue siendo semánticamente cercano y pertenece al grupo de sentimientos positivos de vínculo.'},
        C:{plausible:'Apego puede tener matices distintos o incluso excesivos.',break:'Mantiene la idea de vínculo y cercanía, no de rechazo.'},
        E:{plausible:'Pasión es más intensa que amor.',break:'La diferencia de intensidad no rompe la dirección semántica; sigue siendo un sentimiento de fuerte atracción.'}
      }
    },
    'RV-14-003': {
      position:149, answer:'E', focus:'Término excluido por cambio de campo semántico', anchor:'GROTESCO',
      point:'Estrafalario, ridículo, estrambótico y extravagante pueden describir algo extraño, exagerado o chocante. “Profano” pertenece a otro eje: significa no sagrado o ajeno a lo religioso.',
      transfer:'Cuando varias opciones parecen sinónimos parciales, busca la que cambia completamente de rasgo semántico en lugar de la que solo cambia de intensidad.',
      wrong:{
        A:{plausible:'“Estrafalario” tiene un matiz más relacionado con vestimenta o apariencia.',break:'Aun así conserva el rasgo de extravagancia o rareza que comparte con grotesco.'},
        B:{plausible:'“Ridículo” puede centrarse más en provocar burla.',break:'Ese matiz sigue dentro del significado que el propio libro atribuye a grotesco.'},
        C:{plausible:'“Estrambótico” es coloquial y muy intenso.',break:'Continúa describiendo algo extravagante o extraño, por lo que permanece en la misma familia semántica.'},
        D:{plausible:'“Extravagante” no es siempre tan negativo como grotesco.',break:'Comparte el núcleo de salirse de lo común; la relación sigue siendo mucho más cercana que con “profano”.'}
      }
    },
    'RV-14-004': {
      position:150, answer:'B', focus:'Término excluido por relación con un espacio', anchor:'DORMITORIO',
      point:'Cama, pijama, almohada y dormir se relacionan directamente con la función y los objetos típicos de un dormitorio. “Vajilla” pertenece al ámbito de comer y de la cocina/comedor.',
      transfer:'En relaciones por contexto, agrupa objetos y acciones que normalmente ocurren alrededor del término guía; excluye lo que pertenece a otra escena cotidiana.',
      wrong:{
        A:{plausible:'Una cama puede existir en otros lugares.',break:'Aun así es uno de los objetos prototípicos de un dormitorio y encaja claramente en el grupo.'},
        C:{plausible:'El pijama es una prenda, no un mueble.',break:'La relación no exige misma categoría gramatical; exige vínculo funcional con dormir y el dormitorio.'},
        D:{plausible:'Una almohada también podría usarse fuera del dormitorio.',break:'Su función típica está directamente ligada a descansar y dormir.'},
        E:{plausible:'“Dormir” es una acción mientras las otras son objetos.',break:'El criterio del ejercicio admite características, objetos y acciones relacionados con la premisa; dormir es la función central del dormitorio.'}
      }
    }
  };
  window.PRONABEC_CURATED_101_150 = Object.assign(window.PRONABEC_CURATED_101_150 || {}, chunk);
})();