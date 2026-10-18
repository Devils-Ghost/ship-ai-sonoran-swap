// The three bundled sample yards (public/samples, see PROVENANCE.md). Every one is AI-generated,
// so the UI shows business.disclosures.sample with the before photo.
export const SAMPLE_YARDS = [
  {
    id: "yard-1",
    alt: "Sample yard: a single-story tan stucco house with a tile roof and a green front lawn",
  },
  { id: "yard-2", alt: "Sample yard: a two-story beige stucco house with a curved lawn beside the driveway" },
  {
    id: "yard-3",
    alt: "Sample yard: a single-story ranch house with a walkway between two lawns and mountains behind",
  },
] as const;

export type SampleYardId = (typeof SAMPLE_YARDS)[number]["id"];

export const sampleBefore = (id: SampleYardId) => `/samples/${id}-before.jpg`;
export const sampleAfter = (id: SampleYardId, style: string) => `/samples/${id}-${style}.jpg`;

/** The pair shown as an example when a live preview isn't available (FR-VIS-05/12). */
export const EXAMPLE_YARD: SampleYardId = "yard-1";
