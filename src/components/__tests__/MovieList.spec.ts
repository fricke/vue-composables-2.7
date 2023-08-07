import '@testing-library/jest-dom';
import useFilteredMovies from "@/composables/useFilteredMovies";
import { render } from "@testing-library/vue";
import type { Movie } from "@/types";
import MovieList from "@/components/MovieList.vue";
import {ref} from "vue";
import flushPromises from "@/tests/flushPromises";

jest.mock("@/composables/useFilteredMovies");

describe("MovieList", () => {
  it("should show loading when movies are loading", async () => {
    const { screen, loading } = renderComponent();
    loading.value = true;
    await flushPromises();
    expect(screen.getByText("Loading...I'm Spinning...I'm Loading")).toBeVisible();
  });

  it("should show movies when loading is finished", async () => {
    const { screen, loading, movies } = renderComponent();
    loading.value = false;
    movies.value = [{id: 1, name: 'Donnie Darko', category: 'Drama'}]
    await flushPromises();
    expect(screen.getByText("Donnie Darko")).toBeVisible();
  });
});

function renderComponent() {
  const loading = ref<boolean>(false);
  const movies = ref<Movie[]>([]);
  (useFilteredMovies as jest.Mock).mockImplementation(() => {
    return { loading, movies };
  });

  const screen = render(MovieList);
  return { screen, loading, movies };
}
