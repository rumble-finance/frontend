<template>
  <div class="app-nav-footer">
    <div class="app-nav-footer-container pl-5 pr-5">
      <div class="w-full flex justify-center">
        <AppNavToggle darkModeBg="700" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppNavToggle from '@/components/navs/AppNav/AppNavToggle.vue';
import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';

export default defineComponent({
  name: 'AppFooterNav',

  components: {
    AppNavToggle
  }
});
</script>

<style scoped>
.app-nav-footer {
  @apply fixed bottom-0 left-0 right-0 px-2 mb-4 z-20;
  text-align: center;
}

.app-nav-footer-container {
  @apply py-2 mx-auto rounded-full;
  @apply bg-white dark:bg-gray-800 shadow-xl;
  @apply inline-flex items-center;
}
</style>
