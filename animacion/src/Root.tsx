import React from "react";
import { Composition } from "remotion";
import { LogoSting } from "./scenes/LogoSting";
import { AreaSting, AREA_SLUGS } from "./scenes/AreaSting";
import { Variant } from "./theme";
import { SlotReelScene } from "./scenes/SlotReelScene";
import { SlotReelLockupScene } from "./scenes/SlotReelLockupScene";
import { UnidadAreaScene, unidadDuration } from "./scenes/UnidadAreaScene";

const COMPS: { id: string; variant: Variant }[] = [
  { id: "UifceLogo", variant: "lavanda" },
  { id: "UifceLogoFondoBlanco", variant: "blanco" },
  { id: "UifceLogoFondoNegro", variant: "negro" },
  { id: "UifceLogoTransparente", variant: "transparente" },
  { id: "UifceLogoGif", variant: "lavandaGif" },
];
const AREA_VARIANTS: Variant[] = ["lavanda", "lavandaGif", "blanco", "negro", "transparente"];
const REEL_VARIANTS: Variant[] = ["lavanda", "lavandaGif", "blanco", "negro", "transparente"];
// reel order after Estrategias Tecnológicas (each segment starts exactly where the previous one landed)
const TOUR = ["apoyos-academicos", "gestion-del-conocimiento", "desarrollo-automatizaciones-ti",
  "virtualizacion-academica", "cursos-libres", "coordinacion"] as const;
const common = { durationInFrames: 150, fps: 30, width: 1920, height: 1080 };

export const RemotionRoot: React.FC = () => (
  <>
    {COMPS.map((c) => (
      <Composition key={c.id} id={c.id} component={LogoSting} defaultProps={{ variant: c.variant }} {...common} />
    ))}
    {/* slot reel landing on "Estrategias Tecnológicas" — transparent background */}
    <Composition id="SlotReel" component={SlotReelScene} {...common} />
    {/* reel to the right of the wordmark, at the size of the static area logos (5.5 s) */}
    <Composition id="SlotReelLogo" component={SlotReelLockupScene} {...common} durationInFrames={165} />
    {/* the same reel landing on every area, in the GIF colour versions: SlotReelLogo-<area>-<variant> */}
    {AREA_SLUGS.flatMap((area) =>
      REEL_VARIANTS.map((variant) => (
        <Composition key={`reel-${area}-${variant}`} id={`SlotReelLogo-${area}-${variant}`} component={SlotReelLockupScene}
          defaultProps={{ area, variant }} {...common} durationInFrames={165} />
      )),
    )}
    {/* unit logo animation → reel landing on Estrategias Tecnológicas, i-dot glows with the name */}
    {REEL_VARIANTS.map((variant) => (
      <Composition key={`unidad-${variant}`} id={`UnidadEstrategias-${variant}`} component={UnidadAreaScene}
        defaultProps={{ area: "estrategias-tecnologicas" as const, variant }} {...common} durationInFrames={unidadDuration(30)} />
    ))}
    {/* long version: after Estrategias Tecnológicas the reel visits every other area in reel order */}
    {REEL_VARIANTS.map((variant) => (
      <Composition key={`recorrido-${variant}`} id={`UnidadRecorrido-${variant}`} component={UnidadAreaScene}
        defaultProps={{ area: "estrategias-tecnologicas" as const, variant, tour: TOUR }} {...common} durationInFrames={unidadDuration(30, TOUR.length)} />
    ))}
    {/* one composition per area and colour version, e.g. Area-cursos-libres-negro */}
    {AREA_SLUGS.flatMap((area) =>
      AREA_VARIANTS.map((variant) => (
        <Composition key={`${area}-${variant}`} id={`Area-${area}-${variant}`} component={AreaSting}
          defaultProps={{ area, variant }} {...common} />
      )),
    )}
  </>
);
