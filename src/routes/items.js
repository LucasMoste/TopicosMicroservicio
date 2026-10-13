const express = require('express');
const { collection } = require('../db');
const { notFound } = require('../errors');
const {
  parseIntParam,
  parsePatternParam,
  parseBoolParam,
  parseDateParam,
  todayUTC,
} = require('../validators');

const router = express.Router();

// Nunca exponemos el _id interno de Mongo: la clave es "id".
const PROJECTION = { _id: 0 };

// GET /items -> lista paginada, ordenada por id ascendente
router.get('/', async (req, res, next) => {
  try {
    const q = req.query;
    const limit = parseIntParam(q, 'limit', { min: 1, max: 100, def: 20 });
    const offset = parseIntParam(q, 'offset', { min: 0, def: 0 });
    const categoriaId = parsePatternParam(q, 'categoriaId', 'CAT');
    const productoId = parsePatternParam(q, 'productoId', 'PRD');
    const vigente = parseBoolParam(q, 'vigente');
    const fecha = parseDateParam(q, 'fecha') || todayUTC();

    // Filtros combinados con AND
    const filter = {};
    if (categoriaId) filter.categoriaId = categoriaId;
    if (productoId) filter.productoId = productoId;
    if (vigente === true) {
      // fechaInicio <= fecha <= fechaFin (YYYY-MM-DD se compara bien como string)
      filter.fechaInicio = { $lte: fecha };
      filter.fechaFin = { $gte: fecha };
    } else if (vigente === false) {
      filter.$or = [{ fechaInicio: { $gt: fecha } }, { fechaFin: { $lt: fecha } }];
    }

    const col = collection();
    const [items, total] = await Promise.all([
      col.find(filter, { projection: PROJECTION }).sort({ id: 1 }).skip(offset).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    res.json({ items, total, limit, offset });
  } catch (err) {
    next(err);
  }
});

// GET /items/:id -> detalle o 404
router.get('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id).trim().toUpperCase();
    const item = await collection().findOne({ id }, { projection: PROJECTION });
    if (!item) throw notFound(`No existe ${req.params.id}.`);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
