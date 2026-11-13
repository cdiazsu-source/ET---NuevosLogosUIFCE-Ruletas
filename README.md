# UIFCE · Sistema de marca y portafolio de áreas

**Unidad de Informática de la Facultad de Ciencias Económicas**, Universidad Nacional de Colombia, Sede Bogotá.

Este repositorio reúne la identidad visual de la UIFCE y de sus siete áreas: logos, animaciones, ruletas, manual de marca y fichas comerciales. Tiene dos objetivos:

1. **Comunicar mejor entre áreas.** Todas usan la misma marca, el mismo discurso y el mismo procedimiento para pedirse trabajo.
2. **Vender cada área a su público.** Cada área tiene una propuesta de valor, una página y una ficha de una hoja que puede enviar o imprimir.

> **Sitio publicado:** https://cdiazsu-source.github.io/ET---NuevosLogosUIFCE-Ruletas/. Desde ahí se llega al portafolio, al manual y a las descargas. También puedes abrir `index.html` directamente.

## Público de cada área

| Área | Público principal | Promesa |
|---|---|---|
| **Apoyos Académicos** | Profesores y personal administrativo | Llevamos la herramienta a tu clase. |
| **Cursos Libres** | Estudiantes | Habilidades digitales que se notan en tu hoja de vida. |
| **Virtualización Académica** | Dependencias y comunidad académica de posgrado | Tus programas y procesos, disponibles en cualquier lugar. |
| **Estrategias Tecnológicas** | Comunidad universitaria en general | Conectamos a la comunidad con la tecnología de la Facultad. |
| Desarrollo & Automatizaciones TI | Dependencias y áreas administrativas *(por validar)* | Menos tareas manuales, más tiempo para lo importante. |
| Gestión del Conocimiento | Equipo UIFCE y áreas de la Facultad *(por validar)* | Lo que sabemos, documentado y al alcance de todos. |
| Coordinación | Directivas, aliados y equipo UIFCE *(por validar)* | Un solo punto de contacto para toda la Unidad. |

Todo el contenido comercial (lemas, propuestas, servicios, pasos y llamados a la acción) está en **[`marca/areas.json`](marca/areas.json)**. Para cambiar un texto se edita ese archivo y se regenera el sitio. No hay que tocar el HTML a mano.

## Contenido

| Carpeta / archivo | Qué hay |
|---|---|
| [`index.html`](index.html) | Sitio de marca: «¿Quién eres?», portafolio de áreas y recursos |
| [`portafolio/`](portafolio/) | Una página comercial por área, con propuesta, beneficios, servicios, cómo acceder y descargas |
| [`comunicacion.html`](comunicacion.html) | Guía de comunicación entre áreas: mapa de públicos, discurso de 30 segundos, plantilla de *brief* y flujos de colaboración |
| [`manual.html`](manual.html) | Manual de marca: logo, variantes, color, tipografía, área de protección, usos incorrectos y movimiento |
| [`fichas/`](fichas/) | Ficha de una página por área, en HTML y en [PDF](fichas/pdf/) (tamaño carta) |
| [`logos/unidad/`](logos/unidad/) | Logo UIFCE en SVG (azul, blanco y negro) y PNG |
| [`logos/areas/`](logos/areas/) | Los 7 logos de área en 4 variantes y en SVG, PNG, PDF y EPS, más una [vista previa](logos/areas/vista-previa.html) |
| [`media/logo/`](media/logo/) | Animación del logo UIFCE (MP4, WebM, GIF y WebP) |
| [`media/areas/<área>/`](media/areas/) | Animación del logo de cada área |
| [`media/ruleta/<área>/`](media/ruleta/) | Ruleta junto al logotipo, que se detiene en cada área |
| [`media/unidad-estrategias/`](media/unidad-estrategias/) | Animación de la Unidad enlazada con la ruleta de Estrategias Tecnológicas; el punto de la «i» se ilumina junto con el área |
| [`media/unidad-recorrido/`](media/unidad-recorrido/) | Versión larga (44 s): de la Unidad pasa a la ruleta y recorre las 7 áreas, de Estrategias Tecnológicas a Coordinación |
| [`animacion/`](animacion/) | Código fuente de todas las animaciones (Remotion + GSAP) |
| [`archivo/propuestas/`](archivo/propuestas/) | Exploraciones de diseño anteriores |

### Variantes de los logos

`uifce-<área>-azul` · `uifce-<área>-blanco` (transparente) · `uifce-<área>-negro-fondo-blanco` · `uifce-<área>-blanco-fondo-negro`

### Formatos de video

| Archivo | Uso |
|---|---|
| `.mp4` (lavanda, `-fondo-blanco`, `-fondo-negro`) | Pantallas, presentaciones y redes |
| `-transparente.webm` | Web y OBS, con fondo transparente |
| `.gif` / `-transparente.webp` | Correo, chat y firmas |
| `-transparente.mov` (ProRes 4444) | Edición profesional. **No está en el repositorio** porque pesa entre 60 y 90 MB por archivo; se genera con los comandos de abajo |

## Regenerar

Sitio y fichas (requiere Node 18 o superior):

```bash
node scripts/build-sitio.mjs
```

Para pasar las fichas a PDF, abre cada `fichas/<área>.html` en Edge o Chrome y usa Imprimir → Guardar como PDF (carta, sin márgenes ni encabezados), o ejecuta en Windows:

```bash
bash scripts/fichas-pdf.sh
```

Animaciones (desde `animacion/`):

```bash
npm install
npm run render:areas    # animación del logo de cada área
npm run render:reel     # ruletas de las 7 áreas (unos 3 min por área)
npm run render:unidad   # Unidad → Estrategias Tecnológicas
npm run render:recorrido # Unidad → recorrido por las 7 áreas (versión larga)
npx remotion studio     # editor visual
```

## Publicar el sitio

El sitio se publica solo con GitHub Pages (rama `main`, carpeta `/ (root)`) cada vez que se sube un cambio a `main`. El archivo `.nojekyll` hace que GitHub sirva los archivos tal cual, sin pasarlos por Jekyll.

## Pendientes

- [ ] Agregar los enlaces de los llamados a la acción (`ctaUrl` en `marca/areas.json`): formulario de apoyos académicos, oferta de cursos libres, contacto de cada área.
- [ ] Validar con Desarrollo & Automatizaciones TI, Gestión del Conocimiento y Coordinación su público y sus servicios.
- [ ] Revisar con cada área los servicios que aparecen en su página y en su ficha.
