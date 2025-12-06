# SmartSpend AI — Guía rápida (REAL)

Breve, práctica y lista para usar localmente.

## Requisitos
- Node.js 18+  
- Git (opcional)

## Resumen rápido (comandos)
Abre un terminal y desde la raíz del proyecto (donde está este README) ejecuta:
```bash
cd /home/francmt/Desktop/FinCop_mvp2/smartspend-ai
npm install
# crea .env (ver sección siguiente) y luego:
npm run dev
```
La app se abrirá en la URL que muestre Vite (ej. http://localhost:3000).

## Archivo .env
Crea `.env` en la raíz del proyecto y añade tu API key (sin comillas):
```env
VITE_API_KEY=tu_clave_api_aqui
```
No subas `.env` al repositorio.

## Verifica que el código use la variable Vite
El cliente de IA debe leer `import.meta.env.VITE_API_KEY`. El archivo relevante es [`services/geminiService.ts`](services/geminiService.ts). Debe usar algo como:
```ts
const apiKey = (import.meta as any).env?.VITE_API_KEY || (process.env as any).API_KEY;
```
Si cambias `.env` reinicia el servidor (`Ctrl+C` y `npm run dev`).

## Archivos clave
- Configuración y scripts: [package.json](package.json)  
- Vite config: [vite.config.ts](vite.config.ts)  
- Cliente IA: [services/geminiService.ts](services/geminiService.ts)  
- Entrada app: [index.tsx](index.tsx) y [index.html](index.html)  
- Componentes UI: [src/components](./src/components)

> Nota: hay una plantilla anidada en `smartspend-ai/smartspend-ai/` — evita ejecutar npm en esa carpeta a menos que quieras usar la plantilla interna.

## Errores comunes y soluciones rápidas
- "Cannot find type definition file for 'node'": instala types y vuelve a ejecutar:
  ```bash
  npm install --save-dev @types/node
  ```
- Variables de entorno no aplicadas: asegúrate que `.env` esté en la raíz y reinicia Vite.
- Módulo no encontrado: corre `npm install` y revisa mayúsculas/minúsculas en imports.

## Build / Preview
- Build producción:
  ```bash
  npm run build
  ```
- Probar build local:
  ```bash
  npm run preview
  ```

## Seguridad
- No comites tu `.env`. Usa .gitignore (ya incluido) o soluciones secret manager para producción.

Si después de seguir esto no arranca, pega el error exacto de la terminal (salida de `npm run dev`) y reviso el problema concreto.
