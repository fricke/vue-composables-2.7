import Vuex from "vuex";
import useMovies from "@/composables/useMovies";
import flushPromises from "@/tests/flushPromises";
import fetchMovies from "@/fetchMovies";
import type { Movie } from "@/types";
import useStore from "@/composables/useStore";
import pathify, { make } from "vuex-pathify";
import mountComposable from "@/tests/mountComposable";

jest.mock("@/fetchMovies");
jest.mock("@/composables/useStore");

describe("useMovies improved", () => {
  it("should fetch movies on mount", () => {
    mountMoviesComposable();
    expect(fetchMovies).toHaveBeenCalledWith("US");
  });

  it("should set loading to true when fetching data", () => {
    const { mountedComponent } = mountMoviesComposable();
    expect(mountedComponent.vm.loading).toEqual(true);
  });

  it("should set loading to false when done fetching data", async () => {
    const { mountedComponent } = mountMoviesComposable();
    await flushPromises();
    expect(mountedComponent.vm.loading).toEqual(false);
  });

  it('should refetch data when country changes', async () => {
    const { store } = mountMoviesComposable();
    await flushPromises();
    // simply change the store data, flush promises, and test result
    store.state.activeCountry = "Japan";
    await flushPromises();
    expect(fetchMovies).toHaveBeenCalledTimes(2)
    expect(fetchMovies).toHaveBeenCalledWith('Japan');
  })
});

function mountMoviesComposable() {
  const state = { activeCountry: "US" };
  const store = new Vuex.Store<any>({
    state,
    plugins: [pathify.plugin],
    mutations: make.mutations(state),
  });

  (fetchMovies as jest.Mock).mockResolvedValue([
    { id: 1, name: "Pulp Fiction", category: "Drama" },
    { id: 2, name: "Inglorious Bastards", category: "Drama" },
  ] as Movie[]);

  (useStore as jest.Mock).mockImplementation(() => {
    return store;
  });

  const mountedComponent = mountComposable(useMovies);
  return { store, mountedComponent };
}
