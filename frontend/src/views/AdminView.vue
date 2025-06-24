<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import HeaderComponent from '@/components/header.vue'
import { RouterView } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumb.vue'
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/SessionStore'

const sessionStore = useSessionStore();

onMounted(() => {
    document.documentElement.setAttribute('data-theme', 'admin');
    sessionStore.login()
}) 

</script>

<template>
    <main class="h-full admin:bg-[var(--color-background)] overflow-auto">
        <Sidebar />

        <div class="flex h-full flex-col sm:ml-64">
            <div class="flex flex-col p-4 justify-top min-h-40 ">
                <div class="flex flex-1">
                    <HeaderComponent />
                </div>
                <div>
                    <Breadcrumbs />
                </div>
                
            </div>
            <div class="flex grow mt-4 overflow-auto">
                <RouterView />
            </div>
        </div>
    </main>
</template>