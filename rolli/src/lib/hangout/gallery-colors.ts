export type GalleryPastelTheme = {
  accent: string;
  background: string;
};

/** Ten pastel themes — index 0 is reserved for the host (film keeper). */
export const GALLERY_PASTEL_THEMES: GalleryPastelTheme[] = [
  { accent: "#F4729A", background: "#FFF5F8" },
  { accent: "#A78BFA", background: "#F7F4FF" },
  { accent: "#60A5FA", background: "#F3F8FF" },
  { accent: "#4ADE80", background: "#F3FDF6" },
  { accent: "#FBBF24", background: "#FFFBF0" },
  { accent: "#FB923C", background: "#FFF8F3" },
  { accent: "#2DD4BF", background: "#F2FCFA" },
  { accent: "#C084FC", background: "#FAF6FF" },
  { accent: "#FB7185", background: "#FFF4F6" },
  { accent: "#34D399", background: "#F2FBF7" },
];

export function getGalleryParticipantTheme(
  participantIndexAmongNonHosts: number,
  isFilmKeeper: boolean,
): GalleryPastelTheme {
  if (isFilmKeeper) {
    return GALLERY_PASTEL_THEMES[0];
  }

  const themeIndex = (participantIndexAmongNonHosts % 9) + 1;

  return GALLERY_PASTEL_THEMES[themeIndex];
}
