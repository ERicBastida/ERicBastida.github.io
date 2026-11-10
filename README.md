# CV de Eric Bastida

CV interactivo y estático, hecho con Vite, React y [Motion](https://motion.dev).

## Editar los datos

Todo el contenido está en [`src/data/cv.json`](src/data/cv.json): color de acento (`accent` para rellenos y `accentText`, más claro, para textos y líneas), datos personales, idiomas, experiencia, proyectos y estudios.
Los textos traducibles llevan `es` y `en`. En experiencia y proyectos, `description` se muestra en la página y `summary`, más corto, en el PDF. En `endDate`, `"current"` significa que el trabajo sigue vigente.
Los años de experiencia, los períodos y el stack se calculan solos a partir de ese archivo.

Las imágenes van en `public/` y se referencian con una ruta relativa, por ejemplo `logos/UNL_logo.png`.
El mapa de Contacto (`federacion.jpg`) está generado con datos de © OpenStreetMap.

El fondo corre un Dijkstra bidireccional sobre `roads.bin`, el grafo de calles sacado de `buenos-aires.jpg` con `scripts/build-roads.py`. Si cambiás esa imagen, volvé a generarlo.

## Desarrollo

```bash
npm install
npm run dev
```

## CV en PDF

`npm run pdf` genera, con los mismos datos de `cv.json`, dos versiones en español e inglés:

- `public/cv-eric-bastida-{es,en}.pdf`, desde `pdf.html`: el diseño visual, para mandarle a una persona. Es el que se descarga desde la página.
- `public/cv-eric-bastida-ats-{es,en}.pdf`, desde `ats.html`: una sola columna, sin foto ni gráficos, para cargar en portales que filtran CVs automáticamente (ATS). Las categorías de tecnologías están en `src/pdf/skills.ts`.

 Usa Google Chrome; si está en otra ruta, indicala con `CHROME_PATH`.

## Publicación

Cada push a `main` publica el sitio con GitHub Actions. En el repo, activá **Settings > Pages > Source: GitHub Actions**.
