## Vue Composables: Enhancing Modularity and Testing in Vue Applications

### Introduction

Vue Composables are a valuable extension within the Vue framework, offering a better approach to managing concerns within Vue components. At their core, Vue Composables encapsulate functions integrated with Vue Reactive fields, Vue lifecycle methods, and assorted Vue component functionalities that are conventionally employed within components.

In contrast to the usage of mixins in Vue versions prior to `2.7`, Vue Composables provide a more refined solution without the pitfalls that mixins introduced, such as naming conflicts, intricate debugging, and overly tight coupling.

### Example of Asynchronous Composables

```typescript
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

  onMounted(() => {
    loadMovies();
  });

  // Data from a Vuex store can be used in a composable. 
  const activeCountry = computed<string>(() => {
    return store.get("activeCountry");
  });

  watch(activeCountry, loadMovies);

  async function loadMovies() {
    loading.value = true;
    const moviesResult = await fetchMovies(activeCountry.value);
    movies.value = moviesResult;
    loading.value = false;
  }

  // Composables can return any value, but for reactivity in the caller use `ref`, `computed`, or `reactive` values.
  // Functions can be exposed by returning those here as well. 
  return { loading, movies };
}

export default useMovies;
```

### Integration within Components

Utilizing this composable in multiple components is now possible. Whenever the list of movies updates or when loading status changes, the template will respond to these changes.

```vue
<template>
  <div>
    <div v-if="loading">Loading...I'm Spinning...I'm Loading</div>
    <ul v-else>
      <li v-for="movie of movies" :key="movie.id">{{ movie.name }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
  export default {
    name: "MovieList",
  };
</script>

<script setup lang="ts">
  import useMovies from "@/composables/useMovies";
  const { loading, movies } = useMovies();
</script>

<style scoped>
li {
  font-size: 1.5rem;
}
</style>
```

### Composing Composables for Enhanced Modularity

Vue Composables are most effective when designed with a single-purpose focus. This strategy ensures optimal flexibility, simplified reasoning, and streamlined testing. The earlier example concentrated solely on loading movies. However, consider a scenario where additional controls are incorporated for filtering these results. Instead of incorporating all this logic within the `useMovies` composable, it's advisable to segregate filtering logic from fetching logic. This separation enhances the modularity of both fetching and filtering functionalities.

```typescript
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
  const { loading, movies } = useMovies();
  const filteredMovies = ref<Movie[]>([]);

  const categoryFilters = computed(() => {
    return store.get("filters");
  });

  // Changes to either categoryFilters or movies will trigger a filtering of movies
  watch([categoryFilters, movies], filterMovies);

  function filterMovies() {
    filteredMovies.value = movies.value.filter((movie) => {
      if (!categoryFilters.value.length) return true;
      return categoryFilters.value.includes(movie.category);
    });
  }

  return { loading, movies: filteredMovies };
}

export default useFilteredMovies;
```

### Unit Testing Vue Composables 

Given that Vue Composables can leverage Vue lifecycle methods and other Vue component functionalities, testing requires the mounting of the composable onto a component. To evaluate the composable's output, it's necessary to directly examine the values returned by the `setup` method. For this purpose, the `@vue/test-utils` testing module is required.

#### Example: useMovies.spec.ts

Testing the `useMovies` composable requires the following steps:

1. Mocking asynchronous behavior (e.g., `fetchMovies`)
2. Establishing a Vuex store:
  - Defining the state
  - Introducing Vuex Pathify
  - Creating Vuex mutations via `make.mutations`, which facilitates state access/updates using paths (e.g., `store.get('path/to/state')`)
  - Use state changes to test reactive UI updates (see `should refetch data when country changes` test)
3. Providing the test store through a stubbed `useStore` function
4. Constructing a testing component using `defineComponent`, where the composable is invoked within a mounted component, and the result is returned via the `setup()` method
5. The `@vue/test-utils` module returns a `Wrapper<Vue>` type. To enable tests to recognize `loading` and `movies`, it's necessary to include the composable's return type.
6. Each test case can now use the mounted component, e.g., `mountedComponent.vm` to test the return values of `setup()`  

```typescript
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
import mountComposable from "@/tests/mountComposable";

jest.mock("@/fetchMovies");
jest.mock("@/composables/useStore");

describe("useMovies", () => {
  it("should fetch movies on mount", () => {
    mountComposable(useMovies);
    expect(fetchMovies).toHaveBeenCalledWith("US");
  });

  it("should set loading to true when fetching data", () => {
    const { mountedComponent } = mountComposable(useMovies);
    expect(mountedComponent.vm.loading).toEqual(true);
  });

  it("should set loading to false when done fetching data", async () => {
    const { mountedComponent } = mountComposable(useMovies);
    await flushPromises();
    expect(mountedComponent.vm.loading).toEqual(false);
  });

  it("should refetch data when country changes", async () => {
    const { store } = mountComposable(useMovies);
    await flushPromises();
    // Simply change state, flush promises, to test state changes in UI
    store.state.activeCountry = "Japan";
    await flushPromises();
    expect(fetchMovies).toHaveBeenCalledTimes(2);
    expect(fetchMovies).toHaveBeenCalledWith("Japan");
  });
});
```

### Creating a Test Helper Function for Mounting Composables

To streamline the process of mounting a composable onto a component and reusing this setup across multiple tests, a test helper function called `mountComposable` can be created.

This function accepts one parameter: the composable function. It
returns a `Wrapper<Vue>` + the return type of the provided composable function. The function is defined as a generic `Composable extends () => object` to extract the return type of the composable function using the `ReturnType` utility. This extracted return type is then combined with the return type of the helper function.

This approach allows other tests to utilize the helper function, making the process of testing composables more efficient.

```typescript
import Vue, { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import type { Wrapper } from "@vue/test-utils";

function mountComposable<Composable extends () => object>(
  composable: Composable
): Wrapper<Vue & ReturnType<Composable>> {
  const TestComponentWithComposable = defineComponent({
    setup() {
      return composable();
    },
    template: "<div/>",
  });

  const mountedComponent = mount(
    TestComponentWithComposable
  ) as Wrapper<Vue & ReturnType<typeof composable>>;
  return mountedComponent;
}

export default mountComposable;
```

### Simulating Composable Behavior
When incorporating a composable within your component, it becomes necessary to simulate its behavior through mocking. This not only provides enhanced control over testing scenarios but also disentangles the composable's concerns from the component's functionalities.

To effectively mock a composable:

1. Begin by importing the composable into your test suite.
2. At the outset of the test, use `jest.mock('path/to/composable')` to mock the targeted composable.
3. Instantiate variables outside the mock implementation that mirror the ones expected to be returned from the composable.
4. Return these variables to align with the TypeScript signature of the composable's return values.
5. Use these variables, such as setting `loading.value = true`, to trigger UI component reactivity and test those results. 

```typescript
import '@testing-library/jest-dom';
import useFilteredMovies from "@/composables/useFilteredMovies";
import { render } from "@testing-library/vue";
import type { Movie } from "@/types";
import MovieList from "@/components/MovieList.vue";
import { ref } from "vue";
import flushPromises from "@/tests/flushPromises";

jest.mock("@/composables/useFilteredMovies");

describe("MovieList", () => {
  it("should display loading when movies are loading", async () => {
    const { screen, loading } = renderComponent();
    loading.value = true;
    await flushPromises();
    expect(screen.getByText("Loading...I'm Spinning...I'm Loading")).toBeVisible();
  });

  it("should display movies when loading is completed", async () => {
    const { screen, loading, movies } = renderComponent();
    loading.value = false;
    movies.value = [{ id: 1, name: 'Donnie Darko', category: 'Drama' }];
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
```
Now your component does not need to know anything about how these variables are being set, whether they are using other composables, or any other information. You are only testing how your component reacts to composable return value changes. 

### Conclusion

Vue Composables provide a great method for breaking down concerns in Vue applications and encouraging thorough testing. By improving the separation of concerns and making testing easier, Vue Composables contribute to building Vue applications that are easier to maintain.
