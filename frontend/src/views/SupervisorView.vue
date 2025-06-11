<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import HeaderComponent from '@/components/header.vue'
import { RouterView } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumb.vue'
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/SessionStore'
import ToastContainer from '@/components/ToastContainer.vue'

const sessionStore = useSessionStore()

onMounted(() => {
    document.documentElement.setAttribute('data-theme', 'supervisor');
    sessionStore.login()
})
</script>

<template>
    <main class="h-full overflow-auto supervisor:bg-[var(--color-background)]">
        <Sidebar />

        <div class="flex h-full flex-col sm:ml-64">
            <div class="flex flex-col p-4 justify-top min-h-40">
                <div class="flex flex-1">
                    <HeaderComponent />
                </div>
                <div>
                    <Breadcrumbs />
                </div>
            </div>
            <div class="flex grow mt-4 overflow-auto">
                <ToastContainer />
                <RouterView />
            </div>
        </div>
    </main>
</template>
