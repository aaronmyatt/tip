<template>
  <q-layout view="lHh Lpr lFf">

    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <NuxtLink to="/" class="row text-white">
            <div class="border border-black p-2  bg-white text-black m-1">{{ title }}</div>
          </NuxtLink>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- <q-drawer v-model="leftDrawerOpen" side="left" elevated>
      <NuxtLink to="/">
        <Logo></Logo>
      </NuxtLink>
      <q-list bordered separator>
        <q-item clickable v-ripples>
          <q-item-section>tip</q-item-section>
        </q-item>
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <div class="">
        <NuxtPage></NuxtPage>
      </div>
    </q-page-container>

    <q-footer class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <NuxtLink to="/" class="row text-white">
            <div class="border border-black p-2  bg-white text-black m-1">{{ title }}</div>
          </NuxtLink>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">
const title = 'tip';
const leftDrawerOpen = ref(true)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
