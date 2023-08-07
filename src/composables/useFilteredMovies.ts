import { computed, ref, watch } from "vue";
import type { Ref } from "vue";
import useMovies from "./useMovies";
import useStore from "./useStore";
import type { Movie } from "@/types";

export interface UseFilteredMovies {
  loading: Ref<boolean>;
  movies: Ref<Movie[]>;
}

function useFilteredMovies(): UseFilteredMovies {
  const store = useStore();

  // Using the composable useMovies for data.
  const { loading, movies } = useMovies();
  const filteredMovies = ref<Movie[]>([]);

  const categoryFilters = computed(() => {
    //@ts-ignore
    return store.get("filters");
  });

  watch(categoryFilters, filterMovies);
  watch(movies, filterMovies);

  function filterMovies() {
    filteredMovies.value = movies.value.filter((movie) => {
      if (!categoryFilters.value.length) return true;
      return categoryFilters.value.find((category: string) => {
        return category === movie.category;
      });
    });
  }

  /*
    We are simply returning loading to the parent
    and a result from a computed `filteredMovies`;
  */
  return { loading, movies: filteredMovies };
}

export default useFilteredMovies;
