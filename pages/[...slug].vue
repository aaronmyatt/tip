<template>
  <div class="p-4 max-w-3xl mx-auto prose">
    <ContentDoc />
  </div>
</template>
<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())
</script>
