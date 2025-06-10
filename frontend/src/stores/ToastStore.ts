// stores/toastStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export enum ToastType {
    success,
    error,
    info,
    warning,
}

export interface Toast {
    id: number
    message: string
    type: ToastType
    duration?: number
}

let counter = 0

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])

    function addToast(type: ToastType, message: string, duration = 5000) {
        const id = counter++
        toasts.value.push({ id, type, message })
        setTimeout(() => removeToast(id), duration)
    }

    function removeToast(id: number) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    return {
        toasts,
        addToast,
        removeToast,
    }
})
