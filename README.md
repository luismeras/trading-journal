# Trading Journal 50K

Implementación del diseño `design-reference/Trading Journal 50K.dc.html` (Claude Design, sistema Modernist).
Web estática sin dependencias ni build: HTML + CSS + JavaScript.

## Ejecutar

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Abre http://localhost:5173. También funciona abriendo `index.html` directamente con doble clic.

- Pruebas de la lógica de cálculo: http://localhost:5173/tests.html (26 casos).

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Documento, fuentes (Archivo, IBM Plex Mono), favicons, capa de partículas |
| `css/app.css` | Tokens claro/oscuro, base Modernist (botones, campos, segmentados), pantallas, animaciones, `prefers-reduced-motion` |
| `js/i18n.js` | Diccionario ES/EN |
| `js/calc.js` | `calc` (balance, piso trailing/estático, colchón, estadísticas), `sim` (Monte Carlo, 5,000 corridas), formato |
| `js/store.js` | Capa de datos (localStorage: `tj_lang`, `tj_theme`, `tj_entries`, `tj_rules`). Para pasar a backend + auth, se reemplaza este archivo manteniendo su interfaz |
| `js/app.js` | Vistas y eventos. Rutas: `#/`, `#/resumen`, `#/registros`, `#/registrar`, `#/simulador`, `#/ajustes` |

## Notas

- Empieza vacío: todas las cuentas (Backtest, Demo, Live) sin registros.
- Breakpoint móvil 760px (barra inferior de 5 tabs).
- Las imágenes pegadas de TradingView se guardan como data URL en localStorage. Si se llena la cuota, se guardan los registros sin imágenes. En producción, subirlas a un almacenamiento de archivos.
- Handoff pidió Next.js + TypeScript + Tailwind; esta máquina no tiene Node instalado, así que se entregó esta versión sin build. La lógica en `js/calc.js` se puede portar a TypeScript tal cual.
