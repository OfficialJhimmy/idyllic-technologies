/**
 * Staff portraits for the home page carousel, besides the CEO (whose photo and name are in pages.ts and the
 * editable team values). Names and roles are as Idyllic supplied them.
 * TODO: Mr Sunday and Mr Rotimi still need their full names, and Idyllic must supply the other staff.
 */
export type StaffPhoto = { src: string; alt: string; name: string; role?: string; width: number; height: number };

export const staffPhotos: readonly StaffPhoto[] = [
  { src: "/photos/team-jude.webp", name: "Mr Jude Jibunor", role: "Head, Technical Unit", alt: "Portrait of Mr Jude Jibunor in a navy suit and striped tie", width: 1024, height: 1536 },
  { src: "/photos/team-rotimi.webp", name: "Mr Rotimi", role: "Head, Renewable Energy", alt: "Mr Rotimi speaking at an Idyllic Technologies event", width: 771, height: 1080 },
  { src: "/photos/team-sunday.webp", name: "Mr Sunday", role: "Member Technical team", alt: "Portrait of Mr Sunday in a navy blazer, smiling", width: 896, height: 1195 },
];

/** Two photographs under "Who We are" on the home page. */
export const whoWeAreSlides = [
  { src: "/photos/who-solar-field.webp", alt: "Rows of solar panels in a field under a bright sky", width: 1400, height: 934 },
  { src: "/photos/who-wind-turbines.webp", alt: "A wind turbine on a green hillside above a bay at dusk", width: 1400, height: 934 },
] as const;
