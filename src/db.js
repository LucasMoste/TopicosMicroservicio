const { MongoClient } = require('mongodb');

// Nombre lógico según el contrato (se informa en /health)
const COLLECTION = 'promociones';
// Nombre físico en MongoDB (sensible a mayúsculas). Configurable por si difiere.
const collectionName = () => (process.env.COLLECTION_NAME || '').trim() || COLLECTION;

let client;
let db;

async function connect() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) throw new Error('Falta la variable de entorno MONGODB_URI');

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db((process.env.DB_NAME || '').trim() || 'ecommerce');
  return db;
}

function getDb() {
  if (!db) throw new Error('La base de datos no está conectada');
  return db;
}

function collection() {
  return getDb().collection(collectionName());
}

async function close() {
  if (client) await client.close();
}

module.exports = { connect, getDb, collection, close, COLLECTION };
