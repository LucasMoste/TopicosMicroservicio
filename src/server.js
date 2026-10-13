require('dotenv').config();
const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 3000;

async function main() {
  await db.connect();
  console.log('Conectado a MongoDB');

  const server = app.listen(PORT, () => {
    console.log(`Microservicio de promociones escuchando en http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await db.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('No se pudo iniciar el servicio:', err.message);
  process.exit(1);
});
