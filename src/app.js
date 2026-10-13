const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const healthRouter = require('./routes/health');
const itemsRouter = require('./routes/items');
const { HttpError } = require('./errors');

const app = express();

// CORS abierto: otros microservicios y el dashboard del profesor deben poder consultarnos
app.use(cors());
app.disable('x-powered-by');

// Contrato OpenAPI: /openapi.yaml (crudo) y /docs (Swagger UI)
const specPath = path.join(__dirname, '..', 'openapi', 'promociones.yaml');
const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));
app.get('/openapi.yaml', (req, res) => res.type('text/yaml').sendFile(specPath));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.get('/', (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME || 'promociones-service',
    collection: 'promociones',
    endpoints: ['GET /health', 'GET /items', 'GET /items/{id}'],
    docs: '/docs',
  });
});

app.use('/health', healthRouter);
app.use('/items', itemsRouter);

// Rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: `Ruta ${req.method} ${req.path} no encontrada.` });
});

// Manejador central de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, message: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: 'Error interno del servidor.' });
});

module.exports = app;
