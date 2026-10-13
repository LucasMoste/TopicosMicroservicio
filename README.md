# Microservicio de promociones

Servicio REST **de solo lectura** sobre la colección `promociones` (MongoDB Atlas), según el contrato [`openapi/promociones.yaml`](openapi/promociones.yaml).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio y de la DB |
| GET | `/items` | Lista paginada (filtros: `categoriaId`, `productoId`, `vigente`, `fecha`, `limit`, `offset`) |
| GET | `/items/{id}` | Detalle (404 si no existe) |
| GET | `/docs` | Swagger UI |

Ejemplos:

```
GET /items?vigente=true&fecha=2026-10-13
GET /items?categoriaId=CAT03&limit=5&offset=0
GET /items/PRM001
```

## Estructura

```
ms-promociones/
├── data/promociones.json     # semilla
├── openapi/promociones.yaml  # contrato
├── scripts/seed.js           # carga la semilla en MongoDB
├── src/
│   ├── server.js             # entrada (conecta DB + listen)
│   ├── app.js                # express, CORS, swagger, errores
│   ├── db.js                 # conexión MongoDB
│   ├── errors.js             # formato { error, message }
│   ├── validators.js         # validación de query params (400)
│   └── routes/ (health.js, items.js)
└── render.yaml               # blueprint de Render
```

## Desarrollo local

```bash
cp .env.example .env   # completar MONGODB_URI
npm install
npm run seed           # carga los datos en Atlas (npm run seed -- --reset para recargar)
npm run dev            # http://localhost:3000/docs
```

## Deploy en Render

- Build: `npm install` — Start: `npm start` — Health check: `/health`
- Variables: `MONGODB_URI` (secreta), `DB_NAME=Promociones`, `COLLECTION_NAME=Promociones`, `SERVICE_NAME=promociones-service`
- En Atlas → Network Access, permitir `0.0.0.0/0` para que Render pueda conectarse.
