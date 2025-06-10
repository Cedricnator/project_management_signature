<script setup lang="ts">

import SidebarButton from '@/components/SidebarButton.vue'
import { ref } from 'vue';
const isSidebarOpen = ref(false)

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
}

</script>

<template>
    
    <button
        @click="toggleSidebar"
        data-drawer-target="logo-sidebar"
        data-drawer-toggle="logo-sidebar"
        aria-controls="logo-sidebar"
        type="button"
        class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
    >
        <span class="sr-only">Open sidebar</span>
        <svg
            class="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            ></path>
        </svg>
    </button>
    <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black opacity-40 sm:hidden"
        @click="toggleSidebar"
    ></div>
    <aside
        id="logo-sidebar"
        class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
        :class="[
        isSidebarOpen ? 'translate-x-0 max-w-55' : '-translate-x-full',
                    'sm:translate-x-0']"
    >
    
        <div class="flex flex-col h-full px-3 py-4 overflow-y-auto bg-white">
            <div class="flex flex-2 min-h-40 justify-between">
                <RouterLink class="flex items-center ps-2.5 mb-5" :to="{ name: 'user-dashboard' }">
                    <img
                        src="https://flowbite.com/docs/images/logo.svg"
                        class="h-6 me-3 sm:h-7"
                        alt="Flowbite Logo"
                    />
                    <span class="self-center text-xl font-bold whitespace-nowrap text-text-dark"
                        >FirmaTic</span
                    >
                </RouterLink>
                <div class="md:hidden">
                    <button @click="toggleSidebar">
                        <font-awesome-icon icon="fa-solid fa-xmark" size="lg" />
                    </button>
                </div>
            </div>
            <div class="flex h-full grow flex-col">
                <ul class=" space-y-2 font-medium">
                    <li>
                        <SidebarButton label="Dashboard" iconName="fa-solid fa-house" to="user-dashboard" />
                    </li>
                    <!-- <li>
                        <SidebarButton label="Documentos" iconName="fa-solid fa-file-invoice" to="documents" />
                    </li> -->
                    <li>
                        <SidebarButton label="Historial" iconName="fa-solid fa-list-ul" to="user-history"/>
                    </li>
                </ul>
            </div>
            <div class="w-full mb-5">
                <SidebarButton label="Cerrar sesión" iconName="fa-solid fa-arrow-right-from-bracket" :rotation="180" :danger="true" to="login" />
            </div>
            
        </div>
    </aside>


</template>
