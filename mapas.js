// =====================================================================
//  GOODLUCK MAYRA — MAPAS
//  Cada mapa es una cuadrícula de texto (1 carácter = 1 baldosa de 16px).
//
//  Paredes:   #  pared          W  ventana         L  pizarra
//             N  letrero piso   E  ascensor        b  botón ascensor
//             V  televisor      Z  clóset madera   C  gabinetes altos
//  Suelo:     .  suelo          =  puerta          r  alfombra
//  Muebles:   D  escritorio (pantalla hacia abajo)  U  escritorio (pantalla hacia arriba)
//             d  escritorio     M  escritorio con laptop
//             T  mesa reuniones c  silla           P  planta
//             B  estante        l  casilleros      K  cafetera
//             k  lavadero       F  refri           w  dispensador de agua
//             X  impresora      S  sofá            R  recepción
//             Y  vidrio         $  caja BaldeCash  u  tacho
//  Exterior:  q  fachada        o  ventana fachada G  puerta de vidrio
//             s  vereda         a  pista           t  árbol   f  macetero
//
//  npcs:    { id, x, y, dir }  (id de mensajes.js; dir: up/down/left/right)
//  warps:   pisar (x,y) lleva a { a: mapa, x, y, dir }
//  objetos: textos personalizados al interactuar con una baldosa
// =====================================================================

window.PISOS = {
  1: { mapa: 'lobby', nombre: 'Piso 1 · Salida' },
  2: { mapa: 'pasillo2', nombre: 'Piso 2' },
  4: { mapa: 'pasillo4', nombre: 'Piso 4' },
};

window.MAPAS = {
  // ------------------------------------------------------------ PISO 2
  oficina2: {
    nombre: 'OFICINA · PISO 2', piso: 2, tema: 'madera', persianas: true,
    inicio: { x: 6, y: 9, dir: 'up' },
    tiles: [
      '##########################',
      '#WWWWWWWWW#CCC#VVV#ZZ#####',
      '#DDDDDDDDD#kKk..........P#',
      '#.........Y..............#',
      '#............UU..UU..dd..#',
      '#.........Y..DD..DD..dd..#',
      '#....lllll#..............#',
      '#.........#..............#',
      '#....dMd.X#..UU..UU...$..#',
      '#P........#..DD..DD......#',
      '#.........#..............#',
      '#B........#.............w#',
      '#B.....P..#.............u#',
      '################=#########',
    ],
    npcs: [
      { id: 'david', x: 4, y: 3, dir: 'up' },
      { id: 'sebastian', x: 8, y: 3, dir: 'up' },
      { id: 'antonella', x: 23, y: 5, dir: 'left' },
      { id: 'consuelo', x: 14, y: 6, dir: 'up', gira: true },
      { id: 'ale', x: 17, y: 10, dir: 'up' },
    ],
    warps: [{ x: 16, y: 13, a: 'pasillo2', ax: 2, ay: 2, dir: 'down' }],
    objetos: [
      { x: 5, y: 8, texto: ['Tu escritorio... ya casi vacío.', 'Solo quedan unos post-its rosados y muchos recuerdos.'] },
      { x: 6, y: 8, texto: ['Tu laptop. Alguien dejó abierto un Buscaminas a medio terminar...', '¡Ya no hay tiempo para ganar esta partida!'] },
      { x: 7, y: 8, texto: ['Tu escritorio... ya casi vacío.', 'Solo quedan unos post-its rosados y muchos recuerdos.'] },
      { x: 5, y: 6, texto: ['Los casilleros. El tuyo ya está vacío...', '...pero los recuerdos no caben en ningún casillero.'] },
      { x: 9, y: 8, texto: ['La impresora. Atascada, como siempre.'] },
    ],
  },

  pasillo2: {
    nombre: 'PASILLO · PISO 2', piso: 2, tema: 'baldosa', puerta: '#8cc3e8',
    ascensor: { x: 11, y: 2, dir: 'down' },
    tiles: [
      '##################',
      '##=##N###EEbEE####',
      '#P..............P#',
      '#................#',
      '#.....rrrrrr.....#',
      '#.....rrrrrr.....#',
      '#P.......w......P#',
      '##################',
    ],
    npcs: [],
    warps: [{ x: 2, y: 1, a: 'oficina2', ax: 16, ay: 12, dir: 'up' }],
  },

  // ------------------------------------------------------------ PISO 4
  pasillo4: {
    nombre: 'PASILLO · PISO 4', piso: 4, tema: 'baldosa', puerta: '#9c6b3f',
    colores: { suelo: '#dcdde3', suelo2: '#d2d4db', linea: '#bfc2cc', pared: '#e6e2f0' },
    ascensor: { x: 6, y: 2, dir: 'down' },
    tiles: [
      '##################',
      '####EEbEE###N##=##',
      '#P..............P#',
      '#................#',
      '#...SS......SS...#',
      '#................#',
      '#P......w.......P#',
      '##################',
    ],
    npcs: [],
    warps: [{ x: 15, y: 1, a: 'oficina4', ax: 10, ay: 13, dir: 'up' }],
  },

  oficina4: {
    nombre: 'OFICINA · PISO 4', piso: 4, tema: 'alfombra',
    tiles: [
      '########################',
      '#LLL#WWWWWWWWWWWW#VVV###',
      '#...Y.DDDD..DDDD.......#',
      '#TT.Y..................#',
      '#TT....................#',
      '#...Y..UUUU..UUUU...dd.#',
      '#YYYY..DDDD..DDDD...dd.#',
      '#......................#',
      '#P.....UUUU..UUUU.....P#',
      '#......DDDD..DDDD......#',
      '#......................#',
      '#kKk.........SSS.....Fw#',
      '#......................#',
      '#B..........$.........P#',
      '##########=#############',
    ],
    npcs: [
      { id: 'haru', x: 3, y: 3, dir: 'left', gira: true },
      { id: 'emilio', x: 7, y: 3, dir: 'up' },
      { id: 'leo', x: 13, y: 3, dir: 'up' },
      { id: 'anderson', x: 9, y: 4, dir: 'down' },
      { id: 'gerardo', x: 21, y: 4, dir: 'down' },
      { id: 'vania', x: 8, y: 7, dir: 'down' },
      { id: 'miguel', x: 15, y: 7, dir: 'up' },
      { id: 'yadira', x: 8, y: 10, dir: 'up' },
    ],
    warps: [{ x: 10, y: 14, a: 'pasillo4', ax: 15, ay: 2, dir: 'down' }],
    objetos: [
      { x: 1, y: 1, texto: ['En la pizarra dice: "¡TE VAMOS A EXTRAÑAR, {nombre}!" ♥'] },
      { x: 2, y: 1, texto: ['En la pizarra dice: "¡TE VAMOS A EXTRAÑAR, {nombre}!" ♥'] },
      { x: 3, y: 1, texto: ['En la pizarra dice: "¡TE VAMOS A EXTRAÑAR, {nombre}!" ♥'] },
    ],
  },

  // ------------------------------------------------------------ PISO 1
  lobby: {
    nombre: 'LOBBY · PISO 1', piso: 1, tema: 'marmol',
    ascensor: { x: 9, y: 2, dir: 'down' },
    tiles: [
      '####################',
      '#WW#N##EEbEE###WW###',
      '#P................P#',
      '#..................#',
      '#..RRRR............#',
      '#..................#',
      '#.......rrrr.......#',
      '#SS.....rrrr.....SS#',
      '#..................#',
      '#P................P#',
      '########GG##########',
    ],
    npcs: [{ id: 'vigilante', x: 4, y: 3, dir: 'down', gira: true }],
    warps: [
      { x: 8, y: 10, a: 'salida', ax: 9, ay: 4, dir: 'down', requiereTodos: true },
      { x: 9, y: 10, a: 'salida', ax: 9, ay: 4, dir: 'down', requiereTodos: true },
    ],
  },

  salida: {
    nombre: 'SALIDA DEL EDIFICIO', piso: 0, tema: 'calle', atardecer: true, alEntrar: 'final',
    tiles: [
      'qqqqqqqqqqqqqqqqqqqq',
      'qoqoqoqoqoqoqoqoqoqo',
      'qoqoqoqoqoqoqoqoqoqo',
      'qqqqqqqqGGqqqqqqqqqq',
      'tsssssssssssssssssst',
      'ssssssssssssssssssss',
      'ssssssssssssssssssss',
      'fssssssssssssssssssf',
      'aaaaaaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaaaaaaaa',
      'ssssssssssssssssssss',
    ],
    npcs: [],
    warps: [],
    // dónde aparecen los compañeros en la escena final
    despedida: [
      [3, 6], [5, 6], [7, 6], [9, 6], [11, 6], [13, 6], [15, 6],
      [4, 7], [6, 7], [8, 7], [10, 7], [12, 7], [14, 7],
    ],
  },
};
