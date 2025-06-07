<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import HeaderComponent from '@/components/header.vue'
import { RouterView } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumb.vue'
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/SessionStore'

const sessionStore = useSessionStore();

onMounted(() => {
    sessionStore.login()
}) 

</script>

<template>
    <main class="h-full">
        <Sidebar />

        <div class="flex h-full flex-col p-4 sm:ml-64 bg-background">
            <div class="flex flex-col justify-top min-h-40 bg-amber-400">
                <div class="flex flex-1">
                    <HeaderComponent />
                </div>
                <div>
                    <Breadcrumbs />
                </div>
                
            </div>
            <div class="p-4 mt-4 bg-amber-600"><RouterView /></div>
            
        </div>
    </main>
</template>
