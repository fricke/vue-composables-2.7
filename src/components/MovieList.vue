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