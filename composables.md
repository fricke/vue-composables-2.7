## Vue Composable

#### What is a Vue composable?

Vue composable functions are a powerful addition to the Vue framework 
that allow for better separation of concerns from your
Vue components. At the core of it, they are essentially
functions coupled with Vue Reactive fields, Vue lifecycle 
methods, and other various Vue component functionality
that you normally use in a component.

In `Vue < 2.7`, mixins are used to solve similar problems,
but composable functions do not have issues that mixins bring
(overlapping names, hard to trace/debug, tight coupling).

### Async Composable Example
```ts
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
    This function is async and is updating ref values which are reactive.
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

```
<br/>
You can now use this composable in as many components
as need. When the list of offenders is updated, or the
offenders are loading the template will react to 
those changes.

```vue
<template>
  <div>
    <div v-if="loading">Loading...I'm Spinning...I'm Loading</div>
    <ul v-else>
      <li v-for="movie of movies" :key="movie.id">{{movie.name}}</li>
    </ul>
  </div>
</template>

<script lang="ts">
  export default {
    name: "MovieList"
  }
</script>

<script setup lang="ts">
  import useFilteredMovies from '@/composables/useFilteredMovies';
  const {loading, movies} = useFilteredMovies();
</script>

<style scoped>
li {
  font-size: 1.5rem;
}
</style>

```

### Composing Composables 
Vue Composables should be built to be single purpose. 
This will give you the most flexibility
in use, simpler to reason with, and easier to test.

The above example is only goal is for loading movies. Consider if 
there is another control on the page that filters those results. 
You could add all of that logic in the useMovies composable,
but you could also separate that logic away from the
fetching. That way we keep fetching and filters as separate pieces
of logic. 

```ts
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

```

### Jest Unit Testing Composables

Since composables can use Vue lifecycle methods and other Vue component functionality,
you still need to mount a composable into a component and in order
to test the result of the composable, you'll need to directly look at what values
are returned from the `setup` method. This is all done using the `@vue/test-utils` testing
module as the `@vue/testing-library` module does not return this information in the 
version we are using here. The `@vue/testing-libary` goal is to test rendered components,
so this is slightly different type of testing. 

#### Example: useMovies.spec.ts

To test this component you'll need to do the following:
* Stub out async behaviour (fetchMovies)
* Build a Vuex.Store
  * Add the state
  * Add Vuex Pathify
  * Add Vuex mutations using `make.mutations`. This essentially connects Vuex with Vuex Pathify allowing you to ask for state via paths. `store.get('path/to/state')`
* Return the test store in a stubbed `useStore` function
* Use `defineComponent` to build a test component that calls the composable in a mounted component and returns the result from the `setup()`; 
  * Only need to render an empty div to satisfy the requirements of a component. 
* The `@vue/test-utils` module returns a Wrapper<Vue> type. In order for the test to know about `loading` and `movies` you'll need to add that return type of the composable. 
  * Add UseMoviesResult type as the return type `Wrapper<Vue & UseMoviesResult>`
  * Without the return type correctly setup from this helper function, the test for `mountedComponent.vm.loading` will not be recognized as part of the type. 

```ts
import Vue, { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import type { Wrapper } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import useMovies from "@/composables/useMovies";
import type {UseMoviesResult} from "@/composables/useMovies";
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

  it('should refetch data when country changes', async () => {
    const { store } = mountComposable();
    await flushPromises();
    store.state.activeCountry = "Japan";
    await flushPromises();
    expect(fetchMovies).toHaveBeenCalledTimes(2)
    expect(fetchMovies).toHaveBeenCalledWith('Japan');
  })
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

  const mountedComponent = mount(TestComponentWithComposable) as Wrapper<Vue & UseMoviesResult>;
  return { store, mountedComponent };
}

```

### How to create a test helper function for mounting a composable on a component

We want to be able to reuse the part where we mount the composable. Other
tests could benefit from this type of setup without needing to worry about
typing the return result inside the wrapper. So let's create a helper function
called `mountComposable`

#### Helper Requirements:
* Extract away how the composable is being mounted.
* The function should take 1 argument - a composable function
* The function should return `Wrapper<Vue>` + the return type of the composable function
 
#### How to extract the return type of the composable
  * There is a utility in Typescript called `ReturnType` (https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)
  * Using that utility, you can extract the return type of that composable function and combine it with the return type of the helper
  * The function must take a generic type `Composable extends () => any`. Having `T` defined here is necessary, so it's return type can be part of the `mountComposable` result return type
  * `composable` function param is now of generic type `Composable`. 
  * You can now add the extra return type using `ReturnType<typeof Composable>` in the result. 

Now, any caller of this function will invoke it like: `const wrapper = mountComposable(useSomeComposable)`. 
    * See `useMovies-with-helper.spec.ts`

```ts
import Vue, { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import type { Wrapper } from "@vue/test-utils";

function mountComposable<Composable extends () => any>(
        composable: Composable,
): Wrapper<Vue & ReturnType<Composable>> {
  const TestComponentWithComposable = defineComponent({
    setup() {
      return composable();
    },
    template: "<div/>",
  });

  const mountedComponent = mount(
          TestComponentWithComposable,
  ) as Wrapper<Vue & ReturnType<typeof composable>>;
  return mountedComponent;
}

export default mountComposable;


```

## How to mock a composable

Vue composables that are being used in a component are very simple to test. 




