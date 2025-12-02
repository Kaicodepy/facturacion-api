# API de Facturación - Sistema Completo

API REST para sistema de facturación electrónica desarrollada con Node.js, Express y PostgreSQL.

## 📁 Estructura del Proyecto

```
api-facturacion/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de PostgreSQL
│   ├── controllers/
│   │   ├── clientesController.js   # Lógica de negocio - Clientes
│   │   └── facturasController.js   # Lógica de negocio - Facturas
│   ├── middleware/
│   │   ├── auth.js                 # Autenticación JWT
│   │   └── validateData.js         # Validación de datos
│   ├── models/
│   │   ├── Cliente.js              # Modelo de Cliente
│   │   └── Factura.js              # Modelo de Factura
│   ├── routes/
│   │   ├── clientes.js             # Rutas de clientes
│   │   └── facturas.js             # Rutas de facturas
│   ├── utils/
│   │   └── pdfGenerator.js         # Generador de PDF
│   ├── app.js                      # Configuración de Express
│   └── server.js                   # Punto de entrada
├── .env                            # Variables de entorno
├── package.json
└── README.md
```

##  Instalación

### 1. Clonar o crear el proyecto

```bash
mkdir api-facturacion
cd api-facturacion
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar PostgreSQL

```sql
-- Crear base de datos
CREATE DATABASE facturacion_db;
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto con:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=facturacion_db
DB_USER=postgres
DB_PASSWORD=tu_password

JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRE=7d

FISCAL_API_URL=https://api.fiscal.gob/v1
FISCAL_API_KEY=tu_api_key
```

### 5. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

##  Endpoints disponibles

### **Clientes**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Listar todos los clientes |
| GET | `/api/clientes/:id` | Obtener un cliente |
| POST | `/api/clientes` | Crear nuevo cliente |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Desactivar cliente |

### **Facturas**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/facturas` | Listar todas las facturas |
| GET | `/api/facturas?estado=pendiente` | Filtrar por estado |
| GET | `/api/facturas?clienteId=xxx` | Filtrar por cliente |
| GET | `/api/facturas/:id` | Obtener una factura |
| POST | `/api/facturas` | Crear nueva factura |
| PATCH | `/api/facturas/:id/estado` | Actualizar estado |
| GET | `/api/facturas/:id/pdf` | Descargar PDF |

##  Ejemplos de uso

### Crear un cliente

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "1234567890",
    "rfc_cuit": "PEPJ850101XXX",
    "direccion": "Calle Principal 123"
  }'
```

### Crear una factura

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "uuid-del-cliente",
    "items": [
      {
        "descripcion": "Producto A",
        "cantidad": 2,
        "precio_unitario": 100.50
      },
      {
        "descripcion": "Servicio B",
        "cantidad": 1,
        "precio_unitario": 250.00
      }
    ],
    "notas": "Pago en efectivo"
  }'
```

### Actualizar estado de factura

```bash
curl -X PATCH http://localhost:3000/api/facturas/:id/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "pagada"
  }'
```

##  Autenticación (Opcional)

Para habilitar autenticación JWT, descomenta las líneas en:
- `src/routes/clientes.js`
- `src/routes/facturas.js`

```javascript
router.use(auth);
```

Luego envía el token en los headers:

```bash
curl -X GET http://localhost:3000/api/facturas \
  -H "Authorization: Bearer tu_token_jwt"
```

##  Testing

```bash
npm test
```

##  Tecnologías utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM
- **PDFKit** - Generación de PDF
- **Express Validator** - Validación de datos
- **JWT** - Autenticación
- **Axios** - Cliente HTTP

##  Modelos de datos

### Cliente
```javascript
{
  id: UUID,
  nombre: String,
  email: String (unique),
  telefono: String,
  rfc_cuit: String (unique),
  direccion: Text,
  activo: Boolean
}
```

### Factura
```javascript
{
  id: UUID,
  numero: String (auto),
  clienteId: UUID,
  fecha: Date,
  items: JSONB [],
  subtotal: Decimal,
  impuestos: Decimal,
  total: Decimal,
  estado: Enum ['pendiente', 'pagada', 'cancelada'],
  folio_fiscal: String,
  notas: Text
}
```



##  Licencia

MIT

