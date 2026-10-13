const express = require('express');
const { getDb, COLLECTION } = require('../db');
const { version } = require('../../package.json');

const router = express.Router();

// GET /health -> 200 si el servicio y la base de datos están operativos
router.get('/', async (req, res) => {
  try {
    await getDb().command({ ping: 1 });
    res.json({
      status: 'ok',
      service: (process.env.SERVICE_NAME || '').trim() || 'promociones-service',
      collection: COLLECTION,
      version,
    });
  } catch (err) {
    res.status(503).json({ error: 'unavailable', message: 'Base de datos no disponible.' });
  }
});

module.exports = router;
