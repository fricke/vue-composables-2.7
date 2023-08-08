<template>
  <div>
    <h2>Movie List</h2>
    <div v-if="loading">Loading...I'm Spinning...I'm Loading</div>
    <ul v-else-if="movies.length">
      <li v-for="movie of movies" :key="movie.id">{{movie.name}}</li>
    </ul>
    <div v-else>No Results</div>
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