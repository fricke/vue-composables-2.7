import type { Movie } from "@/types";

export const MOVIES_BY_COUNTRY = {
  US: [
    { id: 1, name: "Office Space", category: "Real Life" },
    { id: 2, name: "Brain Candy", category: "Comedy" },
    { id: 4, name: "Drive", category: "Drama" },
  ],
  JAPAN: [{ id: 3, name: "Spirited Away", category: "Anime" }],
};

export default (country: string): Promise<Movie[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      //@ts-ignore
      resolve(MOVIES_BY_COUNTRY[country])
    }, 2000)
  })
};
