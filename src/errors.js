// Errores con el formato del contrato: { "error": "<codigo>", "message": "<detalle>" }
class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const badRequest = (message) => new HttpError(400, 'bad_request', message);
const notFound = (message) => new HttpError(404, 'not_found', message);

module.exports = { HttpError, badRequest, notFound };
