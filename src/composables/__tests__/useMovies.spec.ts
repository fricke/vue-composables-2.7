import Vue, { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import type { Wrapper } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import useMovies from "@/composables/useMovies";
import type { UseMoviesResult } from "@/composables/useMovies";
import flushPromises from "@/tests/flushPromises";
import fetchMovies from "@/fetchMovies";
import type { AppState, Movie } from "@/types";
import useStore from "@/composables/useStore";
import pathify, { make } from "vuex-pathify";

jest.mock("@/fetchMovies");
jest.mock("@/composables/useStore");

describe("useMovies", () => {
  it("should fetch movies on mount", () => {
    mountComposable();
    expect(fetchMovies).toHaveBeenCalledWith("US");
  });

  it("should set loading to true when fetching data", () => {
    const { mountedComponent } = mountComposable();
    expect(mountedComponent.vm.loading).toEqual(true);
  });

  it("should set loading to false when done fetching data", async () => {
    const { mountedComponent } = mountComposable();
    await flushPromises();
    expect(mountedComponent.vm.loading).toEqual(false);
  });

  it("should refetch data when country changes", async () => {
    const { store } = mountComposable();
    await flushPromises();
    store.state.activeCountry = "Japan";
    await flushPromises();
    expect(fetchMovies).toHaveBeenCalledTimes(2);
    expect(fetchMovies).toHaveBeenCalledWith("Japan");
  });
});

function mountComposable(): {
  mountedComponent: Wrapper<Vue & UseMoviesResult>;
  store: Store<Partial<AppState>>;
} {
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

  const TestComponentWithComposable = defineComponent({
    setup() {
      return useMovies();
    },
    template: "<div/>",
  });

  const mountedComponent = mount(TestComponentWithComposable) as Wrapper<
    Vue & UseMoviesResult
  >;
  return { store, mountedComponent };
}
