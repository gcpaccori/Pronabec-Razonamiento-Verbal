(() => {
  'use strict';
  const chunk = {
  "RV-09-001": {
    "position": 81,
    "answer": "A",
    "focus": "Localización literal del referente",
    "anchor": "El correo electrónico o email ha sido una gran innovación tecnológica",
    "point": "La respuesta está formulada de manera directa en la primera oración: el correo electrónico es presentado como la innovación tecnológica relevante para la administración de empresas.",
    "transfer": "En una pregunta literal, localiza primero la frase que contiene exactamente el referente pedido antes de interpretar.",
    "wrong": {"B":"El teléfono fijo aparece como medio anterior, no como la innovación destacada.","C":"El texto no presenta al teléfono móvil como eje.","D":"La computadora hace posible el entorno tecnológico, pero no es el elemento que el texto identifica."}
  },
  "RV-09-002": {
    "position": 82,
    "answer": "A",
    "focus": "Síntesis literal de un proceso",
    "anchor": "tenía que llamar a cada una de ellas él mismo",
    "secondary": "depender de otros para que hagan llegar su mensaje",
    "point": "Antes del correo, comunicar un mismo mensaje exigía contactos uno por uno o intermediarios. A condensa exactamente esas dos dificultades sin añadir una causa inventada.",
    "transfer": "Una buena paráfrasis conserva las acciones y relaciones del texto aunque cambie las palabras.",
    "wrong": {"B":"El texto describe un procedimiento engorroso, pero no afirma que el problema fuera falta de tiempo.","C":"No se cuestiona la habilidad del gerente para usar el teléfono.","D":"Contradice el contraste central entre el proceso anterior y la facilidad del correo."}
  },
  "RV-09-003": {
    "position": 83,
    "answer": "C",
    "focus": "Sentido figurado desde el mecanismo",
    "anchor": "aceptar los caprichos inevitables del “teléfono malogrado”",
    "point": "La expresión alude al deterioro del mensaje cuando pasa por intermediarios: cada transmisión puede alterar lo que originalmente se dijo. C describe ese mecanismo.",
    "transfer": "Para interpretar una expresión figurada, busca qué proceso del párrafo la rodea; el contexto suele explicar la metáfora.",
    "wrong": {"A":"Lee la expresión de forma literal como una avería física, algo que el párrafo no plantea.","B":"Habla de durabilidad del aparato, fuera del problema de transmisión de mensajes.","D":"Generaliza a todos los trabajadores; el punto es la modificación del mensaje, no que todos comprendan mal."}
  },
  "RV-09-004": {
    "position": 84,
    "answer": "B",
    "focus": "Importancia como efecto principal",
    "anchor": "ha hecho que el flujo de información en las organizaciones sea mucho mejor",
    "point": "La importancia no es simplemente que el correo exista o sea rápido, sino el efecto organizacional que el texto destaca: mejora el flujo de información entre muchas personas.",
    "transfer": "Cuando pregunten por importancia, busca el cambio o beneficio que el autor presenta como consecuencia del elemento estudiado.",
    "wrong": {"A":"El texto dice exactamente lo contrario: el correo transmite mal tonos y matices.","C":"Castigar o dar malas noticias aparece como uso desaconsejado.","D":"La expansión rápida se presenta como peligro, no como garantía de transparencia correcta."}
  },
  "RV-09-005": {
    "position": 85,
    "answer": "A",
    "bookAnswer": "D",
    "focus": "Distinguir peligro de recomendación",
    "anchor": "los correos no son el mejor medio para transmitir tonos y matices de voz",
    "point": "El texto nombra como primer peligro la pérdida de tono y matices, porque puede convertir una broma en una orden o una ironía en algo literal. D es una regla de uso que se deriva de ese peligro, no el peligro mismo.",
    "transfer": "Distingue el problema causal de la recomendación que aparece después para reducirlo.",
    "audit": "El solucionario original marca D, pero el texto identifica explícitamente A como el primer peligro. D es una consecuencia práctica de esa limitación.",
    "wrong": {"B":"El correo no impide la comunicación directa; de hecho facilita contactar a varias personas.","C":"El segundo peligro es lo contrario: los correos pueden expandirse demasiado.","D":"Es una recomendación de uso derivada del problema de tono, no la formulación del peligro que el texto enumera."}
  },
  "RV-09-006": {
    "position": 86,
    "answer": "A",
    "focus": "Aplicar una regla a un caso nuevo",
    "anchor": "no debe ser usado para castigar, regañar o dar malas noticias",
    "point": "Reducir el sueldo es una noticia negativa y potencialmente delicada. Aplicando la regla del texto, ese mensaje debe comunicarse en persona y no por correo.",
    "transfer": "En preguntas de aplicación, convierte primero la regla del texto en criterio y luego clasifica el caso nuevo.",
    "wrong": {"B":"Felicitar está expresamente permitido: el correo puede usarse para alabar y alentar.","C":"Solicitar completar una tarea transmite un hecho o instrucción directa, un uso compatible con la regla.","D":"Agradecer una entrega es un mensaje positivo, no una mala noticia."}
  },
  "RV-09-007": {
    "position": 87,
    "answer": "C",
    "focus": "Metáfora de máxima visibilidad",
    "anchor": "se exhiban en la pantalla gigante del Times Square",
    "point": "Times Square funciona como imagen de exposición pública: escribir algo en un correo supone aceptar que podría terminar visible para muchas personas.",
    "transfer": "Una comparación extrema suele expresar una propiedad, no el lugar literal: aquí la propiedad es publicidad/visibilidad.",
    "wrong": {"A":"El idioma o la modernidad no son el rasgo relevante de la imagen.","B":"La moda no explica la advertencia sobre reenvíos y exposición.","D":"Es exactamente lo contrario: la imagen elimina la idea de privacidad."}
  },
  "RV-09-008": {
    "position": 88,
    "answer": "A",
    "focus": "Invertir la recomendación del autor",
    "anchor": "De lo contrario, utilice el teléfono",
    "secondary": "es mejor que esté dispuesto a enviarlo a todo el mundo",
    "point": "Si el contenido no debería hacerse público, el autor recomienda no escribirlo por correo y usar el teléfono. A expresa esa condición en términos cotidianos.",
    "transfer": "Cuando una recomendación aparece como «si no X, haga Y», identifica primero qué condición activa la alternativa Y.",
    "wrong": {"B":"El agradecimiento es un mensaje positivo que sí puede enviarse por correo.","C":"El criterio del texto es privacidad/riesgo de difusión, no cortesía general.","D":"La recomendación no depende de comodidad o pereza."}
  },
  "RV-09-009": {
    "position": 89,
    "answer": "A",
    "bookAnswer": "D",
    "focus": "Tema específico frente a categoría amplia",
    "anchor": "Con el correo electrónico",
    "secondary": "Pero hay dos peligros que siempre se deben tener en cuenta al utilizar el correo electrónico",
    "point": "Todo el desarrollo gira alrededor de lo que el correo facilita y de los riesgos que introduce. Por eso «ventajas y desventajas del correo electrónico» delimita mejor el tema que una categoría amplia como innovaciones tecnológicas.",
    "transfer": "El tema debe cubrir casi todos los párrafos con el menor nivel de generalidad posible: ni un detalle ni una categoría demasiado amplia.",
    "audit": "El solucionario original marca D, pero D solo describe el marco inicial. A representa el contenido desarrollado en todo el texto.",
    "wrong": {"B":"El teléfono aparece como alternativa para casos específicos, no como sustituto general del correo.","C":"No se desarrolla una historia cronológica del correo; solo se compara brevemente con el pasado.","D":"Es una categoría demasiado amplia: el texto no revisa varias innovaciones, sino un solo medio y sus beneficios/riesgos."}
  },
  "RV-09-010": {
    "position": 90,
    "answer": "A",
    "focus": "Idea central que integra beneficio y límite",
    "anchor": "el correo electrónico puede ser utilizado eficazmente",
    "secondary": "Pero hay dos peligros",
    "point": "A integra las dos mitades del texto: el correo es útil y mejora la comunicación, pero requiere escoger bien cuándo usarlo y tomar precauciones por sus riesgos.",
    "transfer": "La idea central debe poder explicar tanto los párrafos favorables como los de advertencia; si solo cubre una mitad, es incompleta.",
    "wrong": {"B":"Recoge únicamente la ventaja inicial y deja fuera los dos peligros y las reglas de uso.","C":"El texto no sostiene que el correo haya perjudicado globalmente la relación laboral.","D":"Generaliza una limitación específica como si el medio fuera inadecuado en general."}
  }
};
  window.PRONABEC_CURATED_51_100 = Object.assign(window.PRONABEC_CURATED_51_100 || {}, chunk);
})();
