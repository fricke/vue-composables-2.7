<template>
  <div id="app">
    <main>
      <MovieFilter/>
      <MovieList/>
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
</style>
