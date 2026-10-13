// Pruebas de contrato contra http://localhost:3000 (o BASE_URL)
const BASE = process.env.BASE_URL || 'http://localhost:3000';
let ok = 0, fail = 0;

async function check(name, path, expectStatus, assertFn) {
  try {
    const r = await fetch(BASE + path);
    const body = await r.json();
    const statusOk = r.status === expectStatus;
    const extra = statusOk && assertFn ? assertFn(body) : true;
    if (statusOk && extra === true) { ok++; console.log(`  OK   ${name}`); }
    else { fail++; console.log(`  FAIL ${name} -> ${r.status} ${typeof extra === 'string' ? extra : ''} ${JSON.stringify(body).slice(0, 200)}`); }
  } catch (e) { fail++; console.log(`  FAIL ${name} -> ${e.message}`); }
}

const ids = (b) => b.items.map((i) => i.id).join(',');
const isErr = (code) => (b) => (b.error === code && typeof b.message === 'string') || 'formato de error';

(async () => {
  console.log(`Probando ${BASE}\n`);
  await check('health', '/health', 200, (b) => (b.status === 'ok' && b.collection === 'promociones') || 'campos');
  await check('lista default (20, orden id, sin _id)', '/items', 200, (b) =>
    (b.total === 12 && b.limit === 20 && b.offset === 0 && b.items.length === 12 && b.items[0].id === 'PRM001' && !('_id' in b.items[0]) && b.items[11].id === 'PRM012') || ids(b));
  await check('paginación limit=5 offset=10', '/items?limit=5&offset=10', 200, (b) => (b.total === 12 && ids(b) === 'PRM011,PRM012') || ids(b));
  await check('categoriaId=CAT03', '/items?categoriaId=CAT03', 200, (b) => (ids(b) === 'PRM005,PRM008' && b.total === 2) || ids(b));
  await check('categoriaId case-insensitive', '/items?categoriaId=cat03', 200, (b) => b.total === 2 || ids(b));
  await check('productoId=PRD005', '/items?productoId=PRD005', 200, (b) => ids(b) === 'PRM003' || ids(b));
  await check('vigente=true fecha=2026-10-13', '/items?vigente=true&fecha=2026-10-13', 200, (b) =>
    (ids(b) === 'PRM001,PRM002,PRM003,PRM006,PRM007,PRM009,PRM010' && b.total === 7) || ids(b));
  await check('vigente=false fecha=2026-10-13', '/items?vigente=false&fecha=2026-10-13', 200, (b) =>
    (ids(b) === 'PRM004,PRM005,PRM008,PRM011,PRM012' && b.total === 5) || ids(b));
  await check('bordes inclusivos (fechaFin)', '/items?vigente=true&fecha=2026-10-18&categoriaId=CAT02', 200, (b) => ids(b) === 'PRM001' || ids(b));
  await check('AND: CAT03 + vigente=true', '/items?categoriaId=CAT03&vigente=true&fecha=2026-11-28', 200, (b) => ids(b) === 'PRM005' || ids(b));
  await check('total con paginación', '/items?vigente=true&fecha=2026-10-13&limit=2', 200, (b) => (b.total === 7 && b.items.length === 2) || ids(b));
  await check('detalle PRM001', '/items/PRM001', 200, (b) => (b.id === 'PRM001' && b.productoId === null && !('_id' in b)) || 'campos');
  await check('404 PRM999', '/items/PRM999', 404, isErr('not_found'));
  await check('400 limit=0', '/items?limit=0', 400, isErr('bad_request'));
  await check('400 limit=101', '/items?limit=101', 400, isErr('bad_request'));
  await check('400 limit=abc', '/items?limit=abc', 400, isErr('bad_request'));
  await check('400 offset=-1', '/items?offset=-1', 400, isErr('bad_request'));
  await check('400 vigente=si', '/items?vigente=si', 400, isErr('bad_request'));
  await check('400 fecha inválida', '/items?fecha=2026-02-30', 400, isErr('bad_request'));
  await check('400 categoriaId mal formado', '/items?categoriaId=XYZ', 400, isErr('bad_request'));
  await check('400 productoId mal formado', '/items?productoId=CAT01', 400, isErr('bad_request'));
  await check('CORS / docs disponibles', '/', 200);

  console.log(`\n${ok} OK, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
