<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import AppFooterNav from '@/components/navs/AppFooterNav/AppFooterNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const isHomePage = computed(() => route.path === '/');
</script>

<template>
  <div>
    <AppNav />
    <AppHero v-if="isHomePage" />
    <div class="pb-16">
      <router-view :key="$route.path" />
    </div>
    <AppFooterNav v-if="upToLargeBreakpoint" />
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
