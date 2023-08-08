<template>
  <div class="movie-filter">
    <div class="country-selector">
      <h2>Country</h2>
      <div>
        <input
          id="US"
          type="radio"
          name="country"
          value="US"
          v-model="activeCountry"
        />
        <label for="US">US</label>
      </div>
      <div>
        <input
          id="Japan"
          type="radio"
          name="country"
          value="JAPAN"
          v-model="activeCountry"
        />
        <label for="Japan">Japan</label>
      </div>
    </div>
    <div class="filters-container">
      <h2>Filters</h2>
      <div class="filters">
        <div>
          <input
            type="checkbox"
            id="All"
            value="All"
            :checked="isAllChecked"
            @input="checkAll"
          />
          <label for="All">All</label>
        </div>

        <div>
          <input
            type="checkbox"
            id="Drama"
            value="Drama"
            :checked="isChecked('Drama')"
            v-model="categoryFilters"
          />
          <label for="Drama">Drama</label>
        </div>

        <div>
          <input
            type="checkbox"
            id="Dramedy"
            value="Dramedy"
            :checked="isChecked('Dramedy')"
            v-model="categoryFilters"
          />
          <label for="Dramedy">Dramedy</label>
        </div>

        <div>
          <input
            type="checkbox"
            id="Comedy"
            value="Comedy"
            :checked="isChecked('Comedy')"
            v-model="categoryFilters"
          />
          <label for="Comedy">Comedy</label>
        </div>

        <div>
          <input
            type="checkbox"
            id="Real Life"
            value="Real Life"
            :checked="isChecked('Real Life')"
            v-model="categoryFilters"
          />
          <label for="Real Life">Real Life</label>
        </div>

        <div>
          <input
            type="checkbox"
            id="Anime"
            value="Anime"
            :checked="isChecked('Anime')"
            v-model="categoryFilters"
          />
          <label for="Anime">Anime</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "MovieFilter",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import useStore from "@/composables/useStore";

const store = useStore();

const categoryFilters = computed({
  get() {
    return store.get("filters");
  },
  set(categories) {
    store.set("filters", categories);
  },
});

const activeCountry = computed({
  get() {
    return store.get("activeCountry");
  },
  set(activeCountry) {
    store.set("activeCountry", activeCountry);
  },
});

const isAllChecked = computed(() => categoryFilters.value.length === 0);

function isChecked(filter: string): boolean {
  return categoryFilters.value.find((category) => filter === category);
}

function checkAll() {
  store.set("filters", []);
}
</script>

<style scoped>
.filters {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

.filters > div {
  display: flex;
  gap: 1rem;
}

.country-selector {
  display: flex;
  flex-direction: column;
}

.country-selector > div {
  display: flex;
  gap: 1rem;
}

</style>
