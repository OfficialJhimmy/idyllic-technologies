/**
 * Slides for the sign-in screens. The captions are taken word for word from the approved website
 * content PDF (a heading and one sentence or paragraph each). Do not reword them here. Alt text
 * describes the photographs only.
 */

export type AuthSlide = {
  id: string;
  image: string;
  alt: string;
  /** CSS object-position, so the subject of each photograph stays in frame on a tall panel. */
  position: string;
  title: string;
  body: string;
};

export const authSlides: readonly AuthSlide[] = [
  {
    id: "team",
    image: "/brand/auth/engineers.webp",
    alt: "Three engineers in white hard hats looking over plans beside rows of solar panels",
    position: "30% 50%",
    title: "Our team",
    body: "At the heart of everything we do is a team committed to innovation, reliability, and customer satisfaction. We don’t just provide power solutions; we build systems you can trust.",
  },
  {
    id: "solar",
    image: "/brand/auth/solar-field.webp",
    alt: "Rows of solar panels in a field under a blue sky with large white clouds",
    position: "50% 60%",
    title: "Let The Sun Do The Work",
    body: "Energize the future with the power of solar energy. Idyllic Technologies delivers clean, sustainable, and reliable electricity solutions designed for both businesses and homes.",
  },
  {
    id: "innovation",
    image: "/brand/auth/wind-turbines.webp",
    alt: "Wind turbines standing in a field at dusk with a pale orange sky",
    position: "60% 50%",
    title: "Commitment to innovation",
    body: "We like to think a bit deeper about things, proud of our ability to find pragmatic solutions. We always think a few steps ahead of everyone else.",
  },
];
