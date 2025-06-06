<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
    <main>
        <Sidebar />

        <div class="p-4 sm:ml-64">
            <RouterView />
        </div>
    </main>
</template>
