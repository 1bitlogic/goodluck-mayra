// Recorrido automático del juego en Chromium real, con capturas.
// Uso: NODE_PATH=<carpeta con playwright>/node_modules node pruebas/recorrido.js <carpeta-capturas>
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || 'capturas';
const url = 'file://' + path.resolve(__dirname, '../index.html');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 704 }, deviceScaleFactor: 1 });
  const errores = [];
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__juego && window.__juego.estado === 'titulo');
  await sleep(700);
  await page.screenshot({ path: `${out}/01-titulo.png` });

  const tecla = async (k, n = 1, pausa = 120) => { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await sleep(pausa); } };
  const estado = () => page.evaluate(() => { const G = window.__juego; return { e: G.estado, mapa: G.mapa && G.mapa.id, x: G.jugador && G.jugador.x, y: G.jugador && G.jugador.y, dlg: !!G.dialogo, el: !!G.eleccion, ocupado: G.ocupado, vis: G.visitados.size }; });
  // avanzar hasta que no haya diálogo
  const pasarDialogos = async (max = 40) => { for (let i = 0; i < max; i++) { const s = await estado(); if (!s.dlg && !s.el && !s.ocupado) return; if (s.el) await tecla('Enter'); else await tecla('Enter', 1, 260); } };

  await tecla('Enter');
  await sleep(900);
  await page.screenshot({ path: `${out}/02-intro.png` });
  await pasarDialogos();
  await sleep(1200);
  await page.screenshot({ path: `${out}/03-oficina2.png` });

  // caminar: desde (6,9) ir a hablar con David en (4,3)
  const mover = async (k, n) => { for (let i = 0; i < n; i++) { await page.keyboard.down(k); await sleep(250); await page.keyboard.up(k); await sleep(40); } };
  await mover('ArrowLeft', 2); // (4,9)
  await mover('ArrowUp', 1);   // (4,8)? escritorio en (5..7,8) => (4,8) libre
  await mover('ArrowUp', 3);   // (4,5)
  await mover('ArrowUp', 1);   // (4,4)
  console.log('posición antes de hablar', await estado());
  await mover('ArrowUp', 1);   // mira a David (4,3)
  await tecla('Enter');
  await sleep(1500);
  await page.screenshot({ path: `${out}/04-david.png` });
  // avanzar hasta la pregunta
  for (let i = 0; i < 30; i++) { const s = await estado(); if (s.el) break; await tecla('Enter', 1, 300); }
  await sleep(300);
  await page.screenshot({ path: `${out}/05-pregunta.png` });
  await tecla('ArrowDown'); await tecla('Enter');
  for (let i = 0; i < 30; i++) { const s = await estado(); if (!s.dlg && !s.el && !s.ocupado) break; const reg = await page.evaluate(() => window.__juego.dialogo && window.__juego.dialogo.retrato && window.__juego.dialogo.retrato.width === 16 && !window.__juego.dialogo.nombre); if (reg) { await sleep(400); await page.screenshot({ path: `${out}/06-regalo.png` }); } await tecla('Enter', 1, 300); }
  console.log('tras David', await estado());

  // registro
  await tecla('x'); await sleep(400);
  await page.screenshot({ path: `${out}/07-registro.png` });
  await tecla('x'); await sleep(300);

  // teletransportes para revisar el resto de escenarios
  const ir = async (mapa, x, y, dir, shot) => {
    await page.evaluate(([mapa, x, y, dir]) => { const G = window.__juego; G.__cargar ? 0 : 0; window.__ir(mapa, x, y, dir); }, [mapa, x, y, dir]);
    await sleep(3200);
    await page.screenshot({ path: `${out}/${shot}.png` });
  };
  await ir('oficina2', 18, 7, 'up', '08-oficina2-derecha');
  await ir('pasillo2', 11, 2, 'up', '09-pasillo2');
  // ascensor
  await tecla('Enter'); await sleep(900);
  await page.screenshot({ path: `${out}/10-ascensor.png` });
  await tecla('ArrowDown'); await tecla('Enter'); await sleep(700);
  await page.screenshot({ path: `${out}/11-viaje.png` });
  await sleep(1500);
  console.log('tras ascensor', await estado());
  await page.screenshot({ path: `${out}/12-pasillo4.png` });
  await ir('oficina4', 10, 7, 'up', '13-oficina4');
  await ir('oficina4', 6, 4, 'left', '14-oficina4-izq');
  await ir('lobby', 9, 8, 'down', '15-lobby');
  // salida bloqueada
  await mover('ArrowDown', 2); await sleep(1500);
  await page.screenshot({ path: `${out}/16-bloqueo.png` });
  await pasarDialogos();
  // completar todos y salir
  await page.evaluate(() => { const G = window.__juego; window.PERSONAJES.filter((p) => !p.extra).forEach((p) => G.visitados.add(p.id)); });
  await sleep(300);
  await mover('ArrowDown', 1); await sleep(600);
  await mover('ArrowDown', 1);
  await sleep(2600);
  await page.screenshot({ path: `${out}/17-salida.png` });
  await pasarDialogos(4);
  await sleep(3800);
  await page.screenshot({ path: `${out}/18-despedida.png` });
  await tecla('Enter', 1, 400); await sleep(200);
  await page.screenshot({ path: `${out}/19-todos.png` });
  await pasarDialogos();
  await sleep(3500);
  console.log('final', await estado());
  await page.screenshot({ path: `${out}/20-creditos.png` });
  await sleep(9000);
  await page.screenshot({ path: `${out}/21-creditos2.png` });

  console.log('mapas:', await page.evaluate(() => window.__erroresMapas));
  console.log('errores consola:', errores.length ? errores : 'ninguno');
  await browser.close();
})();
