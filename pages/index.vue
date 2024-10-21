<template>
  <div class="p-4 max-w-3xl mx-auto space-y-8">
    <h1 class="text-3xl font-bold">today_i_piped</h1>
    <q-list separator class="bg-slate-200">
      <q-item clickable v-ripple v-for="post in navigation" :to="post._path">
        <q-item-section>{{ post.title }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
</script>
