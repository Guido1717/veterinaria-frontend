# Clínica Veterinaria · Frontend

Frontend en **Angular 22** para el sistema de la clínica veterinaria (Programación de software · ITM · 2026-2, cuarto parcial).

Consume en local la API REST del backend del curso ([Guido1717/proyecto-veterinaria](https://github.com/Guido1717/proyecto-veterinaria), FastAPI + SQLAlchemy + Neon PostgreSQL). Cada entidad es un módulo del menú lateral, y cada módulo tiene el CRUD completo.

## Video

> **Video del sistema funcionando en local:** _pendiente: pegar aquí el enlace (YouTube no listado o Drive con acceso por enlace)._

## URL del backend

La aplicación llama a la API en **`http://localhost:8000`**.

Esa URL está en [`src/environments/environment.ts`](src/environments/environment.ts).

## Cómo levantarlo en local

### 1. Backend (API)

Requisitos: Python 3.12 y una base PostgreSQL en Neon.

```bash
git clone https://github.com/Guido1717/proyecto-veterinaria.git
cd proyecto-veterinaria
python -m venv .venv
.venv\Scripts\activate          # Windows (en Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # y poner la DATABASE_URL de Neon
python -m src.database.migrate
python -m src.seeders.seed      # datos de ejemplo (opcional)
uvicorn main:app --reload --port 8000
```

La API queda en `http://localhost:8000`, con Swagger en `http://localhost:8000/docs`.

### 2. Frontend (este repositorio)

Requisitos: Node.js 22.22+, 24.15+ o 26+ (con npm).

```bash
git clone <url-de-este-repositorio>
cd veterinaria-frontend
npm install
npm start
```

Abrir `http://localhost:4200`.

## Módulos

| # | Módulo | Ruta Angular | Recurso HTTP |
|---|---|---|---|
| 1 | Especies | `/especies` | `/especies/` |
| 2 | Dueños | `/duenos` | `/duenos/` |
| 3 | Mascotas | `/mascotas` | `/mascotas/` |
| 4 | Veterinarios | `/veterinarios` | `/veterinarios/` |
| 5 | Citas | `/citas` | `/citas/` |
| 6 | Consultas | `/consultas` | `/consultas/` |
| 7 | Vacunas | `/vacunas` | `/vacunas/` |
| 8 | Tratamientos | `/tratamientos` | `/tratamientos/` |

En cada módulo, las cinco operaciones llaman al backend:

| Operación | En la pantalla | Petición |
|---|---|---|
| Listar | Al entrar al módulo y con **Actualizar** | `GET /recurso/` |
| Consultar uno | Botón **Ver** de la fila, o **Consultar por id** | `GET /recurso/{id}` |
| Crear | Botón **Nuevo/Nueva** → **Crear** | `POST /recurso/` |
| Editar | Botón **Editar** (primero trae el registro con `GET /recurso/{id}`) → **Guardar cambios** | `PUT /recurso/{id}` |
| Eliminar | Botón **Eliminar** → confirmar | `DELETE /recurso/{id}` |

Después de crear, editar o eliminar, la tabla se vuelve a cargar con `GET /recurso/`, para que siempre muestre lo que respondió la API. Los errores de la API (404, 409, 422) se muestran como avisos con el mensaje del backend.

## Menú lateral retraíble

- El botón **Retraer menú** (arriba del menú) lo retrae y lo vuelve a expandir.
- Expandido, muestra el nombre de los ocho módulos. Retraído, queda una barra de íconos con el nombre del módulo al pasar el mouse.
- Al retraerlo, el contenido ocupa el ancho que libera el menú. El menú nunca tapa el contenido.
- En los dos estados, la opción activa se distingue por el fondo, el ícono relleno y la marca a la izquierda.
- La preferencia se recuerda en el navegador.

## Estilos

Diseño propio, en `src/styles.css`, sin librerías de componentes:

- Paleta cálida: crema, salvia y terracota.
- Tipografías Fraunces (títulos) y Nunito (texto). Íconos Material Symbols Rounded.
- Menú claro con íconos y botones redondeados.
- Tabla dentro de una tarjeta, con relaciones e insignias de estado.
- Formulario y detalle en un panel lateral deslizable, confirmación propia para eliminar y avisos flotantes.

## Estructura

```
src/
├── environments/environment.ts   URL de la API
├── styles.css                    estilos globales
└── app/
    ├── app.routes.ts             una ruta por módulo
    ├── core/
    │   ├── entidades.ts          configuración de las 8 entidades (campos, relaciones, validaciones)
    │   ├── modelos.ts            interfaces de lectura de la API
    │   ├── api.service.ts        GET, POST, PUT y DELETE contra la API
    │   ├── errores.ts            mensajes de error de la API
    │   ├── avisos.service.ts     avisos flotantes
    │   └── formato.ts            formato de fechas y textos
    ├── layout/shell.*            menú lateral retraíble y área de trabajo
    └── crud/crud-page.*          pantalla CRUD de cada módulo
```
