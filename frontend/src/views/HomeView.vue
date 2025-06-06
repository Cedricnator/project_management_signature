<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';

</script>

<template>
  <main>
    
    <Sidebar />

    <div class="p-4 sm:ml-64">
      <RouterView />
    </div>
  </main>
</template>
