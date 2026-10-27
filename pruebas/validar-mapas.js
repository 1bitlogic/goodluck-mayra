// Valida que en cada mapa se pueda llegar caminando a cada compañero, puerta y ascensor.
// Uso: node pruebas/validar-mapas.js
global.window = {};
require('../mensajes.js'); require('../mapas.js');
const { MAPAS, PERSONAJES } = window;
const WALK = new Set(['.', '=', 'r', 'G', 's', 'g']);
const D = [[0, 1], [0, -1], [1, 0], [-1, 0]];
let errores = 0;
const err = (m) => { errores++; console.log('✗', m); };

for (const [id, m] of Object.entries(MAPAS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((r, y) => r.length !== w && err(`${id}: fila ${y} mide ${r.length} (esperado ${w})`));
  const at = (x, y) => (m.tiles[y] || '')[x];
  const npc = new Set((m.npcs || []).map((n) => `${n.x},${n.y}`));
  // origen: inicio, llegada de ascensor o llegada de algún warp hacia este mapa
  const origenes = [];
  if (m.inicio) origenes.push(m.inicio);
  if (m.ascensor) origenes.push(m.ascensor);
  for (const o of Object.values(MAPAS)) for (const wp of o.warps || []) if (wp.a === id) origenes.push({ x: wp.ax, y: wp.ay });
  if (!origenes.length) { err(`${id}: no tiene forma de entrar`); continue; }
  const vis = new Set(), cola = origenes.map((o) => [o.x, o.y]);
  cola.forEach(([x, y]) => vis.add(`${x},${y}`));
  while (cola.length) {
    const [x, y] = cola.shift();
    for (const [dx, dy] of D) {
      const k = `${x + dx},${y + dy}`;
      if (!vis.has(k) && WALK.has(at(x + dx, y + dy)) && !npc.has(k)) { vis.add(k); cola.push([x + dx, y + dy]); }
    }
  }
  const adyacente = (x, y) => D.some(([dx, dy]) => vis.has(`${x + dx},${y + dy}`));
  for (const n of m.npcs || []) {
    if (!PERSONAJES.find((p) => p.id === n.id)) err(`${id}: personaje ${n.id} no existe`);
    if (!adyacente(n.x, n.y)) err(`${id}: no se puede llegar a hablar con ${n.id}`);
  }
  for (const wp of m.warps || []) if (!vis.has(`${wp.x},${wp.y}`)) err(`${id}: no se puede llegar a la puerta (${wp.x},${wp.y})`);
  if (m.ascensor) {
    let ok = false;
    m.tiles.forEach((r, y) => [...r].forEach((c, x) => { if ((c === 'E' || c === 'b') && vis.has(`${x},${y + 1}`)) ok = true; }));
    if (!ok) err(`${id}: no se puede llegar al ascensor`);
  }
  console.log(`✓ ${id} (${w}x${m.tiles.length}) — ${vis.size} baldosas alcanzables`);
}
const ubicados = new Set(Object.values(MAPAS).flatMap((m) => (m.npcs || []).map((n) => n.id)));
PERSONAJES.filter((p) => !p.extra && !ubicados.has(p.id)).forEach((p) => err(`${p.id} no está en ningún mapa`));
const sal = MAPAS.salida.despedida.length, n = PERSONAJES.filter((p) => !p.extra).length;
if (sal < n) err(`salida: ${sal} lugares para ${n} compañeros`);
console.log(errores ? `\n${errores} error(es)` : '\nTodo OK');
process.exit(errores ? 1 : 0);
