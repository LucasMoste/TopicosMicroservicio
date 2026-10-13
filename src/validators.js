const { badRequest } = require('./errors');

// Toma un query param como string único; si viene repetido (?a=1&a=2) es inválido.
function single(query, name) {
  const value = query[name];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw badRequest(`El parámetro ${name} debe enviarse una sola vez.`);
  return value;
}

function parseIntParam(query, name, { min, max, def }) {
  const raw = single(query, name);
  if (raw === undefined) return def;
  if (!/^-?\d+$/.test(raw)) throw badRequest(`El parámetro ${name} debe ser un número entero.`);
  const n = Number(raw);
  if (n < min || (max !== undefined && n > max)) {
    const rango = max !== undefined ? `entre ${min} y ${max}` : `mayor o igual a ${min}`;
    throw badRequest(`El parámetro ${name} debe estar ${rango}.`);
  }
  return n;
}

// Texto con patrón tipo ^CAT[0-9]+$. La comparación no distingue mayúsculas,
// así que se normaliza a mayúsculas antes de validar.
function parsePatternParam(query, name, prefix) {
  const raw = single(query, name);
  if (raw === undefined) return undefined;
  const value = raw.trim().toUpperCase();
  if (!new RegExp(`^${prefix}[0-9]+$`).test(value)) {
    throw badRequest(`El parámetro ${name} debe tener el formato ${prefix} seguido de números (ej: ${prefix}01).`);
  }
  return value;
}

function parseBoolParam(query, name) {
  const raw = single(query, name);
  if (raw === undefined) return undefined;
  const v = raw.toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  throw badRequest(`El parámetro ${name} debe ser true o false.`);
}

// Fecha YYYY-MM-DD real (rechaza 2026-02-30, etc.)
function parseDateParam(query, name) {
  const raw = single(query, name);
  if (raw === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw badRequest(`El parámetro ${name} debe tener formato YYYY-MM-DD.`);
  const d = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== raw) {
    throw badRequest(`El parámetro ${name} no es una fecha válida.`);
  }
  return raw;
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { parseIntParam, parsePatternParam, parseBoolParam, parseDateParam, todayUTC };
