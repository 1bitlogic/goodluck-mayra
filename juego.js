// =====================================================================
//  GOODLUCK MAYRA — motor del juego
//  Canvas 2D sin dependencias. El mundo se dibuja a 240x176 y se escala
//  con un factor entero (píxeles nítidos); la interfaz usa un espacio
//  virtual de 960x704 para que el texto se vea fino.
// =====================================================================
(() => {
  'use strict';

  // ------------------------------------------------------------ constantes
  const T = 16, VW = 15, VH = 11, W = VW * T, H = VH * T;
  const UW = W * 4, UH = H * 4;
  const STEP = 1 / 60;
  const FONT = '"Jersey 10", "Courier New", monospace';
  const FK = 1.3; // la fuente es compacta: se escalan todos los tamaños
  const fuente = (px) => `${Math.round(px * FK)}px ${FONT}`;
  const SW = 16, SH = 23;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPUESTO = { up: 'down', down: 'up', left: 'right', right: 'left' };

  const CFG = window.CONFIG, MAPAS = window.MAPAS, PISOS = window.PISOS;
  const PJS = window.PERSONAJES;
  const PJ = Object.fromEntries(PJS.map((p) => [p.id, p]));
  const COLEGAS = PJS.filter((p) => !p.extra);
  const TOTAL = COLEGAS.length;
  const YO = CFG.protagonista;
  const fill = (s) => String(s)
    .replace(/\{nombre\}/g, YO.nombre).replace(/\{empresa\}/g, CFG.empresa).replace(/\{total\}/g, TOTAL);

  // ------------------------------------------------------------ canvas
  const canvas = document.getElementById('juego');
  const ctx = canvas.getContext('2d');
  const view = document.createElement('canvas');
  view.width = W; view.height = H;
  const vctx = view.getContext('2d');
  let K = 4;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const touch = document.body.classList.contains('tactil');
    const availH = innerHeight * (touch ? 0.62 : 1);
    K = Math.max(1, Math.floor(Math.min((innerWidth * dpr) / W, (availH * dpr) / H)));
    canvas.width = W * K; canvas.height = H * K;
    canvas.style.width = (W * K) / dpr + 'px';
    canvas.style.height = (H * K) / dpr + 'px';
  }

  // ------------------------------------------------------------ utilidades
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let c = [n >> 16, (n >> 8) & 255, n & 255];
    c = f < 1 ? c.map((v) => v * f) : c.map((v) => v + (255 - v) * (f - 1));
    return '#' + c.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  }
  function hash(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function newCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  // ------------------------------------------------------------ sprites
  // Cada personaje se construye píxel a píxel en una cuadrícula 16x23,
  // luego se le agrega un contorno oscuro (estilo Pokémon GBA).
  function buildSprite(look, dir, frame) {
    const g = Array.from({ length: SH }, () => Array(SW).fill(null));
    const R = (x, y, w, h, c) => {
      for (let j = y + 1; j < y + 1 + h; j++)
        for (let i = x; i < x + w; i++)
          if (j >= 0 && j < SH && i >= 0 && i < SW) g[j][i] = c;
    };
    const piel = look.piel || '#f1c27d', pielD = shade(piel, 0.84);
    const pelo = look.pelo || '#3b2a20', peloL = shade(pelo, 1.25);
    const ropa = look.ropa || '#4a7bd1', ropaD = shade(ropa, 0.78);
    const pant = look.pantalon || '#33415c', zap = look.zapatos || '#2a2a2e';
    const ojo = '#2a2433', marco = '#262233', rubor = '#f2a0a0';
    const st = look.peinado || 'corto';
    const lado = dir === 'left' || dir === 'right';
    const cuello = look.cuello;

    // piernas
    if (!lado) {
      const l = frame === 1 ? 2 : 3, r = frame === 2 ? 2 : 3;
      R(5, 16, 2, l, pant); R(5, 16 + l, 2, 1, zap);
      R(9, 16, 2, r, pant); R(9, 16 + r, 2, 1, zap);
    } else if (frame === 0) {
      R(6, 16, 4, 3, pant); R(6, 19, 4, 1, zap);
    } else {
      const a = frame === 1 ? 4 : 9, b = frame === 1 ? 9 : 4;
      R(a, 16, 3, 3, pant); R(a, 19, 3, 1, zap);
      R(b, 16, 3, 2, pant); R(b, 18, 3, 1, zap);
    }

    // torso y brazos
    if (!lado) {
      R(4, 11, 8, 5, ropa); R(4, 15, 8, 1, ropaD);
      const sl = frame === 1 ? -1 : 0, sr = frame === 2 ? -1 : 0;
      R(3, 11, 1, 4 + sl, ropaD); R(3, 15 + sl, 1, 1, piel);
      R(12, 11, 1, 4 + sr, ropaD); R(12, 15 + sr, 1, 1, piel);
      if (dir === 'down') {
        if (cuello) { R(5, 11, 2, 1, cuello); R(9, 11, 2, 1, cuello); R(7, 11, 2, 1, piel); }
        else R(7, 11, 2, 1, piel);
      } else if (cuello) R(5, 11, 6, 1, cuello);
    } else {
      R(5, 11, 6, 5, ropa); R(5, 15, 6, 1, ropaD);
      R(7, 11, 2, 4, ropaD); R(7, 15, 2, 1, piel);
      if (cuello) R(6, 11, 4, 1, cuello);
    }

    // cabeza
    if (dir === 'down') {
      if (st === 'largo') { R(2, 4, 2, 9, pelo); R(12, 4, 2, 9, pelo); }
      if (st === 'melena') { R(2, 4, 2, 7, pelo); R(12, 4, 2, 7, pelo); }
      if (st === 'rizado') { R(1, 4, 3, 8, pelo); R(12, 4, 3, 8, pelo); }
      R(3, 4, 10, 7, piel);
      if (st === 'calvo') {
        R(4, 1, 8, 1, piel); R(3, 2, 10, 2, piel); R(3, 4, 1, 3, pelo); R(12, 4, 1, 3, pelo);
      } else {
        R(4, 1, 8, 1, pelo); R(3, 2, 10, 2, pelo); R(3, 4, 10, 1, pelo);
        R(3, 5, 2, 1, pelo); R(11, 5, 2, 1, pelo); R(3, 6, 1, 1, pelo); R(12, 6, 1, 1, pelo);
        R(5, 2, 3, 1, peloL);
      }
      if (st === 'puntas') { R(4, 0, 1, 1, pelo); R(7, 0, 2, 1, pelo); R(11, 0, 1, 1, pelo); }
      if (st === 'moño') { R(6, -1, 4, 2, pelo); R(7, -1, 2, 1, peloL); }
      if (st === 'rizado') { R(2, 1, 1, 2, pelo); R(13, 1, 1, 2, pelo); R(5, 0, 2, 1, pelo); R(9, 0, 2, 1, pelo); }
      R(5, 7, 1, 2, ojo); R(10, 7, 1, 2, ojo);
      R(7, 9, 2, 1, pielD);
      if (look.rubor) { R(4, 9, 1, 1, rubor); R(11, 9, 1, 1, rubor); }
      if (look.lentes) { R(4, 6, 3, 1, marco); R(9, 6, 3, 1, marco); R(7, 7, 2, 1, marco); }
      if (look.barba) { R(3, 8, 1, 3, pelo); R(12, 8, 1, 3, pelo); R(4, 10, 8, 1, pelo); R(6, 9, 4, 1, pelo); }
    } else if (dir === 'up') {
      R(2, 6, 1, 2, piel); R(13, 6, 1, 2, piel);
      R(4, 1, 8, 1, pelo); R(3, 2, 10, 9, pelo); R(5, 2, 4, 1, peloL);
      if (st === 'calvo') { R(4, 1, 8, 1, piel); R(3, 2, 10, 4, piel); }
      if (st === 'largo') { R(2, 3, 12, 11, pelo); }
      if (st === 'melena') { R(2, 3, 12, 8, pelo); }
      if (st === 'rizado') { R(1, 3, 14, 9, pelo); R(2, 1, 12, 2, pelo); }
      if (st === 'cola') { R(6, 10, 4, 4, pelo); R(7, 14, 2, 1, pelo); R(6, 9, 4, 1, '#c94f6d'); }
      if (st === 'moño') { R(6, -1, 4, 2, pelo); }
      if (st === 'puntas') { R(4, 0, 1, 1, pelo); R(7, 0, 2, 1, pelo); R(11, 0, 1, 1, pelo); }
    } else {
      // perfil mirando a la izquierda (la derecha se espeja al final)
      if (st === 'largo') R(9, 4, 4, 10, pelo);
      if (st === 'melena') R(9, 4, 4, 7, pelo);
      if (st === 'rizado') R(8, 3, 6, 9, pelo);
      R(3, 4, 9, 7, piel); R(2, 7, 1, 2, piel);
      if (st === 'calvo') {
        R(4, 1, 8, 1, piel); R(3, 2, 10, 2, piel); R(9, 5, 3, 3, pelo);
      } else {
        R(4, 1, 8, 1, pelo); R(3, 2, 10, 2, pelo); R(3, 4, 4, 1, pelo);
        R(7, 4, 6, 4, pelo); R(9, 8, 3, 2, pelo); R(5, 2, 3, 1, peloL);
      }
      R(8, 6, 1, 2, pielD);
      if (st === 'cola') { R(12, 5, 2, 5, pelo); R(13, 10, 1, 1, pelo); R(12, 5, 1, 1, '#c94f6d'); }
      if (st === 'moño') { R(9, -1, 4, 2, pelo); }
      if (st === 'puntas') { R(5, 0, 1, 1, pelo); R(8, 0, 1, 1, pelo); R(11, 0, 1, 1, pelo); }
      R(4, 7, 1, 2, ojo);
      R(3, 9, 2, 1, pielD);
      if (look.rubor) R(5, 9, 1, 1, rubor);
      if (look.lentes) { R(3, 6, 3, 1, marco); R(5, 7, 3, 1, marco); }
      if (look.barba) { R(3, 10, 6, 1, pelo); R(8, 8, 1, 3, pelo); R(3, 9, 3, 1, pelo); }
    }

    if (dir === 'right') g.forEach((row) => row.reverse());

    // contorno
    const lleno = g.map((row) => row.map((c) => c !== null));
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++) {
        if (lleno[y][x]) continue;
        if ((lleno[y - 1] && lleno[y - 1][x]) || (lleno[y + 1] && lleno[y + 1][x]) || lleno[y][x - 1] || lleno[y][x + 1])
          g[y][x] = '#1d1b29';
      }

    const c = newCanvas(SW, SH), cx = c.getContext('2d');
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++)
        if (g[y][x]) { cx.fillStyle = g[y][x]; cx.fillRect(x, y, 1, 1); }
    return c;
  }

  function buildSprites(look) {
    const s = {};
    for (const d of Object.keys(DIRS)) s[d] = [0, 1, 2].map((f) => buildSprite(look, d, f));
    return s;
  }

  // retrato: cabeza y hombros del sprite (16x16)
  function spriteRetrato(sprites) {
    const c = newCanvas(16, 16);
    c.getContext('2d').drawImage(sprites.down[0], 0, 0, 16, 16, 0, 0, 16, 16);
    return c;
  }

  function iconoRegalo() {
    const c = newCanvas(16, 16), g = c.getContext('2d');
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    R(2, 6, 12, 9, '#1d1b29'); R(3, 7, 10, 7, '#e63946'); R(3, 7, 10, 1, '#ff6b78');
    R(1, 4, 14, 3, '#1d1b29'); R(2, 5, 12, 1, '#f25c69');
    R(7, 4, 2, 11, '#ffd166'); R(4, 1, 3, 3, '#ffd166'); R(9, 1, 3, 3, '#ffd166'); R(5, 2, 1, 1, '#e63946'); R(10, 2, 1, 1, '#e63946');
    return c;
  }

  // ------------------------------------------------------------ baldosas
  const WALL = new Set(['#', 'W', 'L', 'N', 'E', 'b', 'V', 'Z', 'C']);
  const WALKABLE = new Set(['.', '=', 'r', 'G', 's', 'g']);
  const DESK = new Set(['D', 'U', 'd', 'M']);
  const TEMAS = {
    alfombra: { suelo: '#a9b4c9', suelo2: '#a1acc2', linea: '#939fb6', pared: '#eceae4', zocalo: '#8d8a84', techo: '#3d4252' },
    madera: { suelo: '#dcb684', suelo2: '#d4ad79', linea: '#c39a66', pared: '#f2f1ec', zocalo: '#b9b4a8', techo: '#43454f' },
    baldosa: { suelo: '#e4ddcb', suelo2: '#dcd4bf', linea: '#c9bfa6', pared: '#dfe6eb', zocalo: '#76818b', techo: '#3a4350' },
    marmol: { suelo: '#efede7', suelo2: '#e4e0d6', linea: '#d3cec2', pared: '#e8e0d0', zocalo: '#5c5248', techo: '#3b342e' },
    calle: { suelo: '#d4cfc4', suelo2: '#cbc5b9', linea: '#c0baad', pared: '#c9b79c', zocalo: '#7e6e5b', techo: '#3b342e' },
  };
  const tileAt = (m, x, y) => (y < 0 || y >= m.h || x < 0 || x >= m.w ? null : m.tiles[y][x]);

  // mini fuente 3x5 para el letrero de piso
  const GLIFOS = {
    P: ['111', '101', '111', '100', '100'], 1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'], 4: ['101', '101', '111', '001', '001'],
  };

  function drawTile(g, m, tx, ty) {
    const c = m.tiles[ty][tx], X = tx * T, Y = ty * T, th = m.th;
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(X + x, Y + y, w, h); };
    const up = tileAt(m, tx, ty - 1), dn = tileAt(m, tx, ty + 1);
    const lf = tileAt(m, tx - 1, ty), rt = tileAt(m, tx + 1, ty);
    const rnd = (s) => hash(tx, ty, s);

    const suelo = () => {
      R(0, 0, 16, 16, th.suelo);
      if (m.tema === 'madera') {
        for (let i = 0; i < 4; i++) {
          R(0, i * 4 + 3, 16, 1, th.linea);
          R(Math.floor(rnd(i) * 14) + 1, i * 4, 1, 3, th.linea);
          if (rnd(i + 9) > 0.6) R(0, i * 4, 16, 3, th.suelo2);
        }
      } else if (m.tema === 'alfombra') {
        if ((tx + ty) % 2) R(0, 0, 16, 16, th.suelo2);
        for (let i = 0; i < 4; i++) R(Math.floor(rnd(i) * 16), Math.floor(rnd(i + 5) * 16), 1, 1, th.linea);
      } else if (m.tema === 'marmol') {
        if ((tx + ty) % 2) R(0, 0, 16, 16, th.suelo2);
        R(0, 15, 16, 1, th.linea); R(15, 0, 1, 16, th.linea);
        if (rnd(1) > 0.6) for (let i = 0; i < 5; i++) R(3 + i * 2, 4 + i, 2, 1, '#fbfaf7');
      } else {
        R(0, 0, 16, 1, shade(th.suelo, 1.15)); R(0, 15, 16, 1, th.linea); R(15, 0, 1, 16, th.linea);
        R(7, 0, 1, 16, th.suelo2); R(0, 7, 16, 1, th.suelo2);
      }
    };
    const cara = () => {
      R(0, 0, 16, 16, th.pared); R(0, 0, 16, 1, shade(th.pared, 0.86));
      R(0, 13, 16, 3, th.zocalo); R(0, 13, 16, 1, shade(th.zocalo, 1.25));
    };
    const sombra = (y = 15) => R(0, y, 16, 1, 'rgba(0,0,0,0.18)');

    switch (c) {
      case '#': {
        if (dn && !WALL.has(dn) && dn !== '=') cara();
        else {
          R(0, 0, 16, 16, th.techo);
          if (dn && dn !== '#') R(0, 15, 16, 1, shade(th.techo, 1.4));
        }
        break;
      }
      case 'W':
        cara();
        R(1, 1, 14, 11, '#6b7887');
        R(2, 2, 12, 9, '#a6d6f2'); R(2, 2, 12, 3, '#c6e6f8');
        if (m.persianas) {
          R(2, 2, 12, 6, '#f4f3ee');
          for (let i = 0; i < 3; i++) R(2, 3 + i * 2, 12, 1, '#e3e1d9');
          R(2, 8, 12, 1, '#cfccc2'); R(7, 8, 2, 1, '#9a978e');
        } else {
          R(7, 2, 2, 9, '#6b7887');
          R(3, 8, 1, 1, '#fff'); R(4, 7, 1, 1, '#fff'); R(5, 6, 1, 1, '#fff'); R(10, 8, 1, 1, '#fff'); R(11, 7, 1, 1, '#fff');
        }
        R(0, 12, 16, 1, '#d6d2c7');
        break;
      case 'L': {
        cara();
        R(0, 2, 16, 10, '#8a939c'); R(0, 3, 16, 8, '#fbfbfb');
        if (lf !== 'L') R(0, 2, 1, 10, '#8a939c');
        if (rt !== 'L') R(15, 2, 1, 10, '#8a939c');
        const cols = ['#2e6fd8', '#d84a4a', '#2fa35a'];
        for (let i = 0; i < 3; i++) R(2 + Math.floor(rnd(i) * 3), 4 + i * 2, 5 + Math.floor(rnd(i + 3) * 6), 1, cols[(i + tx) % 3]);
        R(1, 11, 14, 1, '#5d646c');
        break;
      }
      case 'N': {
        cara();
        R(3, 2, 10, 8, '#2d3a4a'); R(3, 2, 10, 1, '#41536a');
        const txt = 'P' + m.piso;
        for (let k = 0; k < txt.length; k++) {
          const gl = GLIFOS[txt[k]];
          if (!gl) continue;
          gl.forEach((row, j) => [...row].forEach((b, i) => { if (b === '1') R(5 + k * 4 + i, 3 + j, 1, 1, '#ffd166'); }));
        }
        break;
      }
      case 'E':
        cara();
        R(0, 0, 16, 14, '#6f7782');
        R(0, 2, 16, 12, '#b4bcc6');
        for (let i = 0; i < 4; i++) R(0, 4 + i * 3, 16, 1, '#c3cad3');
        if (lf !== 'E') R(0, 0, 2, 14, '#6f7782');
        if (rt !== 'E') R(14, 0, 2, 14, '#6f7782');
        if (rt === 'E') { R(15, 2, 1, 12, '#59616b'); R(12, 0, 4, 1, '#ffb347'); }
        if (lf === 'E') { R(0, 2, 1, 12, '#dde3ea'); R(0, 0, 4, 1, '#ffb347'); }
        R(0, 14, 16, 2, '#8a929c');
        break;
      case 'b':
        cara();
        R(5, 3, 6, 8, '#7f8791'); R(6, 4, 4, 6, '#9aa2ac');
        R(7, 5, 2, 2, '#ffd166'); R(7, 8, 2, 1, '#ffd166');
        break;
      case 'V':
        cara();
        R(0, 2, 16, 10, '#16181d'); R(0, 3, 16, 8, '#262a33');
        if (lf !== 'V') R(0, 2, 1, 10, '#16181d');
        R(2 + Math.floor(rnd(1) * 8), 4, 3, 1, '#3a4150');
        if (rt === 'V' && lf !== 'V') R(1, 0, 15, 1, '#d9dcdf');
        else if (lf === 'V') R(0, 0, rt === 'V' ? 16 : 15, 1, '#d9dcdf');
        break;
      case 'Z':
        cara();
        R(0, 1, 16, 12, '#b98a55'); R(1, 2, 14, 10, '#c99a63');
        if (rt === 'Z') R(15, 1, 1, 12, '#8a6236');
        R(lf === 'Z' ? 2 : 13, 6, 1, 3, '#6f4e2b');
        R(0, 13, 16, 3, th.zocalo);
        break;
      case 'C':
        cara();
        R(0, 0, 16, 8, '#c99a63'); R(0, 7, 16, 1, '#8a6236');
        R(7, 0, 1, 7, '#a77b49'); R(5, 3, 1, 2, '#6f4e2b'); R(9, 3, 1, 2, '#6f4e2b');
        break;
      case '=': {
        const enPared = up && WALL.has(up);
        if (enPared) {
          cara();
          const col = m.puerta || '#9c6b3f';
          R(2, 0, 12, 16, shade(col, 0.6)); R(3, 1, 10, 15, col);
          R(4, 2, 8, 5, shade(col, 1.12)); R(4, 9, 8, 6, shade(col, 1.12)); R(11, 8, 1, 2, '#e8d27a');
        } else {
          suelo();
          R(2, 3, 12, 10, '#5b4a6b'); R(3, 4, 10, 8, '#6e5c80');
          R(0, 14, 16, 2, '#3a3f4a');
        }
        break;
      }
      case 'D': case 'U': case 'd': case 'M': {
        suelo();
        const top = '#e6c899', borde = '#c9a46e', frente = '#8f6b42';
        const conFrente = !DESK.has(dn), conTope = !DESK.has(up);
        const y0 = conTope ? 3 : 0, y1 = conFrente ? 12 : 16;
        R(0, y0, 16, y1 - y0, top);
        if (conTope) R(0, y0, 16, 1, '#f3dcb5');
        if (!DESK.has(lf)) R(0, y0, 1, y1 - y0, borde);
        if (!DESK.has(rt)) R(15, y0, 1, y1 - y0, borde);
        if (rt === c && c !== 'M') R(15, y0, 1, y1 - y0, '#d8b885');
        if (conFrente) { R(0, 12, 16, 3, frente); R(0, 12, 16, 1, shade(frente, 1.2)); sombra(); }
        if (c === 'D') {
          R(7, y0 + 6, 2, 2, '#30333a');
          R(3, y0 - 2, 10, 8, '#1d2027'); R(4, y0 - 1, 8, 6, rnd(2) > 0.5 ? '#3d6f99' : '#2f5d55');
          R(5, y0, 4, 1, '#8fc0e0'); R(5, y0 + 2, 5, 1, '#78a7c4');
          R(4, y0 + 8, 8, 1, '#3b3e46');
        } else if (c === 'U') {
          R(3, y1 - 7, 10, 6, '#2a2d35'); R(4, y1 - 6, 8, 4, '#363a44'); R(7, y1 - 1, 2, 1, '#30333a');
          R(4, y0 + 2, 8, 1, '#3b3e46');
        } else if (c === 'M') {
          R(4, y0 + 1, 8, 5, '#2b2e36'); R(5, y0 + 2, 6, 3, '#7fbf7a');
          for (let i = 0; i < 3; i++) R(5 + i * 2, y0 + 2 + (i % 2), 1, 1, '#e05a5a');
          R(3, y0 + 6, 10, 3, '#3a3d45'); R(4, y0 + 7, 8, 1, '#565a64');
          R(13, y0 + 1, 2, 2, '#ff9ec7');
        }
        if (c !== 'M') {
          const r = rnd(4);
          if (r < 0.25) { R(12, y0 + 5, 2, 2, '#e76f51'); R(12, y0 + 5, 2, 1, '#f4a68f'); }
          else if (r < 0.45) R(1, y0 + 5, 3, 3, '#fafafa');
          else if (r < 0.55) { R(13, y0 + 4, 2, 3, '#e8f4fb'); R(13, y0 + 4, 2, 1, '#2f80ed'); }
        }
        break;
      }
      case 'T': {
        suelo();
        const conFrente = dn !== 'T', conTope = up !== 'T';
        const y0 = conTope ? 3 : 0, y1 = conFrente ? 12 : 16;
        R(0, y0, 16, y1 - y0, '#7a5136');
        if (conTope) R(0, y0, 16, 1, '#946446');
        if (lf !== 'T') R(0, y0, 1, y1 - y0, '#5e3b25');
        if (rt !== 'T') R(15, y0, 1, y1 - y0, '#5e3b25');
        if (conFrente) { R(0, 12, 16, 3, '#5e3b25'); sombra(); }
        if (rnd(3) < 0.35) { R(5, y0 + 2, 6, 4, '#c0c4cc'); R(6, y0 + 3, 4, 2, '#7fb7e0'); }
        break;
      }
      case 'c':
        suelo();
        R(5, 3, 6, 4, '#2b2e36'); R(4, 7, 8, 5, '#3b3f4a'); R(5, 12, 1, 2, '#222'); R(10, 12, 1, 2, '#222');
        break;
      case 'P':
        suelo();
        R(4, 10, 8, 5, '#b5651d'); R(3, 10, 10, 2, '#c97a35'); R(4, 15, 8, 1, 'rgba(0,0,0,.2)');
        [[6, 1, 4, 3], [3, 3, 5, 4], [8, 3, 5, 4], [4, 6, 8, 4], [2, 6, 3, 3], [11, 6, 3, 3]].forEach(([x, y, w, h]) => R(x, y, w, h, '#3c9a4c'));
        R(6, 2, 2, 1, '#62c172'); R(4, 4, 2, 1, '#62c172'); R(10, 4, 2, 1, '#62c172'); R(5, 8, 6, 1, '#2b7a3a');
        break;
      case 'B': {
        suelo();
        R(1, 0, 14, 15, '#7b5233'); R(2, 1, 12, 13, '#5c3c24');
        R(2, 5, 12, 1, '#7b5233'); R(2, 10, 12, 1, '#7b5233');
        const libros = ['#e63946', '#2a9d8f', '#e9c46a', '#457b9d', '#f4a261', '#8d99ae'];
        [[1, 4], [6, 4], [11, 3]].forEach(([y, h], s) => {
          for (let x = 2; x < 14; x += 2) if (rnd(x + s * 20) > 0.2) R(x, y + (rnd(x + s) > 0.5 ? 0 : 1), 2, h - (rnd(x + s) > 0.5 ? 0 : 1), libros[Math.floor(rnd(x * 3 + s) * 6)]);
        });
        sombra();
        break;
      }
      case 'l':
        suelo();
        R(0, 0, 16, 15, '#c9a878'); R(0, 0, 16, 1, '#a88a5e');
        R(0, 7, 16, 1, '#a88a5e'); R(lf === 'l' ? 0 : 0, 0, 1, 15, '#a88a5e'); R(15, 0, 1, 15, '#e3cfa8');
        R(7, 0, 1, 15, '#a88a5e');
        R(5, 3, 1, 2, '#e3e3e3'); R(13, 3, 1, 2, '#e3e3e3'); R(5, 10, 1, 2, '#e3e3e3'); R(13, 10, 1, 2, '#e3e3e3');
        sombra();
        break;
      case 'K':
        suelo();
        R(0, 6, 16, 9, '#c4ccd4'); R(0, 6, 16, 2, '#e3e8ec'); sombra();
        R(4, 0, 8, 9, '#2f2f33'); R(5, 1, 6, 2, '#55555c'); R(10, 1, 1, 1, '#ff4d4d');
        R(7, 4, 2, 1, '#888'); R(6, 6, 4, 2, '#fff');
        break;
      case 'k':
        suelo();
        R(0, 6, 16, 9, '#c4ccd4'); R(0, 6, 16, 2, '#e3e8ec'); sombra();
        R(3, 8, 10, 4, '#9aa5b0'); R(4, 9, 8, 2, '#7f8a95'); R(7, 5, 2, 4, '#c0c0c0');
        break;
      case 'F':
        suelo();
        R(2, 0, 12, 15, '#dfe6ec'); R(2, 0, 12, 1, '#f5f8fa'); R(2, 6, 12, 1, '#b9c3cc');
        R(11, 2, 1, 3, '#8a96a2'); R(11, 8, 1, 4, '#8a96a2'); R(4, 9, 2, 2, '#e76f51'); sombra();
        break;
      case 'w':
        suelo();
        R(5, 8, 6, 7, '#e1e8ee'); R(5, 8, 6, 1, '#f5f8fa');
        R(5, 1, 6, 7, '#8fd0f2'); R(6, 2, 2, 5, '#c4e8fa'); R(7, 0, 2, 1, '#3a7bd5');
        R(6, 10, 1, 1, '#3a7bd5'); R(9, 10, 1, 1, '#e63946');
        break;
      case 'u':
        suelo();
        R(5, 6, 6, 9, '#b8bec5'); R(5, 6, 6, 2, '#d8dde2'); R(6, 9, 4, 1, '#9aa1a9');
        break;
      case 'X':
        suelo();
        R(1, 6, 14, 8, '#d5d7da'); R(1, 6, 14, 2, '#eceef0'); R(3, 3, 10, 3, '#ffffff');
        R(3, 10, 10, 2, '#9aa0a6'); R(12, 8, 1, 1, '#2ecc71'); sombra();
        break;
      case 'S': {
        suelo();
        const col = m.sofa || '#3f6fa6', dk = shade(col, 0.75);
        R(0, 3, 16, 5, dk); R(0, 7, 16, 6, col); R(0, 12, 16, 2, dk);
        if (lf !== 'S') R(0, 4, 3, 10, dk);
        if (rt !== 'S') R(13, 4, 3, 10, dk);
        if (rt === 'S') R(15, 8, 1, 4, dk);
        sombra(14);
        break;
      }
      case 'R':
        suelo();
        R(0, 2, 16, 6, '#e9dcc6'); R(0, 2, 16, 1, '#f6eddc');
        R(0, 8, 16, 7, '#6b4c35'); R(0, 8, 16, 1, '#8b6a4f'); sombra();
        if (rnd(1) > 0.5) { R(5, 3, 6, 4, '#2b2e36'); R(6, 4, 4, 2, '#7fb7e0'); }
        break;
      case '$':
        suelo();
        R(2, 2, 12, 13, '#f7f8f8'); R(2, 2, 12, 2, '#e3e6e8'); R(2, 14, 12, 1, '#c9ced2');
        R(4, 7, 3, 4, '#1aa37a'); R(5, 6, 3, 2, '#2c5aa0'); R(8, 8, 4, 1, '#2c5aa0'); R(8, 10, 3, 1, '#1aa37a');
        sombra();
        break;
      case 'r':
        suelo();
        R(0, 0, 16, 16, '#9e3b45');
        if (up !== 'r') R(0, 0, 16, 2, '#e0c27a');
        if (dn !== 'r') R(0, 14, 16, 2, '#e0c27a');
        if (lf !== 'r') R(0, 0, 2, 16, '#e0c27a');
        if (rt !== 'r') R(14, 0, 2, 16, '#e0c27a');
        if ((tx + ty) % 2) R(7, 7, 2, 2, '#c45563');
        break;
      case 'Y':
        suelo();
        R(0, 0, 16, 16, 'rgba(170,215,235,0.55)');
        if (up !== 'Y') R(0, 0, 16, 1, '#7d8a96');
        if (dn !== 'Y') { R(0, 12, 16, 4, 'rgba(120,140,155,.55)'); R(0, 15, 16, 1, '#7d8a96'); }
        if (lf !== 'Y') R(0, 0, 1, 16, '#7d8a96');
        if (rt !== 'Y') R(15, 0, 1, 16, '#7d8a96');
        R(4, 4, 1, 1, '#fff'); R(5, 3, 1, 1, '#fff'); R(10, 9, 1, 1, '#fff');
        break;
      // ---- exterior
      case 'q':
        R(0, 0, 16, 16, '#c2ae92');
        for (let i = 0; i < 4; i++) { R(0, i * 4 + 3, 16, 1, '#ab9679'); R((i % 2) * 8 + 3, i * 4, 1, 3, '#ab9679'); }
        if (dn && !['q', 'o', 'G'].includes(dn)) { R(0, 13, 16, 3, '#7e6e5b'); }
        break;
      case 'o':
        R(0, 0, 16, 16, '#c2ae92');
        R(2, 2, 12, 11, '#4f5d6b'); R(3, 3, 10, 9, '#8fc3e6'); R(3, 3, 10, 3, '#b6dcf2');
        R(4, 9, 1, 1, '#fff'); R(5, 8, 1, 1, '#fff'); R(1, 13, 14, 1, '#ece6da');
        break;
      case 'G':
        if (m.tema !== 'calle') suelo();
        R(0, 0, 16, 16, '#4f5d6b'); R(1, 1, 14, 15, '#9fd3ec'); R(1, 1, 14, 4, '#c3e6f6');
        R(lf === 'G' ? 2 : 12, 7, 2, 3, '#e5e5e5');
        if (rt === 'G') R(15, 0, 1, 16, '#4f5d6b');
        R(3, 11, 1, 1, '#fff'); R(4, 10, 1, 1, '#fff');
        break;
      case 's':
        R(0, 0, 16, 16, '#d4cfc4'); R(0, 0, 16, 1, '#c4beb2'); R(0, 0, 1, 16, '#c4beb2');
        R(0, 8, 16, 1, '#ccc6ba'); R(8, 0, 1, 16, '#ccc6ba');
        break;
      case 'a':
        R(0, 0, 16, 16, '#4b4d55');
        for (let i = 0; i < 5; i++) R(Math.floor(rnd(i) * 16), Math.floor(rnd(i + 7) * 16), 1, 1, '#5a5c65');
        if (up === 's') R(0, 0, 16, 3, '#9a958a');
        if (up === 'a' && dn === 'a' && tx % 2 === 0) R(2, 7, 12, 2, '#f2d16b');
        break;
      case 't':
        R(0, 0, 16, 16, '#d4cfc4');
        R(6, 10, 4, 6, '#7a4e2d');
        R(2, 1, 12, 10, '#2f8a3f'); R(1, 3, 14, 6, '#2f8a3f'); R(4, 2, 5, 3, '#4fb15e'); R(3, 7, 10, 2, '#25723a');
        break;
      case 'f':
        R(0, 0, 16, 16, '#d4cfc4');
        R(1, 8, 14, 7, '#8d6e52'); R(2, 8, 12, 2, '#5a3d2b');
        [[3, 5, '#ff7aa2'], [7, 4, '#ffd166'], [11, 5, '#f25c54'], [5, 7, '#ffffff'], [10, 7, '#c77dff']].forEach(([x, y, col]) => {
          R(x, y + 1, 1, 3, '#3c9a4c'); R(x - 1, y, 3, 2, col);
        });
        break;
      case 'g':
        R(0, 0, 16, 16, '#79c25b');
        R(3, 4, 1, 2, '#5ea946'); R(10, 9, 1, 2, '#5ea946'); R(6, 12, 1, 2, '#5ea946');
        break;
      default:
        suelo();
    }
  }

  function prepararMapa(id) {
    const m = MAPAS[id];
    m.id = id;
    m.h = m.tiles.length;
    m.w = Math.max(...m.tiles.map((r) => r.length));
    m.th = { ...TEMAS[m.tema || 'alfombra'], ...(m.colores || {}) };
    m.canvas = newCanvas(m.w * T, m.h * T);
    const g = m.canvas.getContext('2d');
    g.fillStyle = m.th.techo;
    g.fillRect(0, 0, m.w * T, m.h * T);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) drawTile(g, m, x, y);
  }

  // ------------------------------------------------------------ validación de mapas
  // Revisa en el arranque que todo sea consistente; los errores van a la consola.
  function validarMapas() {
    const errores = [];
    for (const [id, m] of Object.entries(MAPAS)) {
      m.tiles.forEach((r, y) => { if (r.length !== m.w) errores.push(`${id}: fila ${y} mide ${r.length}, se esperaba ${m.w}`); });
      const pisable = (x, y) => WALKABLE.has(tileAt(m, x, y));
      (m.npcs || []).forEach((n) => {
        if (!PJ[n.id]) errores.push(`${id}: personaje "${n.id}" no existe en mensajes.js`);
        if (!pisable(n.x, n.y)) errores.push(`${id}: ${n.id} está sobre una baldosa no pisable (${n.x},${n.y})`);
      });
      (m.warps || []).forEach((w) => {
        const d = MAPAS[w.a];
        if (!d) errores.push(`${id}: warp a mapa inexistente "${w.a}"`);
        else if (!WALKABLE.has(tileAt(d, w.ax, w.ay))) errores.push(`${id}: warp llega a baldosa no pisable en ${w.a} (${w.ax},${w.ay})`);
      });
    }
    const vistos = new Set(Object.values(MAPAS).flatMap((m) => (m.npcs || []).map((n) => n.id)));
    COLEGAS.forEach((p) => { if (!vistos.has(p.id)) errores.push(`"${p.id}" no está ubicado en ningún mapa`); });
    errores.forEach((e) => console.warn('[mapas]', e));
    window.__erroresMapas = errores;
  }

  // ------------------------------------------------------------ audio (WebAudio, se activa con la primera tecla)
  const NOTA = (n) => {
    if (n === 'R') return 0;
    const m = n.match(/^([A-G])(#?)(\d)$/);
    const i = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    return 440 * Math.pow(2, (12 * (+m[3] + 1) + i - 69) / 12);
  };
  const CANCIONES = {
    oficina: {
      bpm: 112,
      voces: [
        { onda: 'square', vol: 0.05, notas: 'C5:2 E5:2 G5:2 E5:2 F5:2 A5:2 G5:4 E5:2 D5:2 C5:2 D5:2 E5:6 R:2 A4:2 C5:2 F5:2 E5:2 D5:2 C5:2 D5:4 E5:2 G5:2 C6:2 B5:2 C6:6 R:2' },
        { onda: 'triangle', vol: 0.12, notas: 'C3:4 G2:4 F2:4 C3:4 A2:4 G2:4 C3:4 G2:4 F2:4 F2:4 G2:4 G2:4 C3:4 E3:4 C3:4 G2:4' },
      ],
    },
    final: {
      bpm: 84,
      voces: [
        { onda: 'triangle', vol: 0.14, notas: 'E5:4 D5:2 C5:2 D5:4 G4:4 C5:4 E5:2 G5:2 A5:8 G5:4 E5:2 C5:2 D5:4 A4:4 C5:12 R:4' },
        { onda: 'square', vol: 0.025, notas: 'C4:8 G3:8 A3:8 F3:8 C4:8 G3:8 F3:4 G3:4 C4:8' },
        { onda: 'triangle', vol: 0.1, notas: 'C3:8 G2:8 A2:8 F2:8 C3:8 G2:8 F2:4 G2:4 C3:8' },
      ],
    },
  };

  const audio = {
    ac: null, master: null, musica: null, mudo: false, cancion: null, eventos: [], cursor: 0, inicioLoop: 0, largo: 0, timer: null,
    init() {
      if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ac = new AC();
      this.master = this.ac.createGain(); this.master.gain.value = 0.6; this.master.connect(this.ac.destination);
      this.musica = this.ac.createGain(); this.musica.gain.value = 1; this.musica.connect(this.master);
      if (this.pendiente) this.tocar(this.pendiente);
    },
    tono(f, t0, dur, onda = 'square', vol = 0.1, dest = this.master, f2) {
      if (!this.ac || !f) return;
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = onda; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
      g.gain.setValueAtTime(vol, t0 + Math.max(0.01, dur - 0.04));
      g.gain.linearRampToValueAtTime(0, t0 + dur);
      o.connect(g); g.connect(dest);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },
    sfx(nombre) {
      if (!this.ac || this.mudo) return;
      const t = this.ac.currentTime;
      const S = {
        blip: () => this.tono(740, t, 0.03, 'square', 0.025),
        ok: () => { this.tono(988, t, 0.05, 'square', 0.05); this.tono(1319, t + 0.05, 0.07, 'square', 0.05); },
        choque: () => this.tono(140, t, 0.08, 'square', 0.06, this.master, 90),
        puerta: () => this.tono(520, t, 0.18, 'triangle', 0.12, this.master, 180),
        ding: () => { this.tono(1047, t, 0.5, 'sine', 0.18); this.tono(784, t + 0.18, 0.7, 'sine', 0.16); },
        pop: () => this.tono(500, t, 0.09, 'square', 0.05, this.master, 1200),
        regalo: () => {
          this.duck(1.6);
          ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => this.tono(NOTA(n), t + i * 0.09, 0.09, 'square', 0.07));
          this.tono(NOTA('E6'), t + 0.38, 0.12, 'square', 0.07); this.tono(NOTA('C6'), t + 0.52, 0.5, 'square', 0.07);
          this.tono(NOTA('C4'), t + 0.38, 0.65, 'triangle', 0.15);
        },
        fanfarria: () => {
          this.duck(2.6);
          const m = [['G4', 0.15], ['C5', 0.15], ['E5', 0.15], ['G5', 0.3], ['E5', 0.15], ['G5', 0.9]];
          let tt = t;
          m.forEach(([n, d]) => { this.tono(NOTA(n), tt, d, 'square', 0.07); this.tono(NOTA(n) / 2, tt, d, 'triangle', 0.12); tt += d; });
        },
      };
      if (S[nombre]) S[nombre]();
    },
    duck(seg) {
      if (!this.ac) return;
      const t = this.ac.currentTime, g = this.musica.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0.0001, t + 0.05); g.setValueAtTime(0.0001, t + seg); g.linearRampToValueAtTime(1, t + seg + 0.4);
    },
    tocar(nombre) {
      this.pendiente = nombre;
      if (!this.ac || this.cancion === nombre) return;
      this.cancion = nombre;
      const song = CANCIONES[nombre], ocho = 60 / song.bpm / 2;
      this.eventos = [];
      let largo = 0;
      song.voces.forEach((v) => {
        let pos = 0;
        v.notas.split(' ').forEach((tok) => {
          const [n, d] = tok.split(':');
          this.eventos.push({ t: pos * ocho, f: NOTA(n), d: d * ocho * 0.92, onda: v.onda, vol: v.vol });
          pos += +d;
        });
        largo = Math.max(largo, pos * ocho);
      });
      this.eventos.sort((a, b) => a.t - b.t);
      this.largo = largo; this.cursor = 0; this.inicioLoop = this.ac.currentTime + 0.1;
      // salida del bus anterior con fundido
      const viejo = this.bus;
      if (viejo) { viejo.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.3); setTimeout(() => viejo.disconnect(), 500); }
      this.bus = this.ac.createGain(); this.bus.gain.value = this.mudo ? 0 : 1; this.bus.connect(this.musica);
      clearInterval(this.timer);
      this.timer = setInterval(() => this.programar(), 50);
    },
    programar() {
      if (!this.ac || !this.eventos.length) return;
      const hasta = this.ac.currentTime + 0.25;
      for (;;) {
        const e = this.eventos[this.cursor];
        const t = this.inicioLoop + e.t;
        if (t > hasta) break;
        if (t >= this.ac.currentTime - 0.05) this.tono(e.f, t, e.d, e.onda, e.vol, this.bus);
        if (++this.cursor >= this.eventos.length) { this.cursor = 0; this.inicioLoop += this.largo; }
      }
    },
    alternarMudo() {
      this.mudo = !this.mudo;
      if (this.bus) this.bus.gain.value = this.mudo ? 0 : 1;
    },
  };

  // ------------------------------------------------------------ entrada
  const teclas = {}, pulsadas = {};
  const MAPA_TECLAS = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'a', Enter: 'a', Space: 'a', KeyX: 'b', Escape: 'b', Backspace: 'b', ShiftLeft: 'correr', ShiftRight: 'correr', KeyM: 'mudo',
  };
  function presionar(k) { if (!teclas[k]) pulsadas[k] = true; teclas[k] = true; audio.init(); }
  function soltar(k) { teclas[k] = false; }
  addEventListener('keydown', (e) => {
    const k = MAPA_TECLAS[e.code];
    if (!k) return;
    e.preventDefault();
    if (!e.repeat) presionar(k);
  });
  addEventListener('keyup', (e) => { const k = MAPA_TECLAS[e.code]; if (k) soltar(k); });
  addEventListener('blur', () => Object.keys(teclas).forEach(soltar));
  document.querySelectorAll('[data-k]').forEach((b) => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); presionar(k); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => soltar(k)));
  });
  canvas.addEventListener('pointerdown', () => { if (G.estado !== 'juego') presionar('a'), setTimeout(() => soltar('a'), 50); });
  const dirSostenida = () => ['up', 'down', 'left', 'right'].filter((d) => teclas[d]).pop();

  // ------------------------------------------------------------ estado
  const G = {
    estado: 'cargando', t: 0,
    mapa: null, npcs: [], jugador: null,
    visitados: new Set(), orden: [],
    dialogo: null, eleccion: null, registro: null,
    fade: 1, fadeAnim: null, fadeTexto: '',
    banner: { texto: '', t: 99 }, ocupado: false,
    particulas: [], celebrando: false, choqueT: 0,
    creditos: null, aviso: 0,
  };
  const yoSprites = buildSprites(YO.look);
  const yoRetrato = spriteRetrato(yoSprites);
  const regaloIcono = iconoRegalo();
  const sprites = {}, retratos = {};
  PJS.forEach((p) => { sprites[p.id] = buildSprites(p.look || {}); retratos[p.id] = spriteRetrato(sprites[p.id]); });

  function crearEntidad(x, y, dir, spr) {
    return { x, y, px: x * T, py: y * T, dir, spr, mov: false, fx: x, fy: y, t: 0, pasos: 0, salto: 0 };
  }

  function cargarMapa(id, x, y, dir) {
    const m = MAPAS[id];
    G.mapa = m;
    G.npcs = (m.npcs || []).map((n) => {
      const e = crearEntidad(n.x, n.y, n.dir || 'down', sprites[n.id]);
      Object.assign(e, { id: n.id, pj: PJ[n.id], dirBase: n.dir || 'down', gira: n.gira, giroT: 2 + Math.random() * 3, volverT: 0 });
      return e;
    });
    const j = G.jugador || crearEntidad(x, y, dir, yoSprites);
    Object.assign(j, { x, y, px: x * T, py: y * T, dir, mov: false });
    G.jugador = j;
    G.banner = { texto: m.nombre, t: 0 };
  }

  // ------------------------------------------------------------ movimiento
  function ocupado(x, y, excepto) {
    const m = G.mapa;
    if (!WALKABLE.has(tileAt(m, x, y))) return true;
    if (G.npcs.some((n) => n !== excepto && n.x === x && n.y === y)) return true;
    const j = G.jugador;
    return j !== excepto && j.x === x && j.y === y;
  }
  function iniciarPaso(e, dir) {
    e.dir = dir;
    const [dx, dy] = DIRS[dir];
    if (ocupado(e.x + dx, e.y + dy, e)) return false;
    e.fx = e.x; e.fy = e.y; e.x += dx; e.y += dy; e.t = 0; e.mov = true;
    return true;
  }
  function avanzar(e, dt, vel) {
    if (!e.mov) return false;
    e.t = Math.min(1, e.t + dt * vel);
    e.px = (e.fx + (e.x - e.fx) * e.t) * T;
    e.py = (e.fy + (e.y - e.fy) * e.t) * T;
    if (e.t >= 1) { e.mov = false; e.pasos++; return true; }
    return false;
  }
  function frameDe(e) {
    if (!e.mov) return 0;
    return e.t < 0.5 ? (e.pasos % 2 ? 1 : 2) : 0;
  }

  function actualizarJugador(dt, bloqueado) {
    const j = G.jugador;
    if (j.mov) {
      const corriendo = teclas.correr;
      if (avanzar(j, dt, corriendo ? 7.5 : 4.2)) alTerminarPaso();
      return;
    }
    if (bloqueado || G.ocupado || G.dialogo || G.eleccion || G.registro) return;
    if (pulsadas.a) return interactuar();
    if (pulsadas.b) return abrirRegistro();
    const d = dirSostenida();
    if (!d) { j.quieto = (j.quieto || 0) + dt; return; }
    if (d !== j.dir && j.quieto > 0.05 && !j.girando) { j.dir = d; j.girando = 0.1; return; }
    if (j.girando > 0) { j.girando -= dt; if (j.girando > 0) return; }
    j.girando = 0; j.quieto = 0;
    if (!iniciarPaso(j, d) && G.choqueT <= 0) { audio.sfx('choque'); G.choqueT = 0.3; }
  }

  function alTerminarPaso() {
    const j = G.jugador, m = G.mapa;
    const w = (m.warps || []).find((w) => w.x === j.x && w.y === j.y);
    if (w) ejecutar(() => usarWarp(w));
  }

  // ------------------------------------------------------------ guiones (async)
  async function ejecutar(fn) {
    if (G.ocupado) return;
    G.ocupado = true;
    try { await fn(); } finally { G.ocupado = false; }
  }
  function fundido(objetivo, dur) {
    return new Promise((res) => { G.fadeAnim = { desde: G.fade, hasta: objetivo, t: 0, dur, res }; });
  }

  async function usarWarp(w) {
    if (w.requiereTodos && G.visitados.size < TOTAL) {
      const faltan = COLEGAS.filter((p) => !G.visitados.has(p.id)).map((p) => p.nombre);
      const lista = faltan.length > 1 ? faltan.slice(0, -1).join(', ') + ' y ' + faltan.at(-1) : faltan[0];
      await decir({ yo: true, texto: [`Siento que aún me falta despedirme de alguien...`, `Me faltan: ${lista}.`] });
      const j = G.jugador;
      iniciarPaso(j, OPUESTO[j.dir]);
      while (j.mov) await wait(16);
      return;
    }
    audio.sfx('puerta');
    await fundido(1, 0.3);
    cargarMapa(w.a, w.ax, w.ay, w.dir);
    await wait(120);
    await fundido(0, 0.3);
    if (G.mapa.alEntrar === 'final') await escenaFinal();
  }

  async function ascensor() {
    const actual = G.mapa.piso;
    const pisos = Object.keys(PISOS).map(Number).filter((p) => p !== actual);
    const op = pisos.map((p) => PISOS[p].nombre).concat('Cancelar');
    const i = await preguntar('El ascensor. ¿A qué piso quieres ir?', op);
    if (i >= pisos.length) return;
    const destino = PISOS[pisos[i]], m = MAPAS[destino.mapa];
    audio.sfx('ding');
    G.fadeTexto = (pisos[i] > actual ? '▲ ' : '▼ ') + destino.nombre.toUpperCase();
    await fundido(1, 0.35);
    cargarMapa(destino.mapa, m.ascensor.x, m.ascensor.y, m.ascensor.dir);
    await wait(900);
    audio.sfx('ding');
    await fundido(0, 0.35);
    G.fadeTexto = '';
  }

  // Ejecuta una lista de mensajes: textos del personaje, frases de Mayra y preguntas con respuestas.
  async function conversar(pj, retrato, items) {
    let bloque = [];
    const soltarBloque = async () => {
      if (bloque.length) await decir({ nombre: pj.nombre, area: pj.area, retrato, texto: bloque });
      bloque = [];
    };
    for (const it of items) {
      if (typeof it === 'string') { bloque.push(it); continue; }
      await soltarBloque();
      if (it.yo) await decir({ yo: true, texto: [it.yo] });
      else if (it.pregunta) {
        const i = await preguntar(it.pregunta, it.opciones, { nombre: pj.nombre, area: pj.area, retrato });
        await decir({ yo: true, texto: [it.opciones[i]] });
        await conversar(pj, retrato, (it.respuestas && it.respuestas[i]) || []);
      }
    }
    await soltarBloque();
  }

  async function hablarCon(npc) {
    const j = G.jugador, pj = npc.pj;
    npc.dir = OPUESTO[j.dir];
    npc.volverT = 0;
    const retrato = retratos[pj.id];
    await conversar(pj, retrato, pj.mensaje);
    if (!pj.extra && !G.visitados.has(pj.id)) {
      G.visitados.add(pj.id);
      G.orden.push(pj.id);
      audio.sfx('regalo');
      await decir({ retrato: regaloIcono, texto: [`¡${YO.nombre} recibió ${fill(pj.regalo.nombre)}!`, pj.regalo.desc] });
      if (G.visitados.size === TOTAL) {
        audio.sfx('fanfarria');
        await decir({ texto: CFG.todosListos });
      }
    }
    npc.volverT = 2.5;
  }

  function interactuar() {
    const j = G.jugador, m = G.mapa;
    const [dx, dy] = DIRS[j.dir], x = j.x + dx, y = j.y + dy;
    const npc = G.npcs.find((n) => n.x === x && n.y === y);
    if (npc) return ejecutar(() => hablarCon(npc));
    const tile = tileAt(m, x, y);
    if (tile === 'E' || tile === 'b') return ejecutar(ascensor);
    const obj = (m.objetos || []).find((o) => o.x === x && o.y === y);
    const texto = obj ? obj.texto : TEXTOS[tile];
    if (texto) ejecutar(() => decir({ texto: typeof texto === 'function' ? texto(m) : texto }));
  }

  const TEXTOS = {
    W: ['Por la ventana se ve la ciudad.', 'Cuántas veces miraste por aquí soñando con lo que venía...'],
    L: ['Una pizarra llena de ideas y post-its.'],
    P: ['Una planta de la oficina. Parece que también te va a extrañar.'],
    K: ['La cafetera. ¡La verdadera MVP de la oficina!'],
    k: ['El lavadero. Alguien dejó su taza sin lavar... otra vez.'],
    F: ['La refri. Hay un táper con nombre: "NO TOCAR".'],
    w: ['El dispensador de agua. ¡Mantente hidratada en tu nueva aventura!'],
    u: ['El tacho. Aquí terminaron muchos post-its de "pendientes".'],
    B: ['Estantes llenos de archivadores y papeles importantes.'],
    l: ['Los casilleros de la oficina.'],
    X: ['La impresora. Atascada, como siempre.'],
    D: ['Un escritorio con la compu prendida.'], U: ['Un escritorio con la compu prendida.'],
    d: ['Un escritorio ordenado... más o menos.'], M: ['Una laptop abierta.'],
    T: ['La mesa de reuniones. Aquí nacieron muchas ideas (y muchas reuniones que pudieron ser un correo).'],
    S: ['Un sofá muy cómodo. Ideal para una siestita... pero no hay tiempo.'],
    R: ['La recepción del edificio.'],
    V: ['La tele de la oficina. Aquí se vieron muchas presentaciones (y algún partido de la selección).'],
    Z: ['Un clóset. Mejor no abrirlo...'],
    C: ['Gabinetes llenos de tazas, galletas y sobrecitos de azúcar.'],
    $: ['Una caja de BaldeCash. ¡Cuántos recuerdos con este logo!'],
    Y: ['Una pared de vidrio. ¡Cuidado, no te vayas a chocar!'],
    N: (m) => [`Un letrero: PISO ${m.piso}.`],
    q: ['El edificio donde viviste tantas aventuras.'], o: ['El edificio donde viviste tantas aventuras.'],
    t: ['Un árbol frondoso.'], f: ['Un macetero con flores de colores.'],
  };

  // ------------------------------------------------------------ diálogos
  const BOX = { x: 24, y: UH - 24 - 186, w: UW - 48, h: 186, pad: 28, port: 132, fs: 31, lh: 46 };
  function envolver(texto, maxW) {
    ctx.font = fuente(BOX.fs);
    const lineas = [];
    for (const parrafo of fill(texto).split('\n')) {
      let linea = '';
      for (const p of parrafo.split(' ')) {
        const prueba = linea ? linea + ' ' + p : p;
        if (ctx.measureText(prueba).width > maxW && linea) { lineas.push(linea); linea = p; }
        else linea = prueba;
      }
      lineas.push(linea);
    }
    return lineas;
  }
  function decir(o) {
    if (o.yo) Object.assign(o, { nombre: YO.nombre, area: YO.area, retrato: yoRetrato });
    return new Promise((res) => {
      const maxW = BOX.w - BOX.pad * 2 - (o.retrato ? BOX.port + BOX.pad : 0);
      const paginas = [];
      for (const t of o.texto) {
        const l = envolver(t, maxW);
        for (let i = 0; i < l.length; i += 3) paginas.push(l.slice(i, i + 3));
      }
      G.dialogo = { ...o, paginas, pag: 0, letras: 0, res, blipT: 0 };
    });
  }
  async function preguntar(texto, opciones, quien = {}) {
    await decir({ ...quien, texto: [texto], mantener: true });
    return new Promise((res) => { G.eleccion = { opciones, i: 0, res }; });
  }

  function actualizarDialogo(dt) {
    const d = G.dialogo, pag = d.paginas[d.pag], total = pag.join('').length;
    if (d.letras < total) {
      const antes = Math.floor(d.letras);
      d.letras = Math.min(total, d.letras + dt * (teclas.a || teclas.b ? 110 : 48));
      if (Math.floor(d.letras) !== antes && Math.floor(d.letras) % 3 === 0) audio.sfx('blip');
      if (d.letras > 2 && (pulsadas.a || pulsadas.b)) d.letras = total;
      return;
    }
    const ultima = d.pag === d.paginas.length - 1;
    if (ultima && d.mantener) { if (!d.resuelto) { d.resuelto = true; d.res(); } return; }
    if (pulsadas.a || pulsadas.b) {
      audio.sfx('blip');
      if (!ultima) { d.pag++; d.letras = 0; }
      else { G.dialogo = null; d.res(); }
    }
  }
  function actualizarEleccion() {
    const e = G.eleccion;
    if (pulsadas.up) { e.i = (e.i + e.opciones.length - 1) % e.opciones.length; audio.sfx('blip'); }
    if (pulsadas.down) { e.i = (e.i + 1) % e.opciones.length; audio.sfx('blip'); }
    if (pulsadas.a || pulsadas.b) {
      const i = pulsadas.b ? e.opciones.length - 1 : e.i;
      if (pulsadas.b && e.opciones.at(-1) !== 'Cancelar') return;
      audio.sfx('ok');
      G.eleccion = null; G.dialogo = null; e.res(i);
    }
  }

  // ------------------------------------------------------------ registro de despedidas (menú X)
  function abrirRegistro() { audio.sfx('ok'); G.registro = { i: 0, leyendo: false }; }
  function actualizarRegistro() {
    const r = G.registro;
    if (r.leyendo) return;
    if (pulsadas.up) { r.i = (r.i + TOTAL - 1) % TOTAL; audio.sfx('blip'); }
    if (pulsadas.down) { r.i = (r.i + 1) % TOTAL; audio.sfx('blip'); }
    if (pulsadas.b) { audio.sfx('blip'); G.registro = null; return; }
    if (pulsadas.a) {
      const pj = COLEGAS[r.i];
      if (!G.visitados.has(pj.id)) { audio.sfx('choque'); return; }
      r.leyendo = true;
      const items = pj.mensaje.filter((m) => typeof m === 'string');
      decir({ nombre: pj.nombre, area: pj.area, retrato: retratos[pj.id], texto: items }).then(() => { r.leyendo = false; });
    }
  }

  // ------------------------------------------------------------ escena final
  async function escenaFinal() {
    const j = G.jugador, m = G.mapa;
    G.final = true;
    audio.tocar('final');
    await wait(700);
    await decir({ yo: true, texto: CFG.final.pensamiento });
    j.dir = 'down';
    const spots = m.despedida;
    for (let i = 0; i < COLEGAS.length; i++) {
      const p = COLEGAS[i], [x, y] = spots[i % spots.length];
      const e = crearEntidad(x, y, 'up', sprites[p.id]);
      Object.assign(e, { id: p.id, pj: p, dirBase: 'up', aparicion: 0 });
      G.npcs.push(e);
      chispas(x * T + 8, y * T + 4);
      audio.sfx('pop');
      await wait(230);
    }
    await wait(500);
    G.celebrando = true;
    confeti(160);
    await decir({ nombre: '¡TODOS!', texto: CFG.final.todos });
    confeti(120);
    await decir({ texto: CFG.final.cierre });
    await wait(1200);
    await fundido(1, 1.4);
    iniciarCreditos();
    await fundido(0, 1);
  }

  function chispas(x, y) {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      G.particulas.push({ mundo: true, x, y, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, g: 0, vida: 0.5, col: i % 2 ? '#fff6a8' : '#ffffff', w: 2, h: 2, rot: 0, vr: 0 });
    }
  }
  function confeti(n) {
    const cols = ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#c77dff', '#ff9f1c', '#ffffff'];
    for (let i = 0; i < n; i++)
      G.particulas.push({ x: Math.random() * UW, y: -20 - Math.random() * 300, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 120, g: 40, vida: 8, col: cols[i % cols.length], w: 10, h: 16, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 });
  }
  function actualizarParticulas(dt) {
    G.particulas = G.particulas.filter((p) => {
      p.vida -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.rot += p.vr * dt;
      if (!p.mundo) p.vx *= 0.99;
      return p.vida > 0 && p.y < UH + 40;
    });
  }

  // ------------------------------------------------------------ créditos
  function iniciarCreditos() {
    G.estado = 'creditos';
    G.dialogo = null;
    const C = CFG.creditos, items = [];
    items.push({ tipo: 'retrato', h: 300 });
    items.push({ tipo: 'titulo', s: fill(C.titulo), h: 110 });
    items.push({ tipo: 'texto', s: fill(C.intro), h: 90 });
    COLEGAS.forEach((p) => items.push({ tipo: 'pj', pj: p, h: 88 }));
    items.push({ tipo: 'espacio', h: 50 });
    C.cierre.forEach((s) => items.push({ tipo: 'texto', s: fill(s), h: 60 }));
    items.push({ tipo: 'espacio', h: 60 });
    items.push({ tipo: 'firma', s: fill(C.firma), h: 80 });
    items.push({ tipo: 'espacio', h: 140 });
    items.push({ tipo: 'fin', s: 'FIN', h: 120 });
    const alto = items.reduce((a, b) => a + b.h, 0);
    G.creditos = { items, y: UH - 140, alto, t: 0 };
  }
  function actualizarCreditos(dt) {
    const c = G.creditos;
    c.t += dt;
    const tope = UH * 0.42 - (c.alto - 60);
    c.y = Math.max(tope, c.y - dt * (teclas.a ? 160 : 42));
    c.terminado = c.y <= tope;
    if (c.terminado && pulsadas.a && c.t > 3) reiniciar();
  }

  // ------------------------------------------------------------ flujo principal
  async function empezar() {
    G.estado = 'intro';
    audio.sfx('ok');
    await fundido(1, 0.6);
    G.estado = 'juego';
    const ini = MAPAS.oficina2.inicio;
    cargarMapa('oficina2', ini.x, ini.y, ini.dir);
    G.banner.t = 99;
    G.ocupado = true;
    await decir({ texto: CFG.intro, oscuro: true });
    audio.tocar('oficina');
    G.banner.t = 0;
    await fundido(0, 0.8);
    G.ocupado = false;
  }
  function reiniciar() {
    G.visitados.clear(); G.orden = []; G.final = false; G.celebrando = false; G.particulas = [];
    G.jugador = null; G.mapa = null; G.estado = 'titulo'; G.creditos = null;
    audio.tocar('oficina');
  }

  function actualizar(dt) {
    G.t += dt;
    if (pulsadas.mudo) audio.alternarMudo();
    if (G.fadeAnim) {
      const f = G.fadeAnim;
      f.t += dt;
      G.fade = f.desde + (f.hasta - f.desde) * clamp(f.t / f.dur, 0, 1);
      if (f.t >= f.dur) { G.fadeAnim = null; f.res(); }
    }
    actualizarParticulas(dt);
    if (G.estado === 'titulo') {
      if (G.fade > 0 && !G.fadeAnim) G.fade = Math.max(0, G.fade - dt * 2);
      if (pulsadas.a) empezar();
    } else if (G.estado === 'juego' || G.estado === 'intro') {
      if (!G.mapa) return;
      G.choqueT -= dt;
      G.banner.t += dt;
      // si una ventana consumió la tecla este frame, el jugador no la recibe
      const bloqueado = !!(G.eleccion || G.dialogo || G.registro);
      if (G.eleccion) actualizarEleccion();
      else if (G.dialogo) actualizarDialogo(dt);
      else if (G.registro) actualizarRegistro();
      actualizarJugador(dt, bloqueado);
      for (const n of G.npcs) {
        if (n.volverT > 0 && (n.volverT -= dt) <= 0 && !G.dialogo) n.dir = n.dirBase;
        if (n.gira && !G.ocupado && (n.giroT -= dt) <= 0) {
          n.giroT = 2 + Math.random() * 4;
          n.dir = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
        }
        n.salto = G.celebrando ? Math.abs(Math.sin(G.t * 9 + n.x)) * 5 : 0;
      }
    } else if (G.estado === 'creditos') {
      actualizarCreditos(dt);
    }
  }

  // ------------------------------------------------------------ dibujo: mundo
  function camara() {
    const m = G.mapa, j = G.jugador, mw = m.w * T, mh = m.h * T;
    const cx = mw <= W ? (mw - W) / 2 : clamp(j.px + 8 - W / 2, 0, mw - W);
    const cy = mh <= H ? (mh - H) / 2 : clamp(j.py + 8 - H / 2, 0, mh - H);
    return [Math.round(cx), Math.round(cy)];
  }

  function dibujarMundo() {
    const m = G.mapa;
    const [cx, cy] = camara();
    vctx.fillStyle = '#14141c';
    vctx.fillRect(0, 0, W, H);
    vctx.drawImage(m.canvas, -cx, -cy);
    const ents = [...G.npcs, G.jugador].sort((a, b) => a.py - b.py);
    for (const e of ents) {
      const x = Math.round(e.px - cx), y = Math.round(e.py - cy);
      vctx.fillStyle = 'rgba(0,0,0,0.22)';
      vctx.beginPath(); vctx.ellipse(x + 8, y + 14, 5.5, 2.2, 0, 0, Math.PI * 2); vctx.fill();
      vctx.drawImage(e.spr[e.dir][frameDe(e)], x, y - 5 - Math.round(e.salto || 0));
    }
    // indicadores sobre los compañeros
    if (!G.final) for (const n of G.npcs) {
      if (n.pj.extra) continue;
      const x = Math.round(n.px - cx) + 9, y = Math.round(n.py - cy) - 14 + Math.round(Math.sin(G.t * 4 + n.x) * 1.2);
      if (G.visitados.has(n.id)) dibujarCorazon(vctx, x + 1, y + 2);
      else dibujarBurbuja(vctx, x, y);
    }
    if (m.atardecer) {
      const g = vctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(255,150,80,0.22)'); g.addColorStop(1, 'rgba(120,60,140,0.12)');
      vctx.fillStyle = g; vctx.fillRect(0, 0, W, H);
    }
    for (const p of G.particulas) if (p.mundo) {
      vctx.fillStyle = p.col; vctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.w, p.h);
    }
  }
  function dibujarCorazon(g, x, y) {
    const pat = ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'];
    g.fillStyle = '#1d1b29';
    pat.forEach((r, j) => [...r].forEach((c, i) => { if (c === 'X') g.fillRect(x + i - 1, y + j, 3, 1), g.fillRect(x + i, y + j - 1, 1, 3); }));
    pat.forEach((r, j) => [...r].forEach((c, i) => { if (c === 'X') { g.fillStyle = j === 1 && i === 1 ? '#ffb3c1' : '#ff4d6d'; g.fillRect(x + i, y + j, 1, 1); } }));
  }
  function dibujarBurbuja(g, x, y) {
    g.fillStyle = '#1d1b29'; g.fillRect(x - 1, y, 11, 7); g.fillRect(x, y - 1, 9, 9); g.fillRect(x + 1, y + 8, 2, 2);
    g.fillStyle = '#ffffff'; g.fillRect(x, y, 9, 7); g.fillRect(x + 1, y + 7, 1, 1);
    const n = Math.floor(G.t * 3) % 4;
    g.fillStyle = '#1d1b29';
    for (let i = 0; i < Math.min(3, n); i++) g.fillRect(x + 2 + i * 2, y + 3, 1, 1);
  }

  // ------------------------------------------------------------ dibujo: interfaz (espacio 960x704)
  function caja(x, y, w, h, opts = {}) {
    ctx.save();
    ctx.fillStyle = opts.sombra === false ? 'transparent' : 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.roundRect(x + 4, y + 6, w, h, 14); ctx.fill();
    ctx.fillStyle = '#2b3a67';
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
    ctx.fillStyle = opts.fondo || '#fbfaf5';
    ctx.beginPath(); ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 9); ctx.fill();
    ctx.strokeStyle = '#8fb3e8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x + 11, y + 11, w - 22, h - 22, 6); ctx.stroke();
    ctx.restore();
  }
  function texto(s, x, y, o = {}) {
    ctx.font = fuente(o.fs || BOX.fs);
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = 'alphabetic';
    if (o.sombra !== false) { ctx.fillStyle = o.sombraCol || '#d3d1c8'; ctx.fillText(s, x + 2, y + 2); }
    ctx.fillStyle = o.col || '#2a2838';
    ctx.fillText(s, x, y);
  }
  function retratoEn(img, x, y, s) {
    ctx.fillStyle = '#2b3a67'; ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    const g = ctx.createLinearGradient(0, y, 0, y + s);
    g.addColorStop(0, '#cfe3ff'); g.addColorStop(1, '#a9c7f0');
    ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
    ctx.imageSmoothingEnabled = false;
    const k = s / img.width;
    ctx.drawImage(img, x, y + s - img.height * k, s, img.height * k);
  }

  function dibujarDialogo() {
    const d = G.dialogo;
    if (!d) return;
    const { x, y, w, h, pad, port } = BOX;
    caja(x, y, w, h);
    let tx = x + pad;
    if (d.retrato) { retratoEn(d.retrato, x + 26, y + 27, port); tx += port + pad; }
    if (d.nombre) {
      ctx.font = fuente(28);
      const area = d.area ? '  ·  ' + fill(d.area) : '';
      const ancho = ctx.measureText(d.nombre).width + (area ? ctx.measureText(area).width * 0.8 : 0) + 44;
      caja(x + 6, y - 50, ancho, 58, { fondo: '#2b3a67', sombra: false });
      texto(d.nombre, x + 28, y - 13, { fs: 28, bold: true, col: '#ffffff', sombraCol: '#1a2445' });
      if (area) {
        const nw = ctx.measureText(d.nombre).width;
        texto(area, x + 28 + nw, y - 14, { fs: 22, col: '#ffd166', sombra: false });
      }
    }
    const pag = d.paginas[d.pag];
    let resto = Math.floor(d.letras);
    pag.forEach((l, i) => {
      const s = l.slice(0, Math.max(0, resto));
      resto -= l.length;
      texto(s, tx, y + 66 + i * BOX.lh);
    });
    const completo = d.letras >= pag.join('').length;
    if (completo && !d.mantener) {
      const by = y + h - 34 + Math.round(Math.sin(G.t * 8) * 3);
      ctx.fillStyle = '#e63946';
      ctx.beginPath(); ctx.moveTo(x + w - 52, by); ctx.lineTo(x + w - 32, by); ctx.lineTo(x + w - 42, by + 12); ctx.fill();
    }
  }

  function dibujarEleccion() {
    const e = G.eleccion;
    if (!e) return;
    ctx.font = fuente(BOX.fs);
    const w = Math.max(...e.opciones.map((o) => ctx.measureText(o).width)) + 100;
    const h = e.opciones.length * 50 + 40;
    const x = UW - 24 - w, y = BOX.y - 60 - h;
    caja(x, y, w, h);
    e.opciones.forEach((o, i) => {
      texto(o, x + 62, y + 58 + i * 50);
      if (i === e.i) {
        const by = y + 46 + i * 50;
        ctx.fillStyle = '#2a2838';
        ctx.beginPath(); ctx.moveTo(x + 32, by - 10); ctx.lineTo(x + 46, by); ctx.lineTo(x + 32, by + 10); ctx.fill();
      }
    });
  }

  function dibujarHUD() {
    if (G.final) return;
    const s = `${G.visitados.size} / ${TOTAL}`;
    ctx.font = fuente(30);
    const w = ctx.measureText(s).width + 92;
    caja(UW - 20 - w, 18, w, 64);
    ctx.save(); ctx.translate(UW - 20 - w + 26, 34); ctx.scale(4, 4); dibujarCorazonUI(); ctx.restore();
    texto(s, UW - 20 - w + 66, 61, { fs: 30, bold: true });
    // banner del lugar
    const b = G.banner;
    if (b.t < 3) {
      const k = b.t < 0.35 ? b.t / 0.35 : b.t > 2.6 ? 1 - (b.t - 2.6) / 0.4 : 1;
      ctx.font = fuente(30);
      const bw = ctx.measureText(b.texto).width + 70;
      const y = -90 + 108 * k;
      caja(20, y, bw, 70, { fondo: '#fff3d6' });
      texto(b.texto, 55, y + 46, { fs: 30, bold: true });
    }
    if (G.visitados.size === TOTAL && !G.dialogo && !G.registro) {
      const a = 0.6 + Math.sin(G.t * 4) * 0.4;
      ctx.globalAlpha = a;
      texto('¡Ve a la salida! (Piso 1)', UW - 24, 120, { fs: 24, align: 'right', col: '#ffffff', sombraCol: '#1d1b29', bold: true });
      ctx.globalAlpha = 1;
    }
  }
  function dibujarCorazonUI() {
    const pat = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
    pat.forEach((r, j) => [...r].forEach((c, i) => { if (c === 'X') { ctx.fillStyle = j < 2 && i < 3 && i > 0 ? '#ff8fa3' : '#ff4d6d'; ctx.fillRect(i, j, 1, 1); } }));
  }

  function dibujarRegistro() {
    const r = G.registro;
    if (!r) return;
    ctx.fillStyle = 'rgba(15,18,35,0.82)';
    ctx.fillRect(0, 0, UW, UH);
    caja(20, 20, 560, UH - 40);
    texto('REGISTRO DE DESPEDIDAS', 52, 72, { fs: 30, bold: true });
    texto(`${G.visitados.size}/${TOTAL}`, 548, 72, { fs: 28, align: 'right', col: '#e63946', bold: true });
    const fila = 44, y0 = 96;
    COLEGAS.forEach((p, i) => {
      const y = y0 + i * fila, v = G.visitados.has(p.id);
      if (i === r.i) { ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.roundRect(36, y, 528, fila - 4, 8); ctx.fill(); }
      ctx.imageSmoothingEnabled = false;
      if (v) ctx.drawImage(retratos[p.id], 46, y + 2, 36, 36);
      else { ctx.globalAlpha = 0.25; ctx.filter = 'brightness(0)'; ctx.drawImage(retratos[p.id], 46, y + 2, 36, 36); ctx.filter = 'none'; ctx.globalAlpha = 1; }
      texto(v ? p.nombre : '???', 96, y + 30, { fs: 26, bold: v, col: v ? '#2a2838' : '#9a98a8' });
      const piso = Object.values(MAPAS).find((m) => (m.npcs || []).some((n) => n.id === p.id));
      texto(v ? fill(p.regalo.nombre) : `Piso ${piso ? piso.piso : '?'}`, 552, y + 29, { fs: 20, align: 'right', col: v ? '#3d6f99' : '#9a98a8', sombra: false });
    });
    // detalle
    const pj = COLEGAS[r.i], v = G.visitados.has(pj.id);
    caja(600, 20, UW - 620, UH - 40);
    const px = 600 + (UW - 620) / 2 - 90;
    if (v) retratoEn(retratos[pj.id], px, 60, 180);
    else { ctx.fillStyle = '#d9dde6'; ctx.fillRect(px, 60, 180, 180); texto('?', px + 90, 175, { fs: 90, align: 'center', col: '#9a98a8' }); }
    const cx = 600 + (UW - 620) / 2;
    texto(v ? pj.nombre : '???', cx, 290, { fs: 32, bold: true, align: 'center' });
    texto(v ? fill(pj.area) : 'Aún no te despides', cx, 324, { fs: 22, align: 'center', col: '#6a6880', sombra: false });
    if (v) {
      texto(fill(pj.regalo.nombre), cx, 380, { fs: 23, bold: true, align: 'center', col: '#e63946' });
      ctx.font = fuente(21);
      const lineas = [];
      let l = '';
      for (const p of pj.regalo.desc.split(' ')) { const t = l ? l + ' ' + p : p; if (ctx.measureText(t).width > UW - 690 && l) { lineas.push(l); l = p; } else l = t; }
      lineas.push(l);
      lineas.forEach((s, i) => texto(s, cx, 418 + i * 30, { fs: 21, align: 'center', col: '#4a4860', sombra: false }));
    }
    texto(v ? 'Z: releer mensaje   X: cerrar' : 'X: cerrar', cx, UH - 52, { fs: 20, align: 'center', col: '#6a6880', sombra: false });
  }

  function dibujarParticulasUI() {
    for (const p of G.particulas) {
      if (p.mundo) continue;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, (-p.h / 2) * Math.abs(Math.cos(p.rot * 1.7)), p.w, p.h * Math.abs(Math.cos(p.rot * 1.7)));
      ctx.restore();
    }
  }

  // ------------------------------------------------------------ título y créditos
  function fondoAtardecer() {
    const g = ctx.createLinearGradient(0, 0, 0, UH);
    g.addColorStop(0, '#2b1e5c'); g.addColorStop(0.45, '#c2507a'); g.addColorStop(0.75, '#f6a05a'); g.addColorStop(1, '#ffd38a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, UW, UH);
    for (let i = 0; i < 40; i++) {
      const x = hash(i, 1) * UW, y = hash(i, 2) * UH * 0.4, a = 0.4 + 0.6 * Math.abs(Math.sin(G.t * 1.5 + i));
      ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`; ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
    }
    ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(UW * 0.72, UH * 0.78, 90, 0, Math.PI * 2); ctx.fill();
  }
  function edificios(scroll) {
    ctx.fillStyle = '#3a2a55';
    for (let i = -1; i < 12; i++) {
      const w = 90 + hash(i, 7) * 60, h = 120 + hash(i, 8) * 160;
      const x = ((i * 110 - scroll * 0.3) % (12 * 110) + 12 * 110) % (12 * 110) - 110;
      ctx.fillRect(x, UH - 120 - h, w, h);
      ctx.fillStyle = 'rgba(255,214,140,0.5)';
      for (let yy = UH - 110 - h; yy < UH - 140; yy += 26) for (let xx = x + 12; xx < x + w - 14; xx += 22) if (hash(xx | 0, yy | 0) > 0.45) ctx.fillRect(xx, yy, 10, 12);
      ctx.fillStyle = '#3a2a55';
    }
    ctx.fillStyle = '#2a1f3d'; ctx.fillRect(0, UH - 120, UW, 120);
    ctx.fillStyle = '#4a3a63';
    for (let x = -((scroll) % 80); x < UW; x += 80) ctx.fillRect(x, UH - 70, 40, 8);
  }

  function dibujarTitulo() {
    fondoAtardecer();
    edificios(G.t * 30);
    ctx.imageSmoothingEnabled = false;
    // Mayra en grande, con un leve rebote
    const f = Math.floor(G.t * 4) % 4, rebote = Math.round(Math.abs(Math.sin(G.t * 3)) * -10);
    ctx.fillStyle = 'rgba(30,15,50,0.35)';
    ctx.beginPath(); ctx.ellipse(250, 572, 80, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(yoSprites.down[[1, 0, 2, 0][f]], 250 - 88, 572 - 21 * 11 + rebote, 16 * 11, 23 * 11);
    // título
    ctx.textAlign = 'center';
    ctx.font = fuente(120);
    ctx.lineWidth = 14; ctx.strokeStyle = '#2b1e5c'; ctx.lineJoin = 'round';
    ctx.strokeText(YO.nombre.toUpperCase(), UW / 2 + 140, 230);
    ctx.fillStyle = '#ffd23f'; ctx.fillText(YO.nombre.toUpperCase(), UW / 2 + 140, 230);
    ctx.font = fuente(36);
    ctx.lineWidth = 8; ctx.strokeText('~ Edición Despedida ~', UW / 2 + 140, 290);
    ctx.fillStyle = '#ffffff'; ctx.fillText('~ Edición Despedida ~', UW / 2 + 140, 290);
    if (Math.floor(G.t * 2) % 2 === 0) {
      ctx.font = fuente(34);
      ctx.lineWidth = 8; ctx.strokeText('PRESIONA ENTER', UW / 2, UH - 150);
      ctx.fillStyle = '#ffffff'; ctx.fillText('PRESIONA ENTER', UW / 2, UH - 150);
    }
    ctx.font = fuente(20);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Flechas: mover · Z/Enter: hablar · X: registro · Shift: correr · M: sonido', UW / 2, UH - 28);
    ctx.textAlign = 'left';
  }

  function dibujarCreditos() {
    const c = G.creditos;
    fondoAtardecer();
    edificios(c.t * 60);
    // Mayra caminando hacia el atardecer
    ctx.imageSmoothingEnabled = false;
    const f = Math.floor(c.t * 7) % 4;
    ctx.drawImage(yoSprites.right[[1, 0, 2, 0][f]], 40, UH - 120 - 23 * 5 + 18, 16 * 5, 23 * 5);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, UW, UH - 130); ctx.clip();
    let y = c.y;
    ctx.textAlign = 'center';
    const sombra = (s, x, yy, fs, col = '#ffffff', bold = false) => {
      ctx.font = fuente(fs);
      ctx.lineWidth = Math.max(4, fs / 6); ctx.strokeStyle = '#2b1e5c'; ctx.lineJoin = 'round';
      ctx.strokeText(s, x, yy); ctx.fillStyle = col; ctx.fillText(s, x, yy);
    };
    for (const it of c.items) {
      if (y > -it.h - 20 && y < UH) {
        if (it.tipo === 'retrato') retratoEn(yoRetrato, UW / 2 - 120, y + 20, 240);
        if (it.tipo === 'titulo') sombra(it.s, UW / 2, y + 80, 64, '#ffd23f', true);
        if (it.tipo === 'texto') sombra(it.s, UW / 2, y + 40, 30);
        if (it.tipo === 'firma') sombra(it.s, UW / 2, y + 45, 26, '#ffe9a8');
        if (it.tipo === 'fin') sombra(it.s, UW / 2, y + 80, 80, '#ffd23f', true);
        if (it.tipo === 'pj') {
          const p = it.pj;
          ctx.drawImage(retratos[p.id], UW / 2 - 250, y + 8, 64, 64);
          ctx.textAlign = 'left';
          sombra(p.nombre, UW / 2 - 166, y + 40, 32, '#ffffff', true);
          sombra(fill(p.area) + '  ·  ' + fill(p.regalo.nombre), UW / 2 - 166, y + 72, 20, '#ffe9a8');
          ctx.textAlign = 'center';
        }
      }
      y += it.h;
    }
    ctx.restore();
    if (c.terminado && c.t > 3 && Math.floor(G.t * 2) % 2 === 0) {
      ctx.textAlign = 'center';
      ctx.font = fuente(26);
      ctx.lineWidth = 6; ctx.strokeStyle = '#2b1e5c'; ctx.strokeText('Presiona ENTER para volver a jugar', UW / 2, UH - 40);
      ctx.fillStyle = '#ffffff'; ctx.fillText('Presiona ENTER para volver a jugar', UW / 2, UH - 40);
    }
    ctx.textAlign = 'left';
  }

  function dibujar() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if ((G.estado === 'juego' || G.estado === 'intro') && G.mapa) {
      dibujarMundo();
      ctx.drawImage(view, 0, 0, W * K, H * K);
    }
    ctx.setTransform(K / 4, 0, 0, K / 4, 0, 0);
    if (G.estado === 'cargando') {
      texto('Cargando...', UW / 2, UH / 2, { align: 'center', col: '#fff', sombra: false });
      return;
    }
    if (G.estado === 'titulo' || (G.estado === 'intro' && !G.mapa)) dibujarTitulo();
    if (G.estado === 'creditos') dibujarCreditos();
    if (G.estado === 'juego' || G.estado === 'intro') {
      dibujarParticulasUI();
      if (!G.dialogo || !G.dialogo.oscuro) dibujarHUD();
      dibujarRegistro();
    }
    if (G.estado === 'creditos') dibujarParticulasUI();
    // fundido
    if (G.fade > 0) {
      ctx.fillStyle = `rgba(8,8,14,${G.fade})`;
      ctx.fillRect(0, 0, UW, UH);
      if (G.fadeTexto && G.fade > 0.9) texto(G.fadeTexto, UW / 2, UH / 2, { fs: 40, bold: true, align: 'center', col: '#ffd166', sombra: false });
    }
    if (G.estado === 'juego' || G.estado === 'intro') { dibujarDialogo(); dibujarEleccion(); }
  }

  // ------------------------------------------------------------ bucle (paso fijo de 60 Hz)
  let ultimo = performance.now(), acum = 0;
  function bucle(ahora) {
    acum += Math.min(0.25, (ahora - ultimo) / 1000);
    ultimo = ahora;
    while (acum >= STEP) {
      actualizar(STEP);
      for (const k in pulsadas) delete pulsadas[k];
      acum -= STEP;
    }
    dibujar();
    requestAnimationFrame(bucle);
  }
  document.addEventListener('visibilitychange', () => { ultimo = performance.now(); acum = 0; });

  // ------------------------------------------------------------ arranque
  async function iniciar() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('tactil');
    resize();
    addEventListener('resize', resize);
    requestAnimationFrame(bucle);
    Object.keys(MAPAS).forEach(prepararMapa);
    validarMapas();
    if (document.fonts) await Promise.race([document.fonts.load(fuente(31)), wait(2500)]);
    G.estado = 'titulo';
    G.fade = 1;
    // ganchos para las pruebas automatizadas (pruebas/recorrido.js)
    window.__juego = G;
    window.__ir = (mapa, x, y, dir) => { cargarMapa(mapa, x, y, dir); G.fade = 0; };
  }
  iniciar();
})();
