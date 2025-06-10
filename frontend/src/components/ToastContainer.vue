<script setup lang="ts">
import { computed } from 'vue'
import { ToastType, useToastStore } from '@/stores/ToastStore'

const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)
const removeToast = toastStore.removeToast

const toastClasses: Record<string, string> = {
    [ToastType.success]: 'bg-green-600',
    [ToastType.error]: 'bg-red-600',
    [ToastType.info]: 'bg-blue-600',
    [ToastType.warning]: 'bg-yellow-500 text-black',
}

const iconMap = {
    [ToastType.success]: ['fa-solid', 'circle-check'],
    [ToastType.error]: ['fa-solid', 'circle-xmark'],
    [ToastType.info]: ['fa-solid', 'circle-info'],
    [ToastType.warning]: ['fa-solid', 'triangle-exclamation'],
}
</script>

<template>
    <div
        class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-3 w-full max-w-sm"
    >
        <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="[
                'flex gap-3 items-center justify-between px-4 py-3 rounded-lg shadow-md',
                'text-white text-md font-medium transition-opacity duration-300',
                toastClasses[toast.type],
            ]"
        >
            <font-awesome-icon :icon="iconMap[toast.type]" class="text-lg" />
            <span class="flex-1">{{ toast.message }}</span>
            <button
                @click="removeToast(toast.id)"
                class="ml-4 mb-1 text-white hover:text-gray-200 text-lg font-bold leading-none"
            >
                &times;
            </button>
        </div>
    </div>
</template>
