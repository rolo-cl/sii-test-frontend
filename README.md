# Explorador de Pokémon — Frontend (Angular 21)

Aplicación web del desafío **Explorador de Pokémon**. Permite recorrer el catálogo paginado, buscar Pokémon por nombre y ver el detalle de cada uno. Todos los datos llegan a través del BFF en NestJS, nunca directamente desde PokéAPI.

La solución está dividida en dos repositorios:

| Repositorio | Contenido |
| --- | --- |
| [`sii-test-frontend`](https://github.com/rolo-cl/sii-test-frontend) (este) | Aplicación en Angular 21 |
| [`sii-test-backend`](https://github.com/rolo-cl/sii-test-backend) | BFF en NestJS 11 |

## Ejecutar la solución completa (Docker)

Requisitos: **Docker** con **Docker Compose v2**. No hace falta Node instalado.

```bash
# Clonar ambos repositorios uno al lado del otro
git clone https://github.com/rolo-cl/sii-test-backend.git
git clone https://github.com/rolo-cl/sii-test-frontend.git

cd sii-test-frontend
docker compose up --build
```

Abrir <http://localhost:8080>.

El mismo `docker-compose.yml` existe en ambos repositorios. Si los repos no están en carpetas hermanas: `BACKEND_CONTEXT=/ruta/al/backend docker compose up --build`. Los puertos se cambian con `FRONTEND_PORT` y `BACKEND_PORT`.

### Tests (también con Docker)

```bash
docker run --rm -v "$PWD":/app -v /app/node_modules -w /app -e CI=1 node:24-alpine sh -c "npm ci && npx ng test --watch=false && npx ng build"
```

### Sin Docker (opcional)

Con Node 22+ y el BFF corriendo en `localhost:3000`: `npm ci && npm start`, luego abrir <http://localhost:4200>. El dev server reenvía `/api` al BFF ([`proxy.conf.json`](proxy.conf.json)).

## Configuración

La app no necesita variables de entorno: siempre llama a `/api` en su propio origen.

| Variable (contenedor) | Default | Descripción |
| --- | --- | --- |
| `BFF_URL` | `http://backend:3000` | Hacia dónde nginx reenvía `/api/*` |

## Funcionalidades

- **Catálogo** en grilla, 24 por página, con paginación.
- **Búsqueda por nombre** con debounce (coincidencia parcial; el BFF ordena primero los nombres que empiezan con el término).
- **Detalle**: artwork, número, categoría, tipos, descripción, altura, peso, habilidades (marcando las ocultas) y estadísticas base con barras.
- Estados de **carga** (skeleton/spinner), **error con reintento**, **sin resultados** y **Pokémon no encontrado**.
- Diseño responsive y modo oscuro según la preferencia del sistema.

## Decisiones técnicas

- **La URL es la fuente de verdad** del listado (`/?q=char&page=2`). Búsquedas y páginas se pueden compartir, sobreviven a un reload, y "Volver al catálogo" regresa exactamente a donde estaba el usuario.
- **Mismo origen vía nginx.** En Docker, nginx sirve la SPA y hace proxy de `/api` al BFF; en desarrollo lo hace el proxy de `ng serve`. Así no hay URLs por entorno ni CORS que configurar.
- **Angular moderno:** componentes standalone, zoneless, signals (`input`, `computed`, `linkedSignal`), control flow (`@if`, `@for`, `@let`), `OnPush` y rutas con lazy loading. El parámetro `:name` llega al componente como `input` (`withComponentInputBinding`).
- **Peticiones con RxJS + `toSignal`.** `switchMap` cancela la búsqueda anterior si el usuario sigue escribiendo, y un helper ([`load-state.ts`](src/app/core/load-state.ts)) modela loading/success/error como una unión discriminada. No usé `httpResource` porque sigue marcado como experimental en Angular 21.
- El listado **mantiene visibles los resultados anteriores** mientras carga la página siguiente, en vez de vaciar la grilla.
- **Sin librería de UI:** con dos pantallas, SCSS propio con variables CSS mantiene el bundle chico (~70 KB transferidos en la carga inicial).
- Tipos y estadísticas se traducen al español en el cliente con pipes simples.
- **Docker:** build multi-stage (Node para compilar, `nginx-unprivileged` para servir), caché larga para assets con hash y fallback de SPA para los deep links.

## Limitaciones y fuera de alcance

- Sin filtros por tipo o generación, favoritos, comparador ni cadenas evolutivas: lo dejé fuera para priorizar los tres flujos pedidos.
- Los nombres de habilidades se muestran en inglés (así vienen de PokéAPI).
- Sin tests end-to-end en navegador. Hay tests unitarios y de componentes (Vitest + `RouterTestingHarness` + `HttpTestingController`) que cubren el servicio, el listado con búsqueda y paginación desde la URL, los estados vacío y de error, y el detalle con su 404.
- Sin SSR ni i18n formal; la UI está solo en español.

## Herramientas utilizadas

Angular 21 (CLI, Vitest como runner por defecto), TypeScript, RxJS, SCSS, Prettier, nginx, Docker / Docker Compose. Usé Claude Code como asistente de desarrollo.
