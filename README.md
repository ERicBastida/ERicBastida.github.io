# CV de Eric Bastida

CV interactivo y estático, hecho con Vite, React y [Motion](https://motion.dev).

## Editar los datos

Todo el contenido está en [`src/data/cv.json`](src/data/cv.json): color de acento (`accent` para rellenos y `accentText`, más claro, para textos y líneas), datos personales, idiomas, experiencia, proyectos y estudios.
Los textos traducibles llevan `es` y `en`. En `endDate`, `"current"` significa que el trabajo sigue vigente.
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

`npm run pdf` genera `public/cv-eric-bastida-es.pdf` y `public/cv-eric-bastida-en.pdf` desde `pdf.html`, con los mismos datos de `cv.json`. Usa Google Chrome; si está en otra ruta, indicala con `CHROME_PATH`.

## Publicación

Cada push a `main` publica el sitio con GitHub Actions. En el repo, activá **Settings > Pages > Source: GitHub Actions**.
