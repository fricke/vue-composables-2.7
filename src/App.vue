<template>
  <div id="app">
    <main>
      <MovieFilter class="app__movie-filter"/>
      <MovieList class="app__movie-list"/>
    </main>
  </div>
</template>

<script setup lang="ts">
  import MovieFilter from "@/components/MovieFilter.vue";
  import MovieList from "@/components/MovieList.vue";
</script>


<style scoped>
main {
  display: flex;
  gap: 5rem;
}

.app__movie-filter {
  width: 20%;
  height: 100vh;
  border-right: 1px solid black;
  padding-top: 2rem;
}

.app__movie-list {
  width: 80%;
  padding-top: 2rem;
}
</style>
