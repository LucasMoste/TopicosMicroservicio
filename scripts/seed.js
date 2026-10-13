// Carga la semilla data/promociones.json en MongoDB (idempotente: upsert por id).
// Uso: npm run seed            -> upsert
//      npm run seed -- --reset -> borra la colección y la recarga
require('dotenv').config();
const path = require('path');
const db = require('../src/db');

const seed = require(path.join(__dirname, '..', 'data', 'promociones.json'));

async function main() {
  await db.connect();
  const col = db.collection();

  if (process.argv.includes('--reset')) {
    await col.deleteMany({});
    console.log('Colección vaciada.');
  }

  await col.createIndex({ id: 1 }, { unique: true });
  await col.createIndex({ categoriaId: 1 });
  await col.createIndex({ productoId: 1 });

  const ops = seed.map((doc) => ({
    replaceOne: { filter: { id: doc.id }, replacement: doc, upsert: true },
  }));
  const result = await col.bulkWrite(ops);

  console.log(
    `Semilla cargada en "${db.getDb().databaseName}.${col.collectionName}": ` +
      `${result.upsertedCount} insertados, ${result.modifiedCount} actualizados. ` +
      `Total: ${await col.countDocuments()}`
  );
  await db.close();
}

main().catch(async (err) => {
  console.error('Error cargando la semilla:', err.message);
  await db.close();
  process.exit(1);
});
