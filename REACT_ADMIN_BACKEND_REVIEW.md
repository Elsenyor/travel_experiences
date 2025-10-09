# Revisión del Backend para React Admin Panel

## Fecha de Revisión

Completado el análisis y actualización del backend para garantizar compatibilidad total con React Admin.

## Resumen Ejecutivo

✅ **Estado General: LISTO PARA REACT ADMIN**

El backend de Asia Experiences ha sido completamente revisado y actualizado para garantizar compatibilidad total con React Admin Panel. Todos los controladores principales ahora implementan:

- Formateadores de respuesta compatibles con React Admin
- Middlewares de React Admin para paginación, filtrado y ordenamiento
- Operaciones en masa (bulk delete/update)
- Cabeceras Content-Range para paginación
- Manejo de errores unificado con AppError

---

## Middlewares de React Admin

### ✅ Implementados y Funcionando

1. **`react-admin.middleware.js`**

   - Transforma parámetros de React Admin (`_start`, `_end`, `_sort`, `_order`, `_filter`, `q`)
   - Maneja dos formatos de paginación: `_start/_end` y `_page/_perPage`
   - Procesa filtros y búsquedas globales
   - Gestiona inclusión/exclusión de relaciones

2. **`content-range.middleware.js`**

   - Añade cabeceras `Content-Range` requeridas por React Admin
   - Formato: `resource start-end/total`
   - Expone cabeceras CORS necesarias

3. **`bulk-operations.middleware.js`**

   - Procesa operaciones de eliminación masiva
   - Procesa operaciones de actualización masiva
   - Retorna resultados con estadísticas (exitosos/fallidos)

4. **`relations.middleware.js`**
   - Maneja relaciones anidadas en respuestas
   - Permite incluir/excluir relaciones según parámetros

---

## Controladores Actualizados

### 1. ✅ Trips Controller (`trips.controller.js`)

**Estado: ACTUALIZADO COMPLETAMENTE**

#### Funciones React Admin Compatible:

- `getAllTrips()` - getList con filtros (destination, trip_type, price, featured)
- `getTripById()` - getOne con imágenes y fechas incluidas
- `createTrip()` - create con traducciones
- `updateTrip()` - update con soporte de traducciones
- `deleteTrip()` - delete
- `bulkDeleteTrips()` - deleteMany ⭐ **NUEVO**
- `bulkUpdateTrips()` - updateMany ⭐ **NUEVO**

#### Endpoints Adicionales:

- `addTripImage()` - Gestión de imágenes de viaje
- `addAvailableDate()` - Gestión de fechas disponibles
- `getTripImages()` - Lista de imágenes
- `getTripDates()` - Lista de fechas disponibles
- `updateTripTranslation()` - Actualización de traducciones específicas

#### Características:

- ✅ Formateadores React Admin (`formatReactAdminList`, `formatReactAdminGetOne`, `formatReactAdminSave`)
- ✅ Content-Range headers
- ✅ Filtrado por múltiples criterios
- ✅ Ordenamiento dinámico
- ✅ Paginación
- ✅ Búsqueda global
- ✅ Soporte multilenguaje
- ✅ Manejo de relaciones (imágenes, fechas)
- ✅ Operaciones masivas

**Rutas Actualizadas:**

- Middlewares React Admin aplicados globalmente
- Endpoints bulk operations añadidos
- Autenticación con `authenticateToken` y `checkRole("admin")`
- Documentación Swagger actualizada

---

### 2. ✅ Articles Controller (`articles.controller.js`)

**Estado: YA ESTABA BIEN PREPARADO**

#### Funciones React Admin Compatible:

- `searchArticles()` - getList
- `getArticleById()` - getOne con tags
- `createArticle()` - create
- `updateArticle()` - update
- `deleteArticle()` - delete
- `bulkDeleteArticles()` - deleteMany
- `bulkUpdateArticles()` - updateMany

#### Características:

- ✅ Filtrado por autor, tags, idioma
- ✅ Búsqueda en contenido
- ✅ Gestión de traducciones
- ✅ Relaciones con tags
- ✅ Operaciones masivas

---

### 3. ✅ Bookings Controller (`bookings.controller.js`)

**Estado: YA ESTABA BIEN PREPARADO**

#### Funciones React Admin Compatible:

- `searchBookings()` - getList
- `getBookingById()` - getOne
- `createBooking()` - create
- `updateBooking()` - update
- `deleteBooking()` - delete
- `bulkDeleteBookings()` - deleteMany
- `bulkUpdateBookings()` - updateMany

#### Endpoints Adicionales:

- `getUserBookings()` - Reservas por usuario
- `getTripBookings()` - Reservas por viaje
- `getBookingStatistics()` - Estadísticas para dashboard
- `changeBookingStatus()` - Cambio de estado (pending/confirmed/cancelled)

#### Características:

- ✅ Filtrado por usuario, viaje, estado, fechas
- ✅ Validación de disponibilidad
- ✅ Gestión de plazas disponibles
- ✅ Cambio de estado
- ✅ Estadísticas para dashboard

---

### 4. ✅ Newsletter Subscribers Controller (`newsletter-subscribers.controller.js`)

**Estado: YA ESTABA BIEN PREPARADO**

#### Funciones React Admin Compatible:

- `searchSubscribers()` - getList
- `getSubscriberById()` - getOne
- `createSubscriber()` - create
- `updateSubscriber()` - update
- `deleteSubscriber()` - delete
- `bulkDeleteSubscribers()` - deleteMany
- `bulkUpdateSubscribers()` - updateMany

#### Endpoints Públicos:

- `subscribe()` - Suscripción pública desde formularios
- `unsubscribe()` - Desuscripción pública desde emails

#### Características:

- ✅ Filtrado por estado y idioma preferido
- ✅ Búsqueda por email
- ✅ Prevención de duplicados
- ✅ Gestión de estado (active/unsubscribed)

---

### 5. ✅ FAQ Controller (`faq.controller.js`)

**Estado: ACTUALIZADO COMPLETAMENTE**

#### Funciones React Admin Compatible:

- `getAllFaqs()` - getList ⭐ **ACTUALIZADO**
- `getFaqById()` - getOne ⭐ **ACTUALIZADO**
- `createFaq()` - create ⭐ **ACTUALIZADO**
- `updateFaq()` - update ⭐ **NUEVO**
- `deleteFaq()` - delete ⭐ **ACTUALIZADO**
- `bulkDeleteFaqs()` - deleteMany ⭐ **NUEVO**
- `bulkUpdateFaqs()` - updateMany ⭐ **NUEVO**

#### Endpoints Adicionales:

- `updateFaqTranslation()` - Actualización de traducciones específicas

#### Características:

- ✅ Gestión de posición de ordenamiento (`order_position`)
- ✅ Soporte multilenguaje
- ✅ Búsqueda en preguntas y respuestas
- ✅ Operaciones masivas

**Rutas Actualizadas:**

- Middlewares React Admin aplicados
- Endpoints bulk operations añadidos
- PUT `/:id` para actualización general
- Documentación Swagger añadida

---

### 6. ✅ User Controller (`user.controller.js`)

**Estado: YA ESTABA BIEN PREPARADO**

#### Funciones React Admin Compatible:

- `searchUsers()` - getList
- `getUserById()` - getOne
- `createUser()` - create
- `updateUser()` - update
- `deleteUser()` - delete
- `bulkDeleteUsers()` - deleteMany
- `bulkUpdateUsers()` - updateMany

#### Características:

- ✅ Filtrado por rol, estado
- ✅ Búsqueda por nombre/email
- ✅ Gestión de roles
- ✅ Protección de datos sensibles (passwords no se exponen)

---

### 7. ✅ Newsletter Campaigns Controller

**Estado: YA VERIFICADO - BIEN PREPARADO**

Gestiona las campañas de newsletter con soporte completo para React Admin.

---

### 8. ✅ Newsletter Sends Controller

**Estado: YA VERIFICADO - BIEN PREPARADO**

Gestiona el envío de newsletters con tracking y estadísticas.

---

## Gestión de Imágenes y Banners

### Implementación Actual

#### Trip Images (`trip.images.model.js` + endpoints en `trips.controller.js`)

**Funcionalidad:**

- ✅ Subida de imágenes por URL
- ✅ Gestión de imágenes principales (`is_primary`)
- ✅ Descripción de imágenes
- ✅ Orden de visualización
- ✅ Múltiples imágenes por viaje

**Endpoints Disponibles:**

- `POST /api/v1/trips/:id/images` - Añadir imagen a viaje
- `GET /api/v1/trips/:id/images` - Listar imágenes de viaje

**Campos en base de datos:**

```sql
trip_images:
  - id (UUID)
  - trip_id (FK)
  - url (VARCHAR 500)
  - description (TEXT)
  - is_primary (BOOLEAN)
  - display_order (INT)
  - created_at
```

#### Article Featured Images

Los artículos tienen soporte para imagen destacada (`featured_image`) directamente en el modelo.

### Recomendaciones para Banners del Home

Para gestionar banners de la página principal, se recomienda:

**Opción 1: Tabla dedicada de Banners**

```sql
CREATE TABLE banners (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255),
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Opción 2: Usar featured trips**
Marcar viajes como `featured=true` y usar sus imágenes principales como banners del home.

**Opción 3: Configuración en Frontend**
Gestionar banners estáticos desde el código del frontend con posibilidad de configuración.

---

## Utilidades de Respuesta

### `response.formatter.js`

```javascript
// Formateadores React Admin
formatReactAdminList(data, total); // Para listas
formatReactAdminGetOne(data); // Para obtener uno
formatReactAdminSave(data); // Para create/update/delete

// Formateadores Genéricos
formatSuccess(data, message);
formatPaginatedResponse(data, total, pagination);
formatError(message, statusCode, errors);
```

---

## Rutas Actualizadas con Middlewares React Admin

### Aplicación de Middlewares

Todas las rutas principales ahora aplican los middlewares de React Admin:

```javascript
// Patrón aplicado en:
// - trips.routes.js ✅
// - articles.routes.js ✅
// - bookings.routes.js ✅
// - newsletter-subscribers.routes.js ✅
// - faq.routes.js ✅
// - user.routes.js ✅

router.use(handleReactAdminParams);
router.use(handleBulkOperations);
router.use(parseRelationParams);
```

### Endpoints Bulk Operations

Todos los recursos principales ahora tienen:

```javascript
POST / api / v1 / { resource } / bulk / delete POST / api / v1 / { resource } / bulk / update;
```

Recursos con bulk operations:

- ✅ Trips
- ✅ Articles
- ✅ Bookings
- ✅ Newsletter Subscribers
- ✅ FAQs
- ✅ Users

---

## Autenticación y Permisos

### Middleware de Autenticación

Se usa `authenticateToken` y `checkRole("admin")` para proteger endpoints administrativos:

```javascript
// Lectura (GET) - Generalmente público o autenticado
router.get("/", controller.getAll);

// Escritura (POST/PUT/DELETE) - Solo admin
router.post("/", authenticateToken, checkRole("admin"), controller.create);
router.put("/:id", authenticateToken, checkRole("admin"), controller.update);
router.delete("/:id", authenticateToken, checkRole("admin"), controller.delete);

// Bulk Operations - Solo admin
router.post("/bulk/delete", authenticateToken, checkRole("admin"), controller.bulkDelete);
router.post("/bulk/update", authenticateToken, checkRole("admin"), controller.bulkUpdate);
```

---

## Documentación Swagger

### Estado Actual

✅ Todos los endpoints están documentados con Swagger/OpenAPI

### Cobertura:

- ✅ Trips - Completo con bulk operations
- ✅ Articles - Completo
- ✅ Bookings - Completo
- ✅ Newsletter - Completo
- ✅ FAQs - Completo con bulk operations
- ✅ Users - Completo
- ✅ Auth - Completo

### Acceso a Documentación:

```
http://localhost:3000/api-docs
```

---

## Características Multilenguaje

Todos los recursos con contenido traducible implementan:

### Soporte de Idiomas:

- 🇪🇸 Español (es) - Por defecto
- 🇬🇧 Inglés (en)
- 🔧 Escalable a más idiomas

### Tablas de Traducción:

- ✅ `trip_translations` (title, description, itinerary)
- ✅ `article_translations` (title, content)
- ✅ `faq_translations` (question, answer)

### Parámetros de Idioma:

```javascript
// Query parameter
?language=es

// En filtros React Admin
{ language: 'en' }
```

---

## Verificación de Modelos

### Modelos con Métodos React Admin Compatible:

#### ✅ trip.model.js

- `findByFilters()` - Con soporte de paginación, ordenamiento y filtros
- `countByFilters()` - Para total de registros
- `create()` - Con traducciones
- `update()` - Con validación
- `remove()` - Con cascada
- Métodos auxiliares: `getTripImages()`, `getAvailableDates()`, `addImage()`, `addAvailableDate()`

#### ✅ articles.model.js

- Métodos completos para React Admin
- Gestión de traducciones
- Relación con tags

#### ✅ booking.model.js

- Validación de disponibilidad
- Actualización automática de plazas
- Métodos de estadísticas

#### ✅ Otros modelos

Todos implementan los métodos base requeridos por React Admin.

---

## Recomendaciones para el Desarrollo del Panel Admin

### 1. Data Provider

Crear un `dataProvider` personalizado que:

- Mapee las operaciones CRUD de React Admin a los endpoints
- Maneje los parámetros de filtrado correctamente
- Procese los headers Content-Range

```javascript
const dataProvider = {
  getList: (resource, params) => {
    // Map to _start, _end, _sort, _order, filters
  },
  getOne: (resource, params) => { ... },
  create: (resource, params) => { ... },
  update: (resource, params) => { ... },
  delete: (resource, params) => { ... },
  deleteMany: (resource, params) => { ... },
  updateMany: (resource, params) => { ... },
};
```

### 2. Auth Provider

Configurar autenticación con:

- Login con email/password o Google OAuth
- Almacenamiento de token JWT
- Verificación de rol admin
- Refresh token automático

### 3. Recursos a Implementar

#### Trips

- Lista con filtros (destino, tipo, precio, destacado)
- Formulario con tabs (Info general, Traducciones, Imágenes, Fechas)
- Campo de imágenes con drag & drop y marcación de principal
- Gestión de fechas disponibles con plazas
- Preview antes de publicar

#### Articles

- Editor de texto rico (TinyMCE o similar)
- Gestión de traducciones
- Selector de tags
- Imagen destacada
- Programación de publicación

#### Bookings

- Lista con filtros por fecha, estado, viaje
- Vista de detalle con información del usuario y viaje
- Botones de acción rápida (Confirmar/Cancelar)
- Exportación a CSV/Excel
- Gráficos de estadísticas

#### Newsletter

- Gestión de suscriptores con filtros
- Creador de campañas con editor de emails
- Plantillas predefinidas
- Preview de email
- Programación de envío
- Dashboard de estadísticas (aperturas, clicks)

#### FAQs

- Lista ordenable por drag & drop (usar `order_position`)
- Edición inline de traducciones
- Agrupación por categorías (futuro)

#### Users

- Gestión de roles
- Bloqueo/desbloqueo
- Resetear contraseña
- Filtros por rol y estado

### 4. Dashboard

Crear un dashboard administrativo con:

- Estadísticas generales (viajes totales, reservas, usuarios)
- Gráfico de reservas por mes
- Viajes más populares
- Últimas reservas
- Alertas (plazas agotándose, reservas pendientes)

### 5. Configuración de Imágenes

Para la subida de imágenes, considerar:

- Integración con servicio de almacenamiento (AWS S3, Cloudinary, etc.)
- Validación de tamaño y formato
- Optimización automática
- Generación de thumbnails
- Gestión de URLs relativas/absolutas

---

## Próximos Pasos

### Backend (Opcionales/Mejoras):

1. **Gestión de Banners**

   - Crear tabla y modelo dedicado para banners del home
   - Controller y rutas específicas
   - Orden y activación/desactivación

2. **Caché**

   - Implementar caché con Redis para listados frecuentes
   - Cache de traducciones

3. **Optimización de Consultas**

   - Índices en campos de filtrado frecuente
   - Eager loading de relaciones

4. **Webhooks**

   - Notificaciones en tiempo real para nuevas reservas
   - Integración con servicios externos

5. **Logs y Auditoría**
   - Registro de cambios en entidades críticas
   - Historial de modificaciones

### Frontend React Admin:

1. **Configuración Inicial**

   - Instalación de react-admin
   - Configuración de dataProvider
   - Configuración de authProvider
   - Tema personalizado

2. **Implementación de Recursos**

   - Trips (prioridad alta)
   - Bookings (prioridad alta)
   - Articles
   - Newsletter
   - FAQs
   - Users

3. **Componentes Personalizados**

   - Input de traducción multilenguaje
   - Selector de imágenes con preview
   - Editor de fechas disponibles
   - Selector de tags

4. **Dashboard**
   - Gráficos con Recharts
   - Widgets de estadísticas
   - Lista de últimas acciones

---

## Conclusión

✅ **El backend está completamente preparado para React Admin Panel**

Todos los controladores principales han sido actualizados/verificados para garantizar:

- ✅ Compatibilidad total con React Admin
- ✅ Formateadores de respuesta correctos
- ✅ Middlewares aplicados correctamente
- ✅ Operaciones masivas implementadas
- ✅ Documentación Swagger completa
- ✅ Autenticación y autorización implementada
- ✅ Soporte multilenguaje
- ✅ Gestión de relaciones

**Recursos Listos para React Admin:**

1. ✅ Trips - ACTUALIZADO
2. ✅ Articles - VERIFICADO
3. ✅ Bookings - VERIFICADO
4. ✅ Newsletter Subscribers - VERIFICADO
5. ✅ Newsletter Campaigns - VERIFICADO
6. ✅ Newsletter Sends - VERIFICADO
7. ✅ FAQs - ACTUALIZADO
8. ✅ Users - VERIFICADO

**Próximo paso recomendado:**
Comenzar con el desarrollo del panel React Admin, empezando por la configuración del Data Provider y Auth Provider, y luego implementando los recursos en orden de prioridad (Trips → Bookings → Articles → Newsletter → FAQs → Users).
