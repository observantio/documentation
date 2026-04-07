import baseSlidesRaw from "./slides.json";

import type { SlidesJson } from "./slideTypes";

const baseSlides = baseSlidesRaw as SlidesJson;

export const slidesJson: SlidesJson = {
  understand: baseSlides.understand,
  use: baseSlides.use,
};