# 📡 Installations Assistant — AJ Global

Aplicación web progresiva (PWA) desarrollada en **Angular 21** para que los técnicos de AJ Global registren instalaciones de internet en campo de forma estructurada, reemplazando el envío de datos por WhatsApp de forma manual e incompleta.

---

## ¿Qué hace la app?

El técnico completa un formulario de **4 pasos** desde su celular mientras realiza la instalación. Al finalizar, la app genera automáticamente:

- Un **resumen completo** de la instalación listo para enviar por WhatsApp
- El **Perfil Smart OLT** (solo para clientes de fibra óptica)
- El **Perfil Router Board** (para fibra y radio enlace)

Todo con un botón de copia y envío directo a WhatsApp.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21.1.5 | Framework principal |
| TypeScript | 5.9.3 | Lenguaje |
| Tailwind CSS | 4.x | Estilos |
| Leaflet.js | 1.9.4 | Mapa interactivo |
| OpenStreetMap | — | Tiles del mapa (gratuito) |

### Características de Angular utilizadas
- **Zoneless** — detección de cambios basada 100% en Signals, sin Zone.js
- **Standalone Components** — sin NgModule
- **Signals** — estado reactivo (`signal`, `computed`)
- **Reactive Forms** — formularios tipados con validaciones dinámicas
- `input()` / `output()` — nueva API de inputs y outputs
- `viewChild()` — referencias a componentes hijos
- Sintaxis de control moderna (`@if`, `@for`)

---

## Estructura del proyecto

```
src/app/
├── core/
│   └── models/
│       ├── client.model.ts        # Tipos: ClientType, ServiceType, LocationType
│       └── step.model.ts          # Interfaz StepComponent<T>
├── features/
│   └── installation/
│       ├── installation.ts        # Componente padre orquestador
│       ├── installation.html
│       ├── installation-form.ts   # Servicio de estado con Signals
│       ├── summary-formatter.ts   # Servicio de generación de perfiles
│       └── steps/
│           ├── client-info/       # Paso 1: Datos del cliente
│           ├── service-info/      # Paso 2: Datos del servicio
│           ├── location-info/     # Paso 3: Ubicación con mapa
│           ├── technical-info/    # Paso 4: Datos técnicos
│           └── installation-summary/ # Pantalla de resultados
├── app.ts
├── app.html
├── app.routes.ts                  # Lazy loading de Installation
└── app.config.ts                  # Providers (zoneless)
```

---

## Arquitectura

### Patrón: Componentes desacoplados con interfaz común

Cada step implementa la interfaz `StepComponent<T>`:

```typescript
export interface StepComponent<T> {
  getData(): T;
  setData(data: T): void;
}
```

**El componente padre** (`Installation`) es el único responsable de:
1. Orquestar la navegación entre steps
2. Guardar datos de cada step en el servicio antes de avanzar o retroceder
3. Pasar los datos guardados a cada step como `@Input` para restaurarlos

**Los steps hijos** solo manejan su propio formulario. No conocen el servicio ni otros steps.

```
Installation (padre)
├── clientInfoRef  → viewChild(ClientInfo)
├── serviceInfoRef → viewChild(ServiceInfo)
├── locationInfoRef→ viewChild(LocationInfo)
└── technicalInfoRef→viewChild(TechnicalInfo)
```

### Persistencia entre steps

Angular destruye los componentes al cambiar de step (por el `@if`). Para no perder datos:

1. El padre llama `getData()` antes de cambiar de step y guarda en `InstallationFormService`
2. Al montar el nuevo step, el padre pasa los datos como `[savedData]="signal()"`
3. Angular aplica el `@Input` **antes** del `ngOnInit`, así el step restaura el formulario correctamente

### Steps dinámicos

Los steps se configuran en un array en `installation.ts`:

```typescript
const STEPS: StepConfig[] = [
  { index: 1, title: 'Informacion del cliente' },
  { index: 2, title: 'Informacion del servicio' },
  { index: 3, title: 'Ubicacion' },
  { index: 4, title: 'Datos tecnicos' },
];
```

`totalSteps` se calcula automáticamente de `STEPS.length`. Para agregar un nuevo step solo se necesita:
1. Crear el componente e implementar `StepComponent<T>`
2. Agregar una línea en `STEPS`
3. Agregar un `@if` en `installation.html`

---

## Formulario — Pasos

### Paso 1: Información del cliente
- Tipo de cliente: Persona Natural / Persona Jurídica
- Si natural: Nombres y Apellidos
- Si jurídica: Razón Social
- Teléfono (10 dígitos numéricos)

### Paso 2: Información del servicio
- Tipo de servicio: Fibra Óptica / Radio Enlace
- Si Fibra: Con internet (Sí/No), Mbps (si internet = Sí), Con TV (Sí/No), Cantidad de TVs (si TV = Sí)
- Si Radio Enlace: Mbps
- Número de punto (opcional, numérico)

### Paso 3: Ubicación
- Tipo: Barrio / Vereda
- Nombre del barrio o vereda
- Dirección completa (barrio) o referencia de ubicación (vereda)
- Coordenadas obtenidas automáticamente via `navigator.geolocation`
- Mapa interactivo con Leaflet donde el técnico puede ajustar el marcador
- Si el técnico niega permisos de ubicación: flujo de confirmación manual

### Paso 4: Datos técnicos
- Si Fibra: Precinto (numérico) y Hilo (numérico)
- Si Radio Enlace: Nodo (texto)

---

## Generación de perfiles

Toda la lógica de generación de texto vive en `SummaryFormatterService`:

### Perfil Smart OLT (solo fibra)
```
{codigoCliente} - NOMBRE COMPLETO [+NTV] - PRECINTO X HILO XX
(BARRIO/VDA NOMBRE (DIRECCION O REFERENCIA))
TELEFONO
LATITUD, LONGITUD
solo internet [+NTV] Xmbps | solo NTV
```

### Perfil Router Board
```
UBICACION.NOMBRECOMPLETO[PN]
nombres.apellidos[pn]
{codigoCliente}: NOMBRE COMPLETO - (BARRIO/VDA NOMBRE [NODO X] (DIRECCION (COORDS si radio)))
```

---

## Instalación local

### Requisitos previos

- **Node.js** 20 o superior
- **npm** 10 o superior
- **Angular CLI** 21

```bash
# Verificar versiones
node --version
npm --version
```

### Instalar Angular CLI globalmente

```bash
npm install -g @angular/cli@21
```

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/installations_assistant.git
cd installations_assistant
```

### Instalar dependencias

```bash
npm install
```

### Correr en desarrollo

```bash
ng serve
```

Abre el navegador en `http://localhost:4200`

> **Nota:** La geolocalización requiere HTTPS en producción. En desarrollo (`localhost`) funciona sin HTTPS.

### Build para producción

```bash
ng build
```

Los archivos se generan en `dist/installations_assistant/browser/`.

### Deploy en GitHub Pages

```bash
ng build --base-href /installations_assistant/
```

Luego sube el contenido de `dist/installations_assistant/browser/` a la rama `gh-pages`.

---

## Variables y configuración

### Centro del mapa por defecto

En `location-info.ts` están las constantes del mapa:

```typescript
const DEFAULT_LAT = 5.6338;   // Villa de Leyva
const DEFAULT_LNG = -73.5235;
const DEFAULT_ZOOM = 15;
```

Cámbialas si la operación se mueve a otro municipio.

---

## Dependencias principales

```bash
# Mapa interactivo
npm install leaflet
npm install --save-dev @types/leaflet
```

El CSS de Leaflet está registrado en `angular.json`:

```json
"styles": [
  "src/styles.css",
  "node_modules/leaflet/dist/leaflet.css"
]
```

---

## Decisiones de diseño

**¿Por qué zoneless?**
Angular 21 usa zoneless por defecto. La detección de cambios solo ocurre cuando un Signal cambia, lo que mejora el rendimiento especialmente en dispositivos móviles de gama baja que usan los técnicos.

**¿Por qué Leaflet y no Google Maps?**
Google Maps requiere una API key con costo por uso. Leaflet con OpenStreetMap es completamente gratuito y suficiente para las necesidades de la app.

**¿Por qué el padre guarda los datos y no los hijos?**
Inversión de control: los hijos son puros (solo manejan su formulario), el padre es el orquestador. Esto hace que agregar nuevos steps no requiera tocar los existentes.

---

## Roadmap

- [ ] Agregar código de cliente al formulario
- [ ] Historial de instalaciones en `localStorage`
- [ ] Deploy automatizado con GitHub Actions
- [ ] Modo offline (PWA completa)
