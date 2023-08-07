import { onMounted, ref, watch, computed } from "vue";
import type { Ref } from "vue";
import useStore from "./useStore";
import type { Movie } from "@/types";
import fetchMovies from "../fetchMovies";

export interface UseMoviesResult {
  loading: Ref<boolean>;
  movies: Ref<Movie[]>;
}

function useMovies(): UseMoviesResult {
  const loading = ref<boolean>(false);
  const movies = ref<Movie[]>([]);
  const store = useStore();

  // onMounted or any lifecycle method can be used
  onMounted(() => {
    loadMovies();
  });

  // Use a computed for grabbing store data
  const activeCountry = computed<string>(() => {
    //@ts-ignore
    return store.get("activeCountry");
  });

  // watch for a change with activeCountry and fetch new
  // movies if change.
  watch(activeCountry, loadMovies);

  /*
       This function is async and is updating ref
       values which are reactive.
     */
  async function loadMovies() {
    loading.value = true;
    const moviesResult = await fetchMovies(activeCountry.value);
    movies.value = moviesResult;
    loading.value = false;
  }
  /*
        Any value can be returned, but reactive
        values will trigger Vue rerenders for
        the caller
     */
  return { loading, movies };
}

export default useMovies;
