# Guía Completa: Sitemap.xml y Robots.txt

## 📋 Tabla de Contenidos

1. [¿Qué es un Sitemap?](#qué-es-un-sitemap)
2. [¿Qué es Robots.txt?](#qué-es-robotstxt)
3. [Cómo Funcionan](#cómo-funcionan)
4. [Implementación en Asia Experiences](#implementación-en-asia-experiences)
5. [Configuración](#configuración)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Mejores Prácticas](#mejores-prácticas)

---

## ¿Qué es un Sitemap?

### Definición

Un **sitemap.xml** es un archivo XML que lista todas las páginas importantes de tu sitio web. Es como un "mapa" o "índice" que le facilita a los motores de búsqueda (Google, Bing, etc.) descubrir y rastrear todo el contenido de tu sitio.

### ¿Para qué sirve?

1. **Descubrimiento Rápido**: Ayuda a los motores de búsqueda a encontrar páginas nuevas o actualizadas más rápido
2. **Páginas Difíciles de Alcanzar**: Asegura que páginas con pocos enlaces internos sean descubiertas
3. **Prioridades**: Indica qué páginas son más importantes
4. **Frecuencia de Actualización**: Informa con qué frecuencia cambia cada página
5. **Última Modificación**: Indica cuándo se actualizó por última vez una página

### Estructura de un Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://asiaexperiences.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://asiaexperiences.com/trips/japan</loc>
    <lastmod>2024-01-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Elementos del Sitemap

#### 1. `<loc>` (Location) - OBLIGATORIO

- **Qué es**: La URL completa de la página
- **Formato**: Debe empezar con http:// o https://
- **Ejemplo**: `https://asiaexperiences.com/trips/japan`

#### 2. `<lastmod>` (Last Modified) - OPCIONAL

- **Qué es**: Fecha de última modificación de la página
- **Formato**: YYYY-MM-DD o ISO 8601 (YYYY-MM-DDTHH:MM:SS+00:00)
- **Ejemplo**: `2024-01-15` o `2024-01-15T10:30:00+00:00`
- **Uso**: Google usa esto para saber si debe volver a rastrear la página

#### 3. `<changefreq>` (Change Frequency) - OPCIONAL

- **Qué es**: Con qué frecuencia cambia la página
- **Valores posibles**:
  - `always` - Cambia cada vez que se accede
  - `hourly` - Cambia cada hora
  - `daily` - Cambia diariamente
  - `weekly` - Cambia semanalmente
  - `monthly` - Cambia mensualmente
  - `yearly` - Cambia anualmente
  - `never` - Contenido archivado, no cambia
- **Nota**: Es solo una sugerencia, los motores de búsqueda pueden ignorarlo

#### 4. `<priority>` (Priority) - OPCIONAL

- **Qué es**: Importancia relativa de esta página comparada con otras páginas de tu sitio
- **Rango**: De 0.0 (menos importante) a 1.0 (más importante)
- **Valor por defecto**: 0.5
- **Ejemplos**:
  - `1.0` - Página principal
  - `0.9` - Páginas de categorías importantes
  - `0.8` - Páginas de productos/viajes
  - `0.7` - Artículos del blog
  - `0.5` - Páginas secundarias
- **Nota**: Es relativa solo a tu sitio, no afecta tu ranking vs otros sitios

---

## ¿Qué es Robots.txt?

### Definición

El archivo **robots.txt** es un archivo de texto simple que le dice a los robots de los motores de búsqueda (también llamados "crawlers" o "spiders") qué páginas de tu sitio pueden o no pueden visitar.

### ¿Para qué sirve?

1. **Protección**: Evitar que se indexen páginas privadas o administrativas
2. **Eficiencia**: Evitar que los bots pierdan tiempo en páginas irrelevantes
3. **Presupuesto de Rastreo**: Optimizar cómo los bots usan su "presupuesto" de páginas a rastrear
4. **Contenido Duplicado**: Prevenir indexación de páginas con contenido duplicado
5. **Ubicación del Sitemap**: Informar dónde está el sitemap.xml

### Estructura de Robots.txt

```txt
# Comentario: Las líneas que empiezan con # son comentarios

# Regla para todos los robots
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Ubicación del sitemap
Sitemap: https://asiaexperiences.com/sitemap.xml

# Reglas para Google específicamente
User-agent: Googlebot
Crawl-delay: 0

# Reglas para Bing
User-agent: Bingbot
Crawl-delay: 1
```

### Directivas de Robots.txt

#### 1. `User-agent`

- **Qué es**: Especifica a qué robot se aplican las siguientes reglas
- **Valores**:
  - `*` - Todos los robots
  - `Googlebot` - Solo el robot de Google
  - `Bingbot` - Solo el robot de Bing
  - `Baiduspider` - Solo el robot de Baidu
  - etc.

#### 2. `Disallow`

- **Qué es**: Indica qué URLs NO deben ser rastreadas
- **Ejemplos**:
  - `Disallow: /admin/` - No rastrear nada en /admin/
  - `Disallow: /api/` - No rastrear la API
  - `Disallow: /*?sort=` - No rastrear URLs con parámetro sort
  - `Disallow: /` - No rastrear nada del sitio

#### 3. `Allow`

- **Qué es**: Indica qué URLs SÍ pueden ser rastreadas (sobreescribe Disallow)
- **Ejemplo**:
  ```txt
  Disallow: /admin/
  Allow: /admin/public/
  ```
  Esto bloquea todo /admin/ excepto /admin/public/

#### 4. `Sitemap`

- **Qué es**: URL del sitemap
- **Ejemplo**: `Sitemap: https://asiaexperiences.com/sitemap.xml`
- **Nota**: Puede haber múltiples líneas Sitemap

#### 5. `Crawl-delay`

- **Qué es**: Tiempo en segundos que el bot debe esperar entre peticiones
- **Ejemplo**: `Crawl-delay: 10` (esperar 10 segundos)
- **Nota**: No todos los bots lo respetan (Google lo ignora)

---

## Cómo Funcionan

### Flujo de Rastreo de un Motor de Búsqueda

```
1. Bot visita tu sitio
   ↓
2. Primero busca /robots.txt
   ↓
3. Lee las reglas de robots.txt
   ↓
4. Encuentra la ubicación del sitemap.xml
   ↓
5. Lee el sitemap.xml
   ↓
6. Descubre todas las URLs listadas
   ↓
7. Visita y rastrea las URLs permitidas
   ↓
8. Indexa el contenido en su base de datos
```

### ¿Por qué son importantes?

#### Sin Sitemap:

- Los bots encuentran páginas solo siguiendo enlaces
- Páginas nuevas tardan más en ser descubiertas
- Páginas con pocos enlaces pueden no ser descubiertas

#### Con Sitemap:

- Los bots conocen todas tus páginas importantes
- Descubrimiento más rápido de contenido nuevo
- Mejor cobertura de indexación

#### Sin Robots.txt:

- Los bots pueden rastrear páginas que no quieres indexar
- Desperdiciar "presupuesto de rastreo" en páginas irrelevantes
- Posible indexación de páginas de admin, errores, etc.

#### Con Robots.txt:

- Control total sobre qué se rastrea
- Mejor uso del presupuesto de rastreo
- Protección de áreas privadas

---

## Implementación en Asia Experiences

### Estructura de Archivos

```
backend/
├── src/
│   ├── controllers/
│   │   └── seo.controller.js    ← Controlador para servir sitemap y robots.txt
│   ├── routes/
│   │   └── seo.routes.js         ← Rutas SEO
│   └── utils/
│       └── sitemap.generator.js  ← Generador dinámico de sitemap
```

### Características de Nuestra Implementación

#### 1. **Sitemap Dinámico**

- ✅ Se genera en tiempo real consultando la base de datos
- ✅ Siempre actualizado con los últimos viajes y artículos
- ✅ No necesita regeneración manual
- ✅ Incluye multilenguaje (ES/EN)

#### 2. **Sitemap Modular**

Ofrecemos varios sitemaps:

- **`/sitemap.xml`** - Sitemap principal con todo
- **`/sitemap-index.xml`** - Índice de sitemaps (para sitios grandes)
- **`/sitemap-trips.xml`** - Solo viajes
- **`/sitemap-articles.xml`** - Solo artículos del blog

#### 3. **Robots.txt Dinámico**

- ✅ Se genera dinámicamente
- ✅ Incluye la URL correcta del sitemap basada en el dominio
- ✅ Bloques predefinidos para admin y API

### Sitemaps Generados

#### Sitemap Principal

Incluye:

- Páginas estáticas (home, about, contact, faq)
- Todos los viajes (en ES y EN)
- Todos los artículos del blog (en ES y EN)

#### Prioridades Asignadas

```
1.0 - Homepage
0.9 - Página de listado de viajes
0.9 - Viajes destacados (featured=true)
0.8 - Viajes normales
0.8 - Página de blog
0.7 - Artículos del blog
0.6 - Páginas secundarias (about, contact)
```

#### Frecuencias de Cambio

```
daily   - Homepage, listados
weekly  - Viajes, artículos
monthly - Páginas estáticas
```

### Robots.txt Generado

Nuestro robots.txt bloquea:

- `/api/` - Endpoints de la API
- `/admin/` - Panel administrativo
- `/auth/` - Rutas de autenticación
- `/user/`, `/profile/` - Páginas de usuario
- URLs con parámetros de filtrado (`?sort=`, `?filter=`)

Y permite:

- `/` - Todo el sitio público
- `/assets/`, `/images/` - Recursos estáticos
- Archivos CSS y JS

---

## Configuración

### Variables de Entorno

Añade a tu archivo `.env`:

```env
# SEO Configuration
BASE_URL=https://asiaexperiences.com

# En desarrollo:
# BASE_URL=http://localhost:3000
```

**¿Por qué es importante?**

- El sitemap necesita URLs absolutas (completas)
- Si no se define BASE_URL, se construye automáticamente desde la petición HTTP

### Caché

Los sitemaps están cacheados por **1 hora** (3600 segundos):

```javascript
res.set("Cache-Control", "public, max-age=3600");
```

**¿Por qué cachear?**

- Evitar consultar la base de datos en cada petición
- Mejorar el rendimiento
- Los sitemaps no necesitan actualizarse en tiempo real

**Robots.txt** está cacheado por **24 horas** (86400 segundos):

```javascript
res.set("Cache-Control", "public, max-age=86400");
```

---

## Ejemplos de Uso

### Acceder a los Sitemaps

**Desarrollo:**

```bash
http://localhost:3000/sitemap.xml
http://localhost:3000/sitemap-trips.xml
http://localhost:3000/sitemap-articles.xml
http://localhost:3000/sitemap-index.xml
http://localhost:3000/robots.txt
```

**Producción:**

```bash
https://asiaexperiences.com/sitemap.xml
https://asiaexperiences.com/robots.txt
```

### Enviar Sitemap a Google

1. **Google Search Console**

   - Ir a https://search.google.com/search-console
   - Seleccionar tu propiedad
   - Ir a "Sitemaps" en el menú lateral
   - Añadir nueva sitemap: `https://asiaexperiences.com/sitemap.xml`
   - Enviar

2. **Ping Manual** (opcional)
   ```
   http://www.google.com/ping?sitemap=https://asiaexperiences.com/sitemap.xml
   ```

### Verificar Robots.txt

Usa la herramienta de Google:

1. Ir a Google Search Console
2. Herramientas > Probador de robots.txt
3. Pegar tu robots.txt
4. Probar URLs específicas

---

## Mejores Prácticas

### Para Sitemaps

#### ✅ HACER:

1. **Incluir solo URLs públicas**

   - No incluir páginas de login, registro, checkout
   - Solo páginas que quieres que aparezcan en buscadores

2. **Usar URLs canónicas**

   - Incluir la versión preferida de cada URL
   - Ejemplo: Incluir `https://` no `http://`

3. **Mantener actualizado `lastmod`**

   - Usa la fecha real de última modificación
   - Ayuda a los bots a priorizar qué rastrear

4. **Limitar el tamaño**

   - Máximo 50,000 URLs por sitemap
   - Máximo 50 MB sin comprimir
   - Si excedes, usa sitemap index

5. **Incluir en robots.txt**

   ```txt
   Sitemap: https://asiaexperiences.com/sitemap.xml
   ```

6. **Enviar a Google Search Console**
   - Permite ver estadísticas de indexación
   - Notifica errores

#### ❌ EVITAR:

1. **No incluir URLs bloqueadas por robots.txt**

   - Causa confusión a los bots

2. **No incluir redirects (301/302)**

   - Incluir solo la URL final

3. **No incluir URLs con errores (404, 500)**

   - Verificar que todas las URLs funcionen

4. **No usar URLs relativas**
   - Usar siempre URLs absolutas: `https://example.com/page`

### Para Robots.txt

#### ✅ HACER:

1. **Ubicar en la raíz**

   - Debe estar en `https://example.com/robots.txt`
   - No en subdirectorios

2. **Bloquear páginas administrativas**

   ```txt
   Disallow: /admin/
   Disallow: /wp-admin/
   ```

3. **Bloquear parámetros de URL duplicados**

   ```txt
   Disallow: /*?sort=
   Disallow: /*?filter=
   ```

4. **Permitir crawlers legítimos**

   ```txt
   User-agent: *
   Allow: /
   ```

5. **Incluir referencia al sitemap**
   ```txt
   Sitemap: https://example.com/sitemap.xml
   ```

#### ❌ EVITAR:

1. **No usar para contenido sensible**

   - Robots.txt es público, todos pueden verlo
   - Para contenido privado, usa autenticación

2. **No bloquear CSS/JS necesarios**

   - Google necesita renderizar páginas
   - Permitir recursos necesarios para rendering

3. **No confiar solo en robots.txt**

   - Es una "sugerencia", no todos los bots lo respetan
   - Bots maliciosos pueden ignorarlo

4. **No usar para remover URLs del índice**
   - Si una URL ya está indexada, usa meta tag `noindex`
   - O Google Search Console para remover

---

## Monitoreo y Mantenimiento

### Google Search Console

Monitorear regularmente:

1. **Estado del Sitemap**

   - URLs enviadas vs URLs indexadas
   - Errores de rastreo

2. **Cobertura de Índice**

   - Páginas indexadas
   - Páginas excluidas
   - Errores

3. **Core Web Vitals**
   - Rendimiento de las páginas
   - Experiencia del usuario

### Logs del Servidor

Revisar:

- Peticiones a `/sitemap.xml`
- Peticiones a `/robots.txt`
- User-agents que acceden (Googlebot, Bingbot, etc.)

### Actualización Automática

Nuestro sistema:

- ✅ Genera sitemaps dinámicamente
- ✅ No requiere regeneración manual
- ✅ Siempre refleja el estado actual de la BD

---

## Troubleshooting

### El sitemap no se genera

**Verificar:**

1. ¿El servidor está corriendo?
2. ¿La variable `BASE_URL` está configurada?
3. ¿Hay viajes/artículos en la BD?
4. ¿Hay errores en los logs del servidor?

### Google no rastrea el sitemap

**Soluciones:**

1. Verificar en Google Search Console
2. Asegurar que el sitemap sea accesible públicamente
3. Verificar que no esté bloqueado por robots.txt
4. Enviar manualmente en Search Console

### Demasiadas URLs en el sitemap

**Solución:**
Usar sitemap index:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex>
  <sitemap>
    <loc>https://example.com/sitemap-trips.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-articles.xml</loc>
  </sitemap>
</sitemapindex>
```

---

## Recursos Adicionales

### Documentación Oficial

- **Sitemaps.org**: https://www.sitemaps.org/
- **Google Sitemaps**: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- **Robots.txt RFC**: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt

### Herramientas

1. **XML Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. **Robots.txt Tester**: Google Search Console
3. **Sitemap Generator**: Nuestra implementación en `backend/src/utils/sitemap.generator.js`

---

## Conclusión

**Sitemap.xml** y **robots.txt** son fundamentales para el SEO:

- **Sitemap** = "Mapa" que ayuda a los bots a encontrar todo tu contenido
- **Robots.txt** = "Portero" que controla qué pueden y no pueden rastrear

Nuestra implementación:

- ✅ Dinâmica y siempre actualizada
- ✅ Compatible con múltiples idiomas
- ✅ Optimizada para rendimiento (caché)
- ✅ Fácil de mantener (sin regeneración manual)
- ✅ Lista para producción

**Siguiente paso:** Configurar en Google Search Console y monitorear regularmente!
