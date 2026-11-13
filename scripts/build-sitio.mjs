// Genera el sitio de marca (index, portafolio por área, manual, guía de comunicación y fichas)
// a partir de marca/areas.json. Sin dependencias: `node scripts/build-sitio.mjs`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "marca/areas.json"), "utf8"));
const logo = JSON.parse(fs.readFileSync(path.join(ROOT, "animacion/src/logo.json"), "utf8"));
const { unidad, areas } = data;

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const write = (rel, html) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  console.log("escrito", rel);
};

// ---------- logo de la Unidad en SVG (desde los trazos exactos del logo original) ----------
const unitPaths = [...logo.wordmark.map((g) => g.d), ...logo.lines.flatMap((l) => l.glyphs.map((g) => g.d))];
const unitSvg = (fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -20 ${logo.width + 60} ${logo.height + 40}" role="img" aria-label="UIFCE · Unidad de Informática de la Facultad de Ciencias Económicas"><title>UIFCE · Unidad de Informática de la Facultad de Ciencias Económicas</title><g fill="${fill}">${unitPaths.map((d) => `<path d="${d}"/>`).join("")}</g></svg>\n`;
for (const [name, fill] of [["azul", "#49689F"], ["blanco", "#FFFFFF"], ["negro", "#000000"]]) {
  write(`logos/unidad/uifce-logo-${name}.svg`, unitSvg(fill));
}

// ---------- piezas comunes ----------
const COLORES = [
  { nombre: "Azul UIFCE", hex: "#49689F", uso: "Color principal del sistema de áreas. Logos, títulos y botones." },
  { nombre: "Azul profundo", hex: "#262E6B", uso: "Fondos institucionales, textos de alto contraste y pie de página." },
  { nombre: "Lavanda UIFCE", hex: "#C1C6E4", uso: "Fondo de las animaciones y del logo original. Superficies suaves." },
  { nombre: "Lavanda claro", hex: "#EEF0F9", uso: "Fondos de secciones y tarjetas." },
  { nombre: "Amarillo campaña", hex: "#F5C518", uso: "Solo acentos de campaña (llamados a la acción, etiquetas). Nunca en el logo." },
  { nombre: "Blanco", hex: "#FFFFFF", uso: "Logo sobre fondos oscuros, lavanda o fotografía." },
];

const page = ({ title, desc, depth = 0, body, active = "" }) => {
  const up = "../".repeat(depth);
  const nav = [
    ["index.html", "Inicio", "inicio"],
    ["index.html#portafolio", "Áreas", "areas"],
    ["comunicacion.html", "Comunicación", "comunicacion"],
    ["manual.html", "Manual de marca", "manual"],
  ];
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="${up}logos/unidad/uifce-logo-azul.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}sitio/estilos.css">
</head>
<body>
<header class="topbar">
  <div class="wrap topbar-in">
    <a class="brand" href="${up}index.html"><img src="${up}logos/unidad/uifce-logo-blanco.svg" alt="UIFCE"></a>
    <nav>${nav.map(([h, t, k]) => `<a href="${up}${h}"${k === active ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
  </div>
</header>
<main>
${body}
</main>
<footer class="footer">
  <div class="wrap footer-in">
    <img src="${up}logos/unidad/uifce-logo-blanco.svg" alt="UIFCE">
    <div><strong>${esc(unidad.nombreLargo)}</strong><br>${esc(unidad.institucion)}</div>
  </div>
</footer>
</body>
</html>
`;
};

const logoArea = (a, color = "azul", up = "") => `${up}logos/areas/svg/uifce-${a.slug}-${color}.svg`;
const chips = (list) => list.map((p) => `<span class="chip">${esc(p)}</span>`).join("");
const validar = (a) => (a.publicoValidado ? "" : `<p class="nota">Público y servicios propuestos: pendientes de validar con el área.</p>`);
const cta = (a, cls = "btn") =>
  a.ctaUrl ? `<a class="${cls}" href="${esc(a.ctaUrl)}">${esc(a.cta)}</a>` : `<span class="${cls} btn-pendiente" title="Enlace pendiente: agrégalo en marca/areas.json (ctaUrl)">${esc(a.cta)}</span>`;

// ---------- index ----------
const enfoque = areas.filter((a) => a.publicoValidado);
const index = page({
  title: "UIFCE · Portafolio de áreas",
  desc: unidad.promesa,
  active: "inicio",
  body: `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="eyebrow">${esc(unidad.nombreLargo)}</p>
      <h1>${esc(unidad.promesa)}</h1>
      <p class="lead">${esc(unidad.mision)}</p>
      <div class="hero-cta"><a class="btn" href="#quien-eres">Encuentra tu área</a><a class="btn btn-ghost" href="manual.html">Manual de marca</a></div>
    </div>
    <div class="hero-media">
      <video src="media/unidad-estrategias/uifce-unidad-estrategias-tecnologicas.mp4" autoplay muted loop playsinline poster="media/posters/unidad-estrategias.jpg"></video>
    </div>
  </div>
</section>

<section class="sec" id="quien-eres">
  <div class="wrap">
    <p class="eyebrow">¿Quién eres?</p>
    <h2>Cada público tiene un área que lo acompaña</h2>
    <div class="router">
      ${enfoque.map((a) => `
      <a class="route" href="portafolio/${a.slug}.html">
        <span class="route-who">${esc(a.publico.join(" · "))}</span>
        <img src="${logoArea(a)}" alt="UIFCE ${esc(a.nombre)}">
        <span class="route-lema">${esc(a.lema)}</span>
        <span class="route-go">Ver la propuesta →</span>
      </a>`).join("")}
    </div>
  </div>
</section>

<section class="sec sec-tint" id="portafolio">
  <div class="wrap">
    <p class="eyebrow">Portafolio</p>
    <h2>Siete áreas, una sola Unidad</h2>
    <div class="grid">
      ${areas.map((a) => `
      <a class="card" href="portafolio/${a.slug}.html">
        <img src="${logoArea(a)}" alt="UIFCE ${esc(a.nombre)}">
        <p class="card-lema">${esc(a.lema)}</p>
        <div class="chips">${chips(a.publico)}</div>
      </a>`).join("")}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap two">
    <div>
      <p class="eyebrow">Servicios de la Unidad</p>
      <h2>Lo que hacemos por la Facultad</h2>
      <ul class="ticks">${unidad.serviciosGenerales.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </div>
    <div class="panel">
      <h3>Recursos para las áreas</h3>
      <ul class="links">
        <li><a href="comunicacion.html">Guía de comunicación entre áreas</a></li>
        <li><a href="manual.html">Manual de marca y descargas</a></li>
        <li><a href="fichas/index.html">Fichas comerciales por área (para imprimir o enviar)</a></li>
        <li><a href="logos/areas/vista-previa.html">Vista previa de todos los logos</a></li>
      </ul>
    </div>
  </div>
</section>`,
});
write("index.html", index);

// ---------- página de cada área ----------
for (const a of areas) {
  const up = "../";
  const html = page({
    title: `UIFCE ${a.nombre}`,
    desc: a.propuesta,
    depth: 1,
    active: "areas",
    body: `
<section class="hero hero-area">
  <div class="wrap hero-in">
    <div class="hero-txt">
      <img class="area-logo" src="${logoArea(a, "blanco", up)}" alt="UIFCE ${esc(a.nombre)}">
      <h1>${esc(a.lema)}</h1>
      <p class="lead">${esc(a.propuesta)}</p>
      <div class="chips chips-dark"><span class="chip-label">Para:</span>${chips(a.publico)}</div>
      <div class="hero-cta">${cta(a)}<a class="btn btn-ghost" href="${up}fichas/${a.slug}.html">Ficha para compartir</a></div>
    </div>
    <div class="hero-media">
      <video src="${up}media/ruleta/${a.slug}/uifce-ruleta-${a.slug}.mp4" poster="${up}media/posters/ruleta-${a.slug}.jpg" autoplay muted loop playsinline></video>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${validar(a)}
    <p class="eyebrow">Por qué elegirnos</p>
    <h2>Lo que ganas</h2>
    <div class="benefits">${a.beneficios.map((b, i) => `<div class="benefit"><span class="num">0${i + 1}</span><p>${esc(b)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    <p class="eyebrow">Qué ofrecemos</p>
    <h2>Servicios</h2>
    <div class="grid">${a.servicios.map((s) => `<div class="card card-static"><h3>${esc(s.titulo)}</h3><p>${esc(s.detalle)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap two">
    <div>
      <p class="eyebrow">Cómo acceder</p>
      <h2>En tres pasos</h2>
      <ol class="steps">${a.comoSolicitar.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      ${a.condiciones ? `<p class="cond">${esc(a.condiciones)}</p>` : ""}
      <div class="hero-cta">${cta(a)}</div>
    </div>
    <div class="panel">
      <h3>Mensaje clave</h3>
      <blockquote>${esc(a.mensajeClave)}</blockquote>
      <h3>Descargas del área</h3>
      <ul class="links">
        <li><a href="${up}logos/areas/svg/uifce-${a.slug}-azul.svg" download>Logo azul (SVG)</a> · <a href="${up}logos/areas/png/uifce-${a.slug}-azul.png" download>PNG</a></li>
        <li><a href="${up}logos/areas/svg/uifce-${a.slug}-blanco.svg" download>Logo blanco (SVG)</a> · <a href="${up}logos/areas/png/uifce-${a.slug}-blanco.png" download>PNG</a></li>
        <li><a href="${up}logos/areas/pdf/uifce-${a.slug}-azul.pdf" download>Logo para impresión (PDF)</a> · <a href="${up}logos/areas/eps/uifce-${a.slug}-azul.eps" download>EPS</a></li>
        <li><a href="${up}media/ruleta/${a.slug}/uifce-ruleta-${a.slug}.mp4" download>Video ruleta (MP4)</a> · <a href="${up}media/ruleta/${a.slug}/uifce-ruleta-${a.slug}.gif" download>GIF</a></li>
        <li><a href="${up}media/areas/${a.slug}/uifce-${a.slug}-animacion.mp4" download>Animación del logo (MP4)</a></li>
      </ul>
    </div>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    <p class="eyebrow">Otras áreas</p>
    <div class="mini">${areas.filter((b) => b !== a).map((b) => `<a href="${b.slug}.html"><img src="${logoArea(b, "azul", up)}" alt="UIFCE ${esc(b.nombre)}"></a>`).join("")}</div>
  </div>
</section>`,
  });
  write(`portafolio/${a.slug}.html`, html);
}

// ---------- guía de comunicación entre áreas ----------
const comunicacion = page({
  title: "UIFCE · Guía de comunicación entre áreas",
  desc: "Cómo se comunican y colaboran las áreas de la UIFCE y cómo presentan sus servicios.",
  active: "comunicacion",
  body: `
<section class="hero hero-slim"><div class="wrap">
  <p class="eyebrow">Guía interna</p>
  <h1>Comunicación entre áreas</h1>
  <p class="lead">Una sola voz hacia afuera, acuerdos claros hacia adentro. Esta guía define a quién le habla cada área, cómo se piden trabajo entre ellas y cómo se presenta la Unidad.</p>
</div></section>

<section class="sec"><div class="wrap">
  <p class="eyebrow">1 · Mapa de públicos</p>
  <h2>Quién atiende a quién</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Área</th><th>Público principal</th><th>Promesa</th><th>Llamado a la acción</th></tr></thead>
    <tbody>${areas.map((a) => `<tr><td><img class="t-logo" src="logos/areas/svg/uifce-${a.slug}-azul.svg" alt="UIFCE ${esc(a.nombre)}"></td><td>${esc(a.publico.join(", "))}${a.publicoValidado ? "" : " <em>(por validar)</em>"}</td><td>${esc(a.lema)}</td><td>${esc(a.cta)}</td></tr>`).join("")}</tbody>
  </table></div>
</div></section>

<section class="sec sec-tint"><div class="wrap">
  <p class="eyebrow">2 · Discurso comercial</p>
  <h2>Cómo presentar cada área en 30 segundos</h2>
  <p class="lead">Cuando alguien llega a la UIFCE, cualquier persona del equipo debe poder remitirlo al área correcta con este mensaje.</p>
  <div class="grid">${areas.map((a) => `<div class="card card-static"><img src="logos/areas/svg/uifce-${a.slug}-azul.svg" alt="UIFCE ${esc(a.nombre)}"><p><strong>Si te dicen:</strong> «${esc(a.quienEres)}».</p><p><strong>Responde:</strong> ${esc(a.mensajeClave)}</p><p><a href="portafolio/${a.slug}.html">Envíale la página del área →</a></p></div>`).join("")}</div>
</div></section>

<section class="sec"><div class="wrap two">
  <div>
    <p class="eyebrow">3 · Solicitudes entre áreas</p>
    <h2>Cómo pedir trabajo a otra área</h2>
    <ol class="steps">
      <li><strong>Brief escrito.</strong> Toda solicitud entre áreas se hace por escrito con la plantilla de la derecha, nunca solo de palabra.</li>
      <li><strong>Un responsable por lado.</strong> Quien pide y quien entrega quedan nombrados en el brief.</li>
      <li><strong>Plazo realista.</strong> Mínimo 5 días hábiles para piezas de comunicación y 10 para desarrollos. Si es urgente, se acuerda con Coordinación.</li>
      <li><strong>Cierre.</strong> Quien entrega confirma la entrega; quien pide confirma que la recibió y la aprueba.</li>
    </ol>
  </div>
  <div class="panel">
    <h3>Plantilla de brief</h3>
    <pre class="brief">Área que solicita:
Responsable:
Área que entrega:
Qué necesito (una frase):
Para qué público:
Mensaje principal:
Canales (pantallas, redes, correo, cartelera):
Fecha límite:
Material de apoyo (enlaces):</pre>
  </div>
</div></section>

<section class="sec sec-tint"><div class="wrap">
  <p class="eyebrow">4 · Cómo colaboran las áreas</p>
  <h2>Flujos frecuentes</h2>
  <div class="grid">
    <div class="card card-static"><h3>Lanzamiento de un servicio</h3><p>El área dueña del servicio envía el brief → <strong>Estrategias Tecnológicas</strong> produce la campaña → <strong>Gestión del Conocimiento</strong> publica la guía de uso.</p></div>
    <div class="card card-static"><h3>Nueva herramienta para docentes</h3><p><strong>Apoyos Académicos</strong> detecta la necesidad → <strong>Virtualización Académica</strong> prepara el entorno o contenido → <strong>Cursos Libres</strong> evalúa abrir un curso para estudiantes.</p></div>
    <div class="card card-static"><h3>Proceso repetitivo</h3><p>Cualquier área lo reporta a <strong>Coordinación</strong> → <strong>Desarrollo &amp; Automatizaciones TI</strong> lo evalúa y automatiza → <strong>Gestión del Conocimiento</strong> documenta el nuevo procedimiento.</p></div>
  </div>
</div></section>

<section class="sec"><div class="wrap">
  <p class="eyebrow">5 · Reglas de voz y marca</p>
  <h2>Hablamos igual en todos los canales</h2>
  <ul class="ticks">
    <li>Siempre firmamos con el logo del área; si la pieza es de toda la Unidad, con el logo UIFCE.</li>
    <li>Hablamos de lo que gana el público, no de lo que hacemos por dentro: «llevamos la herramienta a tu clase», no «gestionamos solicitudes de apoyo».</li>
    <li>Tuteamos a estudiantes y profesores; en comunicaciones a directivas usamos «usted».</li>
    <li>Cada pieza termina con un llamado a la acción y un canal concreto.</li>
    <li>Los nombres de las áreas se escriben exactamente como en sus logos.</li>
  </ul>
</div></section>`,
});
write("comunicacion.html", comunicacion);

// ---------- manual de marca ----------
const VARIANTES = [
  ["azul", "Azul sobre fondo claro", "light"],
  ["blanco", "Blanco sobre fondo oscuro o lavanda", "dark"],
  ["negro-fondo-blanco", "Negro sobre blanco (impresión a una tinta)", "img"],
  ["blanco-fondo-negro", "Blanco sobre negro (pantallas y video)", "img"],
];
const ej = areas[0];
const manual = page({
  title: "UIFCE · Manual de marca",
  desc: "Lineamientos de uso del logo UIFCE y del sistema de logos de áreas.",
  active: "manual",
  body: `
<section class="hero hero-slim"><div class="wrap">
  <p class="eyebrow">Manual de marca</p>
  <h1>Un sistema, siete áreas</h1>
  <p class="lead">El logo UIFCE se conserva intacto. Cada área se identifica con su nombre a la derecha del logotipo, en Roboto Medium y en dos líneas cuya altura total es igual a la altura de las mayúsculas del logotipo.</p>
</div></section>

<section class="sec"><div class="wrap two">
  <div>
    <p class="eyebrow">1 · Logo de la Unidad</p>
    <h2>UIFCE</h2>
    <p>El logotipo combina la «u» de Roboto Regular, la «i» dibujada (punto redondeado y fuste) y «FCE» en Roboto Medium. El descriptor «Unidad de Informática / de la Facultad de Ciencias Económicas» acompaña al logo de la Unidad, no a los de las áreas.</p>
    <ul class="links">
      <li><a href="logos/unidad/uifce-logo-azul.svg" download>Logo UIFCE azul (SVG)</a></li>
      <li><a href="logos/unidad/uifce-logo-blanco.svg" download>Logo UIFCE blanco (SVG)</a></li>
      <li><a href="logos/unidad/uifce-logo-negro.svg" download>Logo UIFCE negro (SVG)</a></li>
      <li><a href="logos/unidad/uifce-logo-original.png" download>Logo original (PNG)</a></li>
    </ul>
  </div>
  <div class="swatch-logo dark"><img src="logos/unidad/uifce-logo-blanco.svg" alt="Logo UIFCE"></div>
</div></section>

<section class="sec sec-tint"><div class="wrap">
  <p class="eyebrow">2 · Sistema de áreas</p>
  <h2>Variantes de color</h2>
  <div class="grid">${VARIANTES.map(([v, t, bg]) => `<figure class="variant ${bg} v-${v}"><img src="logos/areas/${bg === "img" ? "png" : "svg"}/uifce-${ej.slug}-${v}.${bg === "img" ? "png" : "svg"}" alt="${esc(t)}"><figcaption>${esc(t)}<br><code>uifce-&lt;área&gt;-${v}</code></figcaption></figure>`).join("")}</div>
  <h3>Todas las áreas</h3>
  <div class="mini mini-big">${areas.map((a) => `<a href="portafolio/${a.slug}.html"><img src="logos/areas/svg/uifce-${a.slug}-azul.svg" alt="UIFCE ${esc(a.nombre)}"></a>`).join("")}</div>
</div></section>

<section class="sec"><div class="wrap">
  <p class="eyebrow">3 · Color</p>
  <h2>Paleta</h2>
  <div class="palette">${COLORES.map((c) => `<div class="color"><span class="sw" style="background:${c.hex}"></span><strong>${c.nombre}</strong><code>${c.hex}</code><p>${esc(c.uso)}</p></div>`).join("")}</div>
</div></section>

<section class="sec sec-tint"><div class="wrap two">
  <div>
    <p class="eyebrow">4 · Tipografía</p>
    <h2>Roboto</h2>
    <p class="type-sample type-500">Roboto Medium — nombres de área y títulos</p>
    <p class="type-sample type-400">Roboto Regular — textos y descriptores</p>
    <p class="type-sample type-300">Roboto Light — textos de apoyo en tamaños grandes</p>
    <p>Disponible gratis en Google Fonts. En piezas de campaña se puede usar una tipografía de apoyo, pero los logos siempre conservan Roboto.</p>
  </div>
  <div>
    <p class="eyebrow">5 · Área de protección y tamaño mínimo</p>
    <h2>Espacio alrededor</h2>
    <p>Deja alrededor del logo un espacio libre igual a la altura de la «F» del logotipo. Ningún texto, borde o imagen debe entrar en esa zona.</p>
    <p>Tamaño mínimo: 120 px de ancho en pantalla y 30 mm en impresión para los logos de área; por debajo de ese tamaño usa solo el logo UIFCE.</p>
  </div>
</div></section>

<section class="sec"><div class="wrap">
  <p class="eyebrow">6 · Usos incorrectos</p>
  <h2>Qué no hacer</h2>
  <div class="grid">
    <div class="card card-static dont"><img src="logos/areas/svg/uifce-${ej.slug}-azul.svg" alt="" style="transform:scaleX(1.35)"><p>No deformes ni estires el logo.</p></div>
    <div class="card card-static dont"><img src="logos/areas/svg/uifce-${ej.slug}-azul.svg" alt="" style="filter:hue-rotate(140deg) saturate(3)"><p>No cambies los colores fuera de la paleta.</p></div>
    <div class="card card-static dont" style="background:#49689F"><img src="logos/areas/svg/uifce-${ej.slug}-azul.svg" alt=""><p style="color:#fff">No pongas el logo azul sobre fondos oscuros o de bajo contraste.</p></div>
    <div class="card card-static dont"><img src="logos/areas/svg/uifce-${ej.slug}-azul.svg" alt="" style="transform:rotate(-8deg)"><p>No lo rotes ni le agregues efectos.</p></div>
  </div>
</div></section>

<section class="sec sec-tint"><div class="wrap">
  <p class="eyebrow">7 · Movimiento</p>
  <h2>Animaciones y ruletas</h2>
  <p>Cada área tiene dos animaciones: la animación de su logo y la ruleta, en la que los nombres de las áreas giran junto al logotipo hasta detenerse en el área. Úsalas como entrada o cierre de videos, en pantallas y en redes.</p>
  <div class="grid">
    <figure class="variant"><video src="media/logo/uifce-logo-animacion.mp4" poster="media/posters/uifce-logo.jpg" autoplay muted loop playsinline></video><figcaption>Logo UIFCE</figcaption></figure>
    <figure class="variant"><video src="media/ruleta/${ej.slug}/uifce-ruleta-${ej.slug}.mp4" poster="media/posters/ruleta-${ej.slug}.jpg" autoplay muted loop playsinline></video><figcaption>Ruleta de área</figcaption></figure>
    <figure class="variant"><video src="media/unidad-estrategias/uifce-unidad-estrategias-tecnologicas.mp4" poster="media/posters/unidad-estrategias.jpg" autoplay muted loop playsinline></video><figcaption>Unidad → Estrategias Tecnológicas</figcaption></figure>
  </div>
  <div class="table-wrap"><table>
    <thead><tr><th>Archivo</th><th>Uso</th></tr></thead>
    <tbody>
      <tr><td><code>.mp4</code> (lavanda, fondo blanco, fondo negro)</td><td>Pantallas, presentaciones, redes sociales</td></tr>
      <tr><td><code>-transparente.webm</code></td><td>Web y OBS, con fondo transparente</td></tr>
      <tr><td><code>.gif</code> / <code>-transparente.webp</code></td><td>Correos, chats y firmas</td></tr>
      <tr><td><code>-transparente.mov</code> (ProRes 4444)</td><td>Edición en Premiere, Final Cut o DaVinci. No está en el repositorio por su peso; se genera con <code>npm run render:reel</code>.</td></tr>
    </tbody>
  </table></div>
</div></section>`,
});
write("manual.html", manual);

// ---------- fichas comerciales (A4, para imprimir o exportar a PDF) ----------
const ficha = (a) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Ficha · UIFCE ${esc(a.nombre)}</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../sitio/ficha.css"></head>
<body><article class="ficha">
  <header class="f-head">
    <img src="../logos/areas/svg/uifce-${a.slug}-blanco.svg" alt="UIFCE ${esc(a.nombre)}">
    <div class="f-para"><span>Para</span>${a.publico.map((p) => `<b>${esc(p)}</b>`).join("")}</div>
  </header>
  <section class="f-hero">
    <h1>${esc(a.lema)}</h1>
    <p>${esc(a.propuesta)}</p>
  </section>
  <section class="f-cols">
    <div>
      <h2>Lo que ganas</h2>
      <ul>${a.beneficios.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      <h2>Cómo acceder</h2>
      <ol>${a.comoSolicitar.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      ${a.condiciones ? `<p class="f-cond">${esc(a.condiciones)}</p>` : ""}
    </div>
    <div>
      <h2>Servicios</h2>
      ${a.servicios.map((s) => `<div class="f-serv"><h3>${esc(s.titulo)}</h3><p>${esc(s.detalle)}</p></div>`).join("")}
    </div>
  </section>
  <footer class="f-foot">
    <div class="f-cta">${esc(a.cta)}${a.ctaUrl ? `<small>${esc(a.ctaUrl)}</small>` : ""}</div>
    <div class="f-unit"><img src="../logos/unidad/uifce-logo-azul.svg" alt="UIFCE"><span>${esc(unidad.institucion)}</span></div>
  </footer>
</article></body></html>
`;
for (const a of areas) write(`fichas/${a.slug}.html`, ficha(a));
write("fichas/index.html", page({
  title: "UIFCE · Fichas por área", desc: "Fichas comerciales de cada área para imprimir o enviar.", depth: 1, active: "areas",
  body: `<section class="hero hero-slim"><div class="wrap"><p class="eyebrow">Fichas comerciales</p><h1>Una página por área</h1><p class="lead">Para imprimir, enviar por correo o presentar en reuniones. Cada ficha está en HTML y en PDF (tamaño carta).</p></div></section>
<section class="sec"><div class="wrap"><div class="grid">${areas.map((a) => `<div class="card card-static"><img src="../logos/areas/svg/uifce-${a.slug}-azul.svg" alt="UIFCE ${esc(a.nombre)}"><p><a href="${a.slug}.html">Ver ficha</a> · <a href="pdf/ficha-uifce-${a.slug}.pdf" download>Descargar PDF</a></p></div>`).join("")}</div></div></section>`,
}));
console.log("listo");
