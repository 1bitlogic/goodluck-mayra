// =====================================================================
//  GOODLUCK MAYRA — CONTENIDO DEL JUEGO
//  Aquí se edita todo lo que dicen los personajes. No hace falta tocar
//  juego.js para cambiar textos, regalos o la apariencia de nadie.
//
//  Cada personaje tiene:
//    id       identificador (se usa en mapas.js)
//    nombre   cómo aparece en el diálogo
//    area     se muestra junto al nombre
//    mensaje  lista de burbujas de diálogo (si una es muy larga se parte sola).
//             Cada elemento puede ser:
//               'texto'                      lo dice el personaje
//               { yo: 'texto' }              lo dice Mayra
//               { pregunta: 'texto', opciones: ['A', 'B'],
//                 respuestas: [[...si elige A], [...si elige B]] }
//    regalo   { nombre, desc } — objeto que Mayra recibe al despedirse
//    look     apariencia del muñequito:
//               piel, pelo, ropa, pantalon, cuello (colores en hex)
//               peinado: corto | puntas | largo | melena | cola | moño | rizado | calvo
//               lentes: true/false, barba: true/false, rubor: true/false
//
//  En los textos puedes usar {nombre} y {empresa}.
// =====================================================================

window.CONFIG = {
  empresa: 'BaldeCash',
  protagonista: {
    nombre: 'Mayra',
    area: 'RRHH',
    look: { piel: '#f3d3bb', pelo: '#7a5236', peinado: 'cola', ropa: '#d99aa6', pantalon: '#3d4f7a', rubor: true },
  },

  intro: [
    'Hoy es un día muy especial...',
    'Es el último día de {nombre} en {empresa}. Una nueva aventura la espera muy pronto.',
    'Pero antes de partir hay una última misión:',
    '¡Despedirse de todos sus compañeros del piso 2 y del piso 4!',
    'Acércate a cada uno y presiona Z o ENTER para hablar. Con X ves tu registro de despedidas.',
    'Cuando te hayas despedido de todos, toma el ascensor al PISO 1 y sal del edificio. ¡Suerte!',
  ],

  todosListos: [
    '¡Te despediste de todos tus compañeros! ♥',
    'Ya es hora de partir... Toma el ascensor hasta el PISO 1 y dirígete a la salida del edificio.',
  ],

  final: {
    pensamiento: ['Bueno... llegó el momento.', 'Qué rápido pasó el tiempo aquí...'],
    todos: ['¡¡MUCHO ÉXITO EN TU NUEVA AVENTURA, {nombre}!!', '¡Te vamos a extrañar un montón! ♥'],
    cierre: [
      'Gracias por todo lo que compartiste con nosotros.',
      'Esta siempre será tu casa. ¡Vuelve cuando quieras!',
    ],
  },

  creditos: {
    titulo: '¡GRACIAS, {nombre}!',
    intro: 'Con muchísimo cariño de tus compañeros de {empresa}:',
    cierre: [
      'Que en tu nueva chamba te vaya increíble.',
      'Nunca dejes de ser tú. ♥',
    ],
    firma: 'Juego hecho con cariño por David',
  },
};

window.PERSONAJES = [
  // ------------------------------ PISO 2 ------------------------------
  {
    id: 'david', nombre: 'David', area: 'Creador del juego',
    look: { piel: '#d9a27a', pelo: '#1a1614', peinado: 'puntas', ropa: '#e3e9e4', cuello: '#2b3440', pantalon: '#2b2b38' },
    mensaje: [
      '¡{nombre}! No puedo creer que hoy sea tu último día.',
      'Hice este jueguito para que te lleves un pedacito de la oficina contigo. Aunque, siendo sinceros, la mejor parte de la oficina eras tú.',
      'Voy a extrañar acompañarte a tu casa después del trabajo. Esas caminatas eran lo mejor del día.',
      { yo: 'Yo también las voy a extrañar...' },
      'Peeero... ¡tu nueva chamba queda cerca de mi casa! Así que esto no es un adiós.',
      {
        pregunta: 'Los días que tenga home office... ¿quedamos para vernos?',
        opciones: ['¡Obvio que sí!', 'Mmm... ¡claro que sí!'],
        respuestas: [
          ['¡Sabía que dirías eso! Ya está agendado.'],
          ['Jaja, era la única respuesta correcta. ¡Ya está agendado!'],
        ],
      },
      'Mucho éxito, {nombre}. Te mereces todo lo bueno. ¡Nos vemos pronto!',
    ],
    regalo: { nombre: 'CUPÓN DE HOME OFFICE', desc: 'Canjeable por un café cerca de casa los días de home de David. Usos ilimitados.' },
  },
  {
    id: 'sebastian', nombre: 'Sebas', area: 'Data',
    look: { piel: '#e8b996', pelo: '#2d1f17', peinado: 'corto', ropa: '#2f9e6e', pantalon: '#2e3440', lentes: true },
    mensaje: [
      '¡{nombre}! El trío se desarma... al menos por ahora.',
      'Hice el análisis y los datos no mienten: sin ti, la oficina pierde un 100% de buena vibra. Es estadísticamente significativo.',
      'Pero tranquila, que yo también me voy en unos meses.',
      { yo: '¿O sea que me vas a seguir?' },
      'Digamos que solo te adelantas. Ve preparando el terreno... ¡nos vemos en el más allá!',
      {
        pregunta: '¿Me guardas un sitio en el más allá?',
        opciones: ['Te guardo el mejor sitio', 'Depende... ¿traes snacks?'],
        respuestas: [
          ['¡Trato hecho! El trío se reencuentra del otro lado.'],
          ['Jaja, llevo snacks para los tres. ¡Trato hecho!'],
        ],
      },
      'Mucho éxito, {nombre}. ¡Te va a ir increíble!',
    ],
    regalo: { nombre: 'BOLETO AL MÁS ALLÁ', desc: 'Reserva para el reencuentro del trío. Fecha estimada: dentro de unos meses.' },
  },
  {
    id: 'consuelo', nombre: 'Consuelo', area: 'Gerente',
    look: { piel: '#e6b48e', pelo: '#4a2e1c', peinado: 'melena', ropa: '#7d4fa8', pantalon: '#2b2b38', rubor: true },
    mensaje: [
      '{nombre}, ha sido un gusto enorme tenerte en el equipo.',
      'Tu compromiso y tu energía dejaron huella aquí. No tengo dudas de que vas a brillar donde vayas.',
      '¿Sabes por qué los gerentes llevan una escalera a las reuniones?',
      '...Porque quieren llegar a los altos mandos. ...Ya, ya, me retiro.',
      'Las puertas de esta casa siempre estarán abiertas para ti. ¡Éxitos!',
    ],
    regalo: { nombre: 'PASE VIP VITALICIO', desc: 'Permite volver a visitar la oficina cuando quieras. No expira nunca.' },
  },
  {
    id: 'antonella', nombre: 'Antonella', area: 'Jefa de {nombre}',
    look: { piel: '#f0c7a8', pelo: '#2e1b12', peinado: 'largo', ropa: '#f08a4b', pantalon: '#34405a', rubor: true },
    mensaje: [
      '¡{nombre}! Qué difícil va a ser el día a día en RRHH sin ti.',
      'Gracias por tu dedicación, por aprender tanto y por enseñarnos también a nosotros.',
      'Oficialmente me toca hacerte la entrevista de salida. Pregunta 1: ¿por qué nos dejas? Pregunta 2: ¿segura? Pregunta 3: ¿segurísima?',
      'Jaja. Ver crecer a alguien del equipo es lo más bonito de este trabajo. ¡Vuela alto!',
    ],
    regalo: { nombre: 'MEDALLA MVP', desc: 'Otorgada a la jugadora más valiosa del equipo. Brilla muchísimo.' },
  },
  {
    id: 'ale', nombre: 'Ale', area: 'Legal',
    look: { piel: '#e0aa82', pelo: '#5b3520', peinado: 'cola', ropa: '#34495e', pantalon: '#22262e' },
    mensaje: [
      '{nombre}, revisé tu caso con mucho cuidado...',
      '...y legalmente no hay ninguna cláusula que te impida seguir siendo parte de la familia.',
      '¿Sabes cuál es el colmo de alguien de Legal? ...Que tu renuncia no admita apelación.',
      '¡Te deseo lo mejor del mundo en esta nueva etapa!',
    ],
    regalo: { nombre: 'CONTRATO DE AMISTAD', desc: 'Vigencia indefinida. No incluye cláusula de salida.' },
  },

  // ------------------------------ PISO 4 ------------------------------
  {
    id: 'emilio', nombre: 'Emilio', area: 'TI',
    look: { piel: '#d8a27c', pelo: '#211814', peinado: 'corto', ropa: '#c0392b', pantalon: '#2b2b38', barba: true },
    mensaje: [
      '¡{nombre}! Intenté hacerle un rollback a tu renuncia, pero no funcionó.',
      '¿Sabes por qué los de TI nunca nos despedimos? ...Porque solo hacemos log out.',
      'Ya en serio: fue un gusto trabajar contigo. ¡Te va a ir genial!',
    ],
    regalo: { nombre: 'CABLE DE RED IRROMPIBLE', desc: 'Para que nunca pierdas la conexión con tus amigos de la oficina.' },
  },
  {
    id: 'yadira', nombre: 'Yadira', area: 'Cobranzas',
    look: { piel: '#c98d63', pelo: '#24160f', peinado: 'rizado', ropa: '#17a589', pantalon: '#2e3440', rubor: true },
    mensaje: [
      '¡{nombre}! Antes de irte tengo que cobrarte algo...',
      '...¡un abrazo bien grande! Y no aceptamos pagos en cuotas.',
      'Te voy a extrañar mucho. ¡Mucha suerte en todo!',
    ],
    regalo: { nombre: 'DEUDA DE ABRAZOS', desc: 'Una deuda impagable. Se cobra con intereses cada vez que nos veamos.' },
  },
  {
    id: 'leo', nombre: 'Leo', area: 'TI',
    look: { piel: '#e4b28d', pelo: '#3a2618', peinado: 'puntas', ropa: '#2d8fd5', pantalon: '#2b2b38' },
    mensaje: [
      '¿Ya te vas, {nombre}? ¿Probaste apagar y volver a prender tu decisión?',
      'Sin ti, ¿quién nos va a hacer las encuestas de clima laboral? El clima va a estar bien nublado.',
      'Jaja, ya, te lo mereces. ¡Que te vaya súper bien!',
    ],
    regalo: { nombre: 'CARGADOR UNIVERSAL', desc: 'Para que nunca te quedes sin energía en tu nueva aventura.' },
  },
  {
    id: 'vania', nombre: 'Vania', area: 'Growth',
    look: { piel: '#f1caa9', pelo: '#6b3f22', peinado: 'moño', ropa: '#ff7aa2', pantalon: '#3a3f58', rubor: true },
    mensaje: [
      '¡{nombre}! Esto es lo que llamamos un crecimiento exponencial.',
      'Intenté retenerte con una campaña... ¿ni con un 2x1 en abrazos te quedas?',
      'Me alegra muchísimo verte dar este paso. ¡A seguir creciendo!',
    ],
    regalo: { nombre: 'POCIÓN DE CRECIMIENTO', desc: 'Aumenta todas tus estadísticas profesionales. Efecto permanente.' },
  },
  {
    id: 'anderson', nombre: 'Anderson', area: 'TI',
    look: { piel: '#c7926a', pelo: '#15100d', peinado: 'corto', ropa: '#1abc9c', pantalon: '#2b2b38', lentes: true },
    mensaje: [
      '{nombre}, abrí un ticket: "La oficina se queda sin {nombre}".',
      'Prioridad: crítica. Estado: no tiene solución. Lo tuve que marcar como "no se puede reproducir".',
      '¡Te vamos a extrañar! Mucho éxito.',
    ],
    regalo: { nombre: 'TAZA DE CAFÉ INFINITA', desc: 'Nunca se vacía. Ideal para los lunes en tu nuevo trabajo.' },
  },
  {
    id: 'haru', nombre: 'Haru', area: 'Product Owner',
    look: { piel: '#f2d0b0', pelo: '#121212', peinado: 'melena', ropa: '#8e5cc4', pantalon: '#2b2b38' },
    mensaje: [
      '{nombre}, agregué una historia de usuario al backlog:',
      '"Como equipo, queremos que a {nombre} le vaya increíble, para seguir celebrando sus logros."',
      'Criterio de aceptación: que nunca te olvides de nosotros. Y sí, va con prioridad máxima en este sprint. ¡Éxitos!',
    ],
    regalo: { nombre: 'ROADMAP AL ÉXITO', desc: 'Todas las rutas llevan a grandes logros. Sin bloqueos ni dependencias.' },
  },
  {
    id: 'gerardo', nombre: 'Gerardo', area: 'Contabilidad',
    look: { piel: '#dba582', pelo: '#3d3d3d', peinado: 'corto', ropa: '#5d6d7e', pantalon: '#22262e', lentes: true },
    mensaje: [
      '¡{nombre}! ¿Vienes a preguntarme por un reembolso otra vez?',
      { yo: 'Jaja... bueno, ya que estoy aquí...' },
      {
        pregunta: '¿Qué necesitas esta vez?',
        opciones: ['Mi reembolso, por favor', 'Solo vine a despedirme'],
        respuestas: [
          ['Está en proceso... como siempre.', 'Jaja, es broma: este sí lo aprobé al toque. Considéralo mi regalo de despedida.'],
          ['¿En serio? ¿Sin ningún reembolso pendiente? Ahora sí creo que te vas...'],
        ],
      },
      'Voy a extrañar que vengas a insistirme todos los días. Nadie me hacía trabajar tan rápido como tú.',
      'Cuadré las cuentas de tu paso por aquí: activos, muchísimos recuerdos. Pasivos, ninguno. El balance es totalmente positivo.',
      '¡Te deseo lo mejor, {nombre}!',
    ],
    regalo: { nombre: 'REEMBOLSO APROBADO', desc: 'El único reembolso aprobado en tiempo récord. Enmarcado y todo.' },
  },
  {
    id: 'miguel', nombre: 'Miguel', area: 'TI',
    look: { piel: '#d49d74', pelo: '#2a1d15', peinado: 'corto', ropa: '#e67e22', pantalon: '#2b2b38' },
    mensaje: [
      '¡{nombre}! Te di acceso de administradora a la felicidad.',
      '¿Sabes qué le dijo el servidor a la chica de RRHH que se iba? ...Que sin ella se quedaba sin recursos humanos.',
      'Úsalo con responsabilidad... el acceso, no el chiste. ¡Te mereces todo lo bueno!',
    ],
    regalo: { nombre: 'ACCESO ROOT', desc: 'Permisos totales para ser feliz. No requiere contraseña.' },
  },

  // --------------------- EXTRAS (no cuentan en el total) ---------------------
  {
    id: 'vigilante', nombre: 'Vigilante', area: 'Recepción', extra: true,
    look: { piel: '#c48a60', pelo: '#1b1b1b', peinado: 'corto', ropa: '#24364f', cuello: '#d9d9d9', pantalon: '#1c2433' },
    mensaje: [
      '¡Buenas! ¿Ya se nos va, señorita {nombre}?',
      'Que le vaya muy bien en su nuevo trabajo. ¡Éxitos!',
    ],
  },
];
