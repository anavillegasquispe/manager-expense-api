# Manager Expense API

API REST para la gestión de gastos e ingresos personales (Módulo III – Programación Backend Moderna).

## Qué incluye

- **Clean Architecture**: `domain` (entidades, errores, contratos) → `application` (casos de uso) → `infrastructure` (MongoDB, MySQL, seguridad, Swagger) → `presentation` (controladores, rutas, middlewares).
- **Servidor Express** con CORS, `express.json`, Morgan, logger propio y manejador global de errores.
- **Rutas REST** versionadas bajo `/api/v1`: `auth`, `currencies`, `categories`, `transactions`, `budgets`, `reports`.
- **Middlewares**: `auth.middleware` (valida JWT Bearer), `role.middleware` (autorización por rol), `logger.middleware`.
- **Autenticación y autorización**: registro/login con contraseñas hasheadas (bcrypt) y JWT; login y registro son públicos, el resto está protegido.
- **Bases de datos**: MongoDB (monedas y usuarios) y MySQL vía Sequelize (categorías, transacciones, presupuestos, auditoría), con datos semilla.
- **Documentación** con Swagger / OpenAPI 3.0 en `/api-docs`.

## Mejoras propias (AVQ)

| Mejora | Detalle |
|---|---|
| **Seguridad en el registro** | El rol ya no se toma del body: todo registro público es `user`. Antes cualquiera podía registrarse como admin enviando `"role": "admin"`. |
| **Autorización por rol aplicada** | `roleMiddleware` existía pero no se usaba. Ahora `POST /currencies` (modificar tipos de cambio) es solo para `admin`; un `user` recibe **403**. |
| **Admin inicial** | Se crea al arrancar a partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`. |
| **Corrección de `AppError`** | Usaba `error.captureStackTrace` (ReferenceError); corregido a `Error.captureStackTrace`. |
| **Manejador global de errores** | Respeta el `statusCode` de los `AppError` (400, 401, 403, 404, 409) en lugar de devolver siempre 500. |
| **Swagger** | Esquema `Error` y respuestas reutilizables `Unauthorized` (401) y `Forbidden` (403) en `components`. |

## Cómo ejecutarlo

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo `.env` a partir de `envexample` y completar los valores:
   ```
   PORT=3000
   JWT_SECRET=<clave secreta>
   MONGO_URI=<cadena de conexión de MongoDB>
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=<password>
   MYSQL_DB=bd_gastos
   ADMIN_EMAIL=<correo del admin inicial>
   ADMIN_PASSWORD=<password del admin inicial>
   ```
   La base de datos MySQL indicada en `MYSQL_DB` debe existir.
3. Levantar el servidor:
   ```bash
   npm run dev
   ```
4. Verificar:
   - Salud: `GET http://localhost:3000/api/v1/health`
   - Documentación: `http://localhost:3000/api-docs`

## Flujo de prueba

1. `POST /api/v1/auth/register` con `name`, `email`, `password`.
2. `POST /api/v1/auth/login` → devuelve el `token`.
3. En Swagger presionar **Authorize** y pegar el token (o enviar `Authorization: Bearer <token>`) para consumir los endpoints protegidos.
